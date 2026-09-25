<?php
if (!defined('ABSPATH')) exit;

class Knokspack_Backup {
    private $options;

    public function __construct() {
        $this->options = wp_parse_args((array) get_option('knokspack_backup_settings', array()), array(
            'backup_path' => WP_CONTENT_DIR . '/backups/knokspack',
            'schedule_enabled' => false, // opt-in: full backups use disk space
            'frequency' => 'daily',
            'retention_days' => 30,
            'exclude_paths' => array(
                'wp-content/cache',
                'wp-content/backups',
                'wp-content/uploads/large-files'
            )
        ), array());

        // Initialize backup system
        add_action('init', array($this, 'init_backup'));
        add_action('wp_ajax_knokspack_create_backup', array($this, 'ajax_create_backup'));
        add_action('wp_ajax_knokspack_restore_backup', array($this, 'ajax_restore_backup'));
        add_action('wp_ajax_knokspack_delete_backup', array($this, 'ajax_delete_backup'));
    }

    public function init_backup() {
        if (!empty($this->options['schedule_enabled'])) {
            if (!wp_next_scheduled('knokspack_scheduled_backup')) {
                wp_schedule_event(time(), $this->options['frequency'], 'knokspack_scheduled_backup');
            }
        } elseif (wp_next_scheduled('knokspack_scheduled_backup')) {
            wp_clear_scheduled_hook('knokspack_scheduled_backup');
        }
        add_action('knokspack_scheduled_backup', array($this, 'create_scheduled_backup'));
    }

    public function create_scheduled_backup() {
        return $this->create_backup('full');
    }

    /** Backups contain the database; make sure the web server never serves them. */
    private function protect_dir($dir) {
        wp_mkdir_p($dir);
        $files = array(
            '.htaccess'  => "Require all denied\nDeny from all\n",
            'web.config' => '<?xml version="1.0"?><configuration><system.webServer><authorization><deny users="*" /></authorization></system.webServer></configuration>',
            'index.php'  => "<?php // Silence is golden.\n",
        );
        foreach ($files as $name => $content) {
            if (!file_exists($dir . '/' . $name)) {
                @file_put_contents($dir . '/' . $name, $content);
            }
        }
    }

    public function list_backups($limit = 20) {
        global $wpdb;
        return $wpdb->get_results($wpdb->prepare(
            "SELECT id, type, size, status, created_at FROM {$wpdb->prefix}knokspack_backups ORDER BY created_at DESC LIMIT %d",
            $limit
        ), ARRAY_A);
    }

    public function create_backup($type = 'full') {
        global $wpdb;
        
        $backup_id = time();
        $this->protect_dir($this->options['backup_path']);
        // A random part in the name means a backup URL cannot be guessed even
        // on servers that ignore .htaccess (e.g. nginx).
        $backup_dir = $this->options['backup_path'] . '/' . $backup_id . '-' . wp_generate_password(16, false);
        
        if (!wp_mkdir_p($backup_dir)) {
            return new WP_Error('backup_error', 'Could not create backup directory');
        }

        // Start backup record
        $wpdb->insert(
            $wpdb->prefix . 'knokspack_backups',
            array(
                'id' => $backup_id,
                'type' => $type,
                'file_path' => '',
                'size' => 0,
                'status' => 'in_progress',
                'created_at' => current_time('mysql')
            )
        );

        try {
            // Backup database
            if ($type === 'full' || $type === 'database') {
                $this->backup_database($backup_dir);
            }

            // Backup files
            if ($type === 'full' || $type === 'files') {
                $this->backup_files($backup_dir);
            }

            // Create backup manifest
            $manifest = array(
                'id' => $backup_id,
                'type' => $type,
                'created_at' => current_time('mysql'),
                'wordpress_version' => get_bloginfo('version'),
                'active_theme' => wp_get_theme()->get('Name'),
                'active_plugins' => get_option('active_plugins')
            );
            file_put_contents($backup_dir . '/manifest.json', json_encode($manifest));

            // Create ZIP archive
            $zip = new ZipArchive();
            $zip_file = $backup_dir . '.zip';
            
            if ($zip->open($zip_file, ZipArchive::CREATE) === TRUE) {
                $this->add_dir_to_zip($zip, $backup_dir, basename($backup_dir));
                $zip->close();
                
                // Update backup record
                $wpdb->update(
                    $wpdb->prefix . 'knokspack_backups',
                    array(
                        'status' => 'completed',
                        'file_path' => $zip_file,
                        'size' => filesize($zip_file)
                    ),
                    array('id' => $backup_id)
                );

                // Cleanup temporary directory
                $this->rrmdir($backup_dir);

                // Cleanup old backups
                $this->cleanup_old_backups();

                return $backup_id;
            }

            throw new Exception('Failed to create ZIP archive');

        } catch (Exception $e) {
            $wpdb->update(
                $wpdb->prefix . 'knokspack_backups',
                array(
                    'status' => 'failed',
                    'error' => $e->getMessage()
                ),
                array('id' => $backup_id)
            );
            return new WP_Error('backup_error', $e->getMessage());
        }
    }

    private function backup_database($backup_dir) {
        global $wpdb;

        $tables = $wpdb->get_results('SHOW TABLES', ARRAY_N);
        $sql_file = $backup_dir . '/database.sql';
        $handle = fopen($sql_file, 'w');

        foreach ($tables as $table) {
            $table_name = $table[0];
            
            // Table structure
            $create_table = $wpdb->get_row("SHOW CREATE TABLE `$table_name`", ARRAY_N);
            if (empty($create_table[1])) {
                continue;
            }
            fwrite($handle, "\n\nDROP TABLE IF EXISTS `$table_name`;\n" . $create_table[1] . ";\n\n");

            // Table data, in pages so large tables do not exhaust memory
            $offset = 0;
            do {
                $rows = $wpdb->get_results($wpdb->prepare("SELECT * FROM `$table_name` LIMIT %d OFFSET %d", 500, $offset), ARRAY_A);
                foreach ($rows as $row) {
                    $values = array_map(function ($v) use ($wpdb) {
                        return $v === null ? 'NULL' : "'" . $wpdb->_real_escape($v) . "'";
                    }, $row);
                    fwrite($handle, "INSERT INTO `$table_name` VALUES (" . implode(', ', $values) . ");\n");
                }
                $offset += 500;
            } while (count($rows) === 500);
        }

        fclose($handle);
    }

    private function backup_files($backup_dir) {
        $root_dir = ABSPATH;
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($root_dir)
        );

        foreach ($iterator as $file) {
            if ($file->isDir()) continue;

            $path = $file->getPathname();
            $relative_path = str_replace($root_dir, '', $path);

            // Skip excluded paths
            foreach ($this->options['exclude_paths'] as $exclude) {
                if (strpos($relative_path, $exclude) === 0) continue 2;
            }

            // Create directory structure
            $backup_path = $backup_dir . '/files/' . $relative_path;
            wp_mkdir_p(dirname($backup_path));

            // Copy file
            copy($path, $backup_path);
        }
    }

    private function add_dir_to_zip($zip, $path, $base_path = '') {
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($path),
            RecursiveIteratorIterator::SELF_FIRST
        );

        foreach ($iterator as $file) {
            if ($file->isDir()) continue;

            $local_path = $base_path . '/' . substr($file->getPathname(), strlen($path) + 1);
            $zip->addFile($file->getPathname(), $local_path);
        }
    }

    private function cleanup_old_backups() {
        global $wpdb;
        
        $retention_date = date('Y-m-d H:i:s', strtotime("-{$this->options['retention_days']} days"));
        
        $old_backups = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}knokspack_backups WHERE created_at < %s",
            $retention_date
        ));

        foreach ($old_backups as $backup) {
            if (file_exists($backup->file_path)) {
                unlink($backup->file_path);
            }
            $wpdb->delete(
                $wpdb->prefix . 'knokspack_backups',
                array('id' => $backup->id)
            );
        }
    }

    public function restore_backup($backup_id) {
        global $wpdb;
        
        $backup = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}knokspack_backups WHERE id = %d",
            $backup_id
        ));

        if (!$backup || !file_exists($backup->file_path)) {
            return new WP_Error('restore_error', 'Backup not found');
        }

        try {
            $restore_dir = $this->options['backup_path'] . '/restore_' . $backup_id;
            wp_mkdir_p($restore_dir);

            // Extract backup
            $zip = new ZipArchive();
            if ($zip->open($backup->file_path) === TRUE) {
                $zip->extractTo($restore_dir);
                $zip->close();

                // Load manifest
                $manifest = json_decode(file_get_contents($restore_dir . '/manifest.json'), true);

                // Restore database if exists
                if (file_exists($restore_dir . '/database.sql')) {
                    $this->restore_database($restore_dir . '/database.sql');
                }

                // Restore files if exists
                if (is_dir($restore_dir . '/files')) {
                    $this->restore_files($restore_dir . '/files');
                }

                // Cleanup
                $this->rrmdir($restore_dir);

                return true;
            }

            throw new Exception('Failed to extract backup archive');

        } catch (Exception $e) {
            return new WP_Error('restore_error', $e->getMessage());
        }
    }

    private function restore_database($sql_file) {
        global $wpdb;
        
        $sql = file_get_contents($sql_file);
        $statements = explode(";\n", $sql);

        foreach ($statements as $statement) {
            if (trim($statement)) {
                $wpdb->query($statement);
            }
        }
    }

    private function restore_files($files_dir) {
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($files_dir),
            RecursiveIteratorIterator::SELF_FIRST
        );

        foreach ($iterator as $file) {
            if ($file->isDir()) continue;

            $relative_path = substr($file->getPathname(), strlen($files_dir) + 1);
            $restore_path = ABSPATH . $relative_path;

            wp_mkdir_p(dirname($restore_path));
            copy($file->getPathname(), $restore_path);
        }
    }

    private function rrmdir($dir) {
        if (is_dir($dir)) {
            $objects = scandir($dir);
            foreach ($objects as $object) {
                if ($object != "." && $object != "..") {
                    if (is_dir($dir . "/" . $object))
                        $this->rrmdir($dir . "/" . $object);
                    else
                        unlink($dir . "/" . $object);
                }
            }
            rmdir($dir);
        }
    }

    public function ajax_create_backup() {
        check_ajax_referer('knokspack_backup_nonce');
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Insufficient permissions');
        }
        
        $type = isset($_POST['type']) ? sanitize_text_field($_POST['type']) : 'full';
        $result = $this->create_backup($type);
        
        if (is_wp_error($result)) {
            wp_send_json_error($result->get_error_message());
        } else {
            wp_send_json_success($result);
        }
    }

    public function ajax_restore_backup() {
        check_ajax_referer('knokspack_backup_nonce');
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Insufficient permissions');
        }
        
        $backup_id = isset($_POST['backup_id']) ? intval($_POST['backup_id']) : 0;
        $result = $this->restore_backup($backup_id);
        
        if (is_wp_error($result)) {
            wp_send_json_error($result->get_error_message());
        } else {
            wp_send_json_success('Backup restored successfully');
        }
    }

    public function ajax_delete_backup() {
        check_ajax_referer('knokspack_backup_nonce');
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Insufficient permissions');
        }
        
        global $wpdb;
        $backup_id = isset($_POST['backup_id']) ? intval($_POST['backup_id']) : 0;
        
        $backup = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}knokspack_backups WHERE id = %d",
            $backup_id
        ));

        if ($backup) {
            if (file_exists($backup->file_path)) {
                unlink($backup->file_path);
            }
            $wpdb->delete(
                $wpdb->prefix . 'knokspack_backups',
                array('id' => $backup_id)
            );
            wp_send_json_success('Backup deleted successfully');
        } else {
            wp_send_json_error('Backup not found');
        }
    }
}

// Initialize the backup module
$GLOBALS['knokspack_backup'] = new Knokspack_Backup();

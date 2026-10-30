<?php
if ((defined('ABSPATH') === false)) exit;

class Knokspack_Backup {
    private $options;

    public function __construct() {
        $this->options = wp_parse_args((array) get_option('knokspack_backup_settings', array()), array(
            'backup_path' => (defined('KNOKSPACK_PRIVATE_BACKUP_DIR') === true) ? KNOKSPACK_PRIVATE_BACKUP_DIR : WP_CONTENT_DIR . '/backups/knokspack',
            'schedule_enabled' => false, // opt-in: full backups use disk space
            'frequency' => 'daily',
            'retention_days' => 30,
            'exclude_paths' => array(
                'wp-content/cache',
                'wp-content/backups',
                'wp-content/uploads/large-files'
            )
        ));

        // Initialize backup system
        add_action('init', array($this, 'init_backup'));
        add_action('wp_ajax_knokspack_create_backup', array($this, 'ajax_create_backup'));
        add_action('wp_ajax_knokspack_restore_backup', array($this, 'ajax_restore_backup'));
        add_action('wp_ajax_knokspack_delete_backup', array($this, 'ajax_delete_backup'));
    }

    public function init_backup() {
        if ((empty($this->options['schedule_enabled']) === false)) {
            if ((wp_next_scheduled('knokspack_scheduled_backup') === false)) {
                wp_schedule_event(time(), $this->options['frequency'], 'knokspack_scheduled_backup');
            }
        } elseif ((wp_next_scheduled('knokspack_scheduled_backup') !== false)) {
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
            if ((file_exists($dir . '/' . $name) === false)) {
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
        if ((in_array($type, array('full', 'database', 'files'), true) === false)) {
            return new WP_Error('invalid_backup_type', 'Unsupported backup type');
        }
        // Never rely on .htaccess to protect database dumps on nginx/IIS.
        $private_root = (defined('KNOKSPACK_PRIVATE_BACKUP_DIR') === true) ? realpath(KNOKSPACK_PRIVATE_BACKUP_DIR) : false;
        $site_root = realpath(ABSPATH);
        $configured = is_string($this->options['backup_path']) === true ? realpath($this->options['backup_path']) : false;
        if ($private_root === false || $site_root === false || $configured !== $private_root || ($this->is_within($private_root, $site_root) === true)) {
            return new WP_Error('private_backup_required', 'Configure an existing private backup directory outside the web root before creating backups.');
        }
        if ((class_exists('ZipArchive') === false)) {
            return new WP_Error('zip_required', 'The PHP zip extension is required.');
        }


        // The table owns identity: timestamps collide for simultaneous requests.
        $inserted = $wpdb->insert(
            $wpdb->prefix . 'knokspack_backups',
            array(
                'type' => $type,
                'file_path' => '',
                'size' => 0,
                'status' => 'in_progress',
                'created_at' => current_time('mysql')
            )
        );
        if ($inserted === false || $wpdb->insert_id < 1) {
            return new WP_Error('backup_record_error', 'Could not reserve backup record');
        }
        $backup_id = $wpdb->insert_id;
        $backup_dir = $private_root . '/' . $backup_id . '-' . wp_generate_password(16, false);

        try {
            $this->protect_dir($private_root);
            if (wp_mkdir_p($backup_dir) === false) {
                throw new Exception('Could not create backup directory');
            }
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
            if (file_put_contents($backup_dir . '/manifest.json', json_encode($manifest)) === false) {
                throw new Exception('Failed to write backup manifest');
            }

            // Create ZIP archive
            $zip = new ZipArchive();
            $zip_file = $backup_dir . '.zip';
            
            if ($zip->open($zip_file, ZipArchive::CREATE) === TRUE) {
                $this->add_dir_to_zip($zip, $backup_dir, basename($backup_dir));
                if (($zip->close() === false)) {
                    throw new Exception('Failed to finish ZIP archive');
                }
                
                // Do not report success when the archive could not be recorded.
                $updated = $wpdb->update(
                    $wpdb->prefix . 'knokspack_backups',
                    array(
                        'status' => 'completed',
                        'file_path' => $zip_file,
                        'size' => filesize($zip_file)
                    ),
                    array('id' => $backup_id)
                );

                if ($updated === false) {
                    throw new Exception('Could not record completed backup');
                }

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
        if ($this->backup_query_failed() === true || is_array($tables) === false) throw new Exception('Could not list backup tables');
        $handle = fopen($backup_dir . '/database.sql', 'w');
        if ($handle === false) throw new Exception('Could not open database export');
        try {
            foreach ($tables as $table) {
                $quoted = $this->quote_backup_identifier($table[0]);
                $create = $wpdb->get_row("SHOW CREATE TABLE $quoted", ARRAY_N);
                if ($this->backup_query_failed() === true || empty($create[1]) === true || strpos($create[1], 'CREATE TABLE ') !== 0) {
                    throw new Exception('Could not export a supported table definition');
                }
                $columns = $wpdb->get_results("SHOW FULL COLUMNS FROM $quoted", ARRAY_A);
                if ($this->backup_query_failed() === true || empty($columns) === true) throw new Exception('Could not read backup column metadata');
                $writable = array();
                $names = array();
                $selections = array();
                foreach ($columns as $column) {
                    // DEFAULT_GENERATED is writable; virtual/stored expressions are not.
                    if (preg_match('/\b(?:VIRTUAL|STORED|PERSISTENT)(?:\s+GENERATED)?\b/i', $column['Extra']) === 1) continue;
                    $identifier = $this->quote_backup_identifier($column['Field']);
                    $names[] = $identifier;
                    $kind = preg_match('/\Abit\b/i', $column['Type']) === 1 ? 'bit' :
                        (preg_match('/\A(?:binary|varbinary|tinyblob|blob|mediumblob|longblob)\b/i', $column['Type']) === 1 ? 'binary' : 'text');
                    $writable[$column['Field']] = $kind;
                    // Read bytes through HEX so driver-specific BIT conversion cannot lose information.
                    $selections[] = $kind === 'text' ? $identifier : "HEX($identifier) AS $identifier";
                }
                $list = implode(', ', $names);
                $selection = implode(', ', $selections);
                if ($selection === '') $selection = '*';
                $this->write_backup_sql($handle, "\n\nDROP TABLE IF EXISTS $quoted;\n" . $create[1] . ";\n\n");
                $offset = 0;
                do {
                    $rows = $wpdb->get_results($wpdb->prepare("SELECT $selection FROM $quoted LIMIT %d OFFSET %d", 500, $offset), ARRAY_A);
                    if ($this->backup_query_failed() === true || is_array($rows) === false) throw new Exception('Could not read backup table data');
                    foreach ($rows as $row) {
                        $values = array();
                        foreach ($writable as $name => $kind) {
                            if (array_key_exists($name, $row) === false) throw new Exception('Backup row does not match column metadata');
                            $values[] = $this->encode_backup_value($row[$name], $kind);
                        }
                        $this->write_backup_sql($handle, "INSERT INTO $quoted ($list) VALUES (" . implode(', ', $values) . ");\n");
                    }
                    $offset += 500;
                } while (count($rows) === 500);
            }
        } finally {
            if (fclose($handle) === false) throw new Exception('Could not finish database export');
        }
    }

    /**
     * Reads mutable connection state; must not be memoized between SQL queries.
     * @phpstan-impure
     */
    private function backup_query_failed(): bool {
        global $wpdb;
        return $wpdb->last_error !== '';
    }

    private function encode_backup_value($value, $kind) {
        global $wpdb;
        if ($value === null) return 'NULL';
        if ($kind === 'text') return "'" . $wpdb->_real_escape($value) . "'";
        if (is_string($value) === false || preg_match('/\A[0-9a-f]*\z/i', $value) !== 1) {
            throw new Exception('Invalid binary export representation');
        }
        if ($kind === 'binary') return "X'" . $value . "'";
        $bits = '';
        foreach (str_split($value) as $digit) {
            $bits .= str_pad(decbin(hexdec($digit)), 4, '0', STR_PAD_LEFT);
        }
        $bits = ltrim($bits, '0');
        return "b'" . ($bits === '' ? '0' : $bits) . "'";
    }

    private function quote_backup_identifier($name) {
        return '`' . str_replace('`', '``', $name) . '`';
    }

    /** @param resource $handle */
    private function write_backup_sql($handle, $sql) {
        $offset = 0;
        $length = strlen($sql);
        while ($offset < $length) {
            $written = fwrite($handle, substr($sql, $offset));
            if ($written === false || $written === 0) throw new Exception('Could not write complete database export');
            $offset += $written;
        }
    }

    private function backup_files($backup_dir) {
        $root_dir = realpath(ABSPATH);
        if ($root_dir === false) throw new Exception('Invalid WordPress root');
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($root_dir)
        );

        foreach ($iterator as $file) {
            if (($file->isDir() === true) || ($file->isLink() === true)) continue;

            $path = realpath($file->getPathname());
            if ($path === false || ($this->is_within($path, $root_dir) === false)) throw new Exception('Backup source escaped WordPress root');
            if (($this->is_within($path, $this->options['backup_path']) === true)) continue;
            $relative_path = str_replace(DIRECTORY_SEPARATOR, '/', substr($path, strlen(rtrim($root_dir, '/\\')) + 1));

            // Skip excluded paths
            foreach ($this->options['exclude_paths'] as $exclude) {
                if (strpos($relative_path, $exclude) === 0) continue 2;
            }

            // Create directory structure
            $backup_path = $backup_dir . '/files/' . $relative_path;
            wp_mkdir_p(dirname($backup_path));

            // Copy file
            if ((copy($path, $backup_path) === false)) throw new Exception('Failed to copy backup file');
        }
    }

    private function add_dir_to_zip($zip, $path, $base_path = '') {
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($path),
            RecursiveIteratorIterator::SELF_FIRST
        );

        foreach ($iterator as $file) {
            if (($file->isDir() === true)) continue;

            $local_path = $base_path . '/' . str_replace(DIRECTORY_SEPARATOR, '/', substr($file->getPathname(), strlen($path) + 1));
            if (($zip->addFile($file->getPathname(), $local_path) === false)) throw new Exception('Failed to add backup file to archive');
        }
    }

    private function is_within($path, $root) {
        $path = str_replace('\\', '/', $path);
        $root = rtrim(str_replace('\\', '/', $root), '/');
        if (DIRECTORY_SEPARATOR === '\\') {
            $path = strtolower($path);
            $root = strtolower($root);
        }
        return $path === $root || strpos($path, $root . '/') === 0;
    }

    /** Persisted paths are untrusted; legacy archives are preserved, not deleted. */
    private function delete_archive($path) {
        $root = (defined('KNOKSPACK_PRIVATE_BACKUP_DIR') === true) ? realpath(KNOKSPACK_PRIVATE_BACKUP_DIR) : false;
        $site = realpath(ABSPATH);
        if (is_string($path) === false || $path === '' || strpos($path, '://') !== false || strpos($path, "\0") !== false) {
            return false;
        }
        $real = realpath($path);
        // Resolve the parent, preserving the final component to reject symlinks.
        $parent = realpath(dirname($path));
        $candidate = $parent === false ? '' : $parent . '/' . basename($path);
        if ($root === false || $site === false || $real === false || ($this->is_within($root, $site) === true) || $parent === false || (is_link($candidate) === true)
            || ($this->is_within($real, $root) === false) || (is_file($real) === false) || strtolower(pathinfo($real, PATHINFO_EXTENSION)) !== 'zip') {
            return false;
        }
        return unlink($real);
    }

    private function cleanup_old_backups() {
        global $wpdb;
        
        $days = max(1, absint($this->options['retention_days']));
        $retention_date = date('Y-m-d H:i:s', strtotime("-$days days"));
        
        $old_backups = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}knokspack_backups WHERE created_at < %s",
            $retention_date
        ));

        foreach ($old_backups as $backup) {
            if (($this->delete_archive($backup->file_path) === false)) {
                continue;
            }
            $wpdb->delete(
                $wpdb->prefix . 'knokspack_backups',
                array('id' => $backup->id)
            );
        }
    }

    public function restore_backup($backup_id) {
        return new WP_Error(
            'restore_disabled',
            __('Restore is temporarily disabled until archive validation, safe extraction, SQL preflight, and rollback safeguards are implemented.', 'knokspack')
        );
    }

    private function rrmdir($dir) {
        if ((is_dir($dir) === true)) {
            $objects = scandir($dir);
            foreach ($objects as $object) {
                if ($object !== "." && $object !== "..") {
                    if ((is_link($dir . "/" . $object) === false) && (is_dir($dir . "/" . $object) === true))
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
        if ((current_user_can('manage_options') === false)) {
            wp_send_json_error('Insufficient permissions');
        }
        
        $type = (isset($_POST['type']) === true) ? sanitize_text_field($_POST['type']) : 'full';
        $result = $this->create_backup($type);
        
        if ((is_wp_error($result) === true)) {
            wp_send_json_error($result->get_error_message());
        } else {
            wp_send_json_success($result);
        }
    }

    public function ajax_restore_backup() {
        check_ajax_referer('knokspack_backup_nonce');
        if ((current_user_can('manage_options') === false)) {
            wp_send_json_error('Insufficient permissions');
        }
        
        $backup_id = (isset($_POST['backup_id']) === true) ? intval($_POST['backup_id']) : 0;
        $result = $this->restore_backup($backup_id);
        
        if ((is_wp_error($result) === true)) {
            wp_send_json_error($result->get_error_message());
        } else {
            wp_send_json_success('Backup restored successfully');
        }
    }

    public function ajax_delete_backup() {
        check_ajax_referer('knokspack_backup_nonce');
        if ((current_user_can('manage_options') === false)) {
            wp_send_json_error('Insufficient permissions');
        }
        
        global $wpdb;
        $backup_id = (isset($_POST['backup_id']) === true) ? intval($_POST['backup_id']) : 0;
        
        $backup = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}knokspack_backups WHERE id = %d",
            $backup_id
        ));

        if ($backup !== null) {
            if (($this->delete_archive($backup->file_path) === false)) {
                wp_send_json_error('Backup path is not a validated private archive', 400);
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

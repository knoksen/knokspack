<?php
/**
 * Core functionality of Knokspack plugin
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Main Knokspack Class.
 */
final class Knokspack {
    /** @var Knokspack single instance */
    private static $instance = null;

    /**
     * Get instance
     * @return Knokspack
     */
    public static function instance() {
        if (is_null(self::$instance)) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Constructor
     */
    public function __construct() {
        $this->define_constants();
        $this->init_hooks();
        $this->load_dependencies();
    }

    /**
     * Define Constants
     */
    private function define_constants() {
        $this->define('KNOKSPACK_DB_VERSION', '1.1.0');
    }

    /**
     * Initialize hooks
     */
    private function init_hooks() {
        // Activation/deactivation hooks are registered in the main plugin file.
        add_action('init', array($this, 'init'), 0);
        add_action('plugins_loaded', array($this, 'load_textdomain'));
    }

    /**
     * Load required dependencies
     */
    private function load_dependencies() {
        // Autoloader is already loaded in the main plugin file
        new Knokspack_Autoloader();
    }

    /**
     * Define constant if not already defined
     * @param string $name
     * @param mixed $value
     */
    private function define($name, $value) {
        if (!defined($name)) {
            define($name, $value);
        }
    }

    /**
     * What type of request is this?
     * @param string $type
     * @return bool
     */
    private function is_request($type) {
        switch ($type) {
            case 'admin':
                return is_admin();
            case 'ajax':
                return defined('DOING_AJAX');
            case 'cron':
                return defined('DOING_CRON');
            case 'frontend':
                return (!is_admin() || defined('DOING_AJAX')) && !defined('DOING_CRON');
        }
    }

    /**
     * Initialize plugin
     */
    public function init() {
        // Before init action
        do_action('before_knokspack_init');

        // Modules are loaded by knokspack_load_modules() in the main plugin file.

        // Upgrade tables for sites that updated without re-activating.
        if (get_option('knokspack_db_version') !== KNOKSPACK_DB_VERSION) {
            $this->install_tables();
        }

        // Init action
        do_action('knokspack_init');
    }

    /**
     * Load localization files
     */
    public function load_textdomain() {
        load_plugin_textdomain(
            'knokspack',
            false,
            dirname(plugin_basename(KNOKSPACK_PLUGIN_FILE)) . '/languages/'
        );
    }

    /**
     * Plugin activation
     */
    public function activate() {
        // Create necessary tables
        $this->install_tables();
    }

    /**
     * Plugin deactivation
     */
    public function deactivate() {
        // Cleanup scheduled events
        foreach (array('knokspack_daily_cleanup', 'knokspack_security_scan', 'knokspack_scheduled_backup') as $hook) {
            wp_clear_scheduled_hook($hook);
        }
    }

    /**
     * Install database tables
     */
    private function install_tables() {
        global $wpdb;

        $wpdb->hide_errors();
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

        // Create activity log table
        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE {$wpdb->prefix}knokspack_activity_log (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            user_id bigint(20) NOT NULL,
            action varchar(255) NOT NULL,
            object_type varchar(50) NOT NULL,
            object_id bigint(20),
            ip_address varchar(45),
            details text,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            KEY user_id (user_id),
            KEY action (action),
            KEY created_at (created_at)
        ) $charset_collate;";

        dbDelta($sql);

        // Create backups table
        $sql = "CREATE TABLE {$wpdb->prefix}knokspack_backups (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            type varchar(50) NOT NULL,
            file_path varchar(255) NOT NULL,
            size bigint(20) NOT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            status varchar(50) DEFAULT 'completed',
            error text,
            PRIMARY KEY  (id),
            KEY type (type),
            KEY status (status),
            KEY created_at (created_at)
        ) $charset_collate;";

        dbDelta($sql);

        // The analytics tables are created by modules/stats.php.

        // Create cache directory
        $cache_dir = WP_CONTENT_DIR . '/cache/knokspack';
        if (!file_exists($cache_dir)) {
            wp_mkdir_p($cache_dir);
        }

        // Create backup directory
        $backup_dir = WP_CONTENT_DIR . '/backups/knokspack';
        if (!file_exists($backup_dir)) {
            wp_mkdir_p($backup_dir);
        }

        // Set initial options
        $this->set_default_options();
        update_option('knokspack_db_version', KNOKSPACK_DB_VERSION);
    }

    /**
     * Set default options
     */
    private function set_default_options() {
        $default_options = array(
            'security' => array(
                'firewall_enabled' => true,
                'brute_force_protection' => true,
                'activity_log_enabled' => true,
                'scan_frequency' => 'daily'
            ),
            'performance' => array(
                'cache_enabled' => true,
                'minify_css' => true,
                'minify_js' => true,
                'lazy_load' => true
            ),
            'backup' => array(
                'frequency' => 'daily',
                'retention_days' => 30,
                'include_files' => true,
                'include_database' => true
            ),
            'stats' => array(
                'enable_tracking' => true,
                'track_visitors' => true,
                'track_page_views' => true,
                'track_events' => true,
                'retention_days' => 90
            )
        );

        foreach ($default_options as $option_name => $values) {
            if (!get_option('knokspack_' . $option_name)) {
                add_option('knokspack_' . $option_name, $values);
            }
        }
    }
}

/**
 * Initialize Knokspack
 * @return Knokspack
 */
function knokspack() {
    return Knokspack::instance();
}

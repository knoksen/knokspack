<?php
/**
 * Plugin loader for Knokspack
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class responsible for loading the plugin
 */
class Knokspack_Loader {
    /**
     * Plugin instance
     * @var Knokspack_Loader
     */
    private static $instance = null;

    /**
     * Get the singleton instance
     * @return Knokspack_Loader
     */
    public static function get_instance() {
        if (is_null(self::$instance)) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Constructor
     */
    private function __construct() {
        // Load required files
        $this->load_dependencies();

        // Initialize hooks
        $this->init_hooks();
    }

    /**
     * Load required dependencies
     */
    private function load_dependencies() {
        // Core files
        require_once KNOKSPACK_INCLUDES_DIR . 'class-knokspack-autoloader.php';
        require_once KNOKSPACK_INCLUDES_DIR . 'class-knokspack.php';

        // Initialize autoloader
        new Knokspack_Autoloader();

        // Load modules
        if (function_exists('is_admin')) {
            $this->load_modules();
        }
    }

    /**
     * Initialize hooks
     */
    private function init_hooks() {
        // Load text domain
        if (function_exists('add_action')) {
            add_action('init', array($this, 'load_textdomain'));
            add_action('admin_menu', array($this, 'register_admin_menu'));
            add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
        }
    }

    /**
     * Load plugin text domain
     */
    public function load_textdomain() {
        if (function_exists('load_plugin_textdomain')) {
            load_plugin_textdomain(
                'knokspack',
                false,
                dirname(KNOKSPACK_BASENAME) . '/languages'
            );
        }
    }

    /**
     * Load plugin modules
     */
    private function load_modules() {
        $modules = array(
            'stats',
            'security',
            'backup',
            'analytics',
            'ai',
            'crm',
            'growth',
            'promotion'
        );

        foreach ($modules as $module) {
            $module_file = KNOKSPACK_MODULES_DIR . $module . '.php';
            if (file_exists($module_file)) {
                require_once $module_file;
            }
        }
    }

    /**
     * Initialize plugin
     */
    public function init_plugin() {
        // Initialize the main plugin class
        knokspack();
    }

    /**
     * Plugin activation
     */
    public function activate() {
        // Run activation tasks
        knokspack()->activate();
    }

    /**
     * Plugin deactivation
     */
    public function deactivate() {
        // Run deactivation tasks
        knokspack()->deactivate();
    }

    /**
     * Enqueue admin scripts and styles
     */
    public function enqueue_admin_scripts($hook) {
        // Only load on plugin pages
        if (strpos($hook, 'knokspack') === false) {
            return;
        }

        // Font dependencies
        wp_enqueue_style(
            'knokspack-fonts',
            'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
            array(),
            KNOKSPACK_VERSION
        );

        // Analytics styles
        wp_enqueue_style(
            'knokspack-analytics',
            KNOKSPACK_ASSETS_URL . 'css/analytics.css',
            array(),
            KNOKSPACK_VERSION
        );

        // React app scripts
        if (file_exists(KNOKSPACK_PATH . 'dist/index.js')) {
            wp_enqueue_script(
                'knokspack-app',
                KNOKSPACK_URL . 'dist/index.js',
                array('wp-element', 'wp-components', 'wp-api-fetch'),
                KNOKSPACK_VERSION,
                true
            );

            wp_localize_script('knokspack-app', 'knokspackData', array(
                'ajaxUrl' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('knokspack-nonce'),
                'pluginUrl' => KNOKSPACK_URL
            ));
        }
    }

    /**
     * Register admin menu
     */
    public function register_admin_menu() {
        add_menu_page(
            'Knokspack',
            'Knokspack',
            'manage_options',
            'knokspack',
            array($this, 'render_admin_page'),
            'dashicons-admin-generic',
            30
        );

        add_submenu_page(
            'knokspack',
            'Analytics',
            'Analytics',
            'manage_options',
            'knokspack-analytics',
            array($this, 'render_admin_page')
        );
    }

    /**
     * Render admin page
     */
    public function render_admin_page() {
        echo '<div class="wrap"><div id="knokspack-root"></div></div>';
    }
}

<?php
/**
 * Plugin Name: Knokspack - Complete WordPress Toolkit
 * Description: A comprehensive suite of tools for security, performance, backups, analytics, AI assistance, and more.
 * Version: 2.0.0
 * Author: knoksen
 * Author URI: https://knoksen.com
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * Text Domain: knokspack
 * Domain Path: /languages
 *
 * @package Knokspack
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

// Load required core files
require_once(ABSPATH . 'wp-admin/includes/plugin.php');

// Define plugin constants
define('KNOKSPACK_VERSION', '2.0.0');
define('KNOKSPACK_PATH', plugin_dir_path(__FILE__));
define('KNOKSPACK_URL', plugin_dir_url(__FILE__));
define('KNOKSPACK_BASENAME', plugin_basename(__FILE__));
define('KNOKSPACK_MODULES_DIR', KNOKSPACK_PATH . 'modules/');
define('KNOKSPACK_INCLUDES_DIR', KNOKSPACK_PATH . 'includes/');
define('KNOKSPACK_ASSETS_URL', KNOKSPACK_URL . 'assets/');

// Initialize the plugin
function knokspack_init() {
    // Load text domain for translations
    load_plugin_textdomain('knokspack', false, dirname(KNOKSPACK_BASENAME) . '/languages');

    // Load module files
    $modules = array(
        'performance', 'security', 'backup', 'analytics', 'ai', 'social',
        'stats', 'crm', 'growth', 'promotion', 'search', 'cdn', 'scan',
        'blocks', 'icons', 'design'
    );

    foreach ($modules as $module) {
        $module_file = KNOKSPACK_MODULES_DIR . $module . '.php';
        if (file_exists($module_file)) {
            require_once $module_file;
        }
    }
}

// Register activation hook
register_activation_hook(__FILE__, 'knokspack_activate');

function knokspack_activate() {
    // Create necessary database tables
    global $wpdb;
    
    // Create analytics table
    $table_name = $wpdb->prefix . 'knokspack_analytics';
    $charset_collate = $wpdb->get_charset_collate();
    
    $sql = "CREATE TABLE IF NOT EXISTS $table_name (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        page_id bigint(20),
        url varchar(255) NOT NULL,
        visitor_id varchar(32),
        referrer varchar(255),
        device varchar(50),
        browser varchar(50),
        country varchar(2),
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY page_id (page_id),
        KEY visitor_id (visitor_id),
        KEY created_at (created_at)
    ) $charset_collate;";

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);

    // Create necessary directories
    wp_mkdir_p(WP_CONTENT_DIR . '/uploads/knokspack');

    // Set default options
    $default_options = array(
        'analytics' => array(
            'tracking_enabled' => true,
            'exclude_admins' => true,
            'anonymize_ips' => true
        )
    );

    foreach ($default_options as $option_name => $values) {
        if (!get_option('knokspack_' . $option_name)) {
            add_option('knokspack_' . $option_name, $values);
        }
    }

    // Flush rewrite rules
    flush_rewrite_rules();
}

function knokspack_enqueue_scripts($hook) {
    // Only load on our plugin pages
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
    wp_enqueue_script(
        'knokspack-app',
        KNOKSPACK_URL . 'dist/index.js',
        array(),
        KNOKSPACK_VERSION,
        true
    );

    // Localize script
    wp_localize_script('knokspack-app', 'knokspackData', array(
        'ajaxUrl' => admin_url('admin-ajax.php'),
        'nonce' => wp_create_nonce('knokspack-nonce'),
        'pluginUrl' => KNOKSPACK_URL
    ));
}

function knokspack_admin_menu() {
    add_menu_page(
        'Knokspack',
        'Knokspack',
        'manage_options',
        'knokspack',
        'knokspack_render_admin_page',
        'dashicons-admin-generic',
        30
    );

    add_submenu_page(
        'knokspack',
        'Analytics',
        'Analytics',
        'manage_options',
        'knokspack-analytics',
        'knokspack_render_admin_page'
    );
}

function knokspack_render_admin_page() {
    echo '<div class="wrap"><div id="knokspack-root"></div></div>';
}

// Initialize plugin
add_action('plugins_loaded', 'knokspack_init');
add_action('admin_menu', 'knokspack_admin_menu');
add_action('admin_enqueue_scripts', 'knokspack_enqueue_scripts');
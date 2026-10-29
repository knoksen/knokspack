<?php
if (!defined('ABSPATH')) exit;

class Knokspack_Menu {
    private $pages = array();

    public function __construct() {
        add_action('admin_menu', array($this, 'setup_menu'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_menu_assets'));
    }

    public function setup_menu() {
        // Main menu
        add_menu_page(
            'Knokspack',
            'Knokspack',
            'manage_options',
            'knokspack',
            array($this, 'render_dashboard'),
            'dashicons-shield',
            30
        );

        // Dashboard submenu
        $this->add_submenu_page('dashboard', 'Dashboard', 'manage_options', array($this, 'render_dashboard'));

        // Security submenus
        $this->add_submenu_page('security', 'Security', 'manage_options', array($this, 'render_security'));
        $this->add_submenu_page('firewall', 'Firewall', 'manage_options', array($this, 'render_firewall'));
        $this->add_submenu_page('malware-scan', 'Malware Scan', 'manage_options', array($this, 'render_malware_scan'));
        $this->add_submenu_page('activity-log', 'Activity Log', 'manage_options', array($this, 'render_activity_log'));

        // Performance submenus
        $this->add_submenu_page('performance', 'Performance', 'manage_options', array($this, 'render_performance'));
        $this->add_submenu_page('cdn', 'CDN', 'manage_options', array($this, 'render_cdn'));
        $this->add_submenu_page('cache', 'Cache', 'manage_options', array($this, 'render_cache'));

        // Backup submenus
        $this->add_submenu_page('backup', 'Backup & Restore', 'manage_options', array($this, 'render_backup'));
        $this->add_submenu_page('scheduled-backups', 'Scheduled Backups', 'manage_options', array($this, 'render_scheduled_backups'));

        // AI submenu
        $this->add_submenu_page('ai', 'AI Assistant', 'manage_options', array($this, 'render_ai'));

        // Marketing submenus
        $this->add_submenu_page('growth', 'Growth Tools', 'manage_options', array($this, 'render_growth'));
        $this->add_submenu_page('newsletter', 'Newsletter', 'manage_options', array($this, 'render_newsletter'));
        $this->add_submenu_page('social', 'Social Media', 'manage_options', array($this, 'render_social'));
        $this->add_submenu_page('promotion', 'Promotion', 'manage_options', array($this, 'render_promotion'));

        // CRM submenu
        $this->add_submenu_page('crm', 'CRM', 'manage_options', array($this, 'render_crm'));

        // Analytics submenus
        $this->add_submenu_page('analytics', 'Analytics', 'manage_options', array($this, 'render_analytics'));
        $this->add_submenu_page('search', 'Search', 'manage_options', array($this, 'render_search'));

        // Settings submenu
        $this->add_submenu_page('settings', 'Settings', 'manage_options', array($this, 'render_settings'));
    }

    private function add_submenu_page($slug, $title, $capability, $callback) {
        add_submenu_page(
            'knokspack',
            'Knokspack - ' . $title,
            $title,
            $capability,
            'knokspack-' . $slug,
            $callback
        );
        $this->pages[$slug] = $callback;
    }

    public function enqueue_menu_assets($hook) {
        // Only load assets on plugin pages
        if (strpos($hook, 'knokspack') === false) return;

        wp_enqueue_style(
            'knokspack-admin',
            plugins_url('css/admin.css', dirname(__FILE__)),
            array(),
            KNOKSPACK_VERSION
        );

        wp_enqueue_script(
            'knokspack-admin',
            plugins_url('js/admin.js', dirname(__FILE__)),
            array('jquery'),
            KNOKSPACK_VERSION,
            true
        );

        wp_localize_script('knokspack-admin', 'knokspackAdmin', array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('knokspack-admin'),
            'i18n' => array(
                'confirmReset' => __('Are you sure you want to reset all settings?', 'knokspack'),
                'confirmDelete' => __('Are you sure you want to delete this item?', 'knokspack')
            )
        ));
    }

    private function render_template($name) {
        if (!current_user_can('manage_options')) {
            wp_die(esc_html__('You do not have permission to access this page.', 'knokspack'));
        }
        $path = KNOKSPACK_PATH . 'templates/' . $name . '.php';
        if (is_file($path) && is_readable($path)) {
            include $path;
            return;
        }
        echo '<div class="wrap"><h1>' . esc_html__('Knokspack', 'knokspack') . '</h1><p>';
        echo esc_html__('This module interface is not configured yet.', 'knokspack');
        echo '</p></div>';
    }

    public function render_dashboard() {
        $this->render_template('dashboard');
    }

    public function render_security() {
        $this->render_template('security');
    }

    public function render_firewall() {
        $this->render_template('firewall');
    }

    public function render_malware_scan() {
        $this->render_template('malware-scan');
    }

    public function render_activity_log() {
        $this->render_template('activity-log');
    }

    public function render_performance() {
        $this->render_template('performance');
    }

    public function render_cdn() {
        $this->render_template('cdn');
    }

    public function render_cache() {
        $this->render_template('cache');
    }

    public function render_backup() {
        $this->render_template('backup');
    }

    public function render_scheduled_backups() {
        $this->render_template('scheduled-backups');
    }

    public function render_ai() {
        $this->render_template('ai');
    }

    public function render_growth() {
        $this->render_template('growth');
    }

    public function render_newsletter() {
        $this->render_template('newsletter');
    }

    public function render_social() {
        $this->render_template('social');
    }

    public function render_promotion() {
        $this->render_template('promotion');
    }

    public function render_crm() {
        $this->render_template('crm');
    }

    public function render_analytics() {
        $this->render_template('analytics');
    }

    public function render_search() {
        $this->render_template('search');
    }

    public function render_settings() {
        $this->render_template('settings');
    }
}

// Initialize the menu
new Knokspack_Menu();

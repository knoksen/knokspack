<?php
if (!defined('ABSPATH')) exit;

class WPSS_Menu {
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

    public function render_dashboard() {
        include KNOKSPACK_PATH . 'templates/dashboard.php';
    }

    public function render_security() {
        include KNOKSPACK_PATH . 'templates/security.php';
    }

    public function render_firewall() {
        include KNOKSPACK_PATH . 'templates/firewall.php';
    }

    public function render_malware_scan() {
        include KNOKSPACK_PATH . 'templates/malware-scan.php';
    }

    public function render_activity_log() {
        include KNOKSPACK_PATH . 'templates/activity-log.php';
    }

    public function render_performance() {
        include KNOKSPACK_PATH . 'templates/performance.php';
    }

    public function render_cdn() {
        include KNOKSPACK_PATH . 'templates/cdn.php';
    }

    public function render_cache() {
        include KNOKSPACK_PATH . 'templates/cache.php';
    }

    public function render_backup() {
        include KNOKSPACK_PATH . 'templates/backup.php';
    }

    public function render_scheduled_backups() {
        include KNOKSPACK_PATH . 'templates/scheduled-backups.php';
    }

    public function render_ai() {
        include KNOKSPACK_PATH . 'templates/ai.php';
    }

    public function render_growth() {
        include KNOKSPACK_PATH . 'templates/growth.php';
    }

    public function render_newsletter() {
        include KNOKSPACK_PATH . 'templates/newsletter.php';
    }

    public function render_social() {
        include KNOKSPACK_PATH . 'templates/social.php';
    }

    public function render_promotion() {
        include KNOKSPACK_PATH . 'templates/promotion.php';
    }

    public function render_crm() {
        include KNOKSPACK_PATH . 'templates/crm.php';
    }

    public function render_analytics() {
        include KNOKSPACK_PATH . 'templates/analytics.php';
    }

    public function render_search() {
        include KNOKSPACK_PATH . 'templates/search.php';
    }

    public function render_settings() {
        include KNOKSPACK_PATH . 'templates/settings.php';
    }
}

// Initialize the menu
new WPSS_Menu();

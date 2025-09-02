<?php
if (!defined('ABSPATH')) exit;

class WPSS_Icons {
    public function __construct() {
        add_action('admin_menu', [$this, 'register_menu_icons']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_icon_styles']);
    }

    public function register_menu_icons() {
        $icons = array(
            'ai' => 'dashicons-robot',
            'analytics' => 'dashicons-chart-area',
            'backup' => 'dashicons-backup',
            'crm' => 'dashicons-groups',
            'growth' => 'dashicons-chart-line',
            'mobile' => 'dashicons-smartphone',
            'newsletter' => 'dashicons-email',
            'performance' => 'dashicons-performance',
            'promotion' => 'dashicons-megaphone',
            'scan' => 'dashicons-shield',
            'search' => 'dashicons-search',
            'security' => 'dashicons-lock',
            'social' => 'dashicons-share',
            'video' => 'dashicons-video-alt3'
        );

        foreach ($icons as $key => $icon) {
            $title = ucfirst($key);
            add_menu_page(
                $title,
                $title,
                'manage_options',
                'wpss_' . $key,
                'wpss_render_' . $key . '_page',
                $icon
            );
        }
    }

    public function enqueue_icon_styles() {
        wp_enqueue_style('dashicons');
        wp_enqueue_style('wpss-icons', plugins_url('css/wpss-icons.css', __FILE__));
    }
}

new WPSS_Icons();

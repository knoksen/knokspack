<?php
if (!defined('ABSPATH')) exit;

class Knokspack_Icons {
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
            $callback = 'knokspack_render_' . $key . '_page';
            if (!function_exists($callback)) {
                $callback = [$this, 'render_unavailable_page'];
            }
            add_menu_page(
                $title,
                $title,
                'manage_options',
                'knokspack_' . $key,
                $callback,
                $icon
            );
        }
    }

    public function render_unavailable_page() {
        if (!current_user_can('manage_options')) {
            wp_die(esc_html__('You do not have permission to access this page.', 'knokspack'));
        }
        echo '<div class="wrap"><h1>' . esc_html__('Knokspack', 'knokspack') . '</h1><p>';
        echo esc_html__('This module interface is not configured yet.', 'knokspack');
        echo '</p></div>';
    }

    public function enqueue_icon_styles() {
        wp_enqueue_style('dashicons');
        wp_enqueue_style('knokspack-icons', plugins_url('assets/css/knokspack-icons.css', __FILE__));
    }
}

new Knokspack_Icons();

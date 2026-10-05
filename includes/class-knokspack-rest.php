<?php
/**
 * REST API for the admin dashboard: real numbers from this site.
 *
 * GET  knokspack/v1/overview  – stats, security, backups and recent activity
 * POST knokspack/v1/scan      – run the malware-signature scan now
 *
 * @package Knokspack
 */

if (!defined('ABSPATH')) {
    exit;
}

class Knokspack_REST {
    public function __construct() {
        add_action('rest_api_init', array($this, 'routes'));
    }

    public function routes() {
        register_rest_route('knokspack/v1', '/overview', array(
            'methods'             => 'GET',
            'callback'            => array($this, 'overview'),
            'permission_callback' => array($this, 'is_admin'),
        ));
        register_rest_route('knokspack/v1', '/scan', array(
            'methods'             => 'POST',
            'callback'            => array($this, 'scan'),
            'permission_callback' => array($this, 'is_admin'),
        ));
    }

    public function is_admin() {
        return current_user_can('manage_options');
    }

    private function table_exists($table) {
        global $wpdb;
        return $wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s', $table)) === $table;
    }

    public function overview() {
        global $wpdb;
        $since = gmdate('Y-m-d H:i:s', time() - 30 * DAY_IN_SECONDS);

        $views = 0;
        $visitors = 0;
        $analytics = $wpdb->prefix . 'knokspack_analytics';
        if ($this->table_exists($analytics)) {
            $views = (int) $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM {$analytics} WHERE created_at >= %s", $since));
            $visitors = (int) $wpdb->get_var($wpdb->prepare("SELECT COUNT(DISTINCT visitor_id) FROM {$analytics} WHERE created_at >= %s", $since));
        }

        $blocked = 0;
        foreach ((array) get_option('knokspack_blocked_ips', array()) as $entry) {
            if (!empty($entry['expires']) && $entry['expires'] > time()) {
                $blocked++;
            }
        }

        $scan = (array) get_option('knokspack_last_scan_results', array());
        $scan_time = (int) get_option('knokspack_last_scan_time', 0);

        $backups = array();
        $backups_table = $wpdb->prefix . 'knokspack_backups';
        if ($this->table_exists($backups_table)) {
            $backups = $wpdb->get_results("SELECT type, size, status, created_at FROM {$backups_table} ORDER BY created_at DESC LIMIT 5", ARRAY_A);
        }

        $activity = array();
        $log = $wpdb->prefix . 'knokspack_activity_log';
        if ($this->table_exists($log)) {
            $activity = $wpdb->get_results("SELECT action, details, created_at FROM {$log} ORDER BY id DESC LIMIT 10", ARRAY_A);
        }

        return array(
            'stats'    => array('views30' => $views, 'visitors30' => $visitors),
            'security' => array(
                'blockedIps' => $blocked,
                'lastScan'   => $scan_time ? gmdate('c', $scan_time) : null,
                'malware'    => count((array) ($scan['malware'] ?? array())),
                'changed'    => count((array) ($scan['file_changes'] ?? array())),
            ),
            'backups'  => $backups,
            'activity' => array_map(function ($row) {
                $row['details'] = json_decode((string) $row['details'], true);
                return $row;
            }, $activity),
            'ai'       => array('configured' => Knokspack_AI::is_configured()),
            'modules'  => knokspack_modules(),
        );
    }

    public function scan() {
        $security = $GLOBALS['knokspack_security'] ?? null;
        if (!$security instanceof Knokspack_Security) {
            return new WP_Error('knokspack_scan', __('The security module is not active.', 'knokspack'), array('status' => 400));
        }
        if (function_exists('set_time_limit')) {
            @set_time_limit(120);
        }
        $results = $security->run_security_scan();
        return array(
            'time'    => gmdate('c'),
            'malware' => array_map(function ($m) {
                return str_replace(ABSPATH, '', $m['file']);
            }, (array) $results['malware']),
            'changed' => array_map(function ($f) {
                return str_replace(ABSPATH, '', $f);
            }, (array) $results['file_changes']),
        );
    }
}

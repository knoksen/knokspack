<?php
/**
 * Stats tracking module for Knokspack
 * Handles visitor tracking, page views, and event tracking.
 *
 * @package Knokspack
 */

defined('ABSPATH') || die('No direct access!');

/**
 * Main stats tracking class
 * 
 * @since 1.0.0
 */
class Knokspack_Stats {
    /** @var string Current version number */
    const VERSION = '1.0.0';
    
    /** @var string Database version */
    const DB_VERSION = '1.0.0';

    /** @var array Plugin settings */
    private $options;

    /** @var array Default plugin settings */
    private $default_options = array(
        'enable_tracking' => true,
        'track_visitors' => true,
        'track_page_views' => true,
        'track_events' => true,
        'retention_days' => 90
    );

    /** @var string Database version */
    private $db_version = '1.1.0';

    public function __construct() {
        $this->options = wp_parse_args((array) get_option('knokspack_stats_settings', array()), $this->default_options);

        // Initialize stats
        add_action('init', array($this, 'init_stats'));
        
        // Track page views
        if ($this->options['track_page_views']) {
            add_action('wp', array($this, 'track_page_view'));
        }

        // AJAX handlers
        add_action('wp_ajax_knokspack_get_stats', array($this, 'ajax_get_stats'));
        add_action('wp_ajax_knokspack_track_event', array($this, 'ajax_track_event'));
        
        // Cleanup old data
        add_action('knokspack_daily_cleanup', array($this, 'cleanup_old_data'));
    }

    public function init_stats() {
        // dbDelta is expensive; only run it when the schema version changes.
        if (get_option('knokspack_stats_db_version') !== $this->db_version) {
            $this->create_tables();
        }
        $this->schedule_cleanup();
    }

    private function create_tables() {
        global $wpdb;
        
        $charset_collate = $wpdb->get_charset_collate();

        // Analytics table
        $table_name = $wpdb->prefix . 'knokspack_analytics';
        $sql = "CREATE TABLE $table_name (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            page_id bigint(20),
            url varchar(255) NOT NULL,
            visitor_id varchar(32),
            user_id bigint(20),
            referrer varchar(255),
            ip_address varchar(45),
            user_agent varchar(255),
            device varchar(50),
            browser varchar(50),
            country varchar(2),
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            KEY page_id (page_id),
            KEY visitor_id (visitor_id),
            KEY created_at (created_at)
        ) $charset_collate;";

        // Events table
        $events_table = $wpdb->prefix . 'knokspack_analytics_events';
        $sql .= "CREATE TABLE $events_table (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            event_type varchar(50) NOT NULL,
            event_name varchar(100) NOT NULL,
            event_data longtext,
            visitor_id varchar(32),
            user_id bigint(20),
            page_id bigint(20),
            url varchar(255),
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            KEY event_type (event_type),
            KEY event_name (event_name),
            KEY visitor_id (visitor_id),
            KEY created_at (created_at)
        ) $charset_collate;";

        // Daily Stats table
        $daily_table = $wpdb->prefix . 'knokspack_analytics_daily';
        $sql .= "CREATE TABLE $daily_table (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            stat_date date NOT NULL,
            stat_type varchar(50) NOT NULL,
            stat_name varchar(100) NOT NULL,
            stat_value bigint(20) NOT NULL DEFAULT 0,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            UNIQUE KEY stat_date_type_name (stat_date, stat_type, stat_name),
            KEY stat_type (stat_type),
            KEY stat_date (stat_date)
        ) $charset_collate;";

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);

        update_option('knokspack_stats_db_version', $this->db_version);
    }

    private function schedule_cleanup() {
        if (!wp_next_scheduled('knokspack_daily_cleanup')) {
            wp_schedule_event(time(), 'daily', 'knokspack_daily_cleanup');
        }
    }

    public function cleanup_old_data() {
        global $wpdb;
        
        $retention_days = absint($this->options['retention_days']);
        if ($retention_days < 1) $retention_days = 90;

        $date = date('Y-m-d H:i:s', strtotime("-$retention_days days"));

        // Clean up old analytics data
        $wpdb->query($wpdb->prepare(
            "DELETE FROM {$wpdb->prefix}knokspack_analytics WHERE created_at < %s",
            $date
        ));

        // Clean up old events
        $wpdb->query($wpdb->prepare(
            "DELETE FROM {$wpdb->prefix}knokspack_analytics_events WHERE created_at < %s",
            $date
        ));

        // Keep daily stats for historical records
    }

    public function track_page_view() {
        if (is_admin() || empty($this->options['track_page_views']) || empty($this->options['enable_tracking'])) return;
        if (wp_doing_ajax() || wp_doing_cron() || (defined('REST_REQUEST') && REST_REQUEST) || is_feed() || is_404() || is_preview()) return;
        if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') return;
        if (current_user_can('edit_posts')) return; // don't count the site's own editors
        if (preg_match('/bot|crawl|spider|slurp|preview|monitor/i', $this->user_agent())) return;

        global $wpdb;
        $visitor_id = $this->get_visitor_id();

        $data = array(
            'page_id' => (int) get_queried_object_id(),
            'url' => esc_url_raw(substr((string) ($_SERVER['REQUEST_URI'] ?? ''), 0, 255)),
            'visitor_id' => $visitor_id,
            'user_id' => get_current_user_id(),
            'referrer' => isset($_SERVER['HTTP_REFERER']) ? esc_url_raw(substr((string) $_SERVER['HTTP_REFERER'], 0, 255)) : '',
            // Privacy: no IP address or full user agent is stored.
            'ip_address' => '',
            'user_agent' => '',
            'device' => $this->get_device_type(),
            'browser' => $this->get_browser_type(),
            'country' => $this->get_visitor_country()
        );

        $wpdb->insert(
            $wpdb->prefix . 'knokspack_analytics',
            $data,
            array('%d', '%s', '%s', '%d', '%s', '%s', '%s', '%s', '%s', '%s')
        );
    }

    /**
     * Cookie-less visitor id: a hash of IP + user agent with a salt that
     * changes every day, so visitors can be counted per day but not followed
     * across days, and nothing is stored on the visitor's device.
     */
    private function get_visitor_id() {
        $ip = isset($_SERVER['REMOTE_ADDR']) ? (string) $_SERVER['REMOTE_ADDR'] : '';
        return substr(hash('sha256', wp_salt('nonce') . gmdate('Y-m-d') . $ip . $this->user_agent()), 0, 32);
    }

    private function user_agent() {
        return isset($_SERVER['HTTP_USER_AGENT']) ? (string) $_SERVER['HTTP_USER_AGENT'] : '';
    }

    private function get_device_type() {
        $user_agent = $this->user_agent();
        
        if (preg_match('/(tablet|ipad|playbook)|(android(?!.*(mobi|opera mini)))/i', strtolower($user_agent))) {
            return 'tablet';
        }
        
        if (preg_match('/(up.browser|up.link|mmp|symbian|smartphone|midp|wap|phone|android|iemobile)/i', strtolower($user_agent))) {
            return 'mobile';
        }
        
        return 'desktop';
    }

    private function get_browser_type() {
        $user_agent = $this->user_agent();
        
        if (strpos($user_agent, 'Chrome')) return 'chrome';
        if (strpos($user_agent, 'Firefox')) return 'firefox';
        if (strpos($user_agent, 'Safari')) return 'safari';
        if (strpos($user_agent, 'Edge')) return 'edge';
        if (strpos($user_agent, 'MSIE') || strpos($user_agent, 'Trident/7')) return 'ie';
        if (strpos($user_agent, 'Opera') || strpos($user_agent, 'OPR/')) return 'opera';
        
        return 'other';
    }

    private function get_visitor_country() {
        // This is a placeholder - in production, you would use a GeoIP service
        return '';
    }

    public function ajax_track_event() {
        check_ajax_referer('knokspack_stats_nonce');

        if (!$this->options['track_events']) {
            wp_send_json_error('Event tracking is disabled');
        }

        $event_type = sanitize_key($_POST['event_type']);
        $event_name = sanitize_key($_POST['event_name']);
        $event_data = isset($_POST['event_data']) ? sanitize_text_field($_POST['event_data']) : '';

        global $wpdb;
        $visitor_id = $this->get_visitor_id();

        $data = array(
            'event_type' => $event_type,
            'event_name' => $event_name,
            'event_data' => $event_data,
            'visitor_id' => $visitor_id,
            'user_id' => get_current_user_id(),
            'page_id' => isset($_POST['page_id']) ? absint($_POST['page_id']) : 0,
            'url' => isset($_POST['url']) ? esc_url_raw($_POST['url']) : ''
        );

        $result = $wpdb->insert(
            $wpdb->prefix . 'knokspack_analytics_events',
            $data,
            array('%s', '%s', '%s', '%s', '%d', '%d', '%s')
        );

        if ($result) {
            wp_send_json_success('Event tracked successfully');
        } else {
            wp_send_json_error('Failed to track event');
        }
    }

    public function ajax_get_stats() {
        check_ajax_referer('knokspack_stats_nonce');
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Insufficient permissions');
        }

        $period = isset($_GET['period']) ? sanitize_key($_GET['period']) : '7days';
        $type = isset($_GET['type']) ? sanitize_key($_GET['type']) : 'page_views';

        $stats = $this->get_stats($period, $type);
        wp_send_json_success($stats);
    }

    private function get_stats($period, $type) {
        global $wpdb;

        switch ($period) {
            case '24hours':
                $interval = '24 HOUR';
                $group_by = 'HOUR';
                break;
            case '7days':
                $interval = '7 DAY';
                $group_by = 'DATE';
                break;
            case '30days':
                $interval = '30 DAY';
                $group_by = 'DATE';
                break;
            default:
                $interval = '7 DAY';
                $group_by = 'DATE';
        }

        switch ($type) {
            case 'page_views':
                $table = $wpdb->prefix . 'knokspack_analytics';
                $query = $wpdb->prepare(
                    "SELECT DATE_FORMAT(created_at, %s) as label,
                            COUNT(*) as value
                     FROM $table
                     WHERE created_at >= DATE_SUB(NOW(), INTERVAL $interval)
                     GROUP BY label
                     ORDER BY created_at ASC",
                    $group_by === 'HOUR' ? '%Y-%m-%d %H:00:00' : '%Y-%m-%d'
                );
                break;

            case 'visitors':
                $table = $wpdb->prefix . 'knokspack_analytics';
                $query = $wpdb->prepare(
                    "SELECT DATE_FORMAT(created_at, %s) as label,
                            COUNT(DISTINCT visitor_id) as value
                     FROM $table
                     WHERE created_at >= DATE_SUB(NOW(), INTERVAL $interval)
                     GROUP BY label
                     ORDER BY created_at ASC",
                    $group_by === 'HOUR' ? '%Y-%m-%d %H:00:00' : '%Y-%m-%d'
                );
                break;

            case 'devices':
                $table = $wpdb->prefix . 'knokspack_analytics';
                $query = "SELECT device as label,
                                COUNT(*) as value
                         FROM $table
                         WHERE created_at >= DATE_SUB(NOW(), INTERVAL $interval)
                         GROUP BY device
                         ORDER BY value DESC";
                break;

            case 'browsers':
                $table = $wpdb->prefix . 'knokspack_analytics';
                $query = "SELECT browser as label,
                                COUNT(*) as value
                         FROM $table
                         WHERE created_at >= DATE_SUB(NOW(), INTERVAL $interval)
                         GROUP BY browser
                         ORDER BY value DESC";
                break;

            default:
                return array();
        }

        $results = $wpdb->get_results($query);
        return $results ? $results : array();
    }
}

// Initialize stats module
new Knokspack_Stats();

<?php

if ((defined('ABSPATH') === false)) {
    define('ABSPATH', dirname(__DIR__, 2) . DIRECTORY_SEPARATOR);
}

if ((defined('WP_CONTENT_DIR') === false)) { define('WP_CONTENT_DIR', ABSPATH . 'wp-content'); }

if ((class_exists('WP_Error') === false)) {
    class WP_Error {
        private $code;
        private $message;

        public function __construct($code = '', $message = '') {
            $this->code = $code;
            $this->message = $message;
        }

        public function get_error_code() {
            return $this->code;
        }

        public function get_error_message() {
            return $this->message;
        }
    }
}

class Knokspack_Test_Json_Response extends RuntimeException {
    public $payload;
    public $status;

    public function __construct($payload, $status = 200) {
        parent::__construct('WordPress JSON response');
        $this->payload = $payload;
        $this->status = $status;
    }
}

class Knokspack_Test_Wpdb {
    public $prefix = 'wp_';
    public $inserts = array();

    public function insert($table, $data, $format = null) {
        $this->inserts[] = array($table, $data, $format);
        return 1;
    }
}

$GLOBALS['knokspack_test_options'] = array();
$GLOBALS['knokspack_test_hooks'] = array();
$GLOBALS['wpdb'] = new Knokspack_Test_Wpdb();

if ((function_exists('add_action') === false)) {
    function add_action($hook, $callback) {
        $GLOBALS['knokspack_test_hooks'][$hook][] = $callback;
    }
}

if ((function_exists('get_option') === false)) {
    function get_option($name, $default = false) {
        return (array_key_exists($name, $GLOBALS['knokspack_test_options']) === true)
            ? $GLOBALS['knokspack_test_options'][$name]
            : $default;
    }
}

if ((function_exists('wp_parse_args') === false)) {
    function wp_parse_args($args, $defaults = array()) {
        return array_merge($defaults, (array) $args);
    }
}

if ((function_exists('check_ajax_referer') === false)) {
    function check_ajax_referer($action = -1, $query_arg = false, $stop = true) {
        return $GLOBALS['knokspack_test_nonce_result'] ?? 1;
    }
}

if ((function_exists('wp_send_json_error') === false)) {
    function wp_send_json_error($data = null, $status_code = null) {
        throw new Knokspack_Test_Json_Response(array('success' => false, 'data' => $data), $status_code ?: 200);
    }
}

if ((function_exists('wp_send_json_success') === false)) {
    function wp_send_json_success($data = null, $status_code = null) {
        throw new Knokspack_Test_Json_Response(array('success' => true, 'data' => $data), $status_code ?: 200);
    }
}

if ((function_exists('sanitize_key') === false)) {
    function sanitize_key($key) {
        return preg_replace('/[^a-z0-9_\-]/', '', strtolower((string) $key));
    }
}

if ((function_exists('wp_unslash') === false)) {
    function wp_unslash($value) {
        return $value;
    }
}

if ((function_exists('wp_hash') === false)) {
    function wp_hash($data, $scheme = 'auth') {
        return hash_hmac('sha256', $data, 'knokspack-test-secret');
    }
}

if ((function_exists('wp_create_nonce') === false)) {
    function wp_create_nonce($action = -1) {
        return 'test-nonce';
    }
}

if ((function_exists('is_ssl') === false)) {
    function is_ssl() {
        return false;
    }
}

if ((function_exists('is_admin') === false)) {
    function is_admin() {
        return false;
    }
}

if ((function_exists('wp_doing_ajax') === false)) {
    function wp_doing_ajax() {
        return false;
    }
}

if ((function_exists('wp_doing_cron') === false)) {
    function wp_doing_cron() {
        return false;
    }
}

if ((function_exists('is_feed') === false)) {
    function is_feed() {
        return false;
    }
}

if ((function_exists('is_404') === false)) {
    function is_404() {
        return false;
    }
}

if ((function_exists('is_preview') === false)) {
    function is_preview() {
        return false;
    }
}

if ((function_exists('current_user_can') === false)) {
    function current_user_can($capability) {
        return false;
    }
}

if ((function_exists('get_queried_object_id') === false)) {
    function get_queried_object_id() {
        return 123;
    }
}

if ((function_exists('get_current_user_id') === false)) {
    function get_current_user_id() {
        return 0;
    }
}

if ((function_exists('esc_url_raw') === false)) {
    function esc_url_raw($url) {
        return $url;
    }
}

if ((function_exists('wp_salt') === false)) {
    function wp_salt($scheme = 'auth') {
        return 'knokspack-test-salt';
    }
}

if ((function_exists('wp_enqueue_script') === false)) {
    function wp_enqueue_script() {}
}

if ((function_exists('wp_localize_script') === false)) {
    function wp_localize_script() {}
}

if ((function_exists('admin_url') === false)) {
    function admin_url($path = '') {
        return 'https://example.test/wp-admin/' . $path;
    }
}

if ((function_exists('home_url') === false)) {
    function home_url($path = '') {
        return 'https://example.test/' . ltrim($path, '/');
    }
}

if ((function_exists('wp_parse_url') === false)) {
    function wp_parse_url($url, $component = -1) {
        return parse_url($url, $component);
    }
}

if ((function_exists('esc_html_e') === false)) {
    function esc_html_e($text, $domain = null) {
        echo htmlspecialchars($text, ENT_QUOTES, 'UTF-8');
    }
}

if ((function_exists('__') === false)) {
    function __($text, $domain = null) {
        return $text;
    }
}

require_once ABSPATH . 'modules/stats.php';
require_once ABSPATH . 'modules/backup.php';

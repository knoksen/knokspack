<?php
if (!defined('ABSPATH')) exit;

/**
 * Front-end performance helpers. Everything that can change how a site
 * renders (page cache, script deferral, CDN) is opt-in under
 * Knokspack → Settings. Lazy loading is on by default.
 */
class Knokspack_Performance {
    private $options;

    public function __construct() {
        $this->options = wp_parse_args(
            (array) get_option('knokspack_performance_settings', array()),
            Knokspack_Settings_Defaults::performance()
        );

        add_action('init', [$this, 'init']);
        add_filter('script_loader_tag', [$this, 'defer_js_files'], 10, 3);
        add_filter('wp_get_attachment_image_attributes', [$this, 'add_lazy_loading'], 10, 3);
        add_action('save_post', [$this, 'clear_cache']);
        add_action('switch_theme', [$this, 'clear_cache']);
        add_action('update_option_knokspack_performance_settings', [$this, 'clear_cache']);
    }

    public function init() {
        if (!empty($this->options['enable_cache'])) {
            $this->setup_page_cache();
        }
        if (!empty($this->options['enable_cdn']) && !empty($this->options['cdn_url'])) {
            add_filter('wp_get_attachment_url', [$this, 'cdn_rewrite']);
        }
    }

    private function cacheable_request() {
        return !is_user_logged_in()
            && !is_admin()
            && ($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'GET'
            && empty($_GET)
            && !wp_doing_ajax()
            && !wp_doing_cron()
            && !(defined('REST_REQUEST') && REST_REQUEST)
            && !$this->has_session_cookie();
    }

    private function has_session_cookie() {
        foreach (array_keys($_COOKIE) as $name) {
            if (preg_match('/^(wordpress_logged_in_|wp-postpass_|comment_author_|woocommerce_items_in_cart|wp_woocommerce_session_)/', $name)) {
                return true;
            }
        }
        return false;
    }

    private function setup_page_cache() {
        add_action('template_redirect', function () {
            if (!$this->cacheable_request() || is_404() || is_search() || is_feed() || is_preview()) {
                return;
            }
            $cache_file = $this->get_cache_file_path();
            $expiry = (int) $this->options['cache_expiry'];
            if (is_readable($cache_file) && time() - filemtime($cache_file) < $expiry) {
                header('X-Knokspack-Cache: HIT');
                readfile($cache_file);
                exit;
            }
            header('X-Knokspack-Cache: MISS');
            ob_start(function ($buffer) use ($cache_file) {
                // Only store complete, successful HTML pages.
                if (http_response_code() === 200 && stripos($buffer, '</html>') !== false) {
                    @file_put_contents($cache_file, $buffer, LOCK_EX);
                }
                return $buffer;
            });
        }, 0);
    }

    private function cache_dir() {
        return trailingslashit(WP_CONTENT_DIR) . 'cache/knokspack/';
    }

    private function get_cache_file_path() {
        $dir = $this->cache_dir();
        if (!is_dir($dir)) {
            wp_mkdir_p($dir);
        }
        $key = (is_ssl() ? 'https' : 'http') . '://' . ($_SERVER['HTTP_HOST'] ?? '') . ($_SERVER['REQUEST_URI'] ?? '/');
        return $dir . md5($key) . '.html';
    }

    public function cdn_rewrite($url) {
        return str_replace(home_url(), untrailingslashit($this->options['cdn_url']), $url);
    }

    public function defer_js_files($tag, $handle, $src) {
        if (is_admin() || empty($this->options['defer_js'])) return $tag;
        if (strpos($handle, 'jquery') !== false || strpos($tag, ' defer') !== false || strpos($tag, ' async') !== false || strpos($tag, 'type="module"') !== false) {
            return $tag;
        }
        // Scripts with inline code attached must run in order; leave them alone.
        $scripts = wp_scripts();
        if (!empty($scripts->get_data($handle, 'after')) || !empty($scripts->get_data($handle, 'before'))) {
            return $tag;
        }
        return str_replace(' src=', ' defer src=', $tag);
    }

    public function add_lazy_loading($attrs, $attachment, $size) {
        if (empty($this->options['enable_lazy_load'])) return $attrs;
        if (empty($attrs['loading'])) {
            $attrs['loading'] = 'lazy';
        }
        return $attrs;
    }

    public function clear_cache() {
        $files = glob($this->cache_dir() . '*.html');
        if (is_array($files)) {
            array_map('unlink', $files);
        }
    }
}

new Knokspack_Performance();

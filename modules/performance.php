<?php
if (!defined('ABSPATH')) exit;

class WPSS_Performance {
    private $options;

    public function __construct() {
        $this->options = get_option('wpss_performance_settings', [
            'enable_cache' => true,
            'enable_cdn' => false,
            'enable_lazy_load' => true,
            'minify_css' => true,
            'minify_js' => true,
            'defer_js' => true,
            'cdn_url' => '',
            'cache_expiry' => 3600
        ]);

        add_action('init', [$this, 'init']);
        add_action('wp_enqueue_scripts', [$this, 'optimize_assets'], 999);
        add_filter('script_loader_tag', [$this, 'defer_js_files'], 10, 3);
        add_filter('wp_get_attachment_image_attributes', [$this, 'add_lazy_loading'], 10, 3);
    }

    public function init() {
        if ($this->options['enable_cache']) {
            $this->setup_page_cache();
        }
        if ($this->options['enable_cdn']) {
            add_filter('wp_get_attachment_url', [$this, 'cdn_rewrite']);
            add_filter('theme_file_uri', [$this, 'cdn_rewrite']);
            add_filter('plugins_url', [$this, 'cdn_rewrite']);
        }
    }

    public function optimize_assets() {
        if ($this->options['minify_css']) {
            // Minify CSS
            $this->minify_css_files();
        }
        if ($this->options['minify_js']) {
            // Minify JS
            $this->minify_js_files();
        }
    }

    private function setup_page_cache() {
        if (!defined('WP_CACHE')) {
            define('WP_CACHE', true);
        }
        
        add_action('template_redirect', function() {
            if (!is_user_logged_in() && !is_admin()) {
                $cache_file = $this->get_cache_file_path();
                if (file_exists($cache_file) && time() - filemtime($cache_file) < $this->options['cache_expiry']) {
                    readfile($cache_file);
                    exit;
                }
                ob_start(function($buffer) use ($cache_file) {
                    file_put_contents($cache_file, $buffer);
                    return $buffer;
                });
            }
        });
    }

    private function get_cache_file_path() {
        $url_path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $cache_path = WP_CONTENT_DIR . '/cache/wpss';
        if (!is_dir($cache_path)) {
            wp_mkdir_p($cache_path);
        }
        return $cache_path . md5($url_path) . '.html';
    }

    public function cdn_rewrite($url) {
        if (empty($this->options['cdn_url'])) return $url;
        return str_replace(site_url(), $this->options['cdn_url'], $url);
    }

    public function defer_js_files($tag, $handle, $src) {
        if (!$this->options['defer_js']) return $tag;
        if (strpos($handle, 'jquery') !== false) return $tag;
        return str_replace(' src=', ' defer src=', $tag);
    }

    public function add_lazy_loading($attrs, $attachment, $size) {
        if (!$this->options['enable_lazy_load']) return $attrs;
        $attrs['loading'] = 'lazy';
        return $attrs;
    }

    private function minify_css_files() {
        // CSS minification logic
        add_filter('style_loader_src', function($src) {
            if (strpos($src, '.min.css') !== false) return $src;
            return str_replace('.css', '.min.css', $src);
        });
    }

    private function minify_js_files() {
        // JS minification logic
        add_filter('script_loader_src', function($src) {
            if (strpos($src, '.min.js') !== false) return $src;
            return str_replace('.js', '.min.js', $src);
        });
    }

    public function clear_cache() {
        $cache_path = WP_CONTENT_DIR . '/cache/wpss';
        if (is_dir($cache_path)) {
            array_map('unlink', glob("$cache_path/*"));
        }
    }
}

new WPSS_Performance();

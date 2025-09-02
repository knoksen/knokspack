<?php
if (!defined('ABSPATH')) exit;

class Knokspack_Design {
    private $options;

    public function __construct() {
        if (!function_exists('add_action')) {
            return;
        }
        // Delay initialization until WordPress is fully loaded
        add_action('init', array($this, 'init'));
    }

    public function init() {
        $this->options = get_option('knokspack_design_settings', array(
            'enable_blocks' => true,
            'enable_templates' => true,
            'custom_css' => '',
            'custom_js' => '',
            'custom_fonts' => array()
        ));

        // Initialize design features
        add_action('init', array($this, 'register_blocks'), 20);
        add_action('wp_enqueue_scripts', array($this, 'enqueue_custom_styles'));
        add_action('admin_menu', array($this, 'add_design_menu'));
        add_action('wp_ajax_knokspack_save_design', array($this, 'ajax_save_design'));
    }

    public function register_blocks() {
        if (!function_exists('register_block_type') || !$this->options['enable_blocks']) {
            return;
        }

        // Register custom blocks for design
        register_block_type('knokspack/heading', array(
            'editor_script' => 'knokspack-heading-block',
            'editor_style' => 'knokspack-heading-block',
            'style' => 'knokspack-heading-block',
            'attributes' => array(
                'content' => array('type' => 'string'),
                'level' => array('type' => 'number', 'default' => 2),
                'alignment' => array('type' => 'string', 'default' => 'left'),
                'style' => array('type' => 'object')
            ),
            'render_callback' => array($this, 'render_heading_block')
        ));

        register_block_type('knokspack/container', array(
            'editor_script' => 'knokspack-container-block',
            'editor_style' => 'knokspack-container-block',
            'style' => 'knokspack-container-block',
            'attributes' => array(
                'width' => array('type' => 'string', 'default' => 'wide'),
                'padding' => array('type' => 'object'),
                'margin' => array('type' => 'object'),
                'background' => array('type' => 'object'),
                'content' => array('type' => 'string')
            ),
            'render_callback' => array($this, 'render_container_block')
        ));

        // Register block scripts
        wp_register_script(
            'knokspack-heading-block',
            KNOKSPACK_URL . 'assets/js/blocks/heading.js',
            array('wp-blocks', 'wp-element', 'wp-editor'),
            KNOKSPACK_VERSION,
            true
        );

        wp_register_script(
            'knokspack-container-block',
            KNOKSPACK_URL . 'assets/js/blocks/container.js',
            array('wp-blocks', 'wp-element', 'wp-editor'),
            KNOKSPACK_VERSION,
            true
        );

        // Register block styles
        wp_register_style(
            'knokspack-heading-block',
            KNOKSPACK_URL . 'assets/css/blocks/heading.css',
            array(),
            KNOKSPACK_VERSION
        );

        wp_register_style(
            'knokspack-container-block',
            KNOKSPACK_URL . 'assets/css/blocks/container.css',
            array(),
            KNOKSPACK_VERSION
        );
    }

    public function render_heading_block($attributes) {
        $level = isset($attributes['level']) ? $attributes['level'] : 2;
        $content = isset($attributes['content']) ? $attributes['content'] : '';
        $alignment = isset($attributes['alignment']) ? $attributes['alignment'] : 'left';
        $style = isset($attributes['style']) ? $this->parse_style_attribute($attributes['style']) : '';

        return sprintf(
            '<h%1$d class="knokspack-heading" style="text-align: %2$s; %3$s">%4$s</h%1$d>',
            $level,
            esc_attr($alignment),
            esc_attr($style),
            wp_kses_post($content)
        );
    }

    public function render_container_block($attributes) {
        $width = isset($attributes['width']) ? $attributes['width'] : 'wide';
        $content = isset($attributes['content']) ? $attributes['content'] : '';
        $style = $this->get_container_style($attributes);

        return sprintf(
            '<div class="knokspack-container knokspack-container-%s" style="%s">%s</div>',
            esc_attr($width),
            esc_attr($style),
            wp_kses_post($content)
        );
    }

    private function parse_style_attribute($style) {
        if (!is_array($style)) return '';

        $css = array();
        foreach ($style as $property => $value) {
            $property = sanitize_key($property);
            $value = sanitize_text_field($value);
            $css[] = "$property: $value";
        }

        return implode('; ', $css);
    }

    private function get_container_style($attributes) {
        $style = array();

        if (!empty($attributes['padding'])) {
            foreach ($attributes['padding'] as $side => $value) {
                $style[] = "padding-$side: " . esc_attr($value);
            }
        }

        if (!empty($attributes['margin'])) {
            foreach ($attributes['margin'] as $side => $value) {
                $style[] = "margin-$side: " . esc_attr($value);
            }
        }

        if (!empty($attributes['background'])) {
            if (!empty($attributes['background']['color'])) {
                $style[] = "background-color: " . esc_attr($attributes['background']['color']);
            }
            if (!empty($attributes['background']['image'])) {
                $style[] = "background-image: url('" . esc_url($attributes['background']['image']) . "')";
            }
        }

        return implode('; ', $style);
    }

    public function enqueue_custom_styles() {
        // Register and enqueue base design styles
        wp_register_style(
            'knokspack-design',
            KNOKSPACK_URL . 'assets/css/design.css',
            array(),
            KNOKSPACK_VERSION
        );
        wp_enqueue_style('knokspack-design');

        // Custom CSS
        if (!empty($this->options['custom_css'])) {
            wp_add_inline_style('knokspack-design', $this->options['custom_css']);
        }

        // Register and enqueue base design scripts
        wp_register_script(
            'knokspack-design',
            KNOKSPACK_URL . 'assets/js/design.js',
            array('jquery'),
            KNOKSPACK_VERSION,
            true
        );
        wp_enqueue_script('knokspack-design');

        // Custom JS
        if (!empty($this->options['custom_js'])) {
            wp_add_inline_script('knokspack-design', $this->options['custom_js']);
        }

        // Custom Fonts
        if (!empty($this->options['custom_fonts'])) {
            foreach ($this->options['custom_fonts'] as $font) {
                if (!empty($font['url'])) {
                    wp_enqueue_style(
                        'knokspack-font-' . sanitize_title($font['name']),
                        $font['url']
                    );
                }
            }
        }
    }

    public function add_design_menu() {
        add_submenu_page(
            'knokspack',
            'Design Settings',
            'Design',
            'manage_options',
            'knokspack-design',
            array($this, 'render_design_page')
        );
    }

    public function render_design_page() {
        if (!current_user_can('manage_options')) {
            return;
        }

        // Add design page template here
        include WPSS_PATH . 'templates/design-settings.php';
    }

    public function ajax_save_design() {
        check_ajax_referer('wpss_design_nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error('Insufficient permissions');
        }

        $settings = array();

        if (isset($_POST['custom_css'])) {
            $settings['custom_css'] = wp_kses_post($_POST['custom_css']);
        }

        if (isset($_POST['custom_js'])) {
            $settings['custom_js'] = wp_kses_post($_POST['custom_js']);
        }

        if (isset($_POST['custom_fonts'])) {
            $fonts = json_decode(stripslashes($_POST['custom_fonts']), true);
            if (is_array($fonts)) {
                $settings['custom_fonts'] = array_map(function($font) {
                    return array(
                        'name' => sanitize_text_field($font['name']),
                        'url' => esc_url_raw($font['url'])
                    );
                }, $fonts);
            }
        }

        update_option('wpss_design_settings', array_merge($this->options, $settings));

        wp_send_json_success('Design settings saved successfully');
    }
}

// Initialize the design module
new WPSS_Design();

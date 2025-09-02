<?php
if (!defined('ABSPATH')) exit;

class Knokspack_Blocks {
    public function __construct() {
        if (!function_exists('add_action')) {
            return;
        }
        add_action('init', [$this, 'register_blocks']);
    }

    public function register_blocks() {
        if (!function_exists('register_block_type')) return;

        // Register AI Content Helper block
        register_block_type('knokspack/ai-content-helper', array(
            'editor_script' => 'knokspack-ai-content-helper',
            'attributes' => array(
                'content' => array('type' => 'string'),
                'prompt' => array('type' => 'string'),
                'style' => array('type' => 'string'),
                'length' => array('type' => 'string')
            ),
            'render_callback' => [$this, 'render_ai_content_helper']
        ));

        wp_register_script(
            'knokspack-ai-content-helper',
            plugins_url('assets/js/blocks/ai-content-helper.js', dirname(__FILE__)),
            array('wp-blocks', 'wp-element', 'wp-editor', 'wp-components')
        );

        // Register Social Share block
        register_block_type('knokspack/social-share', array(
            'editor_script' => 'knokspack-social-share',
            'attributes' => array(
                'platforms' => array('type' => 'array'),
                'style' => array('type' => 'string'),
                'alignment' => array('type' => 'string')
            ),
            'render_callback' => [$this, 'render_social_share']
        ));

        wp_register_script(
            'knokspack-social-share',
            plugins_url('assets/js/blocks/social-share.js', dirname(__FILE__)),
            array('wp-blocks', 'wp-element', 'wp-editor', 'wp-components')
        );

        // Register Newsletter Signup block
        register_block_type('knokspack/newsletter-signup', array(
            'editor_script' => 'knokspack-newsletter-signup',
            'attributes' => array(
                'title' => array('type' => 'string'),
                'description' => array('type' => 'string'),
                'buttonText' => array('type' => 'string'),
                'style' => array('type' => 'string')
            ),
            'render_callback' => [$this, 'render_newsletter_signup']
        ));

        wp_register_script(
            'knokspack-newsletter-signup',
            plugins_url('assets/js/blocks/newsletter-signup.js', dirname(__FILE__)),
            array('wp-blocks', 'wp-element', 'wp-editor', 'wp-components')
        );
    }

    public function render_ai_content_helper($attributes) {
        if (empty($attributes['content'])) return '';
        return sprintf(
            '<div class="knokspack-ai-content">%s</div>',
            wp_kses_post($attributes['content'])
        );
    }

    public function render_social_share($attributes) {
        $platforms = $attributes['platforms'] ?? array('facebook', 'twitter', 'linkedin');
        $output = '<div class="knokspack-social-share">';
        foreach ($platforms as $platform) {
            $output .= sprintf(
                '<a href="#" class="knokspack-share-%s" data-platform="%s">Share on %s</a>',
                esc_attr($platform),
                esc_attr($platform),
                esc_html(ucfirst($platform))
            );
        }
        $output .= '</div>';
        return $output;
    }

    public function render_newsletter_signup($attributes) {
        $title = $attributes['title'] ?? 'Subscribe to our Newsletter';
        $description = $attributes['description'] ?? 'Stay updated with our latest news and updates.';
        $buttonText = $attributes['buttonText'] ?? 'Subscribe';
        
        return sprintf(
            '<div class="knokspack-newsletter-signup">
                <h3>%s</h3>
                <p>%s</p>
                <form class="knokspack-newsletter-form" method="post">
                    <input type="email" name="email" placeholder="Enter your email" required>
                    <button type="submit">%s</button>
                    %s
                </form>
            </div>',
            esc_html($title),
            esc_html($description),
            esc_html($buttonText),
            wp_nonce_field('knokspack_newsletter_signup', '_wpnonce', true, false)
        );
    }
}

new Knokspack_Blocks();

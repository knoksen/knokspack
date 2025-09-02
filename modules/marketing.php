<?php
if (!defined('ABSPATH')) exit;

class WPSS_Marketing {
    private $options;

    public function __construct() {
        $this->options = get_option('wpss_marketing_settings', array(
            'newsletter_enabled' => true,
            'social_auto_post' => false,
            'seo_meta_enabled' => true,
            'xml_sitemap' => true,
            'related_posts' => true
        ));

        // Add marketing features
        add_action('init', array($this, 'init_marketing'));
        add_action('wp_head', array($this, 'add_seo_meta'));
        add_action('publish_post', array($this, 'handle_post_publish'));
        add_action('wp_ajax_wpss_subscribe_newsletter', array($this, 'ajax_subscribe_newsletter'));
        add_action('wp_ajax_nopriv_wpss_subscribe_newsletter', array($this, 'ajax_subscribe_newsletter'));
    }

    public function init_marketing() {
        // Add XML sitemap support
        if ($this->options['xml_sitemap']) {
            add_action('init', array($this, 'generate_sitemap'));
        }

        // Add newsletter shortcode
        add_shortcode('wpss_newsletter', array($this, 'newsletter_shortcode'));
    }

    public function newsletter_shortcode($atts) {
        $atts = shortcode_atts(array(
            'title' => 'Subscribe to our Newsletter',
            'description' => 'Stay updated with our latest news and updates.',
            'button_text' => 'Subscribe'
        ), $atts);

        return sprintf(
            '<div class="wpss-newsletter">
                <h3>%s</h3>
                <p>%s</p>
                <form class="wpss-newsletter-form" method="post">
                    <input type="email" name="email" placeholder="Enter your email" required>
                    <button type="submit">%s</button>
                    %s
                </form>
            </div>',
            esc_html($atts['title']),
            esc_html($atts['description']),
            esc_html($atts['button_text']),
            wp_nonce_field('wpss_newsletter', '_wpnonce', true, false)
        );
    }

    public function add_seo_meta() {
        if (!$this->options['seo_meta_enabled']) return;

        global $post;
        if (!is_singular()) return;

        // Basic meta tags
        $meta_description = substr(strip_tags($post->post_content), 0, 160);
        printf('<meta name="description" content="%s" />', esc_attr($meta_description));

        // Open Graph tags
        printf('<meta property="og:title" content="%s" />', esc_attr(get_the_title()));
        printf('<meta property="og:description" content="%s" />', esc_attr($meta_description));
        printf('<meta property="og:url" content="%s" />', esc_url(get_permalink()));

        if (has_post_thumbnail()) {
            $thumbnail = wp_get_attachment_image_src(get_post_thumbnail_id(), 'large');
            if ($thumbnail) {
                printf('<meta property="og:image" content="%s" />', esc_url($thumbnail[0]));
            }
        }
    }

    public function generate_sitemap() {
        $sitemap_path = ABSPATH . 'sitemap.xml';
        
        if (!file_exists($sitemap_path) || (time() - filemtime($sitemap_path)) > 86400) {
            $xml = '<?xml version="1.0" encoding="UTF-8"?>';
            $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

            // Add homepage
            $xml .= sprintf(
                '<url><loc>%s</loc><lastmod>%s</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>',
                esc_url(home_url('/')),
                date('c')
            );

            // Add posts
            $posts = get_posts(array(
                'post_type' => 'post',
                'posts_per_page' => -1,
                'post_status' => 'publish'
            ));

            foreach ($posts as $post) {
                $xml .= sprintf(
                    '<url><loc>%s</loc><lastmod>%s</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>',
                    esc_url(get_permalink($post)),
                    date('c', strtotime($post->post_modified))
                );
            }

            // Add pages
            $pages = get_pages();
            foreach ($pages as $page) {
                $xml .= sprintf(
                    '<url><loc>%s</loc><lastmod>%s</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>',
                    esc_url(get_permalink($page)),
                    date('c', strtotime($page->post_modified))
                );
            }

            $xml .= '</urlset>';

            file_put_contents($sitemap_path, $xml);
        }
    }

    public function handle_post_publish($post_id) {
        // Auto-post to social media
        if ($this->options['social_auto_post']) {
            $this->post_to_social_media($post_id);
        }

        // Update sitemap
        if ($this->options['xml_sitemap']) {
            $this->generate_sitemap();
        }
    }

    private function post_to_social_media($post_id) {
        $post = get_post($post_id);
        if (!$post || $post->post_status !== 'publish') return;

        $title = get_the_title($post_id);
        $url = get_permalink($post_id);
        $excerpt = wp_trim_words($post->post_content, 20);

        // Facebook posting
        $fb_token = get_option('wpss_facebook_token');
        if ($fb_token) {
            $this->post_to_facebook($title, $url, $excerpt, $fb_token);
        }

        // Twitter posting
        $twitter_keys = get_option('wpss_twitter_keys');
        if ($twitter_keys) {
            $this->post_to_twitter($title, $url, $twitter_keys);
        }

        // LinkedIn posting
        $linkedin_token = get_option('wpss_linkedin_token');
        if ($linkedin_token) {
            $this->post_to_linkedin($title, $url, $excerpt, $linkedin_token);
        }
    }

    private function post_to_facebook($title, $url, $excerpt, $token) {
        $page_id = get_option('wpss_facebook_page_id');
        $endpoint = "https://graph.facebook.com/{$page_id}/feed";
        
        wp_remote_post($endpoint, array(
            'body' => array(
                'message' => $title . "\n\n" . $excerpt,
                'link' => $url,
                'access_token' => $token
            )
        ));
    }

    private function post_to_twitter($title, $url, $keys) {
        // Twitter posting implementation
        // Note: Twitter API v2 required
    }

    private function post_to_linkedin($title, $url, $excerpt, $token) {
        $endpoint = 'https://api.linkedin.com/v2/shares';
        
        wp_remote_post($endpoint, array(
            'headers' => array(
                'Authorization' => 'Bearer ' . $token,
                'Content-Type' => 'application/json'
            ),
            'body' => json_encode(array(
                'content' => array(
                    'contentEntities' => array(
                        array(
                            'entityLocation' => $url,
                            'thumbnails' => array($url)
                        )
                    ),
                    'title' => $title
                ),
                'distribution' => array(
                    'linkedInDistributionTarget' => array(
                        'visibleToGuest' => true
                    )
                ),
                'owner' => 'urn:li:organization:' . get_option('wpss_linkedin_company_id'),
                'text' => array('text' => $excerpt)
            ))
        ));
    }

    public function ajax_subscribe_newsletter() {
        check_ajax_referer('wpss_newsletter');

        $email = sanitize_email($_POST['email']);
        if (!is_email($email)) {
            wp_send_json_error('Invalid email address');
        }

        global $wpdb;
        $table_name = $wpdb->prefix . 'wpss_subscribers';

        // Check if already subscribed
        $exists = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM $table_name WHERE email = %s",
            $email
        ));

        if ($exists) {
            wp_send_json_error('Email already subscribed');
        }

        // Add subscriber
        $result = $wpdb->insert(
            $table_name,
            array(
                'email' => $email,
                'status' => 'pending',
                'created_at' => current_time('mysql')
            )
        );

        if ($result) {
            // Send confirmation email
            $this->send_confirmation_email($email);
            wp_send_json_success('Thank you for subscribing! Please check your email to confirm your subscription.');
        } else {
            wp_send_json_error('Subscription failed. Please try again later.');
        }
    }

    private function send_confirmation_email($email) {
        $subject = sprintf('%s - Please Confirm Your Subscription', get_bloginfo('name'));
        
        $token = wp_create_nonce('wpss_confirm_' . $email);
        $confirm_url = add_query_arg(array(
            'wpss_action' => 'confirm_subscription',
            'email' => urlencode($email),
            'token' => $token
        ), home_url('/'));

        $message = sprintf(
            "Hello!\n\n" .
            "Thank you for subscribing to our newsletter. " .
            "Please click the link below to confirm your subscription:\n\n" .
            "%s\n\n" .
            "If you did not request this subscription, please ignore this email.\n\n" .
            "Best regards,\n%s",
            $confirm_url,
            get_bloginfo('name')
        );

        wp_mail($email, $subject, $message);
    }
}

// Initialize the marketing module
new WPSS_Marketing();

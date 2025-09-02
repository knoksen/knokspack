<?php
if (!defined('ABSPATH')) exit;

function knokspack_search_init() {
    // Initialize search functionality
    add_action('rest_api_init', function () {
        register_rest_route('knokspack/v1', '/search', array(
            'methods' => 'GET',
            'callback' => 'knokspack_search_callback',
            'permission_callback' => function () {
                return current_user_can('manage_options');
            }
        ));
    });
}
add_action('init', 'knokspack_search_init');

function knokspack_search_callback($request) {
    // Search functionality implementation
    $query = $request->get_param('q');
    $results = array();
    
    if ($query) {
        $search_args = array(
            's' => $query,
            'post_type' => 'any',
            'posts_per_page' => 10
        );
        
        $search_query = new WP_Query($search_args);
        
        if ($search_query->have_posts()) {
            while ($search_query->have_posts()) {
                $search_query->the_post();
                $results[] = array(
                    'id' => get_the_ID(),
                    'title' => get_the_title(),
                    'url' => get_permalink(),
                    'type' => get_post_type(),
                    'excerpt' => get_the_excerpt()
                );
            }
        }
        wp_reset_postdata();
    }
    
    return new WP_REST_Response($results, 200);
}

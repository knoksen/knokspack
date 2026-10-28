<?php
/** CI-only nonce/identity fixture, copied only into the disposable site's mu-plugins. */
if (defined('KNOKSPACK_INTEGRATION_TEST') === false || KNOKSPACK_INTEGRATION_TEST !== true
    || getenv('KNOKSPACK_INTEGRATION_TEST') !== '1' || DB_NAME !== 'knokspack_integration'
    || DB_USER !== 'knokspack_integration' || home_url() !== 'http://127.0.0.1:8091') {
    return;
}
// Fixture users must never trigger outgoing mail.
add_filter('pre_wp_mail', '__return_true');
add_action('wp_ajax_knokspack_integration_session', function () {
    $data = array(
        'user_id' => get_current_user_id(),
        'rest' => wp_create_nonce('wp_rest'),
        'backup' => wp_create_nonce('knokspack_backup_nonce'),
        'stats' => wp_create_nonce('knokspack_stats_nonce'),
        'consent' => wp_create_nonce('knokspack_analytics_consent')
    );
    if (current_user_can('manage_options') === true) {
        global $wpdb;
        $data['backup_ids'] = $wpdb->get_col("SELECT id FROM {$wpdb->prefix}knokspack_backups ORDER BY id");
        $data['marker'] = get_option('knokspack_integration_marker');
    }
    wp_send_json_success($data);
});

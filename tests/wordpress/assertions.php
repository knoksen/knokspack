<?php
/** Real WordPress/SQL checks, only against the CI-created disposable installation. */
if (defined('KNOKSPACK_INTEGRATION_TEST') === false || KNOKSPACK_INTEGRATION_TEST !== true
    || DB_NAME !== 'knokspack_integration' || DB_USER !== 'knokspack_integration'
    || home_url() !== 'http://127.0.0.1:8091') {
    throw new RuntimeException('Refusing unrecognized fixture: ' . json_encode(array(
        'enabled' => defined('KNOKSPACK_INTEGRATION_TEST') === true ? KNOKSPACK_INTEGRATION_TEST : null,
        'database' => DB_NAME, 'database_user' => DB_USER, 'home' => home_url()
    )));
}
function knokspack_integration_check($condition, $description) {
    if ($condition !== true) throw new RuntimeException($description);
    WP_CLI::log('PASS: ' . $description);
}
global $wpdb;
knokspack_integration_check(count(knokspack_modules()) === 9, 'nine default modules registered');
foreach (knokspack_modules() as $module) {
    knokspack_integration_check(in_array(realpath(KNOKSPACK_MODULES_DIR . $module . '.php'), get_included_files(), true), 'module loaded: ' . $module);
}
foreach (array('activity_log', 'backups', 'analytics', 'analytics_events', 'analytics_daily') as $suffix) {
    $table = $wpdb->prefix . 'knokspack_' . $suffix;
    knokspack_integration_check($wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s', $table)) === $table, 'schema exists: ' . $suffix);
}
knokspack_integration_check(get_option('knokspack_stats')['enable_tracking'] === false, 'new-install core analytics default is off');
add_option('knokspack_integration_marker', 'synthetic-only');
update_option('knokspack_db_version', '0');
knokspack()->init();
knokspack_integration_check(get_option('knokspack_db_version') === KNOKSPACK_DB_VERSION && get_option('knokspack_integration_marker') === 'synthetic-only', 'schema refresh preserves existing option');

wp_set_current_user(0);
$request = new WP_REST_Request('GET', '/knokspack/v1/overview');
knokspack_integration_check(rest_do_request($request)->get_status() === 401, 'guest cannot read admin overview');
$subscriber = wp_create_user('integration_subscriber', wp_generate_password(32), 'subscriber@example.invalid');
knokspack_integration_check(is_wp_error($subscriber) === false, 'subscriber fixture created');
wp_set_current_user($subscriber);
knokspack_integration_check(rest_do_request($request)->get_status() === 403, 'subscriber cannot read admin overview');
$admin = get_user_by('login', 'integration_admin');
wp_set_current_user($admin->ID);
knokspack_integration_check(rest_do_request($request)->get_status() === 200, 'administrator can read admin overview');
wp_set_current_user(0);

$backup = $GLOBALS['knokspack_backup'];
$result = $backup->restore_backup(1);
knokspack_integration_check(is_wp_error($result) === true && $result->get_error_code() === 'restore_disabled', 'restore fails closed in real WordPress');
$id = $backup->create_backup('database');
knokspack_integration_check(is_int($id) === true && $id > 0, 'real database backup recorded');
$record = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}knokspack_backups WHERE id = %d", $id));
knokspack_integration_check($record->status === 'completed' && is_file($record->file_path) === true, 'archive completion persisted');
$archive = new ZipArchive();
knokspack_integration_check($archive->open($record->file_path, ZipArchive::CHECKCONS) === true, 'generated ZIP consistency verified');
$folder = basename($record->file_path, '.zip');
$sql = $archive->getFromName($folder . '/database.sql');
knokspack_integration_check(is_string($sql) === true && strpos($sql, 'knokspack_integration_marker') !== false && strpos($sql, 'synthetic-only') !== false, 'SQL export contains synthetic database fixture');
$manifest = json_decode($archive->getFromName($folder . '/manifest.json'), true);
knokspack_integration_check($manifest['id'] === $id && $manifest['type'] === 'database', 'manifest agrees with database record');
$archive->close();
knokspack_integration_check($wpdb->last_error === '', 'no database error after export');

update_option('knokspack_stats_settings', array('enable_tracking' => true, 'track_page_views' => true, 'track_visitors' => true));
knokspack()->deactivate();
foreach (array('knokspack_daily_cleanup', 'knokspack_security_scan', 'knokspack_scheduled_backup') as $hook) {
    knokspack_integration_check(wp_next_scheduled($hook) === false, 'deactivation clears scheduled hook: ' . $hook);
}
knokspack_integration_check(get_option('knokspack_integration_marker') === 'synthetic-only', 'deactivation preserves fixture data');

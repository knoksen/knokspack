<?php
/** Read-only: wp --path=/verified/root eval-file /path/to/preflight.php */
namespace Jarlhalla\Ecosystem;
if (!defined('ABSPATH')) exit;

function collect_preflight(): array {
    global $wpdb;
    $autoload = function_exists('wp_autoload_values_to_autoload') ? wp_autoload_values_to_autoload() : ['yes'];
    $placeholders = implode(',', array_fill(0, count($autoload), '%s'));
    // Names and byte counts only. Never return option values, emails or tokens.
    $summary = $wpdb->get_row($wpdb->prepare(
        "SELECT COUNT(*) AS count, COALESCE(SUM(LENGTH(option_value)),0) AS bytes FROM {$wpdb->options} WHERE autoload IN ($placeholders)",
        ...$autoload
    ), ARRAY_A);
    $largest = $wpdb->get_results($wpdb->prepare(
        "SELECT option_name AS name, LENGTH(option_value) AS bytes FROM {$wpdb->options} WHERE autoload IN ($placeholders) ORDER BY bytes DESC LIMIT 20",
        ...$autoload
    ), ARRAY_A);
    $cron = [];
    $now = time();
    foreach ((_get_cron_array() ?: []) as $timestamp => $hooks) {
        foreach ($hooks as $hook => $events) {
            // Deliberately omit event arguments, which may contain private data.
            $cron[] = ['hook'=>$hook, 'scheduled_utc'=>gmdate('c', (int)$timestamp),
                'overdue_seconds'=>max(0, $now-(int)$timestamp), 'instances'=>count($events)];
        }
    }
    $pages = [];
    if (function_exists('edd_get_option')) {
        foreach (['purchase_page','success_page','failure_page','purchase_history_page'] as $key) {
            $id = (int) edd_get_option($key, 0);
            $pages[$key] = ['id'=>$id, 'url'=>$id ? get_permalink($id) : null,
                'status'=>$id ? get_post_status($id) : 'not-configured'];
        }
    }
    $mu = [];
    if (is_dir(WPMU_PLUGIN_DIR)) {
        foreach (glob(WPMU_PLUGIN_DIR . '/*.php') ?: [] as $file) {
            $mu[] = ['file'=>basename($file), 'sha256'=>hash_file('sha256', $file)];
        }
    }
    return ['schema_version'=>1, 'observed_at'=>gmdate('c'), 'mode'=>'read-only',
        'wordpress'=>get_bloginfo('version'), 'environment'=>wp_get_environment_type(),
        'addresses'=>['home'=>get_option('home'), 'siteurl'=>get_option('siteurl')],
        'autoload'=>['count'=>(int)($summary['count'] ?? 0), 'bytes'=>(int)($summary['bytes'] ?? 0), 'largest'=>$largest],
        'cron'=>['disabled'=>defined('DISABLE_WP_CRON') && DISABLE_WP_CRON, 'events'=>$cron],
        'commerce_pages'=>$pages, 'mu_plugins'=>$mu,
        'limits'=>['No option values or cron arguments collected.',
            'Cron timestamps do not prove execution success.',
            'No HTTP cache/header tests, payment, email or restore performed.']];
}

if (defined('WP_CLI') && WP_CLI && !defined('JH_ECO_TESTING')) {
    echo wp_json_encode(collect_preflight(), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n";
}

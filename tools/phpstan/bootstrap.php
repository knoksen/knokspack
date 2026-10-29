<?php
/** Analysis-only initialization. Never load the WordPress entrypoint or production config. */
$plugin_root = dirname(__DIR__, 2);
$entry = file_get_contents($plugin_root . '/wp-site-suite.php');
$expected = [
    'KNOKSPACK_PATH' => "define('KNOKSPACK_PATH', plugin_dir_path(__FILE__));",
    'KNOKSPACK_URL' => "define('KNOKSPACK_URL', plugin_dir_url(__FILE__));",
    'KNOKSPACK_BASENAME' => "define('KNOKSPACK_BASENAME', plugin_basename(__FILE__));",
];
foreach ($expected as $declaration) {
    if (!str_contains($entry, $declaration)) {
        throw new RuntimeException('Plugin constant declaration changed: review analysis bootstrap.');
    }
}
$core = file_get_contents($plugin_root . '/includes/class-knokspack.php');
if (!preg_match("/define\('KNOKSPACK_DB_VERSION', '([^']+)'\)/", $core, $match)) {
    throw new RuntimeException('Database version declaration changed: review analysis bootstrap.');
}
// Paths use this checkout. URL is a reserved analysis fixture, never a live site URL.
define('KNOKSPACK_PATH', $plugin_root . '/');
define('KNOKSPACK_URL', 'https://analysis.invalid/knokspack/');
define('KNOKSPACK_BASENAME', basename($plugin_root) . '/wp-site-suite.php');
define('KNOKSPACK_DB_VERSION', $match[1]);

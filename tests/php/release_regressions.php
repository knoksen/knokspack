<?php
/** Isolated regression checks: no WordPress boot, network, SQL execution or files written. */
define('ABSPATH', __DIR__ . '/');
define('WP_CONTENT_DIR', __DIR__ . '/unused-content');
define('ARRAY_A', 'ARRAY_A');
define('KNOKSPACK_INCLUDES_DIR', dirname(__DIR__, 2) . '/includes/');
$GLOBALS['test_hooks'] = [];
$GLOBALS['test_options'] = [];

function check($condition, $message) {
    if (!$condition) {
        throw new RuntimeException($message);
    }
}
function add_action(...$args) { $GLOBALS['test_hooks'][] = $args; }
function get_option($name, $default = false) { return $GLOBALS['test_options'][$name] ?? $default; }
function wp_parse_args($args, $defaults = []) {
    check(func_num_args() <= 2, 'wp_parse_args must receive its supported arguments');
    return array_merge($defaults, $args);
}
function sanitize_text_field($value) { return strip_tags($value); }
function wp_unslash($value) { return stripslashes($value); }
function __($text, $domain = null) { return $text; }
function esc_html__($text, $domain = null) { return htmlspecialchars($text, ENT_QUOTES); }
function current_user_can($capability) { return $GLOBALS['test_admin'] ?? false; }
function wp_die($message) { throw new RuntimeException($message); }
function do_action(...$args) { $GLOBALS['test_events'][] = $args; }
function get_post($id) { return (object) ['post_status' => 'publish', 'post_content' => 'Fixture']; }
function get_the_title($id) { return 'Fixture title'; }
function get_permalink($id) { return 'https://example.invalid/post'; }
function wp_trim_words($text, $count) { return $text; }
function wp_remote_post(...$args) { throw new RuntimeException('Unexpected external request'); }
function is_wp_error($value) { return $value instanceof WP_Error; }
function add_menu_page(...$args) { $GLOBALS['test_menus'][] = $args; }
function knokspack_render_ai_page() {}
class WP_Error {
    public $code;
    public $message;
    public function __construct($code, $message) { $this->code = $code; $this->message = $message; }
}

class WP_List_Table {
    public $items = [];
    protected $_column_headers;
    public $pagination;
    public $page = 1;
    public function __construct($args = []) {}
    public function get_pagenum() { return $this->page; }
    protected function set_pagination_args($args) { $this->pagination = $args; }
}
class TestDatabase {
    public $prefix = 'test_';
    public $queries = [];
    public $prepared_args = [];
    public $rows = [['id' => 1, 'name' => 'Existing contact']];
    public $count = '21';
    public function prepare($sql, ...$args) {
        $this->prepared_args[] = $args;
        foreach ($args as $arg) {
            $sql = preg_replace_callback('/%[sd]/', function ($match) use ($arg) {
                return $match[0] === '%d' ? (string) (int) $arg : "'" . str_replace("'", "''", $arg) . "'";
            }, $sql, 1);
        }
        return $sql;
    }
    public function get_var($sql) { $this->queries[] = $sql; return $this->count; }
    public function get_results($sql, $format) { $this->queries[] = $sql; return $this->rows; }
    public function esc_like($text) { return addcslashes($text, '_%\\'); }
}

require dirname(__DIR__, 2) . '/modules/crm/class-knokspack-crm-contacts-table.php';
require dirname(__DIR__, 2) . '/modules/backup.php';
require dirname(__DIR__, 2) . '/includes/class-knokspack-autoloader.php';
require dirname(__DIR__, 2) . '/modules/icons.php';
require dirname(__DIR__, 2) . '/modules/marketing.php';
require dirname(__DIR__, 2) . '/tools/phpstan/bootstrap.php';
require dirname(__DIR__, 2) . '/modules/menu.php';

$checks = 0;
function run_case($name, $callback) {
    global $checks;
    $callback();
    ++$checks;
    echo "PASS: $name\n";
}
function table_for($request) {
    $_REQUEST = $request;
    $GLOBALS['wpdb'] = new TestDatabase();
    return new Knokspack_CRM_Contacts_Table();
}

run_case('valid sort and rows remain available to WP_List_Table', function () {
    $table = table_for(['orderby' => 'email', 'order' => 'asc']);
    $table->prepare_items();
    check(str_contains($GLOBALS['wpdb']->queries[1], 'ORDER BY email ASC'), 'valid sort lost');
    check($table->items === $GLOBALS['wpdb']->rows, 'results unavailable to renderer');
    check($table->pagination['total_items'] === 21, 'count must be an integer');
    check($table->pagination['per_page'] === 20, 'page size changed');
});
run_case('SQL sort payload is rejected', function () {
    $table = table_for(['orderby' => 'name DESC, (SELECT SLEEP(5))', 'order' => 'ASC; DROP TABLE contacts']);
    $table->prepare_items();
    check(str_contains($GLOBALS['wpdb']->queries[1], 'ORDER BY created_at DESC'), 'unsafe sort accepted');
    check(!str_contains($GLOBALS['wpdb']->queries[1], 'SLEEP'), 'SQL payload reached query');
});
run_case('array request values fail safely to defaults', function () {
    $table = table_for(['orderby' => ['name'], 'order' => ['ASC'], 's' => ['private']]);
    $table->prepare_items();
    check(str_contains($GLOBALS['wpdb']->queries[1], 'ORDER BY created_at DESC'), 'malformed sort accepted');
});
run_case('literal search wildcards are escaped and bound', function () {
    $table = table_for(['s' => '100%_match']);
    $table->prepare_items();
    $args = $GLOBALS['wpdb']->prepared_args[0];
    check($args === ['%100\\%\\_match%', '%100\\%\\_match%', '%100\\%\\_match%'], 'LIKE values are not escaped');
});
run_case('page offset and empty database result', function () {
    $table = table_for([]);
    $table->page = 3;
    $GLOBALS['wpdb']->rows = null;
    $GLOBALS['wpdb']->count = null;
    $table->prepare_items();
    check(str_contains($GLOBALS['wpdb']->queries[1], 'LIMIT 20 OFFSET 40'), 'wrong page offset');
    check($table->items === [], 'empty result must be an array');
    check($table->pagination['total_items'] === 0, 'empty count must be zero');
});
run_case('backup defaults and opt-in schedule preserved', function () {
    $backup = $GLOBALS['knokspack_backup'];
    $reflection = new ReflectionProperty($backup, 'options');
    $options = $reflection->getValue($backup);
    check($options['schedule_enabled'] === false, 'backup must remain opt-in');
    check($options['retention_days'] === 30, 'retention default changed');
    $GLOBALS['test_options']['knokspack_backup_settings'] = ['retention_days' => 12];
    $custom = new Knokspack_Backup();
    check($reflection->getValue($custom)['retention_days'] === 12, 'saved setting lost');
});
run_case('autoload registers and ignores unrelated classes', function () {
    $loader = new Knokspack_Autoloader();
    check(in_array([$loader, 'autoload'], spl_autoload_functions(), true), 'loader not registered');
    $loader->autoload('Unrelated_Missing_Class');
    check(!class_exists('Unrelated_Missing_Class', false), 'unrelated class changed');
    spl_autoload_unregister([$loader, 'autoload']);
});
run_case('legacy menu routes preserve valid callbacks and recover missing callbacks', function () {
    $GLOBALS['test_menus'] = [];
    $icons = new Knokspack_Icons();
    $icons->register_menu_icons();
    check(count($GLOBALS['test_menus']) === 14, 'existing menu routes changed');
    check($GLOBALS['test_menus'][0][4] === 'knokspack_render_ai_page', 'valid callback was replaced');
    foreach ($GLOBALS['test_menus'] as $menu) {
        check(is_callable($menu[4]), 'unusable menu callback registered');
    }
});
run_case('unconfigured menu page checks authorization', function () {
    $icons = new Knokspack_Icons();
    $GLOBALS['test_admin'] = false;
    $denied = false;
    try { $icons->render_unavailable_page(); } catch (RuntimeException $error) { $denied = true; }
    check($denied, 'unauthorized fallback page access');
    $GLOBALS['test_admin'] = true;
    ob_start();
    $icons->render_unavailable_page();
    $html = ob_get_clean();
    check(str_contains($html, 'not configured'), 'missing module is not clearly marked');
});
run_case('unimplemented Twitter reports failure without transmitting credentials', function () {
    $GLOBALS['test_events'] = [];
    $GLOBALS['test_options']['knokspack_twitter_keys'] = ['fixture-secret-not-real'];
    $marketing = new Knokspack_Marketing();
    $method = new ReflectionMethod($marketing, 'post_to_social_media');
    $method->invoke($marketing, 7);
    $event = $GLOBALS['test_events'][0] ?? [];
    check(($event[0] ?? '') === 'knokspack_social_post_failed', 'silent social failure');
    check($event[1] === 'twitter' && $event[2] === 7, 'failure attribution lost');
    check($event[3] instanceof WP_Error, 'failure is not structured');
    check(!str_contains(json_encode($event), 'fixture-secret-not-real'), 'credentials leaked in event');
});
run_case('missing legacy templates keep every route usable without include warnings', function () {
    $GLOBALS['test_admin'] = true;
    $menu = new Knokspack_Menu();
    set_error_handler(function ($severity, $message) { throw new RuntimeException($message); });
    try {
        foreach (['dashboard','security','firewall','malware_scan','activity_log','performance',
                  'cdn','cache','backup','scheduled_backups','ai','growth','newsletter','social',
                  'promotion','crm','analytics','search','settings'] as $route) {
            ob_start();
            $menu->{'render_' . $route}();
            $output = ob_get_clean();
            check(str_contains($output, 'not configured'), 'missing template must be explicit');
        }
    } finally { restore_error_handler(); }
});
run_case('legacy template route denies non-administrators', function () {
    $GLOBALS['test_admin'] = false;
    $denied = false;
    try { (new Knokspack_Menu())->render_dashboard(); }
    catch (RuntimeException $error) { $denied = true; }
    check($denied, 'legacy route bypassed authorization');
});
echo "$checks regression cases passed.\n";

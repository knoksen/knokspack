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
echo "$checks regression cases passed.\n";

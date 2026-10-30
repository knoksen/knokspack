<?php
/** Reconstruct only a disposable SQL fixture on a second, restricted MariaDB server. */
if (defined('KNOKSPACK_INTEGRATION_TEST') === false || KNOKSPACK_INTEGRATION_TEST !== true
    || getenv('GITHUB_ACTIONS') !== 'true' || DB_NAME !== 'knokspack_integration'
    || DB_USER !== 'knokspack_integration' || home_url() !== 'https://127.0.0.1:8092') {
    throw new RuntimeException('Refusing SQL roundtrip outside the disposable fixture');
}
function knokspack_roundtrip_check($condition, $message) {
    if ($condition !== true) throw new RuntimeException($message);
    WP_CLI::log('PASS: ' . $message);
}
function knokspack_roundtrip_import(mysqli $target, string $sql) {
    try {
        $target->multi_query($sql);
        do {
            $result = $target->store_result();
            if ($result instanceof mysqli_result) $result->free();
            if ($target->more_results() === false) break;
        } while ($target->next_result() === true);
    } catch (mysqli_sql_exception $error) {
        // Never print a SQL statement, row values or connection credentials.
        throw new RuntimeException('Scratch SQL import failed with database code ' . $error->getCode());
    }
}
global $wpdb;
$table = $wpdb->prefix . 'knokspack_roundtrip_fixture';
$quoted = '`' . str_replace('`', '``', $table) . '`';
$wpdb->query("CREATE TABLE $quoted (
    id bigint unsigned NOT NULL PRIMARY KEY,
    text_value longtext CHARACTER SET utf8mb4 NOT NULL,
    blob_value longblob NOT NULL,
    nullable_value varchar(64) NULL,
    exact_decimal decimal(30,12) NOT NULL,
    bit_value bit(9) NOT NULL,
    recorded_at datetime(6) NOT NULL,
    derived_value bigint GENERATED ALWAYS AS (id + 7) STORED
) ENGINE=InnoDB");
knokspack_roundtrip_check($wpdb->last_error === '', 'roundtrip fixture schema created');
for ($index = 1; $index <= 503; $index++) {
    $text = "fixture $index: quote ' slash \\ semicolon; newline\nCR\rNUL\0 UTF-8 \u{1F331}";
    $nullable = $index % 2 === 0 ? 'NULL' : "''";
    $inserted = $wpdb->query($wpdb->prepare(
        "INSERT INTO $quoted (id, text_value, blob_value, nullable_value, exact_decimal, bit_value, recorded_at)
         VALUES (%d, %s, UNHEX(%s), $nullable, %s, b'101010101', %s)",
        $index, $text, '0001275c0a0d1aff80c3a9', '-123456789012345678.123456789012', '2026-01-02 03:04:05.123456'
    ));
    knokspack_roundtrip_check($inserted === 1, 'synthetic fixture row inserted');
}
$query = "SELECT id, text_value, HEX(blob_value) AS blob_hex, nullable_value, exact_decimal, HEX(bit_value) AS bit_hex, recorded_at, derived_value FROM $quoted ORDER BY id";
$expected = $wpdb->get_results($query, ARRAY_A);
knokspack_roundtrip_check(count($expected) === 503, 'fixture spans the 500-row export page boundary');
$backup_id = $GLOBALS['knokspack_backup']->create_backup('database');
knokspack_roundtrip_check(is_int($backup_id) === true && $backup_id > 0, 'fixture database export completed');
$record = $wpdb->get_row($wpdb->prepare("SELECT file_path FROM {$wpdb->prefix}knokspack_backups WHERE id = %d", $backup_id));
$zip = new ZipArchive();
knokspack_roundtrip_check($zip->open($record->file_path, ZipArchive::RDONLY | ZipArchive::CHECKCONS) === true, 'roundtrip source is the newly generated archive');
$member = basename($record->file_path, '.zip') . '/database.sql';
$stat = $zip->statName($member);
knokspack_roundtrip_check(is_array($stat) === true && $stat['size'] < 8388608, 'synthetic SQL stays within the fixture budget');
$sql = $zip->getFromName($member, 8388608);
$zip->close();
knokspack_roundtrip_check(is_string($sql) === true, 'export SQL read without extracting arbitrary archive paths');

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
$target = new mysqli('127.0.0.1', 'knokspack_roundtrip', getenv('TEST_ROUNDTRIP_PASSWORD'), 'knokspack_roundtrip', 3307);
$target->set_charset($wpdb->charset);
knokspack_roundtrip_check($target->query('SELECT DATABASE()')->fetch_row()[0] === 'knokspack_roundtrip', 'SQL import is isolated on the scratch database server');
knokspack_roundtrip_check($target->query('SHOW TABLES')->num_rows === 0, 'refuse to overwrite a nonempty scratch database');
knokspack_roundtrip_import($target, $sql);
$actual = $target->query($query)->fetch_all(MYSQLI_ASSOC);
knokspack_roundtrip_check($actual === $expected, 'all 503 rows roundtrip exactly including binary, NULL, Unicode, decimals, timestamps and generated values');
$target->query("UPDATE $quoted SET text_value = 'scratch mutation' WHERE id = 1");
knokspack_roundtrip_import($target, $sql);
knokspack_roundtrip_check($target->query($query)->fetch_all(MYSQLI_ASSOC) === $expected, 'replaying the same fixture dump reverses a synthetic scratch mutation');
knokspack_roundtrip_check($wpdb->get_results($query, ARRAY_A) === $expected && get_option('knokspack_integration_marker') === 'synthetic-only', 'scratch import and replay never modify the WordPress source database');
$target->close();

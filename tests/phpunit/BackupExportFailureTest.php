<?php
use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\Attributes\RunInSeparateProcess;

class Knokspack_Test_ExportFailureDb extends Knokspack_Test_Wpdb {
    public $failure;

    public function get_row($sql, $format = null) {
        if ($this->failure === 'definition') return array('wp_fixture', 'CREATE VIEW wp_fixture AS SELECT 1');
        return array('wp_fixture', 'CREATE TABLE `wp_fixture` (`id` int, `payload` longblob)');
    }

    public function get_results($sql, $format = null) {
        if ($sql === 'SHOW TABLES') return array(array('wp_fixture'));
        if (strpos($sql, 'SHOW FULL COLUMNS') === 0) {
            if ($this->failure === 'metadata') { $this->last_error = 'synthetic sensitive metadata'; return array(); }
            return array(
                array('Field' => 'id', 'Type' => 'int', 'Extra' => ''),
                array('Field' => 'payload', 'Type' => 'longblob', 'Extra' => '')
            );
        }
        if (strpos($sql, 'SELECT ') === 0) {
            if (strpos($sql, 'OFFSET 500') !== false) { $this->last_error = 'synthetic sensitive row data'; return array(); }
            return array_fill(0, 500, array('id' => '1', 'payload' => '00FF'));
        }
        return array();
    }

    public function prepare($sql, ...$args) {
        foreach ($args as $arg) $sql = preg_replace('/%d/', (string) $arg, $sql, 1);
        return $sql;
    }

    public function _real_escape($value) { return $value; }
}

class BackupExportFailureTest extends TestCase {
    #[RunInSeparateProcess]
    public function test_definition_metadata_and_late_page_failures_never_create_successful_archives(): void {
        $root = sys_get_temp_dir() . '/knokspack-export-failure-' . bin2hex(random_bytes(8));
        mkdir($root, 0700);
        define('KNOKSPACK_PRIVATE_BACKUP_DIR', $root);
        $GLOBALS['knokspack_test_options'] = array();
        $backup = new Knokspack_Backup();
        try {
            foreach (array('definition', 'metadata', 'page2') as $failure) {
                $GLOBALS['wpdb'] = new Knokspack_Test_ExportFailureDb();
                $GLOBALS['wpdb']->failure = $failure;
                $result = $backup->create_backup('database');
                self::assertInstanceOf(WP_Error::class, $result);
                self::assertSame('backup_error', $result->get_error_code());
                self::assertSame('failed', $GLOBALS['wpdb']->updates[0][1]['status']);
                self::assertStringNotContainsString('synthetic sensitive', $result->get_error_message());
                self::assertCount(0, glob($root . '/*.zip'));
            }
        } finally {
            (new ReflectionMethod(Knokspack_Backup::class, 'rrmdir'))->invoke($backup, $root);
        }
    }
}

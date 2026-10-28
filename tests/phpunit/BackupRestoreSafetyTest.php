<?php

use PHPUnit\Framework\TestCase;

class BackupRestoreSafetyTest extends TestCase {
    protected function setUp(): void {
        $GLOBALS['wpdb'] = new Knokspack_Test_Wpdb();
        $GLOBALS['knokspack_test_options'] = array();
    }

    public function test_restore_fails_closed_before_reading_or_modifying_backup_data(): void {
        $backup = new Knokspack_Backup();

        $result = $backup->restore_backup(42);

        self::assertInstanceOf(WP_Error::class, $result);
        self::assertSame('restore_disabled', $result->get_error_code());
        self::assertCount(0, $GLOBALS['wpdb']->inserts);
    }
    public function test_creation_rejects_invalid_types_before_any_database_write(): void {
        $result = (new Knokspack_Backup())->create_backup('../database');
        self::assertSame('invalid_backup_type', $result->get_error_code());
        self::assertCount(0, $GLOBALS['wpdb']->inserts);
    }

    public function test_creation_requires_explicit_private_storage(): void {
        $result = (new Knokspack_Backup())->create_backup('full');
        self::assertSame('private_backup_required', $result->get_error_code());
        self::assertCount(0, $GLOBALS['wpdb']->inserts);
    }

    public function test_untrusted_archive_cannot_be_deleted(): void {
        $fixture = tempnam(sys_get_temp_dir(), 'knokspack-test-');
        try {
            $method = new ReflectionMethod(Knokspack_Backup::class, 'delete_archive');
            self::assertFalse($method->invoke(new Knokspack_Backup(), $fixture));
            self::assertFileExists($fixture);
        } finally { unlink($fixture); }
    }

    #[\PHPUnit\Framework\Attributes\RunInSeparateProcess]
    public function test_private_archive_containment_and_symlink_rejection(): void {
        $root = sys_get_temp_dir() . '/knokspack-private-' . bin2hex(random_bytes(6));
        mkdir($root);
        define('KNOKSPACK_PRIVATE_BACKUP_DIR', $root);
        $archive = $root . '/fixture.zip';
        $outside = $root . '-outside.zip';
        file_put_contents($archive, 'fixture');
        file_put_contents($outside, 'preserve');
        $method = new ReflectionMethod(Knokspack_Backup::class, 'delete_archive');
        $backup = new Knokspack_Backup();
        try {
            self::assertFalse($method->invoke($backup, $outside));
            self::assertFileExists($outside);
            self::assertFalse($method->invoke($backup, $root . '/../' . basename($outside)));
            if (@symlink($outside, $root . '/linked.zip')) {
                self::assertFalse($method->invoke($backup, $root . '/linked.zip'));
                unlink($root . '/linked.zip');
            }
            self::assertTrue($method->invoke($backup, $archive));
            self::assertFileDoesNotExist($archive);
        } finally {
            if (file_exists($archive)) unlink($archive);
            unlink($outside);
            rmdir($root);
        }
    }

}

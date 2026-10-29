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
            self::assertFalse($method->invoke($backup, 'file://' . $archive));
            self::assertFalse($method->invoke($backup, 'https://example.invalid/archive.zip'));
            self::assertFalse($method->invoke($backup, array($archive)));
            self::assertFileExists($archive);
            self::assertFalse($method->invoke($backup, $root . '/../' . basename($outside)));
            if (@symlink($outside, $root . '/linked.zip') === true) {
                self::assertFalse($method->invoke($backup, $root . '/linked.zip'));
                unlink($root . '/linked.zip');
            }
            self::assertTrue($method->invoke($backup, $archive));
            self::assertFileDoesNotExist($archive);
        } finally {
            if ((file_exists($archive) === true)) unlink($archive);
            unlink($outside);
            rmdir($root);
        }
    }

    #[\PHPUnit\Framework\Attributes\RunInSeparateProcess]
    public function test_archives_use_database_identity_and_insert_failure_preserves_existing_archives(): void {
        self::assertTrue(class_exists(ZipArchive::class));
        $root = sys_get_temp_dir() . '/knokspack-create-' . bin2hex(random_bytes(6));
        mkdir($root, 0700);
        define('KNOKSPACK_PRIVATE_BACKUP_DIR', $root);
        $backup = new Knokspack_Backup();
        $cleanup = new ReflectionMethod(Knokspack_Backup::class, 'rrmdir');
        try {
            self::assertSame(1, $backup->create_backup('database'));
            self::assertSame(2, $backup->create_backup('database'));
            self::assertArrayNotHasKey('id', $GLOBALS['wpdb']->inserts[0][1]);
            $paths = glob($root . '/*.zip');
            self::assertCount(2, $paths);
            foreach ($paths as $path) {
                $zip = new ZipArchive();
                self::assertTrue($zip->open($path, ZipArchive::CHECKCONS));
                $folder = basename($path, '.zip');
                $manifest = json_decode($zip->getFromName($folder . '/manifest.json'), true);
                self::assertContains($manifest['id'], array(1, 2));
                self::assertSame('database', $manifest['type']);
                self::assertNotFalse($zip->getFromName($folder . '/database.sql'));
                $zip->close();
            }
            $GLOBALS['wpdb']->fail_insert = true;
            $result = $backup->create_backup('database');
            self::assertSame('backup_record_error', $result->get_error_code());
            self::assertSame($paths, glob($root . '/*.zip'));
        } finally { $cleanup->invoke($backup, $root); }
    }

    #[\PHPUnit\Framework\Attributes\RunInSeparateProcess]
    public function test_failed_completion_write_never_reports_success(): void {
        $root = sys_get_temp_dir() . '/knokspack-record-' . bin2hex(random_bytes(6));
        mkdir($root, 0700);
        define('KNOKSPACK_PRIVATE_BACKUP_DIR', $root);
        $GLOBALS['wpdb']->fail_update = true;
        $backup = new Knokspack_Backup();
        try {
            $result = $backup->create_backup('database');
            self::assertInstanceOf(WP_Error::class, $result);
            self::assertSame('backup_error', $result->get_error_code());
            self::assertSame('failed', $GLOBALS['wpdb']->updates[1][1]['status']);
        } finally {
            (new ReflectionMethod(Knokspack_Backup::class, 'rrmdir'))->invoke($backup, $root);
        }
    }

}

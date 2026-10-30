<?php
use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\Attributes\DataProvider;

class BackupArchivePreflightTest extends TestCase {
    private $root;
    private $sequence = 0;

    protected function setUp(): void {
        $this->root = sys_get_temp_dir() . '/knokspack-inspect-' . bin2hex(random_bytes(8));
        mkdir($this->root, 0700);
        $GLOBALS['wpdb'] = new Knokspack_Test_Wpdb();
    }

    protected function tearDown(): void {
        foreach (glob($this->root . '/*') as $path) { unlink($path); }
        rmdir($this->root);
    }

    private function archive($extra = array(), $type = 'database') {
        $this->sequence++;
        $name = '42-fixture' . $this->sequence;
        $path = $this->root . '/' . $name . '.zip';
        $zip = new ZipArchive();
        self::assertTrue($zip->open($path, ZipArchive::CREATE));
        $entries = array('manifest.json' => json_encode(array('id' => 42, 'type' => $type)));
        if ($type !== 'files') $entries['database.sql'] = 'SELECT 1; -- never executed';
        if ($type !== 'database') $entries['files/index.php'] = 'synthetic payload, never extracted';
        foreach (array_merge($entries, $extra) as $entry => $data) {
            $member = strpos($entry, 'ABS:') === 0 ? substr($entry, 4) : $name . '/' . $entry;
            $zip->addFromString($member, $data);
            $zip->setCompressionName($member, ZipArchive::CM_STORE);
        }
        self::assertTrue($zip->close());
        return $path;
    }

    private function inspect($path, $limits = array()) {
        return (new Knokspack_Backup_Archive($this->root, $limits))->inspect($path, hash_file('sha256', $path));
    }

    public function test_valid_database_files_and_full_archives_are_inspected_without_writes(): void {
        foreach (array('database', 'files', 'full') as $type) {
            $path = $this->archive(array(), $type);
            $before = hash_file('sha256', $path);
            $result = $this->inspect($path);
            self::assertIsArray($result);
            self::assertSame(42, $result['backup_id']);
            self::assertSame($type, $result['type']);
            self::assertFalse($result['restore_enabled']);
            self::assertSame($before, hash_file('sha256', $path));
        }
        self::assertCount(3, glob($this->root . '/*'));
        self::assertCount(0, $GLOBALS['wpdb']->inserts);
        self::assertCount(0, $GLOBALS['wpdb']->updates);
    }

    public static function unsafeNames(): array {
        return array(
            array('../escape.php'), array('files/../../escape.php'), array('files/./escape'),
            array('files//escape'), array('files/escape//'), array('files/escape\\outside'), array('files/C:stream'),
            array('files/NUL.txt'), array('files/LPT1'), array('files/trailing.'), array('files/trailing '),
            array('files/%2e%2e/escape'), array('files/%2fescape'), array('files/illegal?.php'),
            array('files/unicode-' . chr(195) . chr(169)), array('files/control' . chr(1)),
            array('ABS:/absolute'), array('ABS:C:/absolute'), array('ABS:another-root/file')
        );
    }

    #[DataProvider('unsafeNames')]
    public function test_unsafe_names_are_rejected($name): void {
        $result = $this->inspect($this->archive(array($name => 'fixture')));
        self::assertInstanceOf(WP_Error::class, $result);
        self::assertSame('archive_entry_path', $result->get_error_code());
    }

    public function test_case_collisions_and_file_directory_conflicts_are_rejected(): void {
        foreach (array(
            array('files/A.php' => 'one', 'files/a.php' => 'two'),
            array('files/a' => 'file', 'files/a/nested.php' => 'child')
        ) as $entries) {
            $result = $this->inspect($this->archive($entries));
            self::assertSame('archive_entry_conflict', $result->get_error_code());
        }
    }

    public function test_unix_links_and_special_files_are_rejected(): void {
        foreach (array(0120777, 0010644) as $mode) {
            $path = $this->archive(array('files/link' => 'outside'));
            $zip = new ZipArchive();
            $zip->open($path);
            $zip->setExternalAttributesName(basename($path, '.zip') . '/files/link', ZipArchive::OPSYS_UNIX, $mode << 16);
            $zip->close();
            self::assertSame('archive_entry_conflict', $this->inspect($path)->get_error_code());
        }
    }

    public function test_digest_is_required_and_tampering_is_rejected(): void {
        $path = $this->archive();
        $validator = new Knokspack_Backup_Archive($this->root);
        self::assertSame('archive_digest_required', $validator->inspect($path, '')->get_error_code());
        self::assertSame('archive_digest_mismatch', $validator->inspect($path, str_repeat('0', 64))->get_error_code());
        $digest = hash_file('sha256', $path);
        file_put_contents($path, 'tampered', FILE_APPEND);
        self::assertSame('archive_digest_mismatch', $validator->inspect($path, $digest)->get_error_code());
    }

    public function test_outside_paths_wrappers_links_and_public_roots_are_rejected(): void {
        $path = $this->archive();
        $digest = hash_file('sha256', $path);
        $validator = new Knokspack_Backup_Archive($this->root);
        foreach (array('https://example.invalid/test.zip', 'file://' . $path, array($path), __FILE__) as $input) {
            self::assertSame('archive_path', $validator->inspect($input, $digest)->get_error_code());
        }
        if (@symlink($path, $this->root . '/link.zip') === true) {
            self::assertSame('archive_path', $validator->inspect($this->root . '/link.zip', $digest)->get_error_code());
        }
        self::assertSame('archive_path', (new Knokspack_Backup_Archive(ABSPATH))->inspect($path, $digest)->get_error_code());
        self::assertSame('archive_path', (new Knokspack_Backup_Archive(dirname(realpath(ABSPATH), 64)))->inspect($path, $digest)->get_error_code());
    }

    public function test_resource_budgets_are_checked_before_manifest_reads(): void {
        $path = $this->archive();
        foreach (array(array('entries' => 1), array('archive_bytes' => 1), array('entry_bytes' => 1), array('total_bytes' => 1)) as $limits) {
            self::assertSame('archive_budget', $this->inspect($path, $limits)->get_error_code());
        }
        self::assertSame('archive_manifest', $this->inspect($path, array('manifest_bytes' => 1))->get_error_code());
        $path = $this->archive(array('files/compressed' => str_repeat('A', 8192)), 'full');
        $zip = new ZipArchive();
        $zip->open($path);
        $zip->setCompressionName(basename($path, '.zip') . '/files/compressed', ZipArchive::CM_DEFLATE);
        $zip->close();
        self::assertSame('archive_budget', $this->inspect($path)->get_error_code());
    }

    public function test_invalid_manifests_layouts_and_zip_are_rejected(): void {
        foreach (array('invalid-json', 'null', '{"id":42,"type":"unknown"}', '{"id":"42","type":"database"}', '{"id":7,"type":"database"}') as $json) {
            self::assertSame('archive_manifest', $this->inspect($this->archive(array('manifest.json' => $json)))->get_error_code());
        }
        self::assertSame('archive_layout', $this->inspect($this->archive(array('unexpected' => 'payload')))->get_error_code());
        self::assertSame('archive_layout', $this->inspect($this->archive(array('files/extra' => 'payload')))->get_error_code());
        $path = $this->root . '/42-invalid.zip';
        file_put_contents($path, 'not a zip');
        self::assertSame('archive_invalid_zip', $this->inspect($path)->get_error_code());
    }

    public function test_encrypted_members_are_not_accepted(): void {
        $path = $this->archive();
        $zip = new ZipArchive();
        $zip->open($path);
        self::assertTrue($zip->setEncryptionName(basename($path, '.zip') . '/database.sql', ZipArchive::EM_AES_256, bin2hex(random_bytes(16))));
        $zip->close();
        self::assertSame('archive_entry_encoding', $this->inspect($path)->get_error_code());
    }

    public function test_current_creator_emits_a_portable_nested_files_archive(): void {
        $source = sys_get_temp_dir() . '/knokspack-creator-' . bin2hex(random_bytes(8));
        mkdir($source . '/files/nested', 0700, true);
        file_put_contents($source . '/files/nested/fixture.txt', 'synthetic file');
        file_put_contents($source . '/manifest.json', json_encode(array('id' => 42, 'type' => 'files')));
        $path = $this->root . '/42-creator.zip';
        $zip = new ZipArchive();
        self::assertTrue($zip->open($path, ZipArchive::CREATE));
        $backup = new Knokspack_Backup();
        try {
            (new ReflectionMethod(Knokspack_Backup::class, 'add_dir_to_zip'))->invoke($backup, $zip, $source, '42-creator');
            self::assertTrue($zip->close());
            $result = $this->inspect($path);
            self::assertIsArray($result);
            self::assertSame('files', $result['type']);
        } finally {
            (new ReflectionMethod(Knokspack_Backup::class, 'rrmdir'))->invoke($backup, $source);
        }
    }

    public function test_configuration_cannot_relax_limits(): void {
        $this->expectException(InvalidArgumentException::class);
        new Knokspack_Backup_Archive($this->root, array('entries' => 10001));
    }
}

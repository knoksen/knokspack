<?php
/** Read-only structural preflight. Never authorizes or performs a restore. */
if (defined('ABSPATH') === false) { exit; }

final class Knokspack_Backup_Archive {
    private $private_root;
    private $limits;
    private const DEFAULT_LIMITS = array(
        'archive_bytes' => 268435456, 'entries' => 10000, 'entry_bytes' => 134217728,
        'total_bytes' => 536870912, 'ratio' => 200, 'manifest_bytes' => 65536
    );

    /** Limits may only tighten the conservative defaults, never come from an archive. */
    public function __construct($private_root, array $limits = array()) {
        foreach ($limits as $key => $value) {
            if (array_key_exists($key, self::DEFAULT_LIMITS) === false || is_int($value) === false
                || $value < 1 || $value > self::DEFAULT_LIMITS[$key]) {
                throw new InvalidArgumentException('Invalid archive inspection limit');
            }
        }
        $this->private_root = $private_root;
        $this->limits = array_merge(self::DEFAULT_LIMITS, $limits);
    }

    /**
     * The digest must come from an independently trusted record, not the inspected ZIP.
     * SHA-256 checks integrity, not the identity/authority of the archive's author.
     * @return array|WP_Error
     */
    public function inspect($path, $trusted_sha256) {
        if (is_string($trusted_sha256) === false || preg_match('/\A[a-f0-9]{64}\z/', $trusted_sha256) !== 1) {
            return $this->reject('archive_digest_required');
        }
        $file = $this->archive_path($path);
        if (is_wp_error($file) === true) return $file;
        clearstatcache(true, $file);
        if (filesize($file) > $this->limits['archive_bytes']) return $this->reject('archive_budget');
        $digest = hash_file('sha256', $file);
        if (is_string($digest) === false || hash_equals($trusted_sha256, $digest) === false) {
            return $this->reject('archive_digest_mismatch');
        }
        if (class_exists('ZipArchive') === false) return $this->reject('archive_zip_required');
        $zip = new ZipArchive();
        if ($zip->open($file, ZipArchive::CHECKCONS | ZipArchive::RDONLY) !== true) return $this->reject('archive_invalid_zip');
        try {
            $result = $this->scan($zip, basename($file, '.zip'));
            if (is_wp_error($result) === true) return $result;
            // This is a point-in-time inspection, never an extraction authorization.
            $after = hash_file('sha256', $file);
            if (is_string($after) === false || hash_equals($trusted_sha256, $after) === false) {
                return $this->reject('archive_changed');
            }
            return $result + array('sha256' => $digest, 'restore_enabled' => false);
        } finally { $zip->close(); }
    }

    private function archive_path($path) {
        if (is_string($path) === false || strpos($path, '://') !== false || strpos($path, "\0") !== false
            || is_string($this->private_root) === false) return $this->reject('archive_path');
        $root = realpath($this->private_root);
        $site = realpath(ABSPATH);
        $file = realpath($path);
        $parent = realpath(dirname($path));
        if ($root === false || $site === false || $file === false || $parent === false) return $this->reject('archive_path');
        $candidate = $parent . '/' . basename($path);
        if (is_dir($root) === false || $this->within($root, $site) === true || $this->within($site, $root) === true || $this->within($file, $root) === false
            || is_link($candidate) === true || is_file($file) === false || substr($file, -4) !== '.zip') {
            return $this->reject('archive_path');
        }
        return $file;
    }

    private function within($path, $root) {
        $path = str_replace('\\', '/', $path);
        $root = rtrim(str_replace('\\', '/', $root), '/');
        if (DIRECTORY_SEPARATOR === '\\') { $path = strtolower($path); $root = strtolower($root); }
        return $path === $root || strpos($path, $root . '/') === 0;
    }

    private function safe_name($name, $root) {
        if (is_string($name) === false || strlen($name) > 1024 || $name === '' || strpos($name, '//') !== false
            || preg_match('/[^\x20-\x7e]|[\\\\:"<>|?*]/', $name) === 1
            || preg_match('/%(?:2e|2f|5c|00)/i', $name) === 1) return false;
        $parts = explode('/', rtrim($name, '/'));
        if ($parts[0] !== $root) return false;
        foreach ($parts as $part) {
            if ($part === '' || $part === '.' || $part === '..' || rtrim($part, '. ') !== $part
                || preg_match('/\A(?:CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\.|\z)/i', $part) === 1) return false;
        }
        return true;
    }

    private function safe_attributes(ZipArchive $zip, int $index, bool $directory) {
        $system = 0;
        $attributes = 0;
        if ($zip->getExternalAttributesIndex($index, $system, $attributes) === false) return false;
        $type = ($attributes >> 16) & 0170000;
        if ($system === ZipArchive::OPSYS_UNIX && $type !== 0) {
            return $directory === true ? $type === 0040000 : $type === 0100000;
        }
        return ($attributes & 0x400) === 0;
    }

    private function scan(ZipArchive $zip, $root) {
        if ($zip->numFiles < 1 || $zip->numFiles > $this->limits['entries']) return $this->reject('archive_budget');
        $seen = array();
        $files = array();
        $directories = array();
        $total = 0;
        for ($index = 0; $index < $zip->numFiles; $index++) {
            $stat = $zip->statIndex($index);
            if ($stat === false || $this->safe_name($stat['name'], $root) === false) return $this->reject('archive_entry_path');
            $name = $stat['name'];
            $directory = substr($name, -1) === '/';
            $key = strtolower(rtrim($name, '/'));
            if (isset($seen[$key]) === true || $this->safe_attributes($zip, $index, $directory) === false) {
                return $this->reject('archive_entry_conflict');
            }
            $seen[$key] = true;
            if ($stat['encryption_method'] !== ZipArchive::EM_NONE
                || in_array($stat['comp_method'], array(ZipArchive::CM_STORE, ZipArchive::CM_DEFLATE), true) === false) {
                return $this->reject('archive_entry_encoding');
            }
            $size = $stat['size'];
            $compressed = $stat['comp_size'];
            if ($size < 0 || $compressed < 0 || ($directory === true && $size !== 0)) return $this->reject('archive_budget');
            $total += $size;
            if ($size > $this->limits['entry_bytes'] || $total > $this->limits['total_bytes']
                || ($size > 0 && ($compressed < 1 || $size > $compressed * $this->limits['ratio']))) {
                return $this->reject('archive_budget');
            }
            if ($directory === false) $files[$key] = $name;
            $parent = $directory === true ? $key : dirname($key);
            while ($parent !== '.' && $parent !== '/') {
                $directories[$parent] = true;
                $parent = dirname($parent);
            }
        }
        if (array_intersect_key($files, $directories) !== array()) return $this->reject('archive_entry_conflict');
        return $this->manifest($zip, $root, $files, $total);
    }

    private function manifest(ZipArchive $zip, $root, $files, $total) {
        $manifest_name = $root . '/manifest.json';
        $stat = $zip->statName($manifest_name);
        if ($stat === false || $stat['size'] > $this->limits['manifest_bytes']) return $this->reject('archive_manifest');
        $json = $zip->getFromName($manifest_name, $this->limits['manifest_bytes'] + 1);
        if ($json === false || strlen($json) > $this->limits['manifest_bytes']) return $this->reject('archive_manifest');
        $manifest = json_decode($json, true, 16);
        if (is_array($manifest) === false || is_int($manifest['id'] ?? null) === false || $manifest['id'] < 1
            || strpos($root, $manifest['id'] . '-') !== 0
            || in_array($manifest['type'] ?? null, array('database', 'files', 'full'), true) === false) {
            return $this->reject('archive_manifest');
        }
        $database = false;
        $site_files = false;
        foreach ($files as $name) {
            if ($name === $manifest_name) continue;
            if ($name === $root . '/database.sql') { $database = true; continue; }
            if (strpos($name, $root . '/files/') === 0) { $site_files = true; continue; }
            return $this->reject('archive_layout');
        }
        $type = $manifest['type'];
        if ($database !== ($type === 'database' || $type === 'full')
            || $site_files !== ($type === 'files' || $type === 'full')) return $this->reject('archive_layout');
        return array('backup_id' => $manifest['id'], 'type' => $type, 'entries' => $zip->numFiles, 'uncompressed_bytes' => $total);
    }

    private function reject($code) {
        return new WP_Error($code, 'Archive preflight rejected the input; restore remains disabled.');
    }
}

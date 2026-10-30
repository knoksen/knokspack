# Read-only archive preflight

Date: 2026-10-30. Base: main at af6b0ab, after the owner merged prior PRs #52/#53. Existing ecosystem inventory work and uncommitted edits in the previous checkout are left untouched. This follow-up uses a separate feature branch/worktree.

## Scope

Knokspack_Backup_Archive::inspect accepts a local archive path plus a SHA-256 value from an independently trusted record. It only reads the ZIP directory and a bounded manifest. It does not extract files, execute SQL, write a database record, call a provider or grant restoration authority. No route, AJAX action, UI or cron invokes it. The WordPress autoloader makes it available to future internal callers. The existing restore_disabled gate is unchanged.

The expected digest must not be supplied by the inspected archive or recomputed from an untrusted upload by a future caller. A matching SHA-256 proves byte integrity relative to that expectation; it does not authenticate an author, establish provenance, validate SQL or authorize execution. There is no persisted trusted archive-digest/signature registry yet. This is a structural precursor, not completed restore security.

## Rejection rules

- File must resolve inside a configured private root disjoint from the WordPress tree. Stream wrappers, outside paths, final symlinks, non-ZIP files and roots containing/inside WordPress are rejected.
- Digest format/match and ZIP consistency are required before entry inspection. Inspection opens read-only and checks the digest again afterward; this remains point-in-time evidence, not a race-free authorization for later extraction.
- Entry names must use one expected archive root and conservative portable ASCII paths. Reject traversal, absolute/drive/ADS paths, backslashes, control/non-ASCII characters, encoded traversal/separators, Windows reserved names, illegal Windows characters, trailing dots/spaces, repeated separators, case-folded duplicate names and file/directory conflicts. Legitimate non-ASCII filenames are intentionally unsupported in this initial gate; input names are never silently normalized.
- Reject Unix links/special files, unsupported compression and encrypted entries. Only regular files/directories using STORE or DEFLATE are accepted. Encryption support requires a separate authenticated key-management design.
- Require a bounded JSON manifest, positive integer backup ID matching the archive root, known backup type and matching database.sql/files payload layout. SQL payload bytes are never interpreted or executed.
- Conservative limits: 256 MiB archive, 10,000 entries, 128 MiB per entry, 512 MiB declared total, compression ratio 200 and 64 KiB manifest. Optional constructor limits may only tighten these values. These defaults are not a statement that every legitimate site backup will fit.

Backup ZIP creation now normalizes the platform directory separator to '/' for nested members, so Windows-created archives follow the same format. A literal backslash in a Unix filename is not silently converted. No existing archive is migrated or deleted.

## Evidence and test scope

Local Windows PHP 8.4.27 with zip/mbstring: 47 PHPUnit tests / 221 assertions pass (18 prior cases plus 29 new preflight cases), PHPStan level 5 has zero errors, and targeted Squiz comparison checks pass. Thirty Jest tests, the Vite build/package and three package/module contracts pass. Dependencies were installed from unchanged lockfiles; no dependency versions changed.

New fixtures cover valid database/files/full layouts, unchanged input hashes and no DB writes; traversal/absolute/encoded/backslash/Windows-invalid paths; case and file/directory conflicts; Unix link/special-file attributes; required/stale digest; private-root containment; resource budgets/compression; malformed manifests/layout/ZIP; encrypted members; non-relaxable limits; and a nested archive from the current creator. Windows symlink cases execute only when the OS allows creating a link; Linux CI exercises them normally.

The isolated WordPress matrix additionally inspects the archive that the packaged plugin exports from its synthetic MariaDB database, confirms its identity and that restore remains disabled, and checks preservation of the database marker. Results must be confirmed on the exact new PR revision; this document does not mark unexecuted CI as passed.

## Still required before any restore

Authenticated, immutable archive provenance/digest storage and key lifecycle; full payload/CRC and target-containment checks using the same immutable bytes; database/table scope and SQL preflight; storage permissions, encryption and quotas; isolated restore and rollback rehearsal; independent review and explicit environment/revision approval. A preflight result is never a release or restore permission. No production access, merge, deployment or restore is performed in this change.

API references: [entry metadata](https://www.php.net/manual/en/ziparchive.statindex.php), [external file attributes](https://www.php.net/manual/en/ziparchive.getexternalattributesindex.php), [bounded manifest reads](https://www.php.net/manual/en/ziparchive.getfromname.php).

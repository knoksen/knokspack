# Database export roundtrip and failure handling

Date: 2026-10-30. Follow-up to archive preflight. PR #55 was merged by the owner while this work was in progress, including the new failing fixture test. The corrective change is isolated on fix/database-backup-roundtrip; no direct main commit, merge or production action is performed by this agent.

## Confirmed failure and correction

The first roundtrip run [41113091386](https://github.com/knoksen/knokspack/actions/runs/41113091386), revision 5d16b6d, failed on both WordPress matrix entries with database error 1406 during scratch import. The legacy exporter serialized every cell as a quoted string and inserted all SELECT * columns by position, including generated columns. BIT fields are returned through drivers in representations that must not be confused with plain text; generated columns must be computed by the target database.

The exporter now reads column metadata, quotes table/column identifiers, selects writable columns explicitly, omits VIRTUAL/STORED/PERSISTENT expressions, reads BLOB/BINARY/BIT data through HEX, emits binary/BIT SQL literals without lossy integer conversion, and preserves explicit NULL. Text, numeric and temporal values retain the existing connection escape handling. DEFAULT_GENERATED columns remain writable. Unsupported table definitions, metadata/read errors, missing row fields and incomplete file writes fail the backup instead of silently reporting a complete archive. Error messages do not include SQL rows or database diagnostics.

The database error-state helper is marked phpstan-impure because it observes mutable connection state after each query. This prevents inappropriate static-analysis memoization; no diagnostic is suppressed and the analysis level is unchanged.

## Isolated reconstruction test

A second digest-pinned MariaDB service uses a separate loopback port, database and restricted user. The test refuses a nonempty import target. It accepts no external site path, server, database name or SQL upload. The source is the archive that this test just generated from its own synthetic WordPress database. SQL is read from that known member without extracting arbitrary archive paths, under an 8 MiB fixture bound. No production secrets are used.

The source fixture has 503 rows, crossing the 500-row export page boundary, with quotes, backslashes, semicolons, line breaks, NUL, Unicode, NULL/empty values, BLOB bytes, BIT(9)/BIT(64), NULL/empty binary values, a quoted identifier, DECIMAL(30,12), microsecond timestamps and stored and virtual generated columns. The test compares all row values exactly after importing on the scratch server, mutates only the scratch table, replays the same dump and checks equality again. The original WordPress rows and sentinel option must remain unchanged. This is an SQL export/replay rehearsal, not plugin restore or atomic site rollback.

Local Windows checks: 49 PHPUnit tests / 245 assertions pass; targeted Squiz comparison checks pass; PHPStan level 5 has zero errors. The added fault-injection case covers unsupported definitions, failed column reads and a failure after the first 500 rows: each returns a failed backup, creates no completed ZIP and redacts raw database details. Full integration results must be checked on the corrective PR revision, not inferred from local mocks.

## Limits and remaining gates

The plugin's restore_disabled gate is unchanged. No SQL execution/import path was added to application code. The import helper exists only under tests/ and is excluded from the packaged plugin.

This matrix uses MariaDB 11.4 on both sides; it does not prove MySQL compatibility, other storage engines, views/routines/triggers, foreign-key import ordering, concurrent-write consistency, auto-increment zero IDs, every SQL mode/charset/time-zone combination or complete schema restoration. Views and unsupported definitions now fail explicitly; other schema objects are not claimed as backed up. Table ownership/scope remains a separate review item for shared databases. Existing archives/data are not migrated or deleted.

Authenticated immutable archive provenance, bounded SQL preflight, file-target validation, encryption/off-site retention and full restore/rollback approval remain required before enabling any production restore.

References: [MariaDB BIT](https://mariadb.com/docs/server/reference/data-types/numeric-data-types/bit), [column metadata](https://mariadb.com/docs/server/reference/sql-statements/administrative-sql-statements/show/show-columns), [generated columns](https://mariadb.com/docs/server/reference/sql-statements/data-definition/create/generated-columns).

## Verified corrective execution

The initial corrective revision d9b604b passed both WordPress matrix jobs in [run 41114531972](https://github.com/knoksen/knokspack/actions/runs/41114531972), including exact 503-row reconstruction, replay after a synthetic mutation and unchanged source data. Subsequent test extensions add BIT(64), NULL/empty binary fields, a backtick-containing column name and a virtual generated column; final results are revision-specific on the corrective PR.

Binary hex representation increases SQL size compared with raw bytes. Large BLOB memory/storage pressure and consistency during concurrent writes remain unverified; this fixture is small and single-writer. No production restore capability is enabled by the roundtrip result.

## Storage boundary follow-up (2026-10-30)

Creation previously accepted a private directory that contained the WordPress tree, although archive preflight rejects this overlapping layout. Creation now requires disjoint canonical directories in both directions, matching preflight. It rejects equal paths, descendants and ancestors before reserving a database record or creating backup files. Existing archives, configuration and site files are not relocated or deleted. A sibling directory remains supported; a disjoint directory alone does not prove that another web-server alias cannot expose it.

Two isolated-process regression cases cover an ancestor and the WordPress root itself, including zero database inserts/updates and unchanged ancestor directory entries. Existing successful private-directory tests remain green. Local validation: `php vendor/phpunit/phpunit/phpunit --bootstrap tests/phpunit/bootstrap.php tests/phpunit` passes 51 tests / 252 assertions; `php vendor/phpstan/phpstan/phpstan analyse --no-progress --memory-limit=512M` passes with zero errors; targeted Squiz comparison checks pass. The first PHPStan attempt exhausted its default 128 MiB limit; only the runner memory budget was raised, without changing rules or application behavior. CI results must be checked on this follow-up revision.

# Phase 0 remediation evidence

Observation date: 2026-10-28 (Europe/Oslo). Scope: code, isolated tests and installable ZIP; no production access, deployment, data migration, merge or restore.

## Baseline and preserved work

GitHub main was `ce004de`; the local audit was at `ba6b07f`, four commits ahead, with uncommitted code, audit docs, tests, Codacy instructions and generated metrics. Remote `audit/phase-0-baseline` does not exist. Local audit docs were read and preserved here as historical snapshots.

The local checkout at `C:/Users/knoks/1APPZ/knokspack` was moved to `fix/phase-0-remediation` without stashing, resetting or deleting changes. Additional local conflict resolutions made its 26 Jest tests and web build pass. Resolved inputs: AI service, Vite config, dashboard JSX/imports, CSS and .gitignore. Dashboard resolution retained live API data rather than conflicting mock metrics. These local-only fixes are not copied over the newer reviewed frontend.

Remote PR #52 (`fix/php-runtime-release-blockers`, `226b099de11dce29676fbf7dcfc18dc8296d8b70`) already has a clean frontend and PHP fixes, analysis context and governance work. This remediation is a **stacked PR targeting that branch**. Preserve #52 and review it separately before integration to main. No local desktop binaries or divergent commits are included. The root plugin source is authoritative; the nested tree exists only in the divergent local history, not this base.

## Changes

- Retain site settings and existing data; new core/runtime analytics defaults are off. Existing enabled installations also require a signed, unexpired visitor opt-in. Missing, forged, expired or denied consent rejects collection; withdrawal prevents subsequent page/event collection. Preferences are same-origin, nonce checked, HttpOnly/SameSite cookies with Secure on HTTPS. Consent UI appears only when site analytics is enabled. Aggregate retention follows detailed retention; no migration runs during this work.
- Restore fails closed with `restore_disabled` before archive reads, extraction, file writes or SQL execution. Removed unreachable destructive restore helpers. This is containment, **not a completed restore implementation**.
- Creation requires the existing configured backup directory to match `KNOKSPACK_PRIVATE_BACKUP_DIR`, outside `ABSPATH`; invalid types or missing ZipArchive fail before DB records. Symlink file sources are skipped, source paths stay within WordPress, and copy/archive/manifest failures are surfaced. Deletion and retention resolve real paths within that explicitly designated private root and reject links, non-ZIP files and outside paths. Legacy archives/records outside it are preserved.
- Cross-platform `scripts/package.py` builds only allowlisted root inputs, omits empty module stubs, rejects linked sources, validates archive contents against source bytes and atomically replaces only the target ZIP. It preserves unrelated build outputs and ignores historical nested source trees. `scripts/package.sh` delegates to the same implementation. README versions/requirements corrected.
- Nine default loaded PHP modules remain unchanged. Static contract checks cover their list and nonempty source files; omitted modules are not automatically activated. The historical module matrix is explicitly marked historical. Runtime activation of every module is still unverified.
- CI now actually runs PHPUnit, requires PHPStan, validates packaging and module contracts, and adds PHP 8.0 syntax coverage. Existing PHP 8.4 isolated regressions and positive/negative analysis contracts remain enabled.

## Initial local evidence (historical)

Windows, Node dependencies installed from unchanged lockfile (`npm ci --ignore-scripts`), PHP 8.4.27 portable test runtime and Composer verified against official SHA-256 metadata. No global installation or production configuration change.

| Command/check | Observed result |
| --- | --- |
| `npm test -- --runInBand` | 4 suites, 26 tests pass |
| `npm run package` | Vite build passes; 39 canonical files validated in installable ZIP |
| `python -m unittest discover -s tests/package -v` | 3 pass: canonical source/nested exclusion, preserve prior ZIP on failure, nine-module registration contract |
| `php vendor/phpunit/phpunit/phpunit --bootstrap tests/phpunit/bootstrap.php tests/phpunit` (mbstring enabled) | 13 tests / 29 assertions pass; consent and fail-closed backup cases, private path/traversal boundaries |
| `php tests/php/release_regressions.php` | 12 pre-existing runtime/security cases pass |
| `php vendor/phpstan/phpstan/phpstan analyse modules includes --no-progress --memory-limit=2G` | 0 errors, unchanged level 5, no suppressions |
| `python tests/phpstan/check_contract.py` | positive fixture passes; negative fixture retains 3 expected diagnostics |
| PHP syntax: includes, modules, new PHPUnit fixtures and entrypoint | Pass on PHP 8.4.27; PHP 8.0 added to CI, not claimed locally |
| `git diff --check` | Pass |

Tests use doubles and temporary synthetic fixtures. Windows may disallow symlink creation: the deletion test always verifies sibling/traversal/valid ZIP boundaries, and exercises symlinks only if permitted. At this initial stage no real WordPress DB, web server or backup archive was used. Later isolated WordPress evidence below supersedes this coverage limit; customer data is never used.

## Remaining gates and blind spots

- Staging WordPress activation/upgrades, authenticated and unauthenticated AJAX/REST authorization, cache-aware consent UI and actual browser interaction are not proven by unit tests. Cached nonces may expire; failure stays off. Full-page caching may prevent server-side page-view recording.
- Restore remains unavailable. Before reenabling, implement authenticated archive manifests/hashes, traversal/absolute-path/symlink/duplicate/zip-bomb rejection, safe SQL preflight and table scope, isolated restore rehearsal, atomic rollback and operator review. Do not run a live restore to test this PR.
- Private storage is an operator decision: permissions, disk quotas, encryption, other web-server aliases and off-site retention remain unverified. Outside ABSPATH alone cannot prove a directory is not exposed by another virtual host. No legacy backup relocation/deletion is authorized or performed.
- Module matrix describes registration, not completeness. Disabled/stub modules and frontend demo routes remain unavailable for release claims. AI destination/SSRF policy is a separate open audit item.
- Existing dependency audit reports 6 low npm advisories; no automatic dependency upgrades applied. Codacy MCP/Trivy tools are unavailable; npm audit and PHPStan are recorded, not a substitute for those checks. To restore Codacy, reset the extension MCP connection or review GitHub Copilot MCP settings; contact Codacy support if it remains unavailable.
- CI results must be checked on the resulting PR revision. Green checks do not authorize merge or deployment.

## Rollback and operator actions

Before release, review #52 and this stacked diff; preserve the safe restore block until replacement safeguards pass staging. Reverting this PR in production would reintroduce unsafe restore/default collection and is not a safe operational rollback. Use the previously approved artifact with analytics/restore explicitly disabled if rollback is required.

No user-machine command or production approval is required to review this work. Private storage provisioning, staging tests, merge and deployment are deferred owner actions and are not requested or executed here.

## Codacy follow-up

The initial revision `5be0b1` passed GitHub CI (run `40762612259`) but Codacy reported 75 added findings. Retrieved the complete public Codacy issue delta (75 Added, 14 Fixed); do not confuse removed legacy restore findings with current findings.

Follow-up addresses the reported rules without changing exclusions or thresholds: explicit PHP boolean comparisons matching Squiz.Operators.ComparisonOperatorUsage; immutable setup-php SHA verified from its upstream v2 ref; removed invalid/redeclared JS lint directives; build invocation moved to npm scripts so the Python archiver no longer launches subprocesses; deletion rejects stream-wrapper/malformed input and uses a canonical parent plus basename for symlink inspection. Added invalid nonce, malformed origin/cookie and archive wrapper tests. Consent buttons now serialize saves to prevent opposite requests racing; DOM tests cover no implicit request, withdrawal, concurrency and failure/retry.

Local follow-up: 30 Jest tests pass; 16 PHPUnit tests / 37 assertions pass; PHPStan 0 errors; targeted PHP_CodeSniffer comparison rule 0 errors; 12 existing PHP regressions and positive/negative analysis contracts pass; package and three contract tests pass. Final Codacy/CI status is revision-specific on PR #53. Staging/production limitations above remain in force.

## Backup identity and record-integrity follow-up

Confirmed the existing table uses AUTO_INCREMENT but creation supplied `time()` as its primary key and ignored insert/update failures. Concurrent requests could collide and update the wrong record. Creation now reserves the database-assigned ID, fails before archive creation if reservation fails, and reports an error if completion cannot be recorded. Existing records/archives are not migrated. Malformed configured paths fail closed instead of reaching realpath with an array.

Added synthetic ZIP tests using temporary private directories and database doubles: sequential requests receive distinct database IDs; generated archives reopen with consistency checks and expected manifests/database.sql; a failed insert preserves previous archives; a failed completion write returns WP_Error. These are not real database-export or restore rehearsals. PHP zip is explicitly enabled in CI. Local PHPUnit now passes 18 tests / 55 assertions with mbstring and zip loaded in inherited test configuration; PHPStan and the targeted PHP_CodeSniffer rule remain clean.

## Real WordPress integration evidence

Revision `55f605e727a7d8ef93c89d5a88e7117d288df4ab` passed both jobs in [isolated integration run 40769194764](https://github.com/knoksen/knokspack/actions/runs/40769194764): WordPress 6.0/PHP 8.0 and WordPress 7.1.4/PHP 8.4, with a dedicated MariaDB 11.4 fixture database. [Standard CI run 40769194707](https://github.com/knoksen/knokspack/actions/runs/40769194707) and Codacy also passed. See [test scope and safety boundaries](../../tests/wordpress/README.md).

Verified against the built ZIP, not mocks: plugin activation and all nine module includes; five core/analytics tables; schema-version refresh preserving a fixture option; guest/subscriber/admin REST overview authorization; restore-disabled behavior; actual database export to a consistent ZIP containing the synthetic marker and matching manifest/record; anonymous HTTP deny/grant/withdrawal and observed page-view row counts; invalid Origin rejection; guest restore denial; cleared scheduled hooks and preserved data after deactivation.

The test harness was repaired without weakening its guard: system ZIP extraction preserves long upstream WordPress paths, fixture URLs are explicitly fixed to loopback, and diagnostics expose only non-secret fixture identity. No application-code change was required by this integration pass. The local Docker daemon was unavailable and was not started; CI used disposable services instead.

Remaining release gates: real hosting/cache/TLS behavior, authenticated administrator cookie/REST-nonce and privileged AJAX paths beyond this suite, full module feature tests, encrypted/off-site storage, independently reviewed archive authentication/extraction/SQL preflight and restore/rollback rehearsal. Restore remains disabled. No staging or production deployment is authorized or performed by this suite.

## Cookie-authenticated integration evidence

Revision `b850fb610ed07dde9b3edc75c6150efecdc0dd0d` passed both WordPress matrix jobs in [run 40775046389](https://github.com/knoksen/knokspack/actions/runs/40775046389). Tests now use real HTTP logins, WordPress cookies and the normal admin screen's REST nonce. They verify administrator access, missing/invalid nonce denial, subscriber/editor boundaries, privileged backup AJAX nonce/capability checks, admin create/delete of only the new fixture archive, preserved preceding backup records, restore still disabled, administrator-only analytics reads and exactly one event across opt-in/withdrawal.

This supersedes the earlier unverified administrator cookie/REST-nonce handshake and these specific AJAX paths. Only test code/fixtures changed; no application security check was bypassed or weakened. The guarded session fixture is excluded from packaging and outgoing fixture mail is blocked. See [scope and fixture safeguards](../../tests/wordpress/README.md).

Still unverified: other privileged feature paths, production-specific cache/TLS behavior, complete database export semantics across schemas/engines, encrypted/off-site storage, archive authentication/extraction/SQL preflight, and actual restore/rollback. Restore remains disabled; no merge, staging deployment or production action is performed.

The authenticated test client's HTTP transport is now restricted to five literal loopback routes with redirects disabled. External absolute/protocol-relative targets are rejected before network calls. This resolves the new test-client URL warning through stricter isolation, not an analyzer exclusion. Results for subsequent revisions remain available on PR #53.

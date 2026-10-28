> Historical Phase 0 snapshot from the preserved local audit checkout. Current remediation and changed baseline: [REMEDIATION.md](REMEDIATION.md). Line references below describe that historical snapshot.

# Phase 0 Repository Baseline

Audit date: 2026-10-28
Repository: `knoksen/knokspack`
Scope: static repository inspection and local frontend checks only

## Verified current baseline

- The only Git tag found is `v3.0.0` (created 2025-12-18). The root and packaged WordPress entrypoints and readmes, `package.json`, and release artifacts identify version `3.0.0`.
- Audit work is isolated on branch `audit/phase-0-baseline`, created from `ba6b07f547ab114e555f3d67f9abfe3d6d96d21b`. That commit is four commits ahead of `origin/main`.
- A pre-existing modification to `.github/instructions/codacy.instructions.md` was preserved and not included in this audit.
- There are two plugin source trees: the repository root and `knokspack/`. The corresponding entrypoints have matching module load lists, but the release/package process's selected source tree was not established.
- CI definitions are in [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml), [`.github/workflows/codeql.yml`](../../.github/workflows/codeql.yml), and [`.github/workflows/npm-grunt.yml`](../../.github/workflows/npm-grunt.yml). Package/build/test configuration is in [`package.json`](../../package.json), [`composer.json`](../../composer.json), and [`vite.config.ts`](../../vite.config.ts).

## Test and build evidence

Commands were run locally on the existing checkout; no dependencies were installed.

| Check | Result | Evidence |
|---|---|---|
| `npm test -- --runInBand` | Failed during TypeScript/Jest compilation. Jest reported 3 passing suites and 1 failed suite; 20 tests passed. | `services/geminiService.ts` contains unresolved merge markers at lines 8, 26, 28, 66, 85, 90, 129, 184, and 190. |
| `npm run build` | Failed before application compilation. | Vite reports `Unexpected "<<"` at `vite.config.ts:8`, caused by unresolved merge markers; additional conflict markers occur at lines 42-47. |
| PHP syntax checks | Not run. | PHP CLI is unavailable in the environment. |
| PHPStan / PHPUnit / WordPress runtime checks | Not run. | No PHP CLI or WordPress test installation was available. CI only conditionally runs PHPStan and checks the PHPUnit version; it does not invoke the PHPUnit suite (`.github/workflows/ci.yml:45-71`). |

These results describe the current local checkout and do not claim that any test suite passed in CI or on a WordPress installation.

## Risk-ranked findings

Severity reflects static evidence and potential impact; no live exploit testing or production inspection was performed.

### Critical

1. **Frontend build is blocked by unresolved merge conflict markers.** `vite.config.ts:8-13,42-47` has conflict markers. The attempted build fails at line 8. `services/geminiService.ts` also has conflict markers, preventing its Jest suite from compiling.
2. **Analytics collection is enabled by default without an observed consent gate.** Defaults enable tracking in `includes/class-knokspack.php:219-231` and `modules/stats.php:23-32`; page-view collection hooks run on frontend requests in `modules/stats.php:38-48,161-188`. A consent requirement is stated in `constants.tsx:368`, but the inspected collection path does not check consent.
3. **Backup restore performs privileged file and SQL restoration without archive authenticity or path-containment checks.** Restore handlers require an administrator capability and nonce (`modules/backup.php:344-379`), but restore extracts an archive, executes its SQL, and copies files into `ABSPATH` (`modules/backup.php:251-325`). This is a critical integrity risk even though the entrypoints are privileged.

### High

1. **Backup restore trusts persisted archive paths and extracted paths.** Paths are stored and later used for filesystem operations (`modules/backup.php:119-128,241-287,391-399`); canonical-path containment checks were not found. Backup-directory protection also depends on server configuration (`modules/backup.php:35-52`).
2. **Duplicate plugin implementations create release-source ambiguity.** Both root and `knokspack/` contain entrypoints, includes, and modules. Which tree is packaged or installed was not verified.
3. **Only a subset of PHP modules is loaded.** Each entrypoint lists nine module files (`wp-site-suite.php:45-58`); a separate group is explicitly described as omitted stubs (`wp-site-suite.php:40-43`). Several frontend routes have no corresponding loaded backend module.
4. **Configured OpenAI base URLs permit outbound requests to configurable endpoints.** The AI proxy sends requests using the configured URL (`includes/class-knokspack-ai.php:165-212`). The accepted-host policy and protection against unsafe destinations were not established; assess this as an SSRF risk in Phase 1 rather than assume it is exploitable.

### Medium

1. **Schema/version management is split across independent options, without a migration history.** Core and stats use separate database version options and `dbDelta` setup (`includes/class-knokspack.php:31-35,77-89`; `modules/stats.php:42-113`).
2. **Core and module settings use inconsistent option names.** Core defaults use `knokspack_stats` and `knokspack_backup` (`includes/class-knokspack.php:219-231`), while runtime modules read `knokspack_stats_settings` and `knokspack_backup_settings` (`modules/stats.php:35`; `modules/backup.php:7-18`).
3. **Backup archives contain complete database table structures and rows.** `modules/backup.php:155-181` enumerates tables and writes rows into the archive. Encryption at rest was not found in the inspected implementation.
4. **REST route argument validation is limited.** Capability checks exist (`includes/class-knokspack-rest.php:18-35`; AI uses `edit_posts` at `includes/class-knokspack-ai.php:64-84`), but explicit per-argument validation/sanitization callbacks were not established for all routes.
5. **Frontend route protection is not server authorization.** `components/ProtectedRoute.tsx:12-59` checks client-side context and plan state; it must not be relied on in place of WordPress capability checks.

### Low

1. **Supported-version coverage is narrower than declared compatibility.** Plugin metadata declares PHP 8.0+ and WordPress 6.0+ (`wp-site-suite.php:4-10`), while CI selects PHP 8.4 and Node 22 (`.github/workflows/ci.yml:17-33`); older declared versions are not covered by that workflow.
2. **PHP CI checks are conditional and incomplete.** PHPStan runs only if installed, and PHPUnit is checked with `--version` rather than running tests (`.github/workflows/ci.yml:45-71`).
3. **Analytics and backup defaults differ between core and module option names.** Runtime behavior should be verified after settings migration before either option is renamed or removed.

## Unverified items and limitations

- No WordPress activation, upgrade, deactivation, REST authorization, analytics consent, backup/restore, or AI integration tests were run.
- No PHP syntax, PHPStan, PHPUnit, WordPress coding standards, accessibility, browser, or performance checks were run because the relevant runtime/test environment was unavailable or not executed.
- Whether the root or nested plugin tree is included in release packaging is unknown.
- Backup access protection at the web-server layer, production endpoint configuration, actual consent/legal basis, and external services' data handling were not inspected.
- Static findings are not a substitute for a focused security assessment or legal review.

## Prioritized follow-up backlog

| Priority | Work item | Acceptance criteria |
|---|---|---|
| P0 | Resolve and review merge conflicts in frontend sources/configuration | No conflict markers remain in build/test inputs; `npm run build` and `npm test` complete successfully with results recorded. |
| P0 | Establish safe backup restore invariants | Restore accepts only authorized, validated archives; archive paths remain within a configured private backup root; extracted paths cannot escape the restore target; SQL/file restore behavior is tested in an isolated WordPress environment. |
| P0 | Make analytics privacy behavior explicit | Tracking defaults and consent/legal basis are documented; collection honors the chosen consent policy; tests cover opt-out/no-consent states and data retention. |
| P1 | Establish one authoritative plugin source/package path | Packaging builds from a documented source tree; root and packaged entrypoints are either synchronized by a tested process or duplication is removed through an approved migration. |
| P1 | Define module activation/readiness contracts | Every module is classified as loaded, intentionally disabled, stub, or unavailable; UI routes clearly distinguish unavailable functionality; module lifecycle tests cover registration. |
| P1 | Add PHP and WordPress validation coverage | PHP lint, PHPStan, PHPUnit, REST authorization/input validation, and lifecycle checks run in CI across declared minimum versions where feasible. |
| P2 | Unify schema and settings migration strategy | Versioned, non-destructive migrations and option compatibility tests cover existing installations and rollback limitations. |
| P2 | Review outbound AI and marketing destinations | Endpoint allow-listing/validation and data disclosure are documented and tested; external calls remain opt-in and auditable. |

## Change log and rollback

- Created this baseline and the companion module matrix as additive audit documentation only. No application code, database, external service, or production setting was changed.
- Rollback is limited to removing the two newly added audit documents (`docs/audit/BASELINE.md` and `docs/audit/MODULE_MATRIX.md`). Preserve the pre-existing `.github/instructions/codacy.instructions.md` modification and all existing commits.

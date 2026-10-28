# Disposable WordPress integration tests

This suite runs only in an explicitly enabled GitHub Actions runner. It creates a fresh temporary WordPress installation and uses a dedicated MariaDB service database/user (`knokspack_integration`) exposed only on runner loopback. It does not accept an existing site path, hostname, database name or production credentials. The local Docker Desktop engine was unavailable and was not started.

The workflow tests the **built ZIP**, not a source symlink: WordPress 6.0/PHP 8.0 and WordPress 7.1.4/PHP 8.4 against a digest-pinned MariaDB 11.4 image. WordPress 7.1.4 was the current version reported by the official core version API on 2026-10-28; it is an explicit fixture, not a floating latest release. WP-CLI 2.12.0 is SHA-256 checked against its official GitHub release asset. Core files are checked against WordPress.org checksums before configuration. See [core download](https://developer.wordpress.org/cli/commands/core/download/) and [core verification](https://developer.wordpress.org/cli/commands/core/verify-checksums/).

Cron and external WordPress HTTP requests are disabled. All users, content, analytics and backup archives are synthetic and temporary; the CI database account has access only to the fixture database. Public run IDs supply disposable service credentials, never production secrets. The built-in web server binds only to 127.0.0.1; its process is stopped when the test exits. GitHub destroys the runner and service database; the script never deletes an existing database or traverses local production directories.

## Coverage

- Install/activate the packaged plugin and confirm all nine module files load.
- Confirm core and analytics tables exist; refresh schema versions without losing an existing fixture option.
- Exercise WordPress REST permissions as guest, subscriber and administrator.
- Verify restore remains disabled before destructive work.
- Create an actual database backup, reopen its ZIP with consistency checking, and inspect exported SQL/manifest against the synthetic database and record.
- Exercise anonymous consent over real HTTP: deny, grant, page-view collection, withdrawal, same-origin enforcement and guest restore denial.
- Verify scheduled hooks are cleared and synthetic site data survives deactivation.

## Limits

This is isolated CI validation, not an approved staging/production deployment. It does not reenable restore, import SQL, test a real reverse proxy/cache/TLS stack, validate every module's feature behavior, or prove encrypted/off-site backups and atomic rollback. It does not contact external AI/marketing services. Production release still requires independent review and environment-specific approval.

Results must be read from the workflow for the exact PR revision; creation of this suite does not itself prove any case has passed. No Windows command is needed to execute the CI suite.

## Verified execution

Revision `55f605e727a7d8ef93c89d5a88e7117d288df4ab` passed both matrix jobs in [run 40769194764](https://github.com/knoksen/knokspack/actions/runs/40769194764). Each job verified activation/loading/schema, REST dispatch permissions, database-to-ZIP export, HTTP consent collection/withdrawal/origin rejection and data-preserving deactivation. Standard CI and Codacy also passed on that revision.

This supersedes the earlier unit-only coverage for these specific flows. That first run used real WordPress REST dispatch with fixture users. The cookie-authenticated extension below supersedes its login-handshake limitation; untested feature paths remain out of scope. No restore was performed.

## Cookie-authenticated extension

Revision `b850fb610ed07dde9b3edc75c6150efecdc0dd0d` passed both matrix jobs in [run 40775046389](https://github.com/knoksen/knokspack/actions/runs/40775046389). The suite now logs in over HTTP with generated temporary passwords and retains real WordPress cookies. It verifies the normal admin page's REST nonce, missing/invalid nonce denial, and subscriber/editor boundaries. Editor AI status is readable without configuring a provider or sending any inference request.

Backup AJAX checks cover invalid admin nonce, insufficient subscriber capability despite a valid subscriber nonce, authorized database-backup creation/deletion of only the new fixture archive, preservation of preceding backup IDs, and restore remaining disabled even for an authorized admin. Analytics checks cover administrator-only stats reads and authenticated event submission before consent, after opt-in, and after withdrawal; the real SQL table must contain exactly one event afterward.

A guarded MU-plugin fixture provides per-session nonces and synthetic admin-only state snapshots. It is copied only into the disposable site from tests/, never the installable ZIP. It has no unauthenticated handler and refuses unrelated site/database identities. Outgoing WordPress mail is intercepted before changing fixture account passwords; external HTTP and cron remain disabled. No credentials, cookies or nonce values are printed.

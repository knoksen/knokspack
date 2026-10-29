# Consolidated release candidate — not deployed

This candidate combines draft PRs #48–#51 without merging them and adds bounded PHP compatibility/security fixes. All existing source-system authority and production approval gates remain in effect.

## Runtime changes

- CRM sorting accepts only declared sortable columns and ASC/DESC, instead of interpolating arbitrary sanitized request text as SQL syntax. Malformed arrays fall back safely. Literal search wildcards are escaped before binding.
- CRM results populate WP_List_Table::items so the renderer can display the fetched contacts. Database failure yields an empty array; pagination receives a nonnegative integer count and lets WordPress calculate page count.
- Backup option parsing uses the supported two arguments while preserving saved settings, defaults and opt-in scheduling.
- Autoloader no longer tries to register the removed PHP __autoload API. The normal plugin SPL autoloader remains registered. Project minimum PHP is 8.0.
- Singleton PHPDocs describe their actual null initial state. Remove an unused private stats property and explicitly format the retention integer for HTML attribute escaping. No configured value or public method is removed.

## Evidence

Seven isolated PHP regression cases PASS: legitimate sorting/rendered results, hostile SQL sort input, malformed request values, literal search wildcard handling, empty results/page offset, backup defaults/saved overrides and SPL registration/unrelated class behavior. Tests use doubles and perform no database/network/filesystem mutations. They are not WordPress staging acceptance tests.

The first runtime commit reduced PHPStan from 54 to 46 findings. The follow-up completes with zero findings, unchanged level, no ignores, exclusions or error baseline:

- Analysis-only bootstrap checks the actual source declarations before defining the four dynamically initialized constants. Paths refer to the checkout; URL is explicitly a reserved analysis.invalid fixture, not a production value. Database version is read from its source declaration. Plugin startup, WordPress configuration and secrets are never loaded.
- A narrowly scoped block-argument PHPDoc corrects the generated stubs' sealed shape for legacy handles supported by WordPress. Official behavior: https://developer.wordpress.org/reference/functions/register_block_type/ and https://developer.wordpress.org/reference/classes/wp_block_type/__construct/ . Existing runtime registrations are unchanged. Positive fixtures pass; invalid callback, invalid legacy handle type and unknown constant still fail with expected diagnostics.
- Remove an uncalled private request helper with no complete return contract. No public API is removed.
- Existing menu callbacks are kept; absent callbacks and templates receive an administrator-only, escaped unconfigured message. All 19 legacy template routes and 14 icon-menu routes remain. Readable existing templates are still included; no replacement content is fabricated.
- The unimplemented Twitter adapter returns a structured WP_Error and emits a failure event instead of silently doing nothing. It transmits no credentials and does not implement publishing.

Validation now includes 12 isolated PHP behavior/security cases plus positive/negative analysis fixtures. This does not certify actual WordPress staging or production compatibility; those gates still require server access and real regression evidence.

The public homepage and gateway health returned HTTP 200; gateway reports ok=true/version=1.1.0. Admin returns 401. These are availability observations, not deployment/backup/security acceptance.

## Deployment boundary

No merge or deployment has occurred. The saved Chociz SSH session still needs an interactive prompt in this process. An already logged-in PuTTY terminal does not supply authentication to a new process. Backup/restore, current WordPress plugin state, staging regressions and production artifact mapping remain unverified. Do not run the repository bootstrap script as a shortcut: it can alter administrators, AI, mail and production configuration.

Rollback is to close the candidate PR or revert the added runtime commit through review. A live rollout needs a verified current backup and artifact-specific rollback, not this code-only rollback description.

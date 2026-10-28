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

PHP syntax checks pass. PHPStan completes with 46 remaining file errors (previous candidate: 54), zero general errors, unchanged level. Outstanding findings include dynamic plugin constants, legacy block argument schema mismatch, unused/incomplete request helper, missing legacy menu callbacks and an unimplemented social adapter. These remain blocking; no ignores or baseline is added.

The public homepage and gateway health returned HTTP 200; gateway reports ok=true/version=1.1.0. Admin returns 401. These are availability observations, not deployment/backup/security acceptance.

## Deployment boundary

No merge or deployment has occurred. The saved Chociz SSH session still needs an interactive prompt in this process. An already logged-in PuTTY terminal does not supply authentication to a new process. Backup/restore, current WordPress plugin state, staging regressions and production artifact mapping remain unverified. Do not run the repository bootstrap script as a shortcut: it can alter administrators, AI, mail and production configuration.

Rollback is to close the candidate PR or revert the added runtime commit through review. A live rollout needs a verified current backup and artifact-specific rollback, not this code-only rollback description.

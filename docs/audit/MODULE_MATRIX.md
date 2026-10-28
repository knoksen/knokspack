> Historical Phase 0 matrix. The remediation branch is based on PR #52 (`226b099`), which has only the root plugin tree. The nine default loaded modules remain unchanged and are checked by `tests/package/test_package.py`. Restore is intentionally unavailable; analytics requires site enablement AND signed visitor consent. Loaded never means production-ready. See [REMEDIATION.md](REMEDIATION.md).

## Current remediation readiness

| Scope | Registration | Release limitation |
| --- | --- | --- |
| security, performance, marketing, search, blocks, design | Loaded by root entrypoint | CI activation/loading/schema verified on WordPress 6.0 and 7.1.4; complete feature tests still required |
| backup | Loaded | Restore unavailable; private-storage checks and real test-database ZIP export pass CI; production storage unverified |
| stats and admin/stats-admin | Loaded | Site opt-in plus valid visitor consent required; PHP, DOM and real HTTP grant/withdrawal tests pass; hosting/cache behavior unverified |
| ads, cdn, crm, embed, growth, mobile, promotion, scan, social, video | Intentionally omitted | Stub/unavailable; never enable merely because a frontend route exists |
| ai.php, dashboard.php, icons.php, menu.php, CRM support class | Not in default module list | Not a module-readiness guarantee; separate class/legacy paths need independent validation |
| AI integration | Core includes/class-knokspack-ai.php path | Provider access and outbound endpoint policy not verified here |
| Historical nested knokspack/ tree | Absent from reviewed base and excluded from packaging | Preserve divergent local history; never distribute it as authoritative source |

## Historical Phase 0 evidence

# Phase 0 Module Matrix

Audit date: 2026-10-28
Scope: static registration/implementation inspection; runtime behavior is unverified.

“Loaded” means explicitly present in the plugin entrypoint's module list. It does not imply successful activation in WordPress or complete production readiness. Both entrypoints use the same loader list and require readable files from their own tree (`wp-site-suite.php:45-66` and `knokspack/wp-site-suite.php:45-66`).

## Root plugin tree

Root entrypoint: [`wp-site-suite.php`](../../wp-site-suite.php). Loader list and load operation: lines 45-66.

| Module/file | Phase 0 status | Evidence / notes |
|---|---|---|
| `modules/security.php` | Loaded; implementation present | Listed at `wp-site-suite.php:47`; AJAX registration and capability/nonce checks at `modules/security.php:25-26,304-314`. |
| `modules/performance.php` | Loaded; implementation present | Listed at `wp-site-suite.php:48`; initialization/cache hooks at `modules/performance.php:18-23`. |
| `modules/backup.php` | Loaded; implementation present; restore risk identified | Listed at `wp-site-suite.php:49`; backup/scheduled hooks at `modules/backup.php:21-35`; restore behavior at `modules/backup.php:251-325`. |
| `modules/stats.php` | Loaded; implementation present; consent review required | Listed at `wp-site-suite.php:50`; schema/tracking setup at `modules/stats.php:35-51`; frontend tracking at `modules/stats.php:161-188`. |
| `modules/marketing.php` | Loaded; implementation present; outbound calls | Listed at `wp-site-suite.php:51`; hooks at `modules/marketing.php:17-27`; outbound requests at `modules/marketing.php:169-186`. |
| `modules/search.php` | Loaded; implementation present | Listed at `wp-site-suite.php:52`; REST search route at `modules/search.php:6-16`. |
| `modules/blocks.php` | Loaded; implementation present | Listed at `wp-site-suite.php:53`; Gutenberg registration at `modules/blocks.php:9-62`. |
| `modules/design.php` | Loaded; implementation present | Listed at `wp-site-suite.php:54`; block/style/admin/AJAX registration at `modules/design.php:25-89`. |
| `modules/admin/stats-admin.php` | Loaded; implementation present | Listed at `wp-site-suite.php:55`; admin menu/settings/assets at `modules/admin/stats-admin.php:8-25`. |
| `modules/ads.php` | Explicitly omitted; identified as a stub by entrypoint | Omitted from loader list; entrypoint comment at `wp-site-suite.php:40-43`. |
| `modules/cdn.php` | Explicitly omitted; identified as a stub by entrypoint | Omitted from loader list; entrypoint comment at `wp-site-suite.php:40-43`. |
| `modules/crm.php` | Explicitly omitted; identified as a stub by entrypoint | Omitted from loader list; entrypoint comment at `wp-site-suite.php:40-43`. |
| `modules/embed.php` | Explicitly omitted; identified as a stub by entrypoint | Omitted from loader list; entrypoint comment at `wp-site-suite.php:40-43`. |
| `modules/growth.php` | Explicitly omitted; identified as a stub by entrypoint | Omitted from loader list; entrypoint comment at `wp-site-suite.php:40-43`. |
| `modules/mobile.php` | Explicitly omitted; identified as a stub by entrypoint | Omitted from loader list; entrypoint comment at `wp-site-suite.php:40-43`. |
| `modules/promotion.php` | Explicitly omitted; identified as a stub by entrypoint | Omitted from loader list; entrypoint comment at `wp-site-suite.php:40-43`. |
| `modules/scan.php` | Explicitly omitted; identified as a stub by entrypoint | Omitted from loader list; entrypoint comment at `wp-site-suite.php:40-43`. |
| `modules/social.php` | Explicitly omitted; identified as a stub by entrypoint | Omitted from loader list; entrypoint comment at `wp-site-suite.php:40-43`. |
| `modules/video.php` | Explicitly omitted; identified as a stub by entrypoint | Omitted from loader list; entrypoint comment at `wp-site-suite.php:40-43`. |
| `modules/ai.php` | Present but not loaded; status unknown | Active AI path observed in `includes/class-knokspack-ai.php`, instantiated from `wp-site-suite.php:36,70`; separate module's operational status not established. |
| `modules/dashboard.php` | Present but not loaded; status unknown | Not in entrypoint module list at `wp-site-suite.php:45-58`; no active registration established. |
| `modules/icons.php` | Present but not loaded; status unknown | Not in entrypoint module list at `wp-site-suite.php:45-58`; no active registration established. |
| `modules/menu.php` | Present but not loaded; status unknown | Not in entrypoint module list at `wp-site-suite.php:45-58`; no active registration established. |
| `modules/crm/class-knokspack-crm-contacts-table.php` | Support class present; active use unconfirmed | Parent CRM module is omitted; this class was not established as loaded by the entrypoint. |

## Packaged `knokspack/` tree

The packaged entrypoint is [`knokspack/wp-site-suite.php`](../../knokspack/wp-site-suite.php). Its loader list is the same as the root entrypoint (`knokspack/wp-site-suite.php:40-66`). The following nine modules are loaded as duplicate implementations:

- `knokspack/modules/security.php`
- `knokspack/modules/performance.php`
- `knokspack/modules/backup.php`
- `knokspack/modules/stats.php`
- `knokspack/modules/marketing.php`
- `knokspack/modules/search.php`
- `knokspack/modules/blocks.php`
- `knokspack/modules/design.php`
- `knokspack/modules/admin/stats-admin.php`

Additional files identified in this tree:

| Module/file | Phase 0 status | Evidence / notes |
|---|---|---|
| `knokspack/modules/menu.php` | Present but not loaded; status unknown | Not included in the entrypoint list at `knokspack/wp-site-suite.php:45-58`. |
| `knokspack/modules/icons.php` | Present but not loaded; status unknown | Not included in the entrypoint list at `knokspack/wp-site-suite.php:45-58`. |
| `knokspack/modules/crm/class-knokspack-crm-contacts-table.php` | Support class present; active use unconfirmed | No CRM parent module is loaded by the entrypoint. |

The duplicate files' behavioral equivalence and the tree selected by release packaging were not verified. Do not treat a frontend route as proof that its matching backend module is loaded or functional.

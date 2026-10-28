# WordPress analysis context

## Change

Load the maintained szepeviktor/phpstan-wordpress extension explicitly and scan wp-site-suite.php for source-declared symbols without executing WordPress or plugin startup. Composer locks exactly two added development packages; existing package versions are preserved. The PHPStan CI command receives a 2 GiB limit because the larger WordPress symbol set exhausted smaller local limits.

No runtime file, production configuration, PHPStan level, ignore rule, baseline or source exclusion changes. The analyzer still fails on remaining findings.

## Validation and remaining work

- PHP 8.4.27, PHPStan 2.2.5: analysis completes with 54 file errors, zero general errors. The prior GitHub run reported 664 errors without WordPress context.
- Composer schema validation succeeds with the existing missing-license warning; strict validation is not claimed clean.
- Composer audit: no advisories found.
- Source scanning reduces unknown symbols but cannot infer every dynamically initialized plugin constant. Remaining findings include unresolved plugin path/URL/database constants, obsolete __autoload registration, singleton nullability annotations, unused/incomplete request dispatch, a three-argument wp_parse_args call, block callback contracts, absent legacy menu callbacks, pagination typing and a no-op social integration.

Do not manufacture constant values, fake missing integrations, add ignores, lower the level or create an error baseline to turn this green. Separate runtime fixes require behavior tests and scope-specific review, particularly legacy social/menu paths and dynamic initialization.

The locked WordPress stubs are a static-analysis dependency, not proof of the site's actual WordPress version. Verify the live supported-version matrix before using this analysis to certify compatibility.

## Rollback

Close the unmerged draft or revert the dev dependency, lockfile, analysis configuration and memory limit through a PR. No database migration, plugin startup, network action or production access occurs during analysis.

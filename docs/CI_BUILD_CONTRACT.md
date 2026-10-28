# CI build and scanning contract

## Root cause and changes

- The legacy npm-grunt.yml ran `grunt`, but package.json has no Grunt dependency, script or configuration. Run the actual locked Vite build and Jest tests with `npm ci`, `npm run build`, and `npm test -- --runInBand`.
- Keep the workflow file and `build` job ID. Use Node 20 and 22; Node 18 does not meet the current dependency engine requirements. Do not add a legacy Grunt dependency to satisfy an unused template.
- The custom codeql.yml conflicts with repository CodeQL default setup. A read-only API check on 2026-10-28 returned state=configured and languages actions, javascript/javascript-typescript, python/typescript. Actual analyses on PR #49 head 53d741a for Actions, Python and JavaScript/TypeScript had empty error fields. Remove only the duplicate advanced workflow; preserve the active default scanning configuration. No repository setting is changed by this PR.

Official reference: https://docs.github.com/en/code-security/how-tos/find-and-fix-code-vulnerabilities/configure-code-scanning/configure-code-scanning — default setup blocks advanced analysis uploads.

## Validation

- Local `npm ci --ignore-scripts`, `npm run build`, `npm test -- --runInBand`: PASS (4 suites, 26 tests), Node 26.12.0. The workflow uses normal npm ci; Node 20/22 execution is checked by GitHub CI.
- npm reported six low-severity dependency advisories. No dependency updates or suppression are included.
- Existing PHPStan failure remains a separate remediation. No analysis level, security policy or error baseline is weakened.

## Safety and rollback

No runtime code, production data, deploy or repository security setting is changed. This is a draft PR requiring review and explicit merge approval. Restore the two workflow files from the base revision through a PR to revert; restoring the advanced workflow while default setup is enabled reintroduces its upload conflict.

Read-only classic branch-protection API reported `Branch not protected` for knokspack/main on 2026-10-28. A separate ruleset read found active ruleset 11224071 covering all branches, with deletion and non-fast-forward restrictions only, plus multiple always-bypass actors. It has no required pull request, approval or status-check rule. Do not interpret the classic API's 404 as absence of every safeguard. The four app repositories separately require one approval, stale-review dismissal, resolved conversations and their CI checks, but enforce_admins=false. Protection changes are not part of this PR; confirm the intended policy before merge.

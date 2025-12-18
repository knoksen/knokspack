Knokspack — V3 Upgrade Plan
===========================

Overview
--------
This document outlines the concrete steps to upgrade Knokspack from v2.x to v3.0.0. Goals: modernize frontend tooling, ensure PHP 8+ compatibility, improve tests and CI, and provide a smooth migration for users.

Phases
------
1. Dependency audit
   - Run `npm outdated` and `npm audit` to list updates and vulnerabilities.
2. Tooling upgrades
   - Update `vite`, `tailwindcss`, `typescript`, `jest`, and testing libs.
   - Update `vite.config.ts`, `tailwind.config.js`, and `tsconfig.json` as needed.
3. Build verification
   - Run `npm ci` and `npm run build`; confirm `dist/.vite/manifest.json` layout.
4. PHP compatibility
   - Bump minimum PHP to `8.0+` in plugin header and update code for strict types, escaping, and prepared statements.
5. Tests & CI
   - Expand Jest tests; add E2E (Playwright) for admin UI.
   - GitHub Actions already added at `.github/workflows/ci.yml` to run frontend build/tests and PHP lint.
6. Release
   - Publish v3 release with changelog and upgrade notes. Include `dist` artifacts for ZIP distribution.

Immediate tasks (actionable)
---------------------------
- Create a feature branch `v3/upgrade-tooling`.
- Run dependency audit and open a PR with minimal safe bumps.
- Add PHP static analysis (`phpstan`) and run in CI in a follow-up PR.

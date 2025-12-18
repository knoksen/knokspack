Title: chore(v3): add CI, dependabot, and upgrade plan

Description
-----------
This branch starts the v3 upgrade work for Knokspack.

- Adds GitHub Actions CI to build frontend and run tests.
- Adds Dependabot config to automate dependency updates.
- Adds `UPGRADE_TO_V3.md` and `DEV_UPGRADE_SUGGESTIONS.md` with the proposed migration plan.
- Adds Composer scaffolding for PHP static analysis (`phpstan`) and `phpunit` dev deps.

Checklist
---------
- [ ] CI passes (frontend build and tests)
- [ ] PHP linting, phpstan, and phpunit run (or skipped) in CI
- [ ] Resolve any failing tests or lint issues reported by CI
- [ ] Create a follow-up PR per dependency group if needed

Notes
-----
If you'd like, I can open the PR for you or continue pushing incremental dependency-upgrade commits to this branch so CI validates each change.

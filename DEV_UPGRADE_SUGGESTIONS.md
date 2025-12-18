Dev dependency upgrade suggestions
=================================

Guiding principles
- Prefer creating a feature branch (e.g. `v3/upgrade-devdeps`) and open small, testable PRs.
- Upgrade dev dependencies in groups: build tooling, test tooling, then CSS/tooling.
- Run `npm ci` and `npm run build` and validate `dist/.vite/manifest.json` after each group.

Suggested upgrade groups & commands

1) Audit current state

  npm outdated
  npm audit --json > audit.json

2) Safe build/tooling upgrades (example)

  npm install -D vite@^6 @vitejs/plugin-react@^5 typescript@~5.8

3) Test tooling

  npm install -D jest@^30 ts-jest@^29 @testing-library/react @testing-library/jest-dom

4) CSS tooling

  npm install -D tailwindcss@^4 postcss@^8 autoprefixer

5) Verify

  npm ci
  npm run build
  npm test

Notes
- Some packages (notably Node itself) need proper local environment (WSL or native Node install). If CI passes but local build fails, prefer adjusting local Node install rather than locking package versions down.
- If any major upgrade breaks the build, revert that group and open a PR per package group so CI gives quick feedback.

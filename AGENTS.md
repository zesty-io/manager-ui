# Repository Guidelines

## Project Structure & Module Organization

This is the Zesty.io manager UI, a React 18 SPA bundled by Webpack 5. Source
code lives in `src/`. The shell is in `src/shell`; feature apps live under
`src/apps/*` such as `content-editor`, `media`, `schema`, and `settings`.
`src/apps/active-preview` is a separate preview entry, not a shell route.
Utilities are in `src/utility`; static files and locale JSON live in `public/`,
especially `public/locales/{locale}/`. Cypress specs are in `cypress/e2e`, with
helpers in `cypress/support` and fixtures in `cypress/fixtures`. There is no
Jest or Vitest setup.

## Build, Test, and Development Commands

- `npm install --legacy-peer-deps`: install dependencies at the repository root.
- `npm start`: run webpack-dev-server on port `8080` against the dev API.
- `npm run start:stage`: run against the stage environment in development mode.
- `npm run start:local`: run with local config.
- `npm run build:prod`: clean and build a production bundle.
- `npm test`: run Cypress headlessly in Electron.
- `npm run test:open`: open the Cypress UI for interactive test runs.
- `./node_modules/.bin/cypress run --spec "cypress/e2e/<area>/<file>.spec.js"`:
  run one spec.

Use Node `22.19.0` via Volta/CI. Local development requires `/etc/hosts`, e.g.
`127.0.0.1 <ZUID>.manager.zesty.io`; `localhost:8080` will not work because the
app derives the instance ZUID from the host. Use stage for destructive testing.

## Coding Style & Naming Conventions

Use 2-space indentation, LF endings, UTF-8, final newlines, and trimmed
whitespace per `.editorconfig`. New code should be TypeScript first and follow
nearby React hooks, Redux Toolkit, RTK Query, and MUI `sx` patterns. React
Router is v5; do not use v6 APIs. Format touched files:

```sh
npx prettier --write src/shell/components/MyComponent.tsx
```

For localization, use `useTranslation()` without a namespace argument and fully
qualified keys such as `t("shell.myKey")` or `t("common.save")`. Reuse `common`
keys for generic labels. Read service URLs from `window.CONFIG`; do not hardcode
URLs or import runtime config from `src/shell/app.config.js`.

## Testing Guidelines

Cypress is the only test framework. Add coverage under `cypress/e2e`, for
example `cypress/e2e/search/search-page.spec.js`. A root `cypress.env.json` with
credentials is required. Use `cy.login()`, `cy.apiRequest()`, and
`cy.getBySelector()`; selectors should use `data-cy`, not class names or MUI
internals. Avoid fixed `cy.wait(ms)`. Check TypeScript changes with:

```sh
npx tsc --noEmit --pretty false
```

## Commit & Pull Request Guidelines

PRs target `dev`. Commit and PR titles generally use `[Area] - Description`
without conventional-commit prefixes. Keep commits focused. PRs need a
description, linked issue, test results, and screenshots or recordings for
visible UI changes. Call out localization, environment, and `timings.json`
updates.

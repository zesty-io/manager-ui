# Cypress

Scoped guidance for `cypress/`. Moved from the root `CLAUDE.md`.

## Testing with Cypress

Specs live in `cypress/e2e/<area>/<file>.spec.js`. Required setup: a `cypress.env.json` at the repo root with `{ "email", "password" }` plus the env vars consumed by the custom commands (`API_AUTH`, `COOKIE_NAME`, etc. — see `cypress.config.js`).

Custom commands (`cypress/support/commands.js`) — use these instead of hand-rolling:

- `cy.login()` — POSTs `${API_AUTH}/login` and writes the `COOKIE_NAME` cookie. Call in `beforeEach`.
- `cy.apiRequest({ method, url, body })` — wraps `cy.request` and auto-injects the bearer from the cookie. Use for setup/teardown HTTP, not raw `cy.request`.
- `cy.getBySelector("foo")` — selects `[data-cy="foo"]`. New components should expose `data-cy` attributes for anything tests will target; don't lean on class names or text.
- `cy.blockLock()` — stubs `/door/knock*` to defeat the "instance is locked" modal. Call before any edit-page test.
- `cy.blockAnnouncements()` — stubs the announcements feed. Use when announcements would otherwise interrupt the flow.
- `cy.waitOn(path, cb)` — runs `cb` after intercepting `path` and waits up to 30s for the request.

Fixtures (`cypress/fixtures/`) seed instance/content/model JSON. Don't hand-roll fixtures inline in specs.

**Tests hit a real dev instance, not mocks.** `cypress/support/api.js` exposes seeding helpers — `cy.createModel`, `cy.deleteModel(s)`, `cy.createField`, `cy.createStatusLabel`, `cy.deleteStatusLabels` — that POST/DELETE against the dev API (`API_ENDPOINTS.devInstance`). Use them in `before` / `after` hooks and clean up everything you create; leaked records pollute later runs within the same day. Hardcoded ZUIDs in specs (e.g. `/content/6-0c960c-d1n0kx`) reference seed data on the configured instance — don't repoint specs at a different instance without re-seeding.

**The dev instance is synced nightly from prod.** Test data created during a run is wiped on the next nightly sync, so specs must not rely on data from a previous day's run still being present — always seed what you need in `before` hooks. Instance-level configuration (integrations, fonts, analytics connections) reflects prod state after each sync.

**`data-cy` is the only selector strategy.** Tests use `cy.getBySelector("Foo")` exclusively; class-based selectors, MUI class hooks, and text-matching for clicks are flake risks. When writing or modifying a component, add a `data-cy="…"` attribute to every interactive element (button, input, menu item, table row) that a test may need to target — never rely on class names or MUI internals. New interactive controls without a `data-cy` are effectively untestable.

**No hard waits.** Do not use `cy.wait(ms)` with a fixed number. Use `cy.waitOn(path, cb)` to wait for a network request, or Cypress's built-in retry-ability (`.should(…)`, `.contains(…)` with a `timeout` option). Hard waits make tests slow and mask real timing issues.

**Use `uuidv4` for unique test data names, not timestamps.** Import `{ v4 as uuidv4 } from "uuid"` and append the result to test record names (e.g. `` `My Model | ${uuidv4()}` ``). UUIDs are collision-resistant across parallel runners; timestamps are not. Derive any dependent values (e.g. reference IDs) programmatically from the same constant rather than hardcoding expected strings.

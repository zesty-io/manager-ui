// Prepares the negative-QA run: authenticates a browser session, resolves the fixture content
// the agent works on, and proves the session actually works before any agent time is spent.
//
// QA targets a dedicated instance (INTERNAL-NEGATIVE-QA) whose fixtures are authored once in
// production and arrive in the dev environment through the nightly prod→dev sync. That sync is
// also the cleanup: whatever the agent mutates is reset overnight, so there is nothing to tear
// down and no window in which a half-finished run leaves debris behind. It also means the agent
// is free to mutate anything it finds here — nothing else shares this instance, unlike the
// Cypress instance where a stray write breaks other PRs.
//
// Outputs, both written to the repo root and both gitignored:
//   auth-state.json  — Playwright storage state holding only the session cookie. Playwright
//                      MCP loads it at browser start, so the QA agent is already logged in
//                      and the token never has to appear in its prompt or transcript.
//   qa-context.json  — the fixture ZUIDs and URLs the agent works against. No secrets.
//
// The verification at the end is not optional decoration. If the session silently fails, the
// agent sees a login screen, burns its whole turn budget finding nothing, and reports "no
// findings" — indistinguishable from a clean PR. Failing loudly here is the whole point.

import { createRequire } from "module";
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

// The dedicated QA instance. Deliberately NOT the Cypress instance
// (8-f48cf3a682-7fthvk) — that one is shared with every PR's e2e run.
const INSTANCE_ZUID = process.env.QA_INSTANCE_ZUID || "8-acabf6a8d6-bj9tr2";

// The model the agent works against, resolved by name rather than ZUID so the fixture can be
// recreated in the instance without touching this repo.
const FIXTURE_MODEL_NAME = process.env.QA_FIXTURE_MODEL || "qa_negative_test";

// Skip the browser check when running this by hand without a dev server up.
const SKIP_VERIFY = process.env.QA_SKIP_VERIFY === "true";

// Service URLs come from the app's own config so they cannot drift from what the running
// app uses. `development` is the block `npm start` selects.
const CONFIG = require(join(ROOT, "src", "shell", "app.config.js")).development;

const API_BASE = `${CONFIG.API_INSTANCE_PROTOCOL}${INSTANCE_ZUID}${CONFIG.API_INSTANCE}`;
const MANAGER_HOST = `${INSTANCE_ZUID}.manager.dev.zesty.io:8080`;
const BASE_URL = `http://${MANAGER_HOST}`;

function readCredentials() {
  // In CI, ci/.env is produced by ci/scripts/pull_ci_secrets.sh (GCS + KMS).
  // Locally, fall back to cypress.env.json so the script can be exercised by hand.
  try {
    const parsed = require("dotenv").config({
      path: join(ROOT, "ci", ".env"),
    }).parsed;
    if (parsed?.TEST_USER_EMAIL && parsed?.TEST_USER_PASSWORD) {
      return {
        email: parsed.TEST_USER_EMAIL,
        password: parsed.TEST_USER_PASSWORD,
      };
    }
  } catch {
    // fall through
  }

  const local = JSON.parse(
    readFileSync(join(ROOT, "cypress.env.json"), "utf8")
  );
  if (!local?.email || !local?.password) {
    throw new Error(
      "No credentials found. Expected TEST_USER_EMAIL/TEST_USER_PASSWORD in ci/.env " +
        "(run `npm run ci:test:setup`) or {email,password} in cypress.env.json."
    );
  }
  return local;
}

async function login({ email, password }) {
  const body = new FormData();
  body.append("email", email);
  body.append("password", password);

  const res = await fetch(`${CONFIG.SERVICE_AUTH}/login`, {
    method: "POST",
    body,
  });
  const json = await res.json();
  const token = json?.meta?.token;
  if (!token) {
    // Never echo the response wholesale — it can carry account detail.
    throw new Error(
      `Login failed (${res.status} ${json?.message ?? "no token returned"}). ` +
        "If this is a 401, the CI test-user credentials have rotated."
    );
  }
  return token;
}

async function resolveFixtures(token) {
  const authed = { authorization: `Bearer ${token}` };
  const get = (path) => fetch(`${API_BASE}${path}`, { headers: authed });

  const modelsRes = await get("/content/models");
  if (!modelsRes.ok) {
    throw new Error(
      `GET /content/models returned ${modelsRes.status} for ${INSTANCE_ZUID}. ` +
        "Check the test user has access to this instance in the dev environment."
    );
  }
  const models = (await modelsRes.json())?.data ?? [];
  const model = models.find((m) => m.name === FIXTURE_MODEL_NAME);

  if (!model) {
    throw new Error(
      `No model named "${FIXTURE_MODEL_NAME}" on ${INSTANCE_ZUID} in the dev environment. ` +
        `Found: ${models.map((m) => m.name).join(", ") || "(none)"}. ` +
        "The fixtures are authored in production and reach dev via the nightly sync — if they " +
        "were added today, they will not be here until tomorrow's sync has run."
    );
  }

  // The API does not return items in sort order, so pick the primary deterministically —
  // otherwise contentUrl points at a different item run to run and repro steps in one
  // report will not line up with the next.
  const items = (
    (await (await get(`/content/models/${model.ZUID}/items`)).json())?.data ??
    []
  ).sort((a, b) => (a.meta?.sort ?? 0) - (b.meta?.sort ?? 0));
  if (!items.length) {
    throw new Error(
      `Model "${FIXTURE_MODEL_NAME}" (${model.ZUID}) has no items to test against.`
    );
  }

  const fields = (
    (await (await get(`/content/models/${model.ZUID}/fields`)).json())?.data ??
    []
  ).map((f) => ({
    name: f.name,
    label: f.label,
    datatype: f.datatype,
    required: !!f.required,
  }));

  return { model, items, fields };
}

function writeSessionFiles(token, { model, items, fields }) {
  // Host-only, non-secure, non-httpOnly — exactly what cy.setCookie produces. The app reads
  // it with js-cookie in src/utility/request.js and sends it as an Authorization bearer, so
  // this one cookie is enough for the boot-time verify() to succeed.
  writeFileSync(
    join(ROOT, "auth-state.json"),
    JSON.stringify(
      {
        cookies: [
          {
            name: CONFIG.COOKIE_NAME,
            value: token,
            domain: MANAGER_HOST.split(":")[0],
            path: "/",
            expires: -1,
            httpOnly: false,
            secure: false,
            sameSite: "Lax",
          },
        ],
        origins: [],
      },
      null,
      2
    )
  );

  const contentUrl = `${BASE_URL}/content/${model.ZUID}/${items[0]?.meta?.ZUID}`;
  writeFileSync(
    join(ROOT, "qa-context.json"),
    JSON.stringify(
      {
        baseUrl: BASE_URL,
        instanceZUID: INSTANCE_ZUID,
        instanceName: "INTERNAL-NEGATIVE-QA",
        disposable: true,
        model: {
          ZUID: model.ZUID,
          name: model.name,
          label: model.label,
          type: model.type,
        },
        fields,
        items: items.map((i) => ({
          ZUID: i.meta?.ZUID,
          metaTitle: i.web?.metaTitle,
          pathPart: i.web?.pathPart,
          url: `${BASE_URL}/content/${model.ZUID}/${i.meta?.ZUID}`,
        })),
        contentUrl,
      },
      null,
      2
    )
  );

  return contentUrl;
}

// Scope of this check, so nobody relies on a guarantee it does not give: it drives Playwright
// directly, NOT the Playwright MCP server the agent uses. It therefore proves the cookie is
// valid, the host resolves, and the app boots signed in — the failures that actually happen —
// but it would NOT catch the MCP server loading the storage state differently, or dropping
// --storage-state on a version bump. Pinning PLAYWRIGHT_MCP_VERSION is what guards that.
async function verifySession(contentUrl) {
  // Imported lazily so the resolve/write half still runs where Playwright isn't installed.
  const { chromium } = await import("playwright");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    storageState: join(ROOT, "auth-state.json"),
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();
  let failure = null;

  try {
    await page.goto(contentUrl, {
      waitUntil: "domcontentloaded",
      timeout: 90000,
    });

    // Ask the store, not the DOM. `auth.checking` is the boot-time race against verify(), and
    // "is there a password field on screen" is not a reliable proxy — the signed-in shell
    // renders one anyway. Reading window.zestyStore is the legacy compatibility shim; reads
    // are tolerated (writes are not — see CLAUDE.md).
    const auth = await page
      .waitForFunction(
        () => {
          const state = window.zestyStore?.getState?.()?.auth;
          return state && state.checking === false ? state : false;
        },
        { timeout: 60000 }
      )
      .then((handle) => handle.jsonValue())
      .catch(() => null);

    if (!auth) {
      failure =
        "auth.checking never settled within 60s — the app did not finish booting. Check " +
        "devserver.log and that the /etc/hosts entry points the ZUID host at 127.0.0.1. " +
        "A first request to a new host can also exceed this while webpack compiles.";
    } else if (!auth.valid) {
      failure =
        "The app booted but auth.valid is false — the session cookie was rejected. " +
        "Check the cookie name/domain written above against CONFIG.COOKIE_NAME in " +
        "src/shell/app.config.js, and that the token has not expired.";
    }
  } catch (err) {
    failure = `Could not load ${contentUrl}: ${err.message}`;
  }

  if (failure) {
    await page
      .screenshot({ path: join(ROOT, "qa-session-check-failed.png") })
      .catch(() => {});
  }
  await browser.close();

  if (failure) throw new Error(failure);
}

async function main() {
  const token = await login(readCredentials());
  const fixtures = await resolveFixtures(token);
  const contentUrl = writeSessionFiles(token, fixtures);

  // Never print the token.
  console.log(
    `Resolved ${FIXTURE_MODEL_NAME} (${fixtures.model.ZUID}) with ` +
      `${fixtures.items.length} item(s), ${fixtures.fields.length} field(s).`
  );
  console.log(`Content URL: ${contentUrl}`);

  if (SKIP_VERIFY) {
    console.log("QA_SKIP_VERIFY=true — skipping the browser session check.");
    return;
  }

  await verifySession(contentUrl);
  console.log("Session check passed — the browser is authenticated.");
}

main().catch((err) => {
  console.error(`qa_session failed: ${err.message}`);
  process.exit(1);
});

// Hands the negative-QA agent an already-authenticated browser, and proves it works before
// any agent time is spent.
//
// That is the whole job. The agent discovers what content exists by browsing — it owns the
// instance, the nav lists the models, the content list shows the items. An earlier version
// also called the API to build a manifest of models/items/fields, which made sense when
// content was seeded per run and the agent couldn't reliably find records created seconds
// earlier. On a fixed instance that manifest was just describing a screen the agent was about
// to look at, so it is gone.
//
// Output, written to the repo root and gitignored:
//   auth-state.json — Playwright storage state holding only the session cookie. Playwright MCP
//                     loads it at browser start, so the agent is already logged in and the
//                     token never has to appear in its prompt or transcript.
//
// The verification is not decoration. If the session silently fails, the agent sees a login
// screen, burns its whole turn budget finding nothing, and reports "no findings" —
// indistinguishable from a clean PR. Failing loudly here is the point.

import { createRequire } from "module";
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

// The dedicated QA instance (INTERNAL-NEGATIVE-QA). Deliberately NOT the Cypress instance
// (8-f48cf3a682-7fthvk) — that one is shared with every PR's e2e run.
const INSTANCE_ZUID = process.env.QA_INSTANCE_ZUID || "8-acabf6a8d6-bj9tr2";

// Skip the browser check when running this by hand without a dev server up.
const SKIP_VERIFY = process.env.QA_SKIP_VERIFY === "true";

// Service URLs come from the app's own config so they cannot drift from what the running
// app uses. `development` is the block `npm start` selects.
const CONFIG = require(join(ROOT, "src", "shell", "app.config.js")).development;

const MANAGER_HOST = `${INSTANCE_ZUID}.manager.dev.zesty.io:8080`;
const BASE_URL = `http://${MANAGER_HOST}`;

function readCredentials() {
  // In CI, ci/.env is produced by ci/scripts/pull_ci_secrets.sh (GCS + KMS).
  // Locally, fall back to cypress.env.json so this can be exercised by hand.
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

function writeAuthState(token) {
  // Host-only, non-secure, non-httpOnly — exactly what cy.setCookie produces. The app reads it
  // with js-cookie in src/utility/request.js and sends it as an Authorization bearer, so this
  // one cookie is enough for the boot-time verify() to succeed.
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
}

// Scope of this check, so nobody relies on a guarantee it does not give: it drives Playwright
// directly, NOT the Playwright MCP server the agent uses. It therefore proves the cookie is
// valid, the host resolves, and the app boots signed in — the failures that actually happen —
// but it would NOT catch the MCP server loading the storage state differently, or dropping
// --storage-state on a version bump. Pinning PLAYWRIGHT_MCP_VERSION is what guards that.
async function verifySession() {
  // Imported lazily so login/write still runs where Playwright isn't installed.
  const { chromium } = await import("playwright");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    storageState: join(ROOT, "auth-state.json"),
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();
  let failure = null;

  try {
    await page.goto(BASE_URL, {
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
        "The app booted but auth.valid is false — the session cookie was rejected. Check the " +
        "cookie name/domain above against CONFIG.COOKIE_NAME in src/shell/app.config.js, that " +
        "the token has not expired, and that the test user can access this instance in dev.";
    }
  } catch (err) {
    failure = `Could not load ${BASE_URL}: ${err.message}`;
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
  writeAuthState(await login(readCredentials()));

  // Never print the token.
  console.log(`Signed in to ${INSTANCE_ZUID}. Base URL: ${BASE_URL}`);

  if (SKIP_VERIFY) {
    console.log("QA_SKIP_VERIFY=true — skipping the browser session check.");
    return;
  }

  await verifySession();
  console.log("Session check passed — the browser is authenticated.");
}

main().catch((err) => {
  console.error(`qa_session failed: ${err.message}`);
  process.exit(1);
});

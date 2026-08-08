// Signs the negative-QA agent's browser in and proves it worked, by writing auth-state.json
// for Playwright MCP's --storage-state. Keeps the token out of the agent's prompt entirely.

import { createRequire } from "module";
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

// INTERNAL-NEGATIVE-QA, not the Cypress instance (8-f48cf3a682-7fthvk).
const INSTANCE_ZUID = process.env.QA_INSTANCE_ZUID || "8-acabf6a8d6-bj9tr2";
const SKIP_VERIFY = process.env.QA_SKIP_VERIFY === "true";

const CONFIG = require(join(ROOT, "src", "shell", "app.config.js")).development;
const MANAGER_HOST = `${INSTANCE_ZUID}.manager.dev.zesty.io:8080`;
const BASE_URL = `http://${MANAGER_HOST}`;

function readCredentials() {
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
    // fall through to the local file
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
    throw new Error(
      `Login failed (${res.status} ${json?.message ?? "no token returned"}). ` +
        "If this is a 401, the CI test-user credentials have rotated."
    );
  }
  return token;
}

function writeAuthState(token) {
  // Host-only, non-secure, non-httpOnly — same shape as cy.setCookie, so js-cookie can read it.
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

// Drives Playwright directly, not the MCP server, so it proves the cookie and the app boot but
// not that MCP still honours --storage-state. Pinning PLAYWRIGHT_MCP_VERSION guards that.
async function verifySession() {
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

    // Ask the store, not the DOM: the signed-in shell renders a password input anyway.
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

  await browser.close();

  if (failure) throw new Error(failure);
}

async function main() {
  writeAuthState(await login(readCredentials()));
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

// Smoke-checks the pre-authenticated browser session before the QA agent is allowed to start.
//
// The whole negative-QA workflow rests on one trick: qa_seed.mjs writes auth-state.json, and
// Playwright MCP's --storage-state loads it so the agent lands on an already-signed-in app.
// When that breaks — a renamed MCP flag, an expired token, a changed cookie name — nothing
// throws. The agent just sees a login screen, spends its full turn budget finding nothing,
// and reports "no findings". That is the worst possible failure mode: expensive and silent.
//
// So: load the same storage state, open the same URL, and assert we are actually logged in.

import { readFileSync } from "fs";
import { chromium } from "playwright";

const ctx = JSON.parse(readFileSync("qa-context.json", "utf8"));

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  storageState: "auth-state.json",
  viewport: { width: 1920, height: 1080 },
});
const page = await context.newPage();

let failure = null;

try {
  await page.goto(ctx.contentUrl, {
    waitUntil: "domcontentloaded",
    timeout: 90000,
  });

  // Ask the store, not the DOM. `auth.checking` is the boot-time race against verify(), and
  // "is there a password field on screen" is not a reliable proxy — the signed-in shell
  // renders one anyway. Reading window.zestyStore is the legacy compatibility shim; reads are
  // tolerated (writes are not — see CLAUDE.md).
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
      "auth.checking never settled within 60s — the app did not finish booting. " +
      "Check devserver.log and that the /etc/hosts entry points the ZUID host at 127.0.0.1.";
  } else if (!auth.valid) {
    failure =
      "The app booted but auth.valid is false — the storage-state session was rejected. " +
      "Check the cookie name/domain written by qa_seed.mjs against CONFIG.COOKIE_NAME in " +
      "src/shell/app.config.js, and that Playwright MCP still supports --storage-state.";
  }
} catch (err) {
  failure = `Could not load ${ctx.contentUrl}: ${err.message}`;
}

if (failure) {
  await page
    .screenshot({ path: "qa-session-check-failed.png" })
    .catch(() => {});
}

await browser.close();

if (failure) {
  console.error(`Session check FAILED. ${failure}`);
  process.exit(1);
}

console.log("Session check passed — the browser is authenticated.");

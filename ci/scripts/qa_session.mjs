// Prepares the negative-QA run: authenticates a browser session and resolves the fixture
// content the agent is allowed to work on.
//
// This replaces the old per-run seeding. QA now targets a dedicated instance
// (INTERNAL-NEGATIVE-QA) whose fixtures are authored once in production and arrive in the dev
// environment through the nightly prod→dev sync. That sync is also the cleanup: whatever the
// agent mutates is reset overnight, so there is nothing to tear down and no window in which a
// half-finished run leaves debris behind. It also means the agent is free to mutate anything
// it finds here — nothing else shares this instance, unlike the Cypress instance where a
// stray write breaks other PRs.
//
// Outputs, both written to the repo root and both gitignored:
//   auth-state.json  — Playwright storage state holding only the session cookie. Playwright
//                      MCP loads it at browser start, so the QA agent is already logged in
//                      and the token never has to appear in its prompt or transcript.
//   qa-context.json  — the fixture ZUIDs and URLs the agent works against. No secrets.

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

const authed = (token) => ({ authorization: `Bearer ${token}` });

async function main() {
  const token = await login(readCredentials());

  const modelsRes = await fetch(`${API_BASE}/content/models`, {
    headers: authed(token),
  });
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

  const itemsRes = await fetch(
    `${API_BASE}/content/models/${model.ZUID}/items`,
    { headers: authed(token) }
  );
  // The API does not return items in sort order, so pick the primary deterministically —
  // otherwise contentUrl points at a different item run to run and repro steps in one
  // report will not line up with the next.
  const items = ((await itemsRes.json())?.data ?? []).sort(
    (a, b) => (a.meta?.sort ?? 0) - (b.meta?.sort ?? 0)
  );
  if (!items.length) {
    throw new Error(
      `Model "${FIXTURE_MODEL_NAME}" (${model.ZUID}) has no items to test against.`
    );
  }

  const fieldsRes = await fetch(
    `${API_BASE}/content/models/${model.ZUID}/fields`,
    { headers: authed(token) }
  );
  const fields = ((await fieldsRes.json())?.data ?? []).map((f) => ({
    name: f.name,
    label: f.label,
    datatype: f.datatype,
    required: !!f.required,
  }));

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

  const primary = items[0];
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
        contentUrl: `${BASE_URL}/content/${model.ZUID}/${primary?.meta?.ZUID}`,
      },
      null,
      2
    )
  );

  // Never print the token.
  console.log(
    `Resolved ${FIXTURE_MODEL_NAME} (${model.ZUID}) with ${items.length} item(s), ${fields.length} field(s).`
  );
  console.log(
    `Content URL: ${BASE_URL}/content/${model.ZUID}/${primary?.meta?.ZUID}`
  );
}

main().catch((err) => {
  console.error(`qa_session failed: ${err.message}`);
  process.exit(1);
});

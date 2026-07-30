// Seeds throwaway content for the negative-QA workflow and hands the browser a
// pre-authenticated session.
//
// Why this exists rather than reusing cypress/plugins/seeds/content.ts: that module is
// TypeScript, is written against the Cypress plugin `config` object, and imports helpers
// out of src/ through webpack aliases — none of which survive outside the Cypress runner.
// This is the same flow (@zesty-io/sdk, same fixtures, same label convention) in plain ESM.
//
// Outputs, both written to the repo root and both gitignored:
//   auth-state.json  — Playwright storage state holding only the session cookie. Playwright
//                      MCP loads it at browser start, so the QA agent is already logged in
//                      and the token never has to appear in its prompt or transcript.
//   qa-context.json  — the ZUIDs and URLs the agent is allowed to touch. No secrets.

import { createRequire } from "module";
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";

const require = createRequire(import.meta.url);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const SDK = require("@zesty-io/sdk");

// cypress.config.js is the single source of truth for the test instance ZUID and the
// service URLs — read it rather than keeping a fourth copy of them.
const cypressConfig = require(join(ROOT, "cypress.config.js"));
const { env } = cypressConfig;
const BASE_URL = cypressConfig.e2e.baseUrl.replace(/\/$/, "");
const INSTANCE_ZUID = new URL(BASE_URL).host.split(".")[0];

// Mirrors src/utility/formatName.js and src/utility/formatPathPart.js. Inlined because those
// are ESM-syntax .js files in a CommonJS package, so Node can't import them from here.
const formatName = (str) =>
  str
    .replace(/[^a-zA-Z0-9\_\\s]+/gi, "_")
    .toLowerCase()
    .trim();
const formatPathPart = (str) =>
  str
    .replace(/[^a-zA-Z0-9\_\\s]+/gi, "-")
    .toLowerCase()
    .trim();

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

async function main() {
  const { email, password } = readCredentials();

  const auth = new SDK.Auth({ authURL: env.API_AUTH });
  const { token } = await auth.login(email, password);
  if (!token) {
    throw new Error("Authentication failed: no token received");
  }

  const sdk = new SDK(INSTANCE_ZUID, token, {
    accountsAPIURL: env.API_ACCOUNTS,
    authURL: env.API_AUTH,
    instancesAPIURL: env.API_INSTANCE_URL,
    mediaAPIURL: env.MEDIA_MANAGER_URL,
  });

  const fixture = process.env.QA_SEED_FIXTURE || "fixtures/item.json";
  const json = JSON.parse(readFileSync(join(ROOT, "cypress", fixture), "utf8"));

  // Same shape as the Cypress `E2E:` prefix so the nightly prod sync sweeps anything the
  // cleanup step misses. uuid, not a timestamp — collision-resistant across parallel runs.
  const runId = randomUUID();
  const modelLabel = `QA: ${json.model.label} | ${env.COMMIT_ID} | ${runId}`;

  // createModel can return null data under API load — same retry the Cypress seed uses.
  let model = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await sdk.instance.createModel({
      ...json.model,
      label: modelLabel,
      metaTitle: modelLabel,
      name: formatName(modelLabel),
    });
    model = res?.data;
    if (model?.ZUID) break;
    if (attempt < 3) await new Promise((r) => setTimeout(r, 2000 * attempt));
  }
  if (!model?.ZUID) {
    throw new Error(`Failed to create model after 3 attempts: "${modelLabel}"`);
  }

  const fields = await Promise.all(
    json.fields.map((field) =>
      sdk.instance.createField(model.ZUID, field).then((res) => ({
        name: field.name,
        datatype: field.datatype,
        ZUID: res?.data?.ZUID || null,
      }))
    )
  );

  const items = await Promise.all(
    json.items.map((item, index) => {
      const itemLabel = `QA: ${item.web.metaTitle} | ${env.COMMIT_ID} | ${runId}`;
      const payload = {
        ...item,
        meta: {
          ...item.meta,
          sort: item.meta?.sort ?? index,
          contentModelZUID: model.ZUID,
        },
        web: {
          ...item.web,
          metaTitle: itemLabel,
          metaLinkText: itemLabel,
          ...(model.type === "block"
            ? {}
            : {
                pathPart: formatPathPart(itemLabel),
                // "0" is how the editor represents the root parent (see ItemParent.tsx).
                // Creating through the API leaves parentZUID null, and the editor's required
                // check is a bare truthiness test — so a null-parent item can't be saved from
                // the UI at all, which would stall the QA agent on every run before it reached
                // anything worth testing. Seed what a UI-created top-level page looks like.
                parentZUID: "0",
              }),
        },
      };
      return sdk.instance.createItem(model.ZUID, payload).then((res) => ({
        ZUID: res?.data?.ZUID || null,
        pathPart: payload.web.pathPart || null,
        metaTitle: itemLabel,
      }));
    })
  );

  const cookieDomain = new URL(BASE_URL).hostname;

  // Host-only, non-secure, non-httpOnly — exactly what cy.setCookie produces. The app reads
  // it with js-cookie in src/utility/request.js and sends it as an Authorization bearer, so
  // this one cookie is enough for the boot-time verify() to succeed.
  writeFileSync(
    join(ROOT, "auth-state.json"),
    JSON.stringify(
      {
        cookies: [
          {
            name: env.COOKIE_NAME,
            value: token,
            domain: cookieDomain,
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

  writeFileSync(
    join(ROOT, "qa-context.json"),
    JSON.stringify(
      {
        baseUrl: BASE_URL,
        instanceZUID: INSTANCE_ZUID,
        model: { ZUID: model.ZUID, label: modelLabel, type: model.type },
        fields,
        items,
        contentUrl: `${BASE_URL}/content/${model.ZUID}/${items[0]?.ZUID}`,
      },
      null,
      2
    )
  );

  // Never print the token.
  console.log(`Seeded model ${model.ZUID} with ${items.length} item(s).`);
  console.log(
    `Content URL: ${BASE_URL}/content/${model.ZUID}/${items[0]?.ZUID}`
  );
}

main().catch((err) => {
  console.error(`qa_seed failed: ${err.message}`);
  process.exit(1);
});

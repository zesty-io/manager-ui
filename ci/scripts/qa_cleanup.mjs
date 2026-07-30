// Deletes the throwaway content seeded by qa_seed.mjs.
//
// Runs in an `if: always()` step so a crashed or timed-out QA agent doesn't leak records onto
// the shared dev instance. Deleting the model cascades to its fields and items, which is why
// there's nothing else to clean up here. Never fails the job — leftovers are swept by the
// nightly prod sync anyway, and a cleanup error must not mask the QA result.

import { createRequire } from "module";
import { existsSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const SDK = require("@zesty-io/sdk");
const cypressConfig = require(join(ROOT, "cypress.config.js"));
const { env } = cypressConfig;
const INSTANCE_ZUID = new URL(cypressConfig.e2e.baseUrl).host.split(".")[0];

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
    // fall through
  }
  return JSON.parse(readFileSync(join(ROOT, "cypress.env.json"), "utf8"));
}

async function main() {
  const contextPath = join(ROOT, "qa-context.json");
  if (!existsSync(contextPath)) {
    console.log("No qa-context.json — nothing to clean up.");
    return;
  }

  const context = JSON.parse(readFileSync(contextPath, "utf8"));
  const modelZUID = context?.model?.ZUID;
  if (!modelZUID) {
    console.log("qa-context.json has no model ZUID — nothing to clean up.");
    return;
  }

  const { email, password } = readCredentials();
  const auth = new SDK.Auth({ authURL: env.API_AUTH });
  const { token } = await auth.login(email, password);

  // @zesty-io/sdk has createModel but no deleteModel, so this goes straight at the endpoint —
  // the same DELETE cy.deleteModel uses in cypress/support/api.js.
  const res = await fetch(
    `${env.API_INSTANCE_URL}/content/models/${modelZUID}`,
    {
      method: "DELETE",
      headers: { authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) {
    throw new Error(
      `DELETE /content/models/${modelZUID} returned ${res.status}`
    );
  }

  console.log(`Deleted seeded model ${modelZUID}.`);
}

main().catch((err) => {
  // Deliberately exit 0: cleanup failure is a warning, not a build failure. The ::warning::
  // prefix surfaces it in the Actions UI so a persistently broken cleanup doesn't go unnoticed
  // while it quietly litters the shared dev instance.
  console.warn(
    `::warning::qa_cleanup failed, leaving records for the nightly sync: ${err.message}`
  );
});

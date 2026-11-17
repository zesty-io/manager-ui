import { v4 as uuidv4 } from "uuid";

// The instance ZUID the app itself derives from the hostname
// (src/utility/instanceZUID.js) — used to assert the session handshake
// payload without hardcoding the dev instance's ZUID a second time.
const INSTANCE_ZUID = new URL(Cypress.config("baseUrl")).hostname.split(".")[0];

const APP_ZUID = `8-marketplace-test-app-${uuidv4()}`;
const APP_URL = `${Cypress.config("baseUrl")}marketplace-test-app.html`;
const NOT_INSTALLED_ZUID = `8-marketplace-not-installed-${uuidv4()}`;

describe("Marketplace custom apps", () => {
  beforeEach(() => {
    cy.login();
    cy.blockLock();
    cy.blockAnnouncements();

    // Stub the two requests fetchInstalledApps makes (src/shell/store/apps.js)
    // so the spec never depends on a real third-party app being installed on
    // the dev instance.
    cy.intercept(
      "GET",
      `${Cypress.env("API_ACCOUNTS")}/instances/*/app-installs`,
      {
        statusCode: 200,
        body: { data: [{ appZUID: APP_ZUID }] },
      }
    ).as("appInstalls");

    cy.intercept("GET", `${Cypress.env("API_ACCOUNTS")}/apps/${APP_ZUID}`, {
      statusCode: 200,
      body: {
        data: {
          ZUID: APP_ZUID,
          label: "Marketplace Test App",
          url: APP_URL,
        },
      },
    }).as("appInfo");
  });

  it("renders the installed app in an iframe and sends the session handshake", () => {
    // The stubbed app document echoes any message it receives back to the
    // parent, so the test asserts on what the iframe actually received rather
    // than stubbing postMessage on a window that gets replaced on navigation.
    cy.intercept("GET", APP_URL, {
      statusCode: 200,
      headers: { "content-type": "text/html" },
      body: `<html><body>Marketplace test app<script>
        window.addEventListener("message", (e) =>
          window.parent.postMessage({ echo: e.data, origin: e.origin }, "*")
        );
      </script></body></html>`,
    }).as("appFrame");

    cy.visit(`/apps/${APP_ZUID}`, {
      onBeforeLoad(win) {
        win.__received = [];
        win.addEventListener("message", (e) => {
          if (e.data?.echo) win.__received.push(e.data.echo);
        });
      },
    });
    cy.wait(["@appInstalls", "@appInfo", "@appFrame"]);

    cy.get(`iframe[src="${APP_URL}"]`).should("exist");

    cy.window().should((win) => {
      expect(win.__received).to.have.length(1);

      const payload = win.__received[0];
      expect(payload.source).to.eq("zesty");
      expect(payload.instance.ZUID).to.eq(INSTANCE_ZUID);
    });
  });

  it("shows the not found state for an app that is not installed", () => {
    cy.visit(`/apps/${NOT_INSTALLED_ZUID}`);
    cy.wait(["@appInstalls", "@appInfo"]);

    cy.getBySelector("NotFound").should("be.visible");
  });
});

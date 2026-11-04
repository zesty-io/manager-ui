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
    // A short, explicit stub response (rather than a real request) keeps a
    // deterministic window between the iframe appearing in the DOM and its
    // "load" event firing, so there's time to attach the postMessage stub
    // below before the app's handshake fires.
    cy.intercept("GET", APP_URL, {
      statusCode: 200,
      headers: { "content-type": "text/html" },
      body: "<html><body>Marketplace test app</body></html>",
    }).as("appFrame");

    cy.visit(`/apps/${APP_ZUID}`);
    cy.wait(["@appInstalls", "@appInfo"]);

    cy.get(`iframe[src="${APP_URL}"]`)
      .should("exist")
      .then(($iframe) => {
        cy.stub($iframe[0].contentWindow, "postMessage").as("postMessage");
      });

    cy.wait("@appFrame");

    cy.get("@postMessage").should((stub) => {
      expect(stub).to.have.been.calledOnce;

      const [payload, targetOrigin] = stub.getCall(0).args;
      expect(payload.source).to.eq("zesty");
      expect(payload.instance.ZUID).to.eq(INSTANCE_ZUID);
      expect(targetOrigin).to.eq(APP_URL);
    });
  });

  it("shows the not found state for an app that is not installed", () => {
    cy.visit(`/apps/${NOT_INSTALLED_ZUID}`);
    cy.wait(["@appInstalls", "@appInfo"]);

    cy.getBySelector("NotFound").should("be.visible");
  });
});

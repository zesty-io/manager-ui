import instanceZUID from "../../../src/utility/instanceZUID";
import CONFIG from "../../../src/shell/app.config";

const OTHER_USER_ZUID = "5-0000000-otheruser";
const gateway = CONFIG[process.env.NODE_ENV]?.SERVICE_REDIS_GATEWAY;

// Load the list, then route to the item in-app so leaving it unmounts ItemEdit
const openItemInApp = (modelZUID, itemZUID) => {
  cy.visit(`/content/${modelZUID}`);
  cy.location("pathname").should("eq", `/content/${modelZUID}`);
  cy.window().then((win) => {
    win.history.pushState({}, "", `/content/${modelZUID}/${itemZUID}`);
    win.dispatchEvent(new win.PopStateEvent("popstate"));
  });
  cy.location("pathname").should("eq", `/content/${modelZUID}/${itemZUID}`);
};

describe("Content Item: Lock modal", () => {
  before(() => {
    cy.task("seed:content", "fixtures/item.json").then(({ model, items }) => {
      Cypress.env("modelZUID", model?.ZUID);
      Cypress.env("itemZUID", items[0]?.meta?.ZUID);
    });
  });

  it("Go Back does not release another user's lock", () => {
    const itemZUID = Cypress.env("itemZUID");
    const modelZUID = Cypress.env("modelZUID");

    // Simulate another user holding the lock
    cy.apiRequest({
      method: "POST",
      url: `${gateway}/door/lock`,
      body: {
        firstName: "Other",
        lastName: "User",
        email: "other.user@example.com",
        userZUID: OTHER_USER_ZUID,
        path: itemZUID,
        instanceZUID,
      },
    });

    cy.intercept("**/door/unlock*").as("unlock");
    // The browser-side knock can miss a lock set via the API, so serve the other user's lock to the app deterministically
    cy.intercept("GET", "**/door/knock*", {
      statusCode: 200,
      body: {
        firstName: "Other",
        lastName: "User",
        email: "other.user@example.com",
        userZUID: OTHER_USER_ZUID,
        path: itemZUID,
        instanceZUID,
        timestamp: `${Math.floor(Date.now() / 1000)}`,
      },
    }).as("knock");

    openItemInApp(modelZUID, itemZUID);

    cy.getBySelector("LockedItemGoBack").should("exist").click();
    cy.location("pathname").should("eq", `/content/${modelZUID}`);
    cy.getBySelector("LockedItemGoBack").should("not.exist");

    cy.get("@unlock.all").should("have.length", 0);

    // The other user's lock is still held
    cy.getCookie(Cypress.env("COOKIE_NAME"))
      .then((cookie) =>
        cy.request({
          url: `${gateway}/door/knock?path=${itemZUID}&instanceZUID=${instanceZUID}`,
          headers: { authorization: `Bearer ${cookie?.value}` },
        })
      )
      .then(({ body: res }) => {
        expect(res?.userZUID).to.eq(OTHER_USER_ZUID);
      });
  });

  it("Releases the lock the current user holds when navigating away", () => {
    const itemZUID = Cypress.env("itemZUID");
    const modelZUID = Cypress.env("modelZUID");

    cy.intercept("**/door/unlock*").as("unlock");

    // No lock held on mount, so the app takes it for the current user.
    // The release check on exit then sees the current user as the holder.
    let holder = {};
    cy.intercept("GET", "**/door/knock*", (req) => req.reply(200, holder));
    cy.intercept("POST", "**/door/lock", (req) => {
      holder = { userZUID: req.body.userZUID, path: itemZUID };
      req.continue();
    }).as("lock");

    openItemInApp(modelZUID, itemZUID);
    cy.wait("@lock");
    cy.getBySelector("LockedItemGoBack").should("not.exist");

    cy.window().then((win) => win.history.back());
    cy.location("pathname").should("eq", `/content/${modelZUID}`);

    cy.wait("@unlock");
  });

  after(() => {
    cy.apiRequest({
      url: `${gateway}/door/unlock?path=${Cypress.env(
        "itemZUID"
      )}&instanceZUID=${instanceZUID}`,
    });
    cy.deleteModel(Cypress.env("modelZUID"));
  });
});

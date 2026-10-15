import ContentItemPage from "./pages/ContentItemPage";

const NOW = Date.now();

const TITLES = {
  publishLabel: `Publish Approval - ${NOW}`,
  testLabel: `Random Test Label - ${NOW}`,
  noPermissionLabel: `No Permission Label - ${NOW}`,
};
const LABEL_DATA = {
  publishLabel: {
    name: TITLES.publishLabel,
    description: "",
    color: "#4E5BA6",
    allowPublish: true,
    addPermissionRoles: ["30-86f8ccec82-swp72s", "30-8ee88afe82-gmx631"],
    removePermissionRoles: ["30-86f8ccec82-swp72s", "30-8ee88afe82-gmx631"],
  },
  testLabel: {
    name: TITLES.testLabel,
    description: "",
    color: "#4E5BA6",
    allowPublish: false,
    addPermissionRoles: ["30-86f8ccec82-swp72s", "30-8ee88afe82-gmx631"],
    removePermissionRoles: ["30-86f8ccec82-swp72s", "30-8ee88afe82-gmx631"],
  },
  // addPermissionRoles set to a role the test user does NOT have, so the app
  // blocks adding it — this is what the "cannot add without permission" test needs.
  noPermissionLabel: {
    name: TITLES.noPermissionLabel,
    description: "",
    color: "#4E5BA6",
    allowPublish: false,
    addPermissionRoles: ["30-fcb3fc9083-mz27f9"],
    removePermissionRoles: ["30-fcb3fc9083-mz27f9"],
  },
};
const cleanUp = () => {
  cy.task("cleanup:labels");
};

// retries disabled: these tests are an ordered, testIsolation:false chain that
// adds/applies workflow labels — a retry re-adds a label that already persisted,
// drifting the active-label count.
describe("Content Item Workflows", { retries: 0 }, () => {
  let ITEM = null;
  before(() => {
    cleanUp();

    Object.values(LABEL_DATA).forEach((data) => {
      cy.task("api:createLabel", data);
    });

    cy.task("seed:content", "fixtures/item.json")
      .then(({ model, items }) => {
        Cypress.env("modelZUID", model?.ZUID);
        Cypress.env("itemZUID", items[0]?.meta?.ZUID);
        ITEM = items?.[0];
      })
      .then(() => {
        cy.visit(
          `/content/${Cypress.env("modelZUID")}/${Cypress.env("itemZUID")}`
        );
      });
  });

  after(() => {
    cleanUp();
  });

  it("Can add a workflow label", () => {
    // Intercept must be registered before the click that fires the PUT.
    cy.intercept("PUT", "**/labels/*").as("updateLabel");

    ContentItemPage.elements.versionSelector().should("exist").click();
    ContentItemPage.elements.addWorkflowStatusLabel().should("exist").click();
    ContentItemPage.elements
      .workflowStatusLabelOption()
      .contains(TITLES.testLabel)
      .should("exist")
      .click({ force: true });

    cy.get("body").type("{esc}");

    cy.wait("@updateLabel")
      .its("response.statusCode")
      .should("be.oneOf", [200, 201]);

    cy.reload();

    ContentItemPage.elements.versionSelector().should("exist").click();
    ContentItemPage.elements
      .versionItem()
      .first()
      .within(() => {
        ContentItemPage.elements
          .activeWorkflowStatusLabel()
          .should("have.length", 1);
      });

    cy.get("body").type("{esc}");
  });

  it("Cannot add a workflow label when role has no permission", () => {
    ContentItemPage.elements.versionSelector().should("exist").click();
    ContentItemPage.elements.addWorkflowStatusLabel().should("exist").click();
    // Click the label the test user lacks permission to add (deterministic, by
    // name) — .first() was non-deterministic and often landed on an addable label.
    ContentItemPage.elements
      .workflowStatusLabelOption()
      .contains(TITLES.noPermissionLabel)
      .should("exist")
      .click({ force: true });

    cy.get("body").type("{esc}");

    cy.reload();

    ContentItemPage.elements.versionSelector().should("exist").click();
    ContentItemPage.elements
      .versionItem()
      .first()
      .within(() => {
        ContentItemPage.elements
          .activeWorkflowStatusLabel()
          .should("have.length", 1);
      });

    cy.get("body").type("{esc}");
  });

  it("Cannot publish a content item if label with allowPublish is missing", () => {
    ContentItemPage.elements
      .publishItemButton()
      .should("exist")
      .click({ force: true });
    ContentItemPage.elements
      .confirmPublishItemButton()
      .should("exist")
      .click({ force: true });
    ContentItemPage.elements
      .toast()
      .contains(
        `Cannot Publish: "${ITEM?.web?.metaTitle}". Does not have a status that allows publishing`
      );
  });

  it("Can publish a content item if label with allowPublish is applied", () => {
    // Intercept must be registered before the click that fires the PUT.
    cy.intercept("PUT", "**/labels/*").as("updateLabel");

    cy.reload();
    ContentItemPage.elements.versionSelector().should("exist").click();
    ContentItemPage.elements.addWorkflowStatusLabel().should("exist").click();
    ContentItemPage.elements
      .workflowStatusLabelOption()
      .contains(TITLES.publishLabel)
      .should("exist")
      .click({ force: true });

    cy.get("body").type("{esc}");

    cy.wait("@updateLabel")
      .its("response.statusCode")
      .should("be.oneOf", [200, 201]);

    // Publish stays blocked until the item's workflow labels load, so clicking
    // before this GET resolves sends no POST. Alias only the reloaded page's
    // request: the PUT above invalidates these labels, so the old page can
    // refetch them too, and that response would not gate the click.
    let reloaded = false;
    cy.intercept("GET", "**/content/models/*/items/*/labels*", (req) => {
      if (reloaded) req.alias = "itemLabels";
    });
    cy.then(() => {
      cy.once("window:before:load", () => {
        reloaded = true;
      });
    });

    cy.reload();
    cy.wait("@itemLabels");

    cy.intercept("POST", "**/items/*/publishings").as("publishItem");

    ContentItemPage.elements.publishItemButton().should("exist").click();
    ContentItemPage.elements.confirmPublishItemButton().should("exist").click();

    cy.wait("@publishItem").then(({ response }) => {
      expect(response.statusCode).to.be.oneOf([200, 201]);

      // The instances API caches GET .../publishings (`instances-api-cache`).
      // A read that lands just before the publish can keep serving the
      // pre-publish list for 40s or more, and a reload inside that window
      // still renders the Publish button (#4393). Wait until the API itself
      // reports this version active, then reload.
      cy.task(
        "api:waitForActivePublishing",
        {
          modelZUID: Cypress.env("modelZUID"),
          itemZUID: Cypress.env("itemZUID"),
          version: response.body.data.version,
        },
        { timeout: 120000 }
      );
    });

    cy.reload();

    ContentItemPage.elements.contentPublishedIndicator().should("exist");
  });
});

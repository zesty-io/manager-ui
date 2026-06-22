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

    cy.reload();

    ContentItemPage.elements.publishItemButton().should("exist").click();
    ContentItemPage.elements.confirmPublishItemButton().should("exist").click();

    ContentItemPage.elements.contentPublishedIndicator().should("exist");
  });
});

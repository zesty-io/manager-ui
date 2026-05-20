import ContentItemPage from "./pages/ContentItemPage";

const NOW = Date.now();

const TITLES = {
  // publishLabel: `Publish Approval - ${NOW}`,
  testLabel: `Random Test Label - ${NOW}`,
};
const LABEL_DATA = {
  // publishLabel: {
  //   name: TITLES.publishLabel,
  //   description: "",
  //   color: "#4E5BA6",
  //   allowPublish: true,
  //   addPermissionRoles: ["30-86f8ccec82-swp72s", "30-8ee88afe82-gmx631"],
  //   removePermissionRoles: ["30-86f8ccec82-swp72s", "30-8ee88afe82-gmx631"],
  // },
  testLabel: {
    name: TITLES.testLabel,
    description: "",
    color: "#4E5BA6",
    allowPublish: false,
    addPermissionRoles: ["30-86f8ccec82-swp72s", "30-8ee88afe82-gmx631"],
    removePermissionRoles: ["30-86f8ccec82-swp72s", "30-8ee88afe82-gmx631"],
  },
};
const cleanUp = () => {
  cy.task("cleanup:labels", [/* TITLES.publishLabel, */ TITLES.testLabel]);
};

describe("Content Item Workflows", () => {
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
    ContentItemPage.elements.versionSelector().should("exist").click();
    ContentItemPage.elements.addWorkflowStatusLabel().should("exist").click();
    ContentItemPage.elements
      .workflowStatusLabelOption()
      .contains(TITLES.testLabel)
      .should("exist")
      .click({ force: true });

    cy.get("body").type("{esc}");

    cy.intercept("PUT", "**/labels/*").as("updateLabel");
    cy.wait("@updateLabel");

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
    ContentItemPage.elements
      .workflowStatusLabelOption()
      .first()
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

  // Skipped: creating an allowPublish:true label on the shared dev instance blocks
  // concurrent specs from publishing until cleanup runs. Needs a mock-based approach
  // to avoid cross-runner interference.
  it.skip("Cannot publish a content item if label with allowPublish is missing", () => {
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

  // Skipped: see note above
  it.skip("Can publish a content item if label with allowPublish is applied", () => {
    cy.reload();
    ContentItemPage.elements.versionSelector().should("exist").click();
    ContentItemPage.elements.addWorkflowStatusLabel().should("exist").click();
    ContentItemPage.elements
      .workflowStatusLabelOption()
      .contains(`Publish Approval - ${NOW}`)
      .should("exist")
      .click({ force: true });

    cy.get("body").type("{esc}");

    cy.intercept("PUT", "**/labels/*").as("updateLabel");
    cy.wait("@updateLabel");

    cy.reload();

    ContentItemPage.elements.publishItemButton().should("exist").click();
    ContentItemPage.elements.confirmPublishItemButton().should("exist").click();

    cy.intercept("GET", "**/publishings").as("publish");
    cy.wait("@publish");

    ContentItemPage.elements.contentPublishedIndicator().should("exist");
  });
});

import ContentItemPage from "./pages/ContentItemPage";

const TITLE = "Content item workflow test";

describe("Content Item Workflows", () => {
  before(() => {
    //TODO: Find a way to seed the labels prior to starting tests

    cy.visit("/content/6-b6cde1aa9f-wftv50/new");

    cy.get("#12-a6d48ca2b7-zxqns2").should("exist").find("input").type(TITLE);
    cy.get("#12-d29ab9bbe0-9k6j70")
      .should("exist")
      .find("textarea")
      .first()
      .type(TITLE);
    ContentItemPage.elements.createItemButton().should("exist").click();
    ContentItemPage.elements.duoModeToggle().should("exist").click();
  });

  after(() => {
    // TODO: Delete seeded labels after test
    ContentItemPage.elements.moreMenu().should("exist").click();
    ContentItemPage.elements.deleteItemButton().should("exist").click();
    ContentItemPage.elements.confirmDeleteItemButton().should("exist").click();
  });

  it("Can add a workflow label", () => {
    ContentItemPage.elements.versionSelector().should("exist").click();
    ContentItemPage.elements.addWorkflowStatusLabel().should("exist").click();
    ContentItemPage.elements
      .workflowStatusLabelOption()
      .last()
      .should("exist")
      .click();

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
      .click();

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

  it("Cannot publish a content item if needed workflow label is missing", () => {
    ContentItemPage.elements.publishItemButton().should("exist").click();
    ContentItemPage.elements.confirmPublishItemButton().should("exist").click();
    ContentItemPage.elements
      .toast()
      .contains(
        `Cannot Publish: "${TITLE}". Does not have a status that allows publishing`
      );
  });
});

import ContentItemPage from "./pages/ContentItemPage";
import SettingsPage from "../settings/pages/SettingsPage";

const TITLES = {
  contentItem: "Content item workflow test",
  publishLabel: "Publish Approval",
  testLabel: "Random Test Label",
};

describe("Content Item Workflows", () => {
  before(() => {
    cy.intercept("POST", "**/labels").as("createLabel");
    cy.intercept("GET", "**/labels*").as("getLabels");

    // Create allow publish workflow label
    SettingsPage.createWorkflowLabel({ name: TITLES.testLabel });
    cy.wait(["@createLabel", "@getLabels"]);
    cy.get(
      '[data-cy="active-labels-container"] [data-cy="status-label"]:visible'
    )
      .contains(TITLES.testLabel)
      .should("exist");

    SettingsPage.createWorkflowLabel({
      name: TITLES.publishLabel,
      allowPublish: true,
    });
    cy.wait(["@createLabel", "@getLabels"]);
    cy.get(
      '[data-cy="active-labels-container"] [data-cy="status-label"]:visible'
    )
      .contains(TITLES.publishLabel)
      .should("exist");

    // Visit test page
    cy.visit("/content/6-b6cde1aa9f-wftv50/new");
    cy.get("#12-a6d48ca2b7-zxqns2")
      .should("exist")
      .find("input")
      .type(TITLES.contentItem);
    cy.get("#12-d29ab9bbe0-9k6j70")
      .should("exist")
      .find("textarea")
      .first()
      .type(TITLES.contentItem);
    ContentItemPage.elements.createItemButton().should("exist").click();
    ContentItemPage.elements.duoModeToggle().should("exist").click();
  });

  after(() => {
    // Delete test content item
    ContentItemPage.elements.moreMenu().should("exist").click();
    ContentItemPage.elements.deleteItemButton().should("exist").click();
    ContentItemPage.elements.confirmDeleteItemButton().should("exist").click();
    cy.intercept("DELETE", "**/content/models/6-b6cde1aa9f-wftv50/items/*").as(
      "deleteContentItem"
    );
    cy.wait("@deleteContentItem");

    // Delete allow publish label after test
    SettingsPage.deactivateWorkflowLabel(TITLES.testLabel);
    cy.get(
      '[data-cy="active-labels-container"] [data-cy="status-label"]:visible'
    )
      .contains("Random Test Label")
      .should("not.exist");
    SettingsPage.deactivateWorkflowLabel(TITLES.publishLabel);
    cy.get(
      '[data-cy="active-labels-container"] [data-cy="status-label"]:visible'
    )
      .contains("Publish Approval")
      .should("not.exist");
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
        `Cannot Publish: "${TITLES.contentItem}". Does not have a status that allows publishing`
      );
  });

  it("Can publish a content item if label with allowPublish is applied", () => {
    cy.reload();
    ContentItemPage.elements.versionSelector().should("exist").click();
    ContentItemPage.elements.addWorkflowStatusLabel().should("exist").click();
    ContentItemPage.elements
      .workflowStatusLabelOption()
      .contains(TITLES.publishLabel)
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

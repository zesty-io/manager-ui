import ContentItemPage from "./pages/ContentItemPage";
import SettingsPage from "../settings/pages/SettingsPage";
import instanceZUID from "../../../src/utility/instanceZUID";
import CONFIG from "../../../src/shell/app.config";
import {
  AUTHORIZED_ROLES,
  colorMenu,
} from "../../../src/apps/settings/src/app/views/User/Workflows/constants";

const INSTANCE_API = `${
  CONFIG?.[process.env.NODE_ENV]?.API_INSTANCE_PROTOCOL
}${instanceZUID}${CONFIG?.[process.env.NODE_ENV]?.API_INSTANCE}`;

const INSTANCE_API = `${
  CONFIG?.[process.env.NODE_ENV]?.API_INSTANCE_PROTOCOL
}${instanceZUID}${CONFIG?.[process.env.NODE_ENV]?.API_INSTANCE}`;
const TITLES = {
  contentItem: "Content item workflow test",
  publishLabel: "Publish Approval",
  testLabel: "Random Test Label",
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
};

describe("Content Item Workflows", () => {
  before(() => {
    cy.intercept("POST", "**/labels").as("createLabel");
    cy.intercept("GET", "**/labels*").as("getLabels");

    // Create allow publish workflow label
    Object.values(LABEL_DATA).forEach((data) => {
      cy.apiRequest({
        method: "POST",
        url: `${INSTANCE_API}/env/labels`,
        body: data,
      });
    });

    // Visit test page
    cy.apiRequest({
      method: "POST",
      url: `${INSTANCE_API}/content/models/6-b6cde1aa9f-wftv50/items`,
      body: {
        data: {
          title: TITLES.contentItem,
          description: TITLES.contentItem,
          tc_title: TITLES.contentItem,
          tc_description: TITLES.contentItem,
          tc_image: null,
        },
        web: {
          canonicalTagMode: 1,
          parentZUID: "0",
          metaLinkText: TITLES.contentItem,
          metaTitle: TITLES.contentItem,
          pathPart: TITLES.contentItem?.replaceAll(" ", "-")?.toLowerCase(),
          metaDescription: TITLES.contentItem,
        },
        meta: { langID: 1, contentModelZUID: "6-b6cde1aa9f-wftv50" },
      },
    }).then((response) => {
      cy.visit(`/content/6-b6cde1aa9f-wftv50/${response.data?.ZUID}`);
    });
  });

  after(() => {
    // Delete test content item
    // ContentItemPage.elements.moreMenu().should("exist").click();
    // ContentItemPage.elements.deleteItemButton().should("exist").click();
    // ContentItemPage.elements.confirmDeleteItemButton().should("exist").click();
    // cy.intercept("DELETE", "**/content/models/6-b6cde1aa9f-wftv50/items/*").as(
    //   "deleteContentItem"
    // );
    // cy.wait("@deleteContentItem");

    // // Delete allow publish label after test
    // SettingsPage.deactivateWorkflowLabel(TITLES.testLabel);
    // cy.get(
    //   '[data-cy="active-labels-container"] [data-cy="status-label"]:visible'
    // )
    //   .contains("Random Test Label")
    //   .should("not.exist");
    // SettingsPage.deactivateWorkflowLabel(TITLES.publishLabel);
    // cy.get(
    //   '[data-cy="active-labels-container"] [data-cy="status-label"]:visible'
    // )
    //   .contains("Publish Approval")
    //   .should("not.exist");
    cy.cleanTestData();
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

Cypress.Commands.add("cleanTestData", () => {
  const labelsToDelete = ["Random Test Label", "Publish Approval"];

  cy.apiRequest({ url: `${INSTANCE_API}/env/labels?showDeleted=true` }).then(
    (response) => {
      response?.data
        ?.filter(
          (label) => !label?.deletedAt && labelsToDelete.includes(label?.name)
        )
        .forEach((label) => {
          cy.apiRequest({
            url: `${INSTANCE_API}/env/labels/${label.ZUID}`,
            method: "DELETE",
          });
        });
    }
  );
});

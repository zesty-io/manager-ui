import { v4 as uuidv4 } from "uuid";
const options = { timeout: 15000 };
const forceClick = { force: true };

const TIMEOUT = {
  timeout: 15000,
};

const CYPRESS_TEST_MODEL = `Cypress Test Model | ${uuidv4()}`;
const CYPRESS_TEST_MODEL_REF_ID = CYPRESS_TEST_MODEL.toLowerCase().replace(
  /\W/g,
  "_"
);

describe("Schema: Models", () => {
  before(() => {
    cy.deleteModels([CYPRESS_TEST_MODEL]);
    cy.waitOn("/v1/content/models*", () => {
      cy.visit("/schema");
    });
  });
  it("Opens creation model with model type selector when triggered from All Models", () => {
    cy.getBySelector("create-model-button-all-models").click(TIMEOUT);
    cy.contains("Select Model Type", TIMEOUT).should("be.visible");
    cy.get("body").type("{esc}");
  });
  it("Opens creation model with model type pre-selected when triggered from Sidebar", () => {
    cy.getBySelector(`create-model-button-sidebar-templateset`).click({
      timeout: 15000,
    });
    cy.contains("Create Single Page Model").should("be.visible");
    cy.get("body").type("{esc}");
    cy.getBySelector(`create-model-button-sidebar-pageset`).click();
    cy.contains("Create Multi Page Model").should("be.visible");
    cy.get("body").type("{esc}");
    cy.getBySelector(`create-model-button-sidebar-dataset`).click();
    cy.contains("Create Dataset Model").should("be.visible");
    cy.get("body").type("{esc}");
  });
  it("Creates model", () => {
    cy.intercept("POST", "**/v1/content/models").as("createModel");
    cy.intercept("GET", "**/v1/content/models").as("getModels");

    cy.getBySelector(`create-model-button-all-models`, options).click(
      forceClick
    );
    cy.contains("Multi Page Model", options).click(forceClick);
    cy.contains("Next", options).click(forceClick);
    cy.contains("Display Name", options).next().type(CYPRESS_TEST_MODEL);
    cy.contains("Reference ID")
      .next()
      .find("input")
      .should("have.value", CYPRESS_TEST_MODEL_REF_ID);

    cy.contains("Model Parent").next().click();

    cy.contains("Model Parent")
      .next()
      .type("Cypress test (Group with visible fields in list)");

    cy.get(".MuiAutocomplete-popper")
      .contains("Cypress test (Group with visible fields in list)", {
        timeout: 60_000,
      })
      .click();

    cy.contains("Description").next().type("Cypress test model description");
    cy.get(".MuiDialog-container").within(() => {
      cy.contains("Create Model").click();
    });
    cy.wait(["@createModel", "@getModels"]);
  });

  it("Renames model", () => {
    cy.intercept("PUT", "**/v1/content/models/**").as("renameModel");
    cy.intercept("GET", "**/v1/content/models").as("getModels");

    cy.getBySelector(`model-header-menu`, options).click(forceClick);
    cy.contains("Rename Model", options).click(forceClick);

    cy.get(".MuiDialog-container", options).within(() => {
      cy.get("label", options).contains("Display Name").next().type(" Updated");
      cy.get("label", options).contains("Reference ID").next().type("_updated");
      cy.contains("Save").click();
    });
    cy.wait(["@renameModel", "@getModels"]);
    cy.contains(`${CYPRESS_TEST_MODEL} Updated`, options).should("exist");
  });
  it("Deletes model", () => {
    cy.getBySelector(`model-header-menu`, options).click(forceClick);
    cy.contains("Delete Model", options).click(forceClick);
    cy.get(".MuiDialog-container", options).within(() => {
      cy.get(".MuiOutlinedInput-root input", options).type(
        `${CYPRESS_TEST_MODEL} Updated`
      );
    });
    cy.contains("Delete Forever", options).click();
  });
  it("Can navigate via breadcrumbs", () => {
    cy.waitOn(
      "/v1/content/models/6-a1a600-k0b6f0/fields?showDeleted=true",
      () => {
        cy.waitOn("/bin/1-6c9618c-r26pt/groups", () => {
          cy.waitOn("/v1/content/models", () => {
            // Homepage
            cy.visit("/schema/6-a1a600-k0b6f0/fields");
          });
        });
      }
    );

    cy.getBySelector("breadcrumbs").find(".MuiBreadcrumbs-li").first().click();
    cy.location("pathname").should("eq", "/schema");
  });
  it("Cannot set its model parent to be itself", () => {
    cy.waitOn(
      "/v1/content/models/6-a1a600-k0b6f0/fields?showDeleted=true",
      () => {
        cy.waitOn("/bin/1-6c9618c-r26pt/groups", () => {
          cy.waitOn("/v1/content/models", () => {
            // Homepage
            cy.visit("/schema/6-a1a600-k0b6f0/fields");
          });
        });
      }
    );

    cy.getBySelector("ModelParentSelector")
      .find("input")
      .type("Schema Fields Cypress Test DO NOT DELETE");
    cy.get(".MuiAutocomplete-noOptions").contains("No options");
  });
  it("Can render a model that has parented itself", () => {
    cy.waitOn(
      "/v1/content/models/6-eca6dfab84-7pglkk/fields?showDeleted=true",
      () => {
        cy.waitOn("/bin/1-6c9618c-r26pt/groups", () => {
          cy.waitOn("/v1/content/models", () => {
            cy.visit("/schema/6-eca6dfab84-7pglkk/fields");
          });
        });
      }
    );

    cy.getBySelector("breadcrumbs")
      .find(".MuiBreadcrumbs-li")
      .eq(1)
      .contains("Model parenting itself");
  });
});

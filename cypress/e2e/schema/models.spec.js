const SEARCH_TERM = `cypress ${Date.now()}`;
describe("Schema: Models", () => {
  before(() => {
    cy.waitOn("/v1/content/models*", () => {
      cy.visit("/schema");
    });
  });
  it("Opens creation model with model type selector when triggered from All Models", () => {
    cy.getBySelector("create-model-button-all-models").click();
    cy.contains("Select Model Type").should("be.visible");
    cy.get("body").type("{esc}");
  });
  it("Opens creation model with model type pre-selected when triggered from Sidebar", () => {
    cy.getBySelector(`create-model-button-sidebar-templateset`).click();
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
    cy.getBySelector(`create-model-button-all-models`).click();
    cy.contains("Multi Page Model").click();
    cy.contains("Next").click();
    cy.contains("Display Name").next().type("Cypress Test Model");
    cy.contains("Reference ID")
      .next()
      .find("input")
      .should("have.value", "cypress_test_model");

    cy.contains("Select Model Parent").next().click();

    cy.contains("Select Model Parent")
      .next()
      .type("A Parent Cypress Schema Do Not Delete");

    cy.get(".MuiAutocomplete-popper")
      .contains("A Parent Cypress Schema Do Not Delete")
      .click();

    cy.contains("Description").next().type("Cypress test model description");
    cy.get(".MuiDialog-container").within(() => {
      cy.contains("Create Model").click();
    });
    cy.intercept("POST", "/models");
    cy.intercept("GET", "/models");
  });

  it("Renames model", () => {
    cy.getBySelector(`model-header-menu`).click();
    cy.contains("Rename Model").click();
    cy.get(".MuiDialog-container").within(() => {
      cy.get("label").contains("Display Name").next().type(" Updated");
      cy.get("label").contains("Reference ID").next().type("_updated");
      cy.contains("Save").click();
    });
    cy.intercept("PUT", "/models");
    cy.intercept("GET", "/models");
    cy.contains("Cypress Test Model Updated").should("exist");
  });
  it("Deletes model", () => {
    cy.getBySelector(`model-header-menu`).click();
    cy.contains("Delete Model").click();
    cy.get(".MuiDialog-container").within(() => {
      cy.get(".MuiOutlinedInput-root").type("Cypress Test Model Updated");
    });
    cy.contains("Delete Forever").click();
  });
  it("Can navigate via breadcrumbs", () => {
    cy.waitOn(
      "/v1/content/models/6-ce80dbfe90-ptjpm6/fields?showDeleted=true",
      () => {
        cy.waitOn("/bin/1-6c9618c-r26pt/groups", () => {
          cy.waitOn("/v1/content/models", () => {
            cy.visit("/schema/6-ce80dbfe90-ptjpm6/fields");
          });
        });
      }
    );

    cy.getBySelector("breadcrumbs").find(".MuiBreadcrumbs-li").first().click();
    cy.location("pathname").should("eq", "/schema");
  });
  it("Cannot set its model parent to be itself", () => {
    cy.waitOn(
      "/v1/content/models/6-ce80dbfe90-ptjpm6/fields?showDeleted=true",
      () => {
        cy.waitOn("/bin/1-6c9618c-r26pt/groups", () => {
          cy.waitOn("/v1/content/models", () => {
            cy.visit("/schema/6-ce80dbfe90-ptjpm6/fields");
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

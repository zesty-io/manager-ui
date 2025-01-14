const SEARCH_TERM = `cypress ${Date.now()}`;
const TIMESTAMP = Date.now();
const TIMEOUT = { timeout: 60_00 };

const LABELS = {
  testModel: "Cypress Test Model",
  testModelNew: "Cypress Test Model New",
  testModelUpdate: "Cypress Test Model Updated",
  testModelDelete: "Cypress Test Model Delete",
  blockTestModel: "Block Test Model",
};
const TEST_DATA = {
  new: {
    label: LABELS.testModelNew,
    description: LABELS.testModelNew,
    listed: true,
    name: LABELS.testModelNew.replace(/ /g, "_").toLowerCase().trim(),
    parentZUID: null,
    type: "pageset",
  },
  delete: {
    label: LABELS.testModelDelete,
    description: LABELS.testModelDelete,
    listed: true,
    name: LABELS.testModelDelete.replace(/ /g, "_").toLowerCase().trim(),
    parentZUID: null,
    type: "pageset",
  },
};

describe("Schema: Models", () => {
  before(() => {
    cy.cleanStatusLabels();
    cy.deleteContentModels([...Object.values(LABELS)]);

    [TEST_DATA.delete, TEST_DATA.new].forEach((model) => {
      cy.createContentModel(model);
    });

    cy.waitOn("/v1/content/models*", () => {
      cy.visit("/schema");
    });
  });
  after(() => {
    cy.deleteContentModels([...Object.values(LABELS)]);
  });

  it("Opens creation model with model type selector when triggered from All Models", () => {
    cy.getBySelector("create-model-button-all-models").click(TIMEOUT);
    cy.contains("Select Model Type").should("be.visible");
    cy.get("body").type("{esc}");
  });
  it("Opens creation model with model type pre-selected when triggered from Sidebar", () => {
    cy.getBySelector(`create-model-button-sidebar-templateset`).click(TIMEOUT);
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
    cy.visit("/schema");

    //make sure to load model parent dropdown
    cy.intercept("**/env/nav").as("getModelParent");

    cy.getBySelector(`create-model-button-all-models`).click(TIMEOUT);
    cy.contains("Multi Page Model").click();
    cy.contains("Next").click();

    cy.wait("@getModelParent");

    cy.contains("Display Name").next().type(LABELS.testModel);
    cy.contains("Reference ID")
      .next()
      .find("input")
      .should(
        "have.value",
        LABELS.testModel.replace(/ /g, "_").toLowerCase().trim()
      );

    cy.contains("Model Parent").next().click();

    cy.contains("Model Parent")
      .next()
      .type("Cypress test (Group with visible fields in list)");

    cy.get(".MuiAutocomplete-popper")
      .contains("Cypress test (Group with visible fields in list)")
      .click({ timeout: 60_000 });

    cy.contains("Description").next().type("Cypress test model description");

    cy.get('[data-cy="create-model-submit-button"]').click();
  });

  it("Renames model", () => {
    openBlockModel(TEST_DATA.new.label);
    cy.getBySelector(`model-header-menu`).click(TIMEOUT);
    cy.contains("Rename Model").click();
    cy.get(".MuiDialog-container").within(() => {
      cy.get("label").contains("Display Name").next().type(" Updated");
      cy.get("label").contains("Reference ID").next().type("_updated");
      cy.contains("Save").click();
    });

    cy.contains(TEST_DATA.new.label).should("exist");
  });
  it("Deletes model", () => {
    openBlockModel(TEST_DATA.delete.label);
    cy.getBySelector(`model-header-menu`).click();
    cy.contains("Delete Model").click();
    cy.get(".MuiDialog-container").within(() => {
      cy.get(".MuiOutlinedInput-root").type(TEST_DATA.delete.label);
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

  it("Can create a block model", () => {
    cy.waitOn("/v1/content/models*", () => {
      cy.visit("/schema");
    });

    cy.getBySelector(`create-model-button-all-models`).click();
    cy.contains("Block Model").click();
    cy.contains("Next").click();
    cy.contains("Display Name").next().type(LABELS.blockTestModel);
    cy.contains("Reference ID")
      .next()
      .find("input")
      .should(
        "have.value",
        LABELS.blockTestModel.replace(/ /g, "_").toLowerCase().trim()
      );

    cy.contains("Description").next().type("Block test model description");
    cy.get(".MuiDialog-container").within(() => {
      cy.contains("Create Model").click();
    });
    cy.contains(`Block Test Model`).should("exist");
  });
});

function openBlockModel(label) {
  cy.visit("/schema");
  cy.get('[data-cy="schema-nav-pageset"] li')
    .contains(label)
    .scrollIntoView()
    .click(TIMEOUT);
}

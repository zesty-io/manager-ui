const NOW = Date.now();

describe("Content item list table", () => {
  let MODEL = null;
  let FIELDS = null;
  let ITEMS = null;
  before(() => {
    cy.task("seed:content", "fixtures/actions.json").then(
      ({ model, fields, items }) => {
        Cypress.env("modelZUID", model?.ZUID);
        Cypress.env("itemZUID", items[0]?.meta?.ZUID);
        MODEL = model;
        ITEMS = items;
        FIELDS = fields;
      }
    );
  });

  it("Resolves internal link zuids", () => {
    cy.waitOn("/search/items*", () => {
      cy.waitOn("/v1/content/models**", () => {
        cy.visit(`/content/${Cypress.env("modelZUID")}`);
      });
    });

    // cy.getBySelector("SingleRelationshipCell")
    cy.get(".MuiDataGrid-row .MuiDataGrid-cell:eq(2)")
      .first()
      .contains(ITEMS?.[0]?.web?.metaTitle, { matchCase: false });
  });

  it("properly removes deleted content items from cache even after page reload", () => {
    cy.waitOn("/search/items*", () => {
      cy.waitOn("/v1/content/models*", () => {
        cy.visit(`/content/${Cypress.env("modelZUID")}/new`);
      });
    });

    cy.intercept("/search/items*").as("searchItems");
    cy.intercept("/v1/content/models*").as("contentModels");

    cy.get("input[name=title]").clear().type(`Delete me ${NOW}`);
    cy.getBySelector("ManualMetaFlow").click();
    cy.getBySelector("metaDescription")
      .find("textarea")
      .first()
      .clear()
      .type(`Delete me ${NOW}`);
    cy.getBySelector("CreateItemSaveButton").click();

    cy.contains("Created Item").should("exist");

    cy.visit(`/content/${Cypress.env("modelZUID")}`);

    cy.get(".MuiDataGrid-cellCheckbox").first().click();
    cy.getBySelector("MultiPageTableDelete").click();
    cy.getBySelector("ConfirmMultiPageTableDelete").click();

    cy.reload();
    cy.wait("@contentModels");

    cy.contains(`Delete me ${NOW}`).should("not.exist");
  });
});

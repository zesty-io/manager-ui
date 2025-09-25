const NOW = Date.now();

describe("Content item list table", () => {
  it("Resolves internal link zuids", () => {
    cy.waitOn("/search/items*", () => {
      cy.waitOn("/v1/content/models*", () => {
        cy.visit("/content/6-a1a600-k0b6f0");
      });
    });

    cy.getBySelector("SingleRelationshipCell", { timeout: 30000 })
      .first()
      .contains(
        "5 Tricks to Teach Your Pitbull: Fun & Easy Tips for You & Your Dog!",
        { timeout: 15_000 }
      );
  });

  it("properly removes deleted content items from cache even after page reload", () => {
    cy.waitOn("/search/items*", () => {
      cy.waitOn("/v1/content/models*", () => {
        cy.visit("/content/6-a1a600-k0b6f0/new");
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

    cy.visit("/content/6-a1a600-k0b6f0");

    cy.get(".MuiDataGrid-cellCheckbox").first().click();
    cy.getBySelector("MultiPageTableDelete").click();
    cy.getBySelector("ConfirmMultiPageTableDelete").click();

    cy.reload();
    cy.wait("@contentModels");

    cy.contains(`Delete me ${NOW}`).should("not.exist");
  });
});

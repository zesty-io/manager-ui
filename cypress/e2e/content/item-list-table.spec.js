const NOW = Date.now();

describe("Content item list table", () => {
  let ITEMS = null;
  before(() => {
    cy.task("seed:content", "fixtures/actions.json").then(
      ({ model, items }) => {
        Cypress.env("modelZUID", model?.ZUID);
        Cypress.env("itemZUID", items[0]?.meta?.ZUID);
        ITEMS = items;
      }
    );
  });

  it("Resolves internal link zuids", () => {
    cy.visit(`/content/${Cypress.env("modelZUID")}`);
    // Content may load from IndexedDB cache — wait for UI instead of network
    cy.getBySelector("listItemTable").should("exist");

    cy.getBySelector("sortByFilter_default").click();
    cy.getBySelector("sort:text").click();
    cy.getBySelector("listItemTable")
      .find('[data-cy="itemListRow"]')
      .first()
      .find('[data-field="text"]')
      .contains(ITEMS?.[1]?.data?.text);
  });

  it("properly removes deleted content items from cache even after page reload", () => {
    cy.visit(`/content/${Cypress.env("modelZUID")}/new`);
    // Content may load from IndexedDB cache — wait for UI instead of network
    cy.getBySelector("CreateItemSaveButton").should("exist");

    cy.intercept("/search/items*").as("searchItems");
    cy.intercept("/v1/content/models*").as("contentModels");
    cy.getBySelector("field:text")
      .find("input")
      .clear()
      .type(`Delete me ${NOW}`);
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

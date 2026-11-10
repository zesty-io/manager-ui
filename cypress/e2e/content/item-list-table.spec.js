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

  it("Shows stripped wysiwyg preview text without executing HTML", () => {
    cy.intercept("GET", "**/content/models/*/items*", (req) => {
      req.continue((res) => {
        if (Array.isArray(res.body?.data)) {
          res.body.data = res.body.data.map((item) => ({
            ...item,
            data: {
              ...item.data,
              wysiwyg_basic:
                '<p>Preview <b>text</b></p><img src="x" onerror="window.__xss = true">',
            },
          }));
        }
      });
    });

    cy.visit(`/content/${Cypress.env("modelZUID")}`);
    cy.getBySelector("listItemTable").should("exist");
    cy.getBySelector("listItemTable")
      .find('[data-cy="itemListRow"]')
      .first()
      .find('[data-field="wysiwyg_basic"]')
      .should("contain.text", "Preview text")
      .and("not.contain.text", "<");
    cy.window().its("__xss").should("not.exist");
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

    // Selection is cleared after a successful delete, so the bulk action
    // bar (and its Delete button) should no longer be present.
    cy.getBySelector("MultiPageTableDelete").should("not.exist");

    cy.reload();
    cy.wait("@contentModels");

    cy.contains(`Delete me ${NOW}`).should("not.exist");
  });
});

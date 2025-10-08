const NOW = Date.now();

describe("Content item list table", () => {
  before(() => {
    cy.task("get:common").then((common) => {
      cy.wrap(common).as("common");
      cy.task("seed:content", {
        fixturePath: "content/default.json",
        overrides: {
          model: {
            label: `content/item-list-table.spec`,
          },
          items: [
            {
              meta: {
                sort: 0,
              },
              data: {
                internal_link: common.items[0].meta.ZUID,
              },
            },
          ],
        },
      }).then((res) => {
        Cypress.env("modelZUID", res?.model?.ZUID);
        Cypress.env("itemZUID", res?.items?.[0]?.meta?.ZUID);
      });
    });
  });

  it("Resolves internal link zuids", function () {
    cy.waitOn("/search/items*", () => {
      cy.waitOn("/v1/content/models*", () => {
        cy.visit(`/content/${Cypress.env("modelZUID")}`);
      });
    });
    cy.getBySelector("SingleRelationshipCell", { timeout: 30000 })
      .first()
      .contains(this.common.items?.[0]?.web?.metaTitle, { timeout: 15_000 });
  });

  it("properly removes deleted content items from cache even after page reload", () => {
    cy.waitOn("/search/items*", () => {
      cy.waitOn("/v1/content/models*", () => {
        cy.visit(`/content/${Cypress.env("modelZUID")}/new`);
      });
    });

    cy.intercept("/search/items*").as("searchItems");
    cy.intercept("/v1/content/models*").as("contentModels");

    cy.get('[data-cy="field:text"] input').clear().type(`Delete me ${NOW}`);
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

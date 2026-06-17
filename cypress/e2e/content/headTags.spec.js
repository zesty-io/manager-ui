// assumes no Head Tags as starting state
describe("Head Tags", () => {
  before(() => {
    cy.task("seed:content", "fixtures/item.json").then(
      ({ model, fields, items }) => {
        Cypress.env("modelZUID", model?.ZUID);
        Cypress.env("itemZUID", items[0]?.meta?.ZUID);
      }
    );
  });
  it("creates and deletes new head tag", () => {
    cy.intercept("GET", "**/v1/content/models").as("getContentModel");
    cy.intercept("GET", "**/v1/web/headtags").as("getHeadtags");
    cy.intercept("GET", "**/v1/env/settings").as("getSettings");
    cy.intercept("GET", "**/v1/web/headers").as("getHeaders");
    cy.intercept("GET", "**/v1/web/views**").as("getViews");
    cy.intercept("GET", "**/v1/web/scripts").as("getScripts");
    cy.intercept("GET", "**/v1/web/stylesheets").as("getStylesheets");

    cy.visit(
      `/content/${Cypress.env("modelZUID")}/${Cypress.env("itemZUID")}/head`
    );

    cy.wait([
      "@getContentModel",
      "@getHeadtags",
      "@getSettings",
      "@getHeaders",
      "@getViews",
      "@getScripts",
      "@getStylesheets",
    ]);

    cy.contains("Create Head Tag").should("exist").should("be.enabled").click();

    cy.getBySelector("newTagCard")
      .last()
      .find(".MuiSelect-select")
      .click({ force: true });

    cy.get("[role=presentation]")
      .last()
      .find('[data-value="script"]')
      .click({ force: true });

    cy.getBySelector("newTagCard")
      .last()
      .contains("Value")
      .parent()
      .find("input")
      .clear()
      .type("Changing the value of content");

    cy.getBySelector("newTagCard")
      .last()
      .contains("Attribute")
      .parent()
      .find("input")
      .clear()
      .type("newAttr");

    // Saves Head Tag
    cy.getBySelector("newTagCard").last().find("#SaveItemButton").click();
    cy.contains("New head tag created");

    // Deletes Head Tag
    cy.getBySelector("tagCard")
      .last()
      .contains("Delete Head Tag")
      .invoke("show")
      .click();

    // TODO: There is a bug in the application that automatically adds a new
    // draft head tag after saving first one
    // cy.get("[data-cy=tagCard]").should("not.exist");
  });
});

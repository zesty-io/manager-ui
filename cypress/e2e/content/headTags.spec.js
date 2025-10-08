// assumes no Head Tags as starting state
describe("Head Tags", () => {
  before(() => {
    cy.task("seed:content", {
      fixturePath: "content/default.json",
      overrides: {
        model: {
          label: "content/headTags.spec",
        },
      },
    }).then(({ model, items }) => {
      Cypress.env("modelZUID", model?.ZUID);
      Cypress.env("itemZUID", items?.[0]?.meta?.ZUID);
    });
  });

  it("creates and deletes new head tag", () => {
    cy.waitOn("/v1/content/models*", () => {
      cy.visit(
        `/content/${Cypress.env("modelZUID")}/${Cypress.env("itemZUID")}/head`
      );
    });

    cy.contains("Create Head Tag", { timeout: 10000 }).click();

    cy.get("[data-cy=newTagCard]")
      .last()
      .find(".MuiSelect-select")
      .click({ force: true });

    cy.get("[role=presentation]")
      .last()
      .find('[data-value="script"]')
      .click({ force: true });

    //cy.get("[data-cy=tagCard]:last-child")
    cy.get("[data-cy=newTagCard]")
      .last()
      .contains("Value")
      .parent()
      .find("input")
      .clear()
      .type("Changing the value of content");

    cy.get("[data-cy=newTagCard]")
      .last()
      .contains("Attribute")
      .parent()
      .find("input")
      .clear()
      .type("newAttr");

    // Saves Head Tag
    cy.get("[data-cy=newTagCard]").last().find("#SaveItemButton").click();
    cy.contains("New head tag created");

    // Deletes Head Tag
    cy.get("[data-cy=tagCard]")
      .last()
      .contains("Delete Head Tag")
      .invoke("show")
      .click();

    // TODO: There is a bug in the application that automatically adds a new
    // draft head tag after saving first one
    // cy.get("[data-cy=tagCard]").should("not.exist");
  });
});

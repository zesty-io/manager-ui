// assumes no Head Tags as starting state
describe("Head Tags", () => {
  it("creates and deletes new head tag", () => {
    cy.waitOn("/v1/content/models*", () => {
      cy.visit("/content/6-556370-8sh47g/7-b939a4-457q19/head");
    });

    cy.contains("Create Head Tag").click();

    cy.get("[data-cy=tagCard]").last().find(".Select button").click();

    cy.get("[data-cy=tagCard]").last().find('[data-value="script"]').click();

    //cy.get("[data-cy=tagCard]:last-child")
    cy.get("[data-cy=tagCard]")
      .last()
      .contains("Value")
      .parent()
      .find("input")
      .clear()
      .type("Changing the value of content");

    cy.get("[data-cy=tagCard]")
      .last()
      .contains("Attribute")
      .parent()
      .find("input")
      .clear()
      .type("newAttr");

    // Saves Head Tag
    cy.get("[data-cy=tagCard]").last().find("#SaveItemButton").click();
    cy.contains("New head tag created");

    // Deletes Head Tag
    cy.get("[data-cy=tagCard]")
      .last()
      .contains("Delete Tag")
      .invoke("show")
      .click();

    // TODO: There is a bug in the application that automatically adds a new
    // draft head tag after saving first one
    // cy.get("[data-cy=tagCard]").should("not.exist");
  });
});

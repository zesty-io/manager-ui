// assumes no Head Tags as starting state
describe("Head Tags", () => {
  before(() => {
    //initial login to set the cookie
    cy.login();
    cy.goHome();
  });
  it("creates and deletes new head tag", () => {
    cy.get("#MainNavigation")
      .contains("All Field Types")
      .click();

    cy.get("[data-cy=head]").click();

    cy.contains("Create Head Tag").click();

    cy.get("[data-cy=tagCard]")
      .last()
      .find(".Select button")
      .click();

    cy.get("[data-cy=tagCard]")
      .last()
      .find('[data-value="script"]')
      .click();

    cy.get("[data-cy=tagCard]")
      .last()
      .contains("Value")
      .find("input")
      .clear()
      .type("Changing the value of content");

    cy.get("[data-cy=tagCard]")
      .last()
      .contains("Attribute")
      .find("input")
      .clear()
      .type("newAttr");

    // Saves Head Tag
    cy.get("[data-cy=tagCard]")
      .last()
      .find("#SaveItemButton")
      .click();
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

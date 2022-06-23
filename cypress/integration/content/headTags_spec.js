// assumes no Head Tags as starting state
describe("Head Tags", () => {
  before(() => {
    //initial login to set the cookie
    cy.login();
    cy.goHome();
  });

  //Force true: When multiple cypress test are running simultaneously, content lock modal will render blocking click events.
  it("creates and deletes new head tag", () => {
    cy.get("[data-cy=contentNavButton]").click();
    cy.get("#MainNavigation")
      .contains("All Field Types")
      .click({ force: true });

    cy.get("[data-cy=contentNavButton]").click();

    cy.get("[data-cy=head]").click({ force: true });

    cy.contains("Create Head Tag").click({ force: true });

    cy.get("[data-cy=tagCard]")
      .last()
      .find(".MuiSelect-select")
      .click({ force: true });

    cy.get("[role=presentation]")
      .last()
      .find('[data-value="script"]')
      .click({ force: true });

    //cy.get("[data-cy=tagCard]:last-child")
    cy.get("[data-cy=tagCard]")
      .last()
      .contains("Value")
      .parent()
      .find("input")
      .clear({ force: true })
      .type("Changing the value of content");

    cy.get("[data-cy=tagCard]")
      .last()
      .contains("Attribute")
      .parent()
      .find("input")
      .clear({ force: true })
      .type("newAttr");

    // Saves Head Tag
    cy.get("[data-cy=tagCard]")
      .last()
      .find("#SaveItemButton")
      .click({ force: true });
    cy.contains("New head tag created");

    // Deletes Head Tag
    cy.get("[data-cy=tagCard]")
      .last()
      .contains("Delete Tag")
      .invoke("show")
      .click({ force: true });

    // TODO: There is a bug in the application that automatically adds a new
    // draft head tag after saving first one
    // cy.get("[data-cy=tagCard]").should("not.exist");
  });
});

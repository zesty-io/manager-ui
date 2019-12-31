describe("Head Tags", () => {
  before(() => {
    //initial login to set the cookie
    cy.login();
    cy.goHome();
  });
  it("Opens item head tab", () => {
    cy.get("#MainNavigation")
      .contains("All Field Types")
      .click({ force: true });
    cy.get("[data-cy=head]").should("exist");
    cy.get("[data-cy=head]").click();
  });
  it("Creates a new headtag", () => {
    cy.contains("New head tag").click();
    cy.get("[data-cy=tagCard]").should("exist");
  });
  it("Changes the tag type", () => {
    cy.get("[data-cy=tagCard]")
      .find(".Select")
      .click();
    cy.get('[data-value="script"]').click();
  });
  it("Changes the value of an attribute", () => {
    cy.contains("Value")
      .find("input")
      .click()
      .clear()
      .type("Changing the value of content");
  });
  it("Changes the attribute name", () => {
    cy.contains("Attribute")
      .find("input")
      .click()
      .clear()
      .type("src");
  });

  it("Deletes a head tag", () => {
    cy.contains("Delete Tag").click({ force: true });
    cy.get("[data-cy=tagCard]").should("not.exist");
  });
});

describe("Actions in content editor", () => {
  before(() => {
    //initial login to set the cookie
    cy.login();
    cy.goHome();
  });

  it("Fails to save without filling all required fields", () => {
    cy.get("#MainNavigation")
      .contains("Required Fields")
      .click({ force: true });
    cy.contains("Required Text")
      .get("input")
      .first()
      .type("testing");
    cy.get("#SaveItemButton").click();
    cy.contains("You are missing data in required textarea").should("exist");
  });
});

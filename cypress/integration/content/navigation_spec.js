describe("Navigation through content editor", () => {
  before(() => {
    //initial login to set the cookie
    cy.login();
    cy.goHome();
  });

  it("Opens homepage item", () => {
    cy.get("#MainNavigation", { timeout: 5000 })
      .contains("Page")
      .click({ force: true });
    cy.contains("Page Title").should("exist");
    cy.contains("Page Content").should("exist");
  });
  it("Opens the reorder nav modal", () => {
    cy.get("#ReorderNavButton").click();
    cy.get("#CloseReorderModal").should("exist");
    cy.get("#CloseReorderModal").click();
  });
  it("Creates a new item from the menu", () => {
    cy.get(".CreateItemDropdown").click();
    cy.get('[data-value="link"]').click();
    cy.get("#CreateLinkButton").should("exist");
  });
});

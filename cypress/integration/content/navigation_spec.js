describe("Navigation through content editor", () => {
  before(() => {
    //initial login to set the cookie
    cy.login();
    cy.goHome();
  });

  it("Opens homepage item", () => {
    cy.get("#MainNavigation").contains("Page").click();
    cy.contains("Page Title").should("exist");
    cy.contains("Page Content").should("exist");
  });
  // TODO: Modal close button is not targetable
  it.skip("Opens the reorder nav modal", () => {
    cy.get("#ReorderNavButton").click();
    cy.get("#CloseReorderModal").should("exist");
    cy.get("#CloseReorderModal").click();
  });
  it("Creates a new item from the menu", () => {
    cy.get(".CreateItemDropdown").click();
    cy.get('[data-value="link"]').click();
    cy.get("#CreateLinkButton").should("exist");
  });
  it("Open and Close Global Account", () => {
    cy.get("[data-cy=globalAccountAvatar]").click();
    cy.get("menu").should("exist");
    cy.get("[data-cy=globalAccountAvatar]").click();
    cy.get("[data-cy=globalAccountAvatar] menu").should("not.exist");
  });
});

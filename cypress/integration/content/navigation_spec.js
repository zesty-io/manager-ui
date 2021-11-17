describe("Navigation through content editor", () => {
  before(() => {
    //initial login to set the cookie
    cy.login();
    cy.goHome();
  });

  // it("Opens homepage item", () => {
  //   cy.get("#MainNavigation").contains("Page").click();
  //   cy.contains("Page Title").should("exist");
  //   cy.contains("Page Content").should("exist");
  // });
  // // TODO: Modal close button is not targetable
  // it.skip("Opens the reorder nav modal", () => {
  //   cy.get("#ReorderNavButton").click();
  //   cy.get("#CloseReorderModal").should("exist");
  //   cy.get("#CloseReorderModal").click();
  // });
  // it("Creates a new item from the menu", () => {
  //   cy.get(".CreateItemDropdown").click();
  //   cy.get('[data-value="link"]').click();
  //   cy.get("#CreateLinkButton").should("exist");
  // });
  // it("Check Content Nav Collapse functionality ", () => {
  //   cy.get("[data-cy=contentNavButton]").contains(" Collapse").should("exist");
  //   cy.get("[data-cy=contentNavButton]").click();
  //   cy.get("[data-cy=contentNavButton]")
  //     .contains(" Collapse")
  //     .should("not.exist");
  // });
  it("Check Content Nav Collapse persist when clicking on other apps ", () => {
    cy.get("[data-cy=contentNavButton]").then((btn) => {
      if (btn.find("span").length > 0) {
        cy.get("[data-cy=contentNavButton]").click();
        cy.visit("/code");
        cy.visit("/content");
        cy.get("[data-cy=contentNavButton]")
          .contains(" Collapse")
          .should("not.exist");
      }
    });
  });
});

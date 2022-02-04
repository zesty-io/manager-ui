describe("Navigation through content editor", () => {
  before(() => {
    //initial login to set the cookie
    cy.login();
    cy.goHome();
  });

  it("Opens homepage item", () => {
    cy.get("#MainNavigation").then((content) => {
      if (content.is(":visible")) {
        cy.get("[data-cy=contentNavButton]").click();
        cy.get("#MainNavigation").contains("Page").click();
        cy.contains("Page Title").should("exist");
        cy.contains("Page Content").should("exist");
      } else {
        cy.get("#MainNavigation").contains("Page").click();
        cy.contains("Page Title").should("exist");
        cy.contains("Page Content").should("exist");
      }
    });
  });
  // TODO: Modal close button is not targetable
  it.skip("Opens the reorder nav modal", () => {
    cy.get("#ReorderNavButton").click();
    cy.get("#CloseReorderModal").should("exist");
    cy.get("#CloseReorderModal").click();
  });

  it("Creates a new item from the menu", () => {
    cy.get("#MainNavigation").then((content) => {
      if (!content.is(":visible")) {
        cy.get("[data-cy=contentNavButton]").click();
        cy.get(".CreateItemDropdown").click();
        cy.get('[data-value="link"]').click();
        cy.get("#CreateLinkButton").should("exist");
      } else {
        cy.get(".CreateItemDropdown").click();
        cy.get('[data-value="link"]').click();
        cy.get("#CreateLinkButton").should("exist");
      }
    });
  });

  it("Check Content Nav Collapsed functionality", () => {
    cy.get("[data-cy=contentNavButton]")
      .siblings("div")
      .then((btn) => {
        if (btn.is(":visible")) {
          cy.get("[data-cy=contentNavButton]")
            .siblings("div")
            .should("be.visible");
        } else {
          cy.get("[data-cy=contentNavButton]")
            .siblings("div")
            .should("not.be.visible");
        }
      });
  });
  it("Check Content Nav Collapse persist when clicking on other Applications ", () => {
    cy.get("[data-cy=contentNavButton]")
      .siblings("div")
      .then((btn) => {
        if (btn.is(":visible")) {
          cy.get("[data-cy=contentNavButton]")
            .siblings("div")
            .should("be.visible");

          cy.visit("/code");
          cy.visit("/content/6-556370-8sh47g/7-b939a4-457q19");
          cy.get("[data-cy=contentNavButton]")
            .siblings("div")
            .should("be.visible");
        } else {
          cy.visit("/code");
          cy.visit("/content/6-556370-8sh47g/7-b939a4-457q19");
          cy.get("[data-cy=contentNavButton]")
            .siblings("div")
            .should("not.be.visible");
        }
      });
  });
  it("Open and Close Global Account", () => {
    cy.get("[data-cy=globalAccountAvatar]").click();
    cy.get("menu").should("exist");
    cy.get("[data-cy=globalAccountAvatar]").click();
    cy.get("[data-cy=globalAccountAvatar] menu").should("not.exist");
  });
});

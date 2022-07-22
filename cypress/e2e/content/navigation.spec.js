describe("Navigation through content editor", () => {
  before(() => {
    cy.waitOn("/v1/env/nav", () => {
      cy.visit("/");
    });
  });

  it("Opens homepage item", () => {
    cy.get("#MainNavigation li a").contains("Homepage").click();
    cy.get("#12-0c3934-8dz720").should("exist");
  });

  it("Opens the reorder nav modal", () => {
    cy.get("#ReorderNavButton").click();
    cy.get(".ModalAligner--ptdt- article main ul.sort--taGo4").should("exist");
    cy.get(".ModalAligner--ptdt-.Open--M5j6S button.Close--kVpCO").click();
  });

  it("Creates a new item from the menu", () => {
    cy.get("#MainNavigation").then((content) => {
      if (!content.is(":visible")) {
        cy.get("[data-cy=contentNavButton]").click();
        cy.get(".CreateItemDropdown").find(".MuiSelect-select").click();
        cy.get("[role=presentation]").find('[data-value="link"]').click();
        cy.get("#CreateLinkButton").should("exist");
      } else {
        cy.get(".CreateItemDropdown").find(".MuiSelect-select").click();
        cy.get("[role=presentation]").find('[data-value="link"]').click();
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

          cy.waitOn("/v1/content/models*", () => {
            cy.visit("/content/6-556370-8sh47g/7-b939a4-457q19");
          });

          cy.get("[data-cy=contentNavButton]")
            .siblings("div")
            .should("be.visible");
        } else {
          cy.visit("/code");

          cy.waitOn("/v1/content/models*", () => {
            cy.visit("/content/6-556370-8sh47g/7-b939a4-457q19");
          });

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

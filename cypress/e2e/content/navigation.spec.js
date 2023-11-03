describe("Navigation through content editor", () => {
  before(() => {
    cy.waitOn("/v1/env/nav", () => {
      cy.visit("/content");
    });
  });

  it("Opens homepage item", () => {
    cy.getBySelector("pages_nav")
      .find("li p[aria-label='Homepage']")
      .should("exist")
      .click();
    cy.get("#12-0c3934-8dz720").should("exist");
  });

  it("Opens the reorder nav modal", () => {
    cy.getBySelector("reorder_nav").should("exist").click();
    cy.get(".ModalAligner--ptdt- article main ul.sort--taGo4").should("exist");
    cy.get(".ModalAligner--ptdt-.Open--M5j6S button.Close--kVpCO").click();
  });

  it("Creates a new item from the menu", () => {
    cy.getBySelector("create_new_content_item").should("exist").click();
    cy.getBySelector("create_new_content_item_dialog").should("exist");
    cy.getBySelector("create_new_content_item_input")
      .find("input")
      .type("cypress");
    cy.get(".MuiAutocomplete-listbox .MuiAutocomplete-option")
      .first()
      .should("exist")
      .click();
    cy.getBySelector("create_new_content_item_btn").click();
    cy.location("pathname").should("eq", "/content/6-0c960c-d1n0kx/new");
  });

  // To be re-added on another release
  it.skip("Check Content Nav Collapsed functionality", () => {
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

  // To be re-added on another release
  it.skip("Check Content Nav Collapse persist when clicking on other Applications ", () => {
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

  // Skipped for now since Global Account has been removed from the top tab bar
  it.skip("Open and Close Global Account", () => {
    cy.get("[data-cy=globalAccountAvatar]").click();
    cy.get("menu").should("exist");
    cy.get("[data-cy=globalAccountAvatar]").click();
    cy.get("[data-cy=globalAccountAvatar] menu").should("not.exist");
  });
});

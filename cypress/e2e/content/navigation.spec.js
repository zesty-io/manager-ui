describe("Navigation through content editor", () => {
  let ITEM;
  before(() => {
    cy.task("seed:content", "fixtures/navigation.json").then(
      ({ model, items }) => {
        Cypress.env("modelZUID", model?.ZUID);
        Cypress.env("itemZUID", items[0]?.meta?.ZUID);
        ITEM = items?.[0];
      }
    );

    cy.waitOn("/v1/env/nav", () => {
      cy.visit("/content");
    });
  });

  it("Opens Content Item", () => {
    cy.waitOn("**/content/models/**", () => {
      cy.getBySelector("pages_nav")
        .find("li")
        .contains(ITEM?.web?.metaTitle)
        .click();
    });

    cy.get('[data-cy="field:text"]').should("exist");
  });

  it("Opens the reorder nav modal", () => {
    cy.getBySelector("reorder_nav").should("exist").click();
    cy.getBySelector("reorder_nav_modal").should("exist");
    cy.getBySelector("close_reorder_nav").click();
  });

  it("Should not navigate to the create item page if no model is selected", () => {
    cy.getBySelector("create_new_content_item").should("exist").click();
    cy.getBySelector("create_new_content_item_btn").click({ force: true });
    cy.contains("Please select a Model to proceed.").should("exist");
    cy.getBySelector("discard_new_content_item_btn")
      .should("exist")
      .click({ force: true });
  });

  it("Creates a new item from the menu", () => {
    cy.getBySelector("create_new_content_item").should("exist").click();
    cy.getBySelector("create_new_content_item_dialog").should("exist");
    cy.getBySelector("create_new_content_item_input")
      .find("input")
      .type("group with visible");
    cy.get(".MuiAutocomplete-listbox .MuiAutocomplete-option")
      .first()
      .should("exist")
      .click();

    cy.getBySelector("create_new_content_item_btn").click();
    cy.location("pathname").should("eq", "/content/6-0c960c-d1n0kx/new");
  });

  it("Check Content Nav Collapsed functionality", () => {
    cy.waitOn("/v1/env/nav", () => {
      cy.visit("/content/6-bac9f3bcbe-b7s4bv/7-f88ad8bcc3-1z83ht");
    });
    // Verify the child items are visible
    cy.getBySelector("pages_nav")
      .find("li")
      .contains(ITEM?.web?.metaTitle, { matchCase: false })
      .scrollIntoView()
      .should("be.visible")
      .click({ force: true });

    cy.get('[id="pages_nav-/content/6-bac9f3bcbe-b7s4bv/7-f88ad8bcc3-1z83ht"]')
      .should("be.visible")
      .click({ force: true });

    // Collapse the E2E item
    cy.get('[id="pages_nav-/content/6-bac9f3bcbe-b7s4bv/7-f88ad8bcc3-1z83ht"]')
      .scrollIntoView()
      .within(() => {
        cy.get(".MuiTreeItem-content .MuiTreeItem-iconContainer")
          .first()
          .should("be.visible")
          .click({ force: true });

        // Verify the child items are no longer visible
        cy.get("li")
          .contains(ITEM?.web?.metaTitle, { matchCase: false })
          .should("not.be.visible");
      });
  });

  it("Check Content Nav Collapse persist when clicking on other Applications ", () => {
    // expand the E2E item
    cy.get('[id="pages_nav-/content/6-bac9f3bcbe-b7s4bv/7-f88ad8bcc3-1z83ht"]')
      .scrollIntoView()
      .within(() => {
        cy.get(".MuiTreeItem-content .MuiTreeItem-iconContainer")
          .first()
          .should("be.visible")
          .click({ force: true });
      });

    //navigate to other app
    cy.getBySelector("CodeApp").click();

    //go back to content app
    cy.waitOn("/v1/content/models*", () => {
      cy.getBySelector("ContentApp").click();
    });

    // verify that child item is visible
    cy.get('[id="pages_nav-/content/6-bac9f3bcbe-b7s4bv/7-f88ad8bcc3-1z83ht"]')
      .scrollIntoView()
      .within(() => {
        cy.get("li")
          .contains(ITEM?.web?.metaTitle, { matchCase: false })
          .scrollIntoView()
          .should("be.visible");
      });
  });

  // Skipped for now since Global Account has been removed from the top tab bar
  it.skip("Open and Close Global Account", () => {
    cy.get("[data-cy=globalAccountAvatar]").click();
    cy.get("menu").should("exist");
    cy.get("[data-cy=globalAccountAvatar]").click();
    cy.get("[data-cy=globalAccountAvatar] menu").should("not.exist");
  });

  it("can navigate content item files in the sidebar", () => {
    cy.contains("All Field Types").click();
    cy.location("pathname").should(
      "eq",
      "/content/6-556370-8sh47g/7-b939a4-457q19"
    );
  });

  it("should be able to directly create a new content item from the sidebar item", () => {
    cy.contains(".MuiTreeItem-root", "Articles")
      .find("[data-cy='tree-item-add-new-content']")
      .click({ force: true });
    cy.location("pathname").should("eq", "/content/6-a8bae2f4d7-rffln5/new");
  });
});

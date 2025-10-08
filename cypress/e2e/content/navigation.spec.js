describe("Navigation through content editor", () => {
  let CHILD_NAV;
  before(() => {
    cy.task("seed:content", {
      fixturePath: "content/default.json",
      overrides: {
        model: {
          label: "content/navigation.spec",
          type: "templateset",
        },
      },
    }).then(({ model, items }) => {
      Cypress.env("modelZUID", model?.ZUID);
      Cypress.env("itemZUID", items?.[0]?.meta?.ZUID);
      cy.wrap(model).as("model");

      cy.task("seed:content", {
        fixturePath: "content/default.json",
        overrides: {
          model: {
            label: "navigation-child",
            type: "pageset",
          },
          items: [
            {
              meta: {
                sort: 0,
              },
              web: {
                parentZUID: items?.[0]?.meta?.ZUID,
              },
            },
          ],
        },
      }).then(function ({ model, items }) {
        CHILD_NAV = {
          model,
          items,
        };
      });
    });
    cy.waitOn("/v1/env/nav", () => {
      cy.visit("/content");
    });
  });

  it("Opens a page item", function () {
    cy.getBySelector("pages_nav")
      .find(`li p[aria-label='${this.model.label}']`)
      .should("exist")
      .click({ force: true });
    cy.get('[data-cy="field:text"]', { timeout: 15000 }).should("exist");
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
      // .type("group with visible");
      .type("content/navigation.spec");
    cy.get(".MuiAutocomplete-listbox .MuiAutocomplete-option")
      .first()
      .should("exist")
      .click();
    cy.getBySelector("create_new_content_item_btn").click();
    cy.location("pathname").should(
      "eq",
      `/content/${Cypress.env("modelZUID")}/${Cypress.env("itemZUID")}`
    );
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

  it("can navigate content item files in the sidebar", function () {
    cy.contains(CHILD_NAV?.model?.label, { matchCase: false }).click({
      force: true,
    });
    cy.contains("Don't Save", { matchCase: false }).click({
      force: true,
    });
    cy.location("pathname").should("eq", `/content/${CHILD_NAV?.model?.ZUID}`);
  });

  it("should be able to directly create a new content item from the sidebar item", () => {
    cy.reload();
    cy.contains(".MuiTreeItem-root", CHILD_NAV?.model?.label)
      .find("[data-cy='tree-item-add-new-content']")
      .click({ force: true });
    cy.location("pathname").should(
      "eq",
      `/content/${CHILD_NAV?.model?.ZUID}/new`
    );
  });
});

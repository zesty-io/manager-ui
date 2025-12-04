const today = Date.now();

describe("Content Meta", () => {
  before(() => {
    // Create two content items to serve as parent and child
    cy.task("seed:content", "fixtures/content.json").then(
      ({ model, fields, items }) => {
        MODEL["parent"] = model;
        FIELDS["parent"] = fields;
        ITEMS["parent"] = items;
        Cypress.env("ParentModelZUID", model?.ZUID);
        Cypress.env("ParentItemZUID", items[0]?.meta?.ZUID);
      }
    );
    cy.task("seed:content", "fixtures/meta.json").then(
      ({ model, fields, items }) => {
        MODEL["child"] = model;
        FIELDS["child"] = fields;
        ITEMS["child"] = items;
        Cypress.env("ChildModelZUID", model?.ZUID);
        Cypress.env("ChildItemZUID", items[0]?.meta?.ZUID);
      }
    );
  });

  it("Modifies and saves Meta fields", () => {
    cy.waitOn("/v1/content/models**", () => {
      cy.waitOn("/v1/search/items*", () => {
        cy.visit(
          `/content/${Cypress.env("ChildModelZUID")}/${Cypress.env(
            "ChildItemZUID"
          )}/meta`
        );
      });
    });

    cy.get("#parentZUID").should("exist");
    cy.get("[data-cy=metaLinkText]").should("exist");
    cy.get("[data-cy=metaTitle]").should("exist");
    cy.get("[data-cy=metaDescription]").should("exist");
    cy.get("[data-cy=metaKeywords]").should("exist");
    cy.get("[data-cy=sitemapPriority]").should("exist");
    cy.get("[data-cy=canonicalTag]").should("exist");

    cy.get("#parentZUID input").type(Cypress.env("ParentItemZUID"));
    cy.get("ul.MuiAutocomplete-listbox").find("li").eq(0).click();
    // select another parent, but switch it back to root level

    cy.get("[data-cy=metaLinkText]")
      .find("input")
      .click()
      .clear()
      .type("All Field Types");

    cy.get("[data-cy=itemRoute]")
      .find("input")
      .click()
      .clear()
      .type("new path part");

    cy.get("[data-cy=metaTitle]")
      .find("input")
      .click()
      .clear()
      .type("new Meta Title");

    cy.get("[data-cy=metaDescription]")
      .find("textarea:eq(0)")
      .click()
      .clear()
      .type("new Meta Description");

    cy.get("[data-cy=metaKeywords]")
      .find("textarea:eq(0)")
      .click()
      .clear()
      .type("key, words, here");

    cy.get("[data-cy=sitemapPriority] >  div").click();
    cy.get('[data-option-index="0"]').click();

    cy.get("[data-cy=canonicalTag] >  div").click();
    cy.get('[data-option-index="1"]').last().click();

    cy.get("[data-cy=canonicalTag] >  div").click();
    cy.get('[data-option-index="0"]').last().click();

    cy.get("#parentZUID input").clear().wait(500).type("e2e");
    cy.get("ul.MuiAutocomplete-listbox").find("li").eq(0).click();

    cy.get("#SaveItemButton").click();
    cy.get("[data-cy=toast]").contains("Item Saved", {
      matchCase: false,
    });
  });

  it("Does not validate meta description for dataset items", () => {
    cy.waitOn("/v1/content/models*", () => {
      cy.waitOn("/v1/env/nav", () => {
        cy.waitOn("/v1/search/items*", () => {
          cy.visit(`/content/${Cypress.env("ChildModelZUID")}/new`);
        });
      });
    });

    cy.get('[data-cy="field:text"]', { timeout: 5000 })
      .find("input")
      .type(today);
    cy.wait(500); // wait for debounced input to settle
    cy.getBySelector("CreateItemSaveButton").click();
    cy.get("[data-cy=toast]").contains("Created Item");
  });

  it("Auto applies page parent when creating an item", () => {
    cy.waitOn("/v1/content/models*", () => {
      cy.waitOn("/v1/env/nav", () => {
        cy.waitOn("/v1/search/items*", () => {
          cy.visit(`/content/${Cypress.env("ChildModelZUID")}/new`);
        });
      });
    });

    cy.iframe("#wysiwyg_basic_ifr")
      .click()
      .type(`{selectall}{backspace}meta description`);
    cy.get('[data-cy="field:text"]')
      .find("input")
      .clear()
      .wait(500)
      .type(`meta title ${today}`);

    cy.waitOn("/v1/content/models*", () => {
      cy.getBySelector("CreateItemSaveButton").wait(500).click();
    });

    cy.get('.MuiTabs-root:eq(0) [role="tablist"]').find("button").eq(1).click();

    cy.contains("/e2e-", { matchCase: false }).should("exist");
  });

  it("Supports a dedicated Twitter title, description and image", () => {
    cy.waitOn("/v1/content/models*", () => {
      cy.waitOn("/v1/env/nav", () => {
        cy.waitOn("/v1/search/items*", () => {
          cy.visit(
            `/content/${Cypress.env("ChildModelZUID")}/${Cypress.env(
              "ChildItemZUID"
            )}/meta`
          );
        });
      });
    });

    const title = `Twitter title ${today}`;
    const description = `Twitter description ${today}`;

    cy.getBySelector("TCTitle").find("input").type(`{selectAll}{del}${title}`);
    cy.getBySelector("TCDescription")
      .find("textarea")
      .first()
      .type(`{selectAll}{del}${description}`);
    cy.getBySelector("SocialMediaPreviewTwitter").click();

    cy.getBySelector("TwitterCardTitle").contains(title);
    cy.getBySelector("TwitterCardDescription").contains(description);
    cy.getBySelector("TwitterCardImage").should(
      "have.attr",
      "src",
      "https://wave-trial.getbynder.com/m/45b0d3ba0b271504/original/kim-cruickshanks-176374.jpg"
    );
  });
});

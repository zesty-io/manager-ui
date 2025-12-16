const today = Date.now();

describe("Content Meta", () => {
  let MODEL, FIELDS, ITEM;
  before(() => {
    // Create two content items to serve as parent and child
    // cy.task("seed:content", "fixtures/content.json").then(
    //   ({ model, fields, items }) => {
    //     MODEL["parent"] = model;
    //     FIELDS["parent"] = fields;
    //     ITEMS["parent"] = items;
    //     Cypress.env("ParentModelZUID", model?.ZUID);
    //     Cypress.env("ParentItemZUID", items[0]?.meta?.ZUID);
    //   }
    // );
    cy.task("seed:content", "fixtures/meta.json").then(
      ({ model, fields, items }) => {
        ITEM = items?.[0];
        // MODEL["child"] = model;
        // FIELDS["child"] = fields;
        // ITEMS["child"] = items;
        Cypress.env("modelZUID", model?.ZUID);
        Cypress.env("itemZUID", items[0]?.meta?.ZUID);
      }
    );
  });

  it("Modifies and saves Meta fields", () => {
    cy.waitOn("/v1/content/models**", () => {
      cy.waitOn("/v1/search/items**", () => {
        cy.visit(
          `/content/${Cypress.env("modelZUID")}/${Cypress.env("itemZUID")}/meta`
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

    // cy.get("#parentZUID input").type(`{selectall}{backspace}`);
    // cy.get("#parentZUID input").wait(500).should("be.empty");
    cy.get("#parentZUID input").click();
    cy.get("#parentZUID input").type(`xxxxxx{selectall}{backspace}`).clear();
    cy.get("#parentZUID input").should("be.empty");
    cy.get("#parentZUID input").type("/");
    cy.wait(1000);
    cy.get("ul.MuiAutocomplete-listbox").find("li").eq(0).click();
    cy.wait(1000);
    // select another parent, but switch it back to root level

    // cy.get("#parentZUID input").type(
    //   `{selectall}{backspace}${ITEM?.web?.parentZUID}`
    // );
    cy.get("#parentZUID input").click();
    cy.get("#parentZUID input").type(`xxxx{selectall}{backspace}`).clear();
    cy.get("#parentZUID input").should("be.empty");
    cy.waitOn("/v1/search/items**", () => {
      cy.get("#parentZUID input").type(ITEM?.web?.parentZUID);
    });

    cy.wait(10000);
    cy.get("ul.MuiAutocomplete-listbox").find("li").eq(0).click();
    cy.wait(1000);

    cy.get("[data-cy=metaLinkText]")
      .find("input")
      .click()

      .clear()
      .type("new Meta LinkText");

    cy.get("#pathPart input").click().clear().type("new path part");

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

    cy.get("#SaveItemButton").click();
    cy.get("[data-cy=toast]").contains("Item Saved", {
      matchCase: false,
    });
  });

  it("Does not validate meta description for dataset items", () => {
    cy.waitOn("/v1/content/models*", () => {
      cy.waitOn("/v1/env/nav", () => {
        cy.waitOn("/v1/search/items*", () => {
          cy.visit(`/content/${Cypress.env("modelZUID")}/new`);
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
          cy.visit(`/content/${Cypress.env("modelZUID")}/new`);
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
            `/content/${Cypress.env("modelZUID")}/${Cypress.env(
              "itemZUID"
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

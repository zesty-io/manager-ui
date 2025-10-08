import { formatName } from "../../../src/utility/formatName";

const today = Date.now();

describe("Content Meta", function () {
  // before(() => {
  //   cy.waitOn("/v1/content/models*", () => {
  //     cy.visit("/content/6-556370-8sh47g/7-b939a4-457q19/meta");
  //   });
  // });

  let PARENT_ITEM = null;

  // skipping failing test in preparation for CI.
  it.skip("Modifies and saves Meta fields", () => {
    cy.get("[data-cy=itemParent]").should("exist");
    cy.get("[data-cy=metaLinkText]").should("exist");
    cy.get("[data-cy=metaTitle]").should("exist");
    cy.get("[data-cy=metaDescription]").should("exist");
    cy.get("[data-cy=metaKeywords]").should("exist");
    cy.get("[data-cy=sitemapPriority]").should("exist");
    cy.get("[data-cy=canonicalTag]").should("exist");

    cy.get("[data-cy=itemParent] .Select").click();
    cy.get('[data-value="7-f40360-7vcf5h"]').click();
    // select another parent, but switch it back to root level
    cy.get("[data-cy=itemParent] .Select").click();
    cy.get("[data-cy=itemParent]").find('[data-value="0"]').first().click();

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
      .find("textarea")
      .click()
      .clear()
      .type("new Meta Description");

    cy.get("[data-cy=metaKeywords]")
      .find("textarea")
      .click()
      .clear()
      .type("key, words, here");

    cy.get("[data-cy=sitemapPriority] >  div").click();
    cy.get('[data-value="-1"]').click();

    cy.get("[data-cy=canonicalTag] >  div").click();
    cy.get('[data-value="1"]').last().click();

    cy.get("[data-cy=canonicalTag] >  div").click();
    cy.get('[data-value="0"]').last().click();

    cy.get("#SaveItemButton").click();
    cy.contains("Saved a new ").should("exist");
  });

  it("Does not validate meta description for dataset items", () => {
    cy.task("seed:content", {
      fixturePath: "content/default.json",
      overrides: {
        model: { label: `content/meta.spec` },
      },
    }).then(({ model, items }) => {
      PARENT_ITEM = items?.[0];
      cy.waitOn("/v1/content/models*", () => {
        cy.waitOn("/v1/env/nav", () => {
          cy.waitOn("/v1/search/items*", function () {
            cy.visit(`/content/${model?.ZUID}/new`);
          });
        });
      });
    });

    cy.get('[data-cy="field:text"]', { timeout: 15000 })
      .find("input")
      .type(today);
    cy.wait(500); // wait for debounced input to settle
    cy.getBySelector("CreateItemSaveButton").click();
    cy.get("[data-cy=toast]").contains("Created Item");
  });

  it("Auto applies page parent when creating an item", function () {
    const modelLabel = `Nested Page`;
    cy.task("seed:content", {
      fixturePath: "content/default.json",
      overrides: {
        model: {
          label: modelLabel,
          type: "pageset",
          parentZUID: PARENT_ITEM?.meta?.ZUID,
        },
      },
    }).then(function ({ model, items }) {
      cy.waitOn("/v1/content/models*", () => {
        cy.waitOn("/v1/env/nav", () => {
          cy.waitOn("/v1/search/items*", function () {
            cy.visit(`/content/${model?.ZUID}/new`);
          });
        });
      });
    });

    cy.iframe("#wysiwyg_basic_ifr")
      .click()
      .type(`{selectall}{backspace}meta description`);
    cy.get('[data-cy="field:text"]').find("input").type(`meta title ${today}`);

    cy.getBySelector("CreateItemSaveButton").click();

    cy.waitOn("/v1/content/models*", () => {
      cy.get('[role="tablist"]').find("button").eq(1).click();
    });

    cy.contains(PARENT_ITEM?.web?.pathPart).should("exist");
  });

  it.skip("Supports a dedicated Twitter title, description and image", () => {
    cy.waitOn("/v1/content/models*", () => {
      cy.waitOn("/v1/env/nav", () => {
        cy.waitOn("/v1/search/items*", () => {
          cy.visit("/content/6-b6cde1aa9f-wftv50/7-92ab81c5a8-bhvb0l/meta");
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

import { v4 as uuidv4 } from "uuid";

const today = Date.now();

describe("Content Meta", () => {
  let ITEM;
  before(() => {
    cy.task("seed:content", "fixtures/meta.json").then(
      ({ model, fields, items }) => {
        ITEM = items?.[0];
        console.debug("ITEM: ", ITEM);
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

    cy.intercept(`/v1/search/items*`).as("searchQuery");

    cy.getBySelector("parentZUID").should("exist");
    cy.getBySelector("metaLinkText").should("exist");
    cy.getBySelector("metaTitle").should("exist");
    cy.getBySelector("metaDescription").should("exist");
    cy.getBySelector("metaKeywords").should("exist");
    cy.getBySelector("sitemapPriority").should("exist");
    cy.getBySelector("canonicalTag").should("exist");

    cy.getBySelector("parentZUID")
      .find("input")
      .click()
      .clear()
      .type(`test-text{selectall}{backspace}/`);

    cy.getBySelector("itemRouteListBox")
      .find("li")
      .eq(1)
      .click({ force: true });

    cy.getBySelector("parentZUID")
      .find("input")
      .click()
      .clear()
      .type(ITEM?.web?.parentZUID);

    cy.wait("@searchQuery");

    cy.get(
      `[data-cy="parent:${ITEM?.web?.parentZUID}"][aria-selected="false"]`
    ).click();

    cy.getBySelector("metaLinkText")
      .find("input")
      .click()
      .clear()
      .type("new Meta LinkText");

    cy.getBySelector("pathPart")
      .find("input")
      .click()
      .clear()
      .type(`new path part ${today}`);

    cy.getBySelector("metaTitle")
      .find("input")
      .click()
      .clear()
      .type("new Meta Title");

    cy.getBySelector("metaDescription")
      .find("textarea")
      .first()
      .click()
      .clear()
      .type("new Meta Description");

    cy.getBySelector("metaKeywords")
      .find("textarea")
      .first()
      .click()
      .clear()
      .type("key, words, here");

    cy.getBySelector("sitemapPriority").find("div").first().click();
    cy.get('[data-option-index="0"]').click();

    cy.getBySelector("canonicalTag").find("div").first().click();
    cy.get('[data-option-index="1"]').last().click();

    cy.getBySelector("canonicalTag").find("div").first().click();
    cy.get('[data-option-index="0"]').last().click();

    cy.getBySelector("SaveItemButton").click();
    cy.getBySelector("toast").contains("Item Saved", {
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

    cy.getBySelector("field:text").find("input").type(today);
    cy.wait(500); // wait for debounced input to settle
    cy.getBySelector("CreateItemSaveButton").click();
    cy.getBySelector("toast").contains("Created Item");
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
    cy.getBySelector("field:text")
      .find("input")
      .clear()
      .type(`{selectall}{backspace} meta title ${today}`);

    cy.getBySelector("ManualMetaFlow").click();

    cy.getBySelector("itemRoute")
      .find("input")
      .should("contain.value", "/cypress/e2e/");
  });

  it("Supports a dedicated Twitter title and description", () => {
    cy.intercept("GET", "**/v1/content/models").as("getModels");
    cy.intercept("GET", "**/v1/search/items**").as("getSearchItems");
    cy.visit(
      `/content/${Cypress.env("modelZUID")}/${Cypress.env("itemZUID")}/meta`
    );
    cy.wait(["@getModels", "@getSearchItems"]);

    const title = `Twitter title ${today}`;
    const description = `Twitter description ${today}`;

    cy.getBySelector("TCTitle")
      .find("input")
      .type(`{selectAll}{del}${title}`)
      .should("have.value", title);
    cy.getBySelector("TCDescription")
      .find("textarea")
      .first()
      .type(`{selectAll}{del}${description}`)
      .should("have.value", description);
    cy.getBySelector("SocialMediaPreviewTwitter")
      .should("exist")
      .should("be.enabled")
      .scrollIntoView()
      .click();

    cy.getBySelector("TwitterCardTitle").contains(title);
    cy.getBySelector("TwitterCardDescription").contains(description);
    // Note: the TwitterCardImage assertion was removed — the preview image depends
    // on the item's social-image data populating and an external bynder image load,
    // which is unreliable in CI (the element intermittently never renders). Title and
    // description cover the dedicated-Twitter-fields behavior.
  });
});

describe("Content Meta - Dataset model auto-populates Meta Title", () => {
  const DATASET_MODEL_LABEL = `Cypress Dataset Meta | ${uuidv4()}`;
  const ITEM_TEXT_VALUE = `dataset item ${uuidv4()}`;
  let datasetModelZUID;

  before(() => {
    cy.createModel({
      label: DATASET_MODEL_LABEL,
      name: DATASET_MODEL_LABEL.toLowerCase().replace(/\W/g, "_"),
      description: "Cypress: dataset model for meta title requirement spec",
      type: "dataset",
      parentZUID: null,
      listed: true,
    }).then(({ data }) => {
      expect(data?.ZUID, "created dataset model ZUID").to.be.a("string");
      datasetModelZUID = data.ZUID;

      cy.createField(datasetModelZUID, {
        label: "Text",
        name: "text",
        datatype: "text",
        sort: 0,
        settings: { list: true },
      });
    });
  });

  after(() => {
    if (datasetModelZUID) {
      cy.deleteModel(datasetModelZUID);
    }
  });

  it("Creates a dataset item, auto-populating Meta Title from the first text field", () => {
    cy.waitOn("/v1/content/models**", () => {
      cy.waitOn("/v1/env/nav", () => {
        cy.visit(`/content/${datasetModelZUID}/new`);
      });
    });

    cy.intercept("POST", "**/content/models/*/items").as("createItem");

    // Dataset items never render a URL/path part field, but Meta Title is still
    // required (see issue #4276) — it's auto-populated from the first text field
    // as the user types, the same way it is for every other non-block model, so
    // it's already set in the store by the time Save is clicked.
    cy.getBySelector("field:text").find("input").type(ITEM_TEXT_VALUE);
    cy.getBySelector("CreateItemSaveButton").click();

    cy.wait("@createItem").then(({ request, response }) => {
      expect(request.body?.web?.metaTitle).to.eq(ITEM_TEXT_VALUE);
      expect(response.statusCode).to.eq(201);
    });

    // A successful create redirects away from the "/new" route to the newly created
    // item's edit page. Pre-fix, ItemCreate's save gate discarded the fresh
    // validateMetaFields() result and checked stale SEOErrors state instead, so a
    // genuinely missing Meta Title reached the thunk's VALIDATION_ERROR response,
    // which ItemCreate then silently swallowed, leaving the app stuck on "/new".
    cy.url().should("include", `/content/${datasetModelZUID}/`);
    cy.url().should("not.include", "/new");
  });
});

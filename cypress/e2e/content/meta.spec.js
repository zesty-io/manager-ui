import { v4 as uuidv4 } from "uuid";

const today = Date.now();
// Typed straight after the value, so it lands inside the fields' 500ms
// debounce: these tests cover saving a value that hasn't committed yet.
const saveShortcut = Cypress.platform === "darwin" ? "{cmd}s" : "{ctrl}s";

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

  it("Creates an item when Save is clicked straight after typing", () => {
    cy.waitOn("/v1/content/models*", () => {
      cy.waitOn("/v1/env/nav", () => {
        cy.waitOn("/v1/search/items*", () => {
          cy.visit(`/content/${Cypress.env("modelZUID")}/new`);
        });
      });
    });

    cy.getBySelector("field:text").find("input").type(today);
    cy.getBySelector("CreateItemSaveButton").click();
    cy.getBySelector("toast").contains("Created Item");
  });

  it("Saves the pending field value when using the save shortcut", () => {
    cy.waitOn("/v1/content/models*", () => {
      cy.waitOn("/v1/env/nav", () => {
        cy.waitOn("/v1/search/items*", () => {
          cy.visit(`/content/${Cypress.env("modelZUID")}/new`);
        });
      });
    });

    const title = `shortcut ${uuidv4()}`;

    cy.getBySelector("field:text").find("input").type(title).type(saveShortcut);
    cy.getBySelector("toast").contains(`Created Item: ${title}`);
  });

  it("Saves the pending field value when using the save shortcut on an existing item", () => {
    cy.intercept(
      "PUT",
      `**/v1/content/models/${Cypress.env("modelZUID")}/items/${Cypress.env(
        "itemZUID"
      )}`
    ).as("saveItem");
    cy.visit(`/content/${Cypress.env("modelZUID")}/${Cypress.env("itemZUID")}`);

    const value = `edit shortcut ${uuidv4()}`;

    cy.getBySelector("field:text")
      .find("input")
      // Wait for the loaded item before replacing its value
      .should("not.have.value", "")
      .type(`{selectall}{backspace}${value}`)
      .type(saveShortcut);
    cy.wait("@saveItem").its("request.body.data.text").should("eq", value);
    cy.getBySelector("toast").contains("Item Saved");
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

describe("Content Meta: dataset items", () => {
  const suffix = uuidv4();
  let modelZUID;

  before(() => {
    cy.createModel({
      label: `E2E: Meta Dataset | ${suffix}`,
      name: `e2e_meta_dataset_${suffix.replace(/-/g, "_")}`,
      type: "dataset",
      listed: true,
    }).then(({ data }) => {
      modelZUID = data?.ZUID;
      cy.createField(modelZUID, {
        label: "Title",
        name: "title",
        datatype: "text",
        sort: 0,
        settings: { list: true },
      });
      // Not the first text field, so it never auto-populates Meta Title
      cy.createField(modelZUID, {
        label: "Subtitle",
        name: "subtitle",
        datatype: "text",
        sort: 1,
        settings: { list: true, maxCharLimit: 10 },
      });
    });
  });

  after(() => {
    if (modelZUID) {
      cy.deleteModel(modelZUID);
    }
  });

  const visitNewItem = () => {
    cy.waitOn("/v1/content/models*", () => {
      cy.visit(`/content/${modelZUID}/new`);
    });
  };

  it("Creates an item when Save is clicked straight after typing", () => {
    cy.intercept("POST", `**/v1/content/models/${modelZUID}/items`).as(
      "createItem"
    );
    visitNewItem();

    const title = `dataset click ${uuidv4()}`;

    cy.getBySelector("field:title").find("input").type(title);
    cy.getBySelector("CreateItemSaveButton").click();
    cy.wait("@createItem")
      .its("request.body.web.metaTitle")
      .should("eq", title);
    cy.getBySelector("toast").contains(`Created Item: ${title}`);
  });

  it("Creates an item when using the save shortcut straight after typing", () => {
    cy.intercept("POST", `**/v1/content/models/${modelZUID}/items`).as(
      "createItem"
    );
    visitNewItem();

    const title = `dataset shortcut ${uuidv4()}`;

    cy.getBySelector("field:title")
      .find("input")
      .type(title)
      .type(saveShortcut);
    cy.wait("@createItem")
      .its("request.body.web.metaTitle")
      .should("eq", title);
    cy.getBySelector("toast").contains(`Created Item: ${title}`);
  });

  it("Does not mark Meta Title as required", () => {
    visitNewItem();

    cy.getBySelector("ManualMetaFlow").click();
    cy.getBySelector("metaTitle-input").should("exist");
    cy.getBySelector("metaTitle").should("not.contain", "*");
  });

  it("Creates an item without a Meta Title", () => {
    cy.intercept("POST", `**/v1/content/models/${modelZUID}/items`).as(
      "createItem"
    );
    visitNewItem();

    cy.getBySelector("field:subtitle").find("input").type("no title");
    cy.getBySelector("CreateItemSaveButton").click();
    cy.wait("@createItem").then(({ request, response }) => {
      expect(request.body.web.metaTitle).to.not.be.ok;
      expect(response.statusCode).to.be.within(200, 299);
    });
    cy.getBySelector("toast").contains("Created Item");
  });

  it("Blocks a save when a value typed straight before it is over the limit", () => {
    cy.intercept("POST", `**/v1/content/models/${modelZUID}/items`).as(
      "createItem"
    );
    visitNewItem();

    cy.getBySelector("field:subtitle").find("input").type("far too long");
    cy.getBySelector("CreateItemSaveButton").click();
    cy.getBySelector("FieldErrorsList").should("contain", "Subtitle");

    cy.getBySelector("field:subtitle")
      .find("input")
      .type("{selectall}{backspace}short");
    cy.getBySelector("CreateItemSaveButton").click();
    // The first create request must be the corrected one
    cy.wait("@createItem")
      .its("request.body.data.subtitle")
      .should("eq", "short");
  });
});

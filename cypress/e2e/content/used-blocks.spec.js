describe("Used Blocks", () => {
  before(() => {
    cy.task("seed:content", "fixtures/block.json").then(({ model, items }) => {
      //Set modelZUID as Cypress env variable for global test access
      Cypress.env("modelZUID", model?.ZUID);
      //Set itemZUID as Cypress env variable for global test access
      Cypress.env("itemZUID", items[0]?.meta?.ZUID);
    });
  });

  it("should not show used blocks if there are no referenced blocks", () => {
    cy.intercept("GET", "**/v1/content/models").as("getContentModels");
    cy.intercept("GET", "**/v1/web/views*").as("getWebViews");

    cy.visit(`/content/${Cypress.env("modelZUID")}/${Cypress.env("itemZUID")}`);

    cy.wait(["@getContentModels", "@getWebViews"]);
    cy.getBySelector("UsedBlocks").should("not.exist");
  });

  it("should show used blocks if there are referenced blocks", () => {
    // UPDATE MODEL TEMPLATE
    cy.apiRequest({
      url: `${Cypress.env("API_INSTANCE_URL")}/web/views`,
      method: "GET",
    }).then((resData) => {
      const viewFile = resData?.data?.find(
        (data) => data?.contentModelZUID === Cypress.env("modelZUID")
      );
      const fileZuid = viewFile?.ZUID;
      return cy.apiRequest({
        url: `${Cypress.env("API_INSTANCE_URL")}/web/views/${fileZuid}`,
        method: "PUT",
        body: {
          code: "<h1>{{this.text}}</h1><div>{{ block(/-/block/nar_test_block.html) }}</div>",
        },
      });
    });
    cy.intercept("GET", "**/v1/content/models").as("models");
    cy.intercept("GET", "**/v1/web/views**").as("getViews");
    cy.intercept("GET", "**/v1/web/scripts").as("getScripts");
    cy.intercept("GET", "**/v1/web/stylesheets").as("getStylesheets");
    cy.intercept("GET", "**/undefined", cy.spy().as("undefinedImgReq"));

    cy.visit(`/content/${Cypress.env("modelZUID")}/${Cypress.env("itemZUID")}`);

    cy.wait(["@models", "@getViews", "@getScripts", "@getStylesheets"]);

    cy.getBySelector("UsedBlockPreview").should("exist");
    // Preview image must never resolve to String(undefined)
    cy.getBySelector("UsedBlockPreview")
      .find("img")
      .should("have.attr", "src")
      .and("not.match", /undefined$/);
    cy.get("@undefinedImgReq").should("not.have.been.called");
  });

  it("should be able to take you to the block edit page", () => {
    cy.getBySelector("EditBlock").should("exist").click();

    cy.location("pathname").should("include", "/blocks/");
  });

  it("should load a block variant that was only pre-seeded as a publishing stub", () => {
    cy.fixture("block.json").then((fixture) => {
      // Variant ZUID referenced by the seeded item's block_selector field
      const variantZUID =
        fixture.items[0].data.block_selector.match(/variant=([\w-]+)/)[1];

      cy.apiRequest({
        url: `${Cypress.env("API_INSTANCE_URL")}/web/views`,
        method: "GET",
      }).then((resData) => {
        const viewFile = resData?.data?.find(
          (data) => data?.contentModelZUID === Cypress.env("modelZUID")
        );
        return cy.apiRequest({
          url: `${Cypress.env("API_INSTANCE_URL")}/web/views/${viewFile?.ZUID}`,
          method: "PUT",
          body: {
            code: `<h1>{{this.text}}</h1><div>{{ block(/-/block/nar_test_block.html?variant=${variantZUID}) }}</div>`,
          },
        });
      });

      // Append a publish record for the variant so the store only holds an empty stub
      let publishingsDelivered;
      const publishingsPromise = new Promise((resolve) => {
        publishingsDelivered = resolve;
      });
      cy.intercept("GET", "**/content/items/publishings*", (req) => {
        req.continue((res) => {
          res.body.data = [
            ...(res.body.data || []),
            {
              ZUID: "18-0000000-cypress",
              itemZUID: variantZUID,
              version: 1,
              publishAt: "2020-01-01T00:00:00Z",
              unpublishAt: null,
            },
          ];
          publishingsDelivered();
        });
      }).as("getPublishings");
      // Hold the views so the block references are built after the stub is in the store
      cy.intercept("GET", "**/web/views*", (req) => {
        req.continue(() => publishingsPromise);
      });
      cy.intercept("GET", `**/search/items?q=${variantZUID}*`).as(
        "searchVariant"
      );

      // Earlier tests leave this variant in the IndexedDB warm cache, which would
      // hydrate it as fully loaded instead of a stub
      cy.visit(
        `/content/${Cypress.env("modelZUID")}/${Cypress.env("itemZUID")}`,
        {
          onBeforeLoad(win) {
            win.indexedDB.deleteDatabase("zesty");
          },
        }
      );

      cy.wait("@getPublishings");
      cy.wait("@searchVariant");
      cy.getBySelector("UsedBlockPreview").should("exist");
      cy.getBySelector("EditBlock").should("not.be.disabled");
      cy.getBySelector("CopyBlockLink").should("not.be.disabled");
      cy.getBySelector("OpenBlockInNewTab").should("not.be.disabled");
    });
  });
});

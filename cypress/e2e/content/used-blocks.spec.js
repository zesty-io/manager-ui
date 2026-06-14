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
      cy.apiRequest({
        url: `${Cypress.env("API_INSTANCE_URL")}/web/views/${fileZuid}`,
        method: "PUT",
        body: {
          code: "<h1>{{this.text}}</h1><div>{{ block(/-/block/nar_test_block.html) }}</div>",
        },
      });
    });

    cy.intercept("GET", "**/v1/web/*").as("getWebData");

    cy.visit(`/content/${Cypress.env("modelZUID")}/${Cypress.env("itemZUID")}`);

    cy.wait("@getWebData");

    cy.getBySelector("UsedBlockPreview").should("exist");
  });

  it("should be able to take you to the block edit page", () => {
    cy.getBySelector("EditBlock").should("exist").click();

    cy.location("pathname").should("include", "/blocks/");
  });
});

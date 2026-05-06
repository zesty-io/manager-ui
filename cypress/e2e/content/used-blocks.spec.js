const TIMESTAMP = Date.now();
const forceClick = { force: true };

describe("Used Blocks", () => {
  before(() => {
    // Seed content
    cy.task("seed:content", "fixtures/content.json").then(
      ({ model, items }) => {
        //Set modelZUID as Cypress env variable for global test access
        Cypress.env("modelZUID", model?.ZUID);
        //Set itemZUID as Cypress env variable for global test access
        Cypress.env("itemZUID", items[0]?.meta?.ZUID);
      }
    );
  });

  it("should not show used blocks if there are no referenced blocks", () => {
    cy.waitOn("/v1/content/models*", () => {
      cy.visit(
        `/content/${Cypress.env("modelZUID")}/${Cypress.env("itemZUID")}`
      );
    });

    cy.intercept("GET", "**/v1/content/models").as("getContentModels");
    cy.intercept("GET", "**/v1/web/views*").as("getWebViews");

    cy.wait(["@getContentModels", "@getWebViews"]);
    cy.getBySelector("UsedBlocks").should("not.exist");
  });

  it("should show used blocks if there are referenced blocks", () => {
    cy.intercept("GET", "**/v1/web/views/*").as("getWebView");
    cy.intercept("PUT", "**/v1/web/views/*").as("updateWebView");
    cy.intercept("GET", "**/v1/content/models").as("getContentModels");
    cy.intercept("GET", "**/v1/web/views*").as("getWebViews");
    cy.intercept("GET", "**/v1/content/models/*").as("getContentModel");

    cy.getBySelector("ContentItemMoreButton").click();
    cy.contains("Edit Template").click();
    cy.contains("Don't Save").click();

    cy.wait("@getWebView");

    cy.get(".monaco-editor textarea")
      .click({ force: true })
      .focused()
      .type("{ctrl+a}", { force: true })
      .invoke("val", "{{ block(/-/block/nar_test_block.html) }}") // set value directly
      .trigger("input", { force: true }); // fire input event

    // cy.window().then((win) => {
    //   const editor = win.monaco.editor.getModels()[0];
    //   editor.setValue("{{ block(/-/block/nar_test_block.html) }}");
    // });

    cy.get("button").contains("Save").click();
    cy.getBySelector("UsedBlocks").should("not.exist");
    cy.get("@updateWebView");

    cy.waitOn("/v1/content/models*", () => {
      cy.visit(
        `/content/${Cypress.env("modelZUID")}/${Cypress.env("itemZUID")}`
      );
    });

    cy.wait(["@getContentModels", "@getWebViews"]);
    cy.wait("@getContentModel");

    cy.getBySelector("UsedBlockPreview").should("exist");
  });

  it("should be able to take you to the block edit page", () => {
    cy.getBySelector("EditBlock").click();
    cy.contains("Don't Save").click();
    cy.location("pathname").should("include", "/blocks/");
  });
});

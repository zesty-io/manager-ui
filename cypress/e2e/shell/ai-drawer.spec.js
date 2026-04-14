describe("AI drawer", () => {
  before(() => {
    cy.task("seed:content", "fixtures/ai-drawer.json").then(
      ({ model, items }) => {
        Cypress.env("modelZUID", model?.ZUID);
        Cypress.env("itemZUID", items[0]?.meta?.ZUID);
      }
    );
  });

  after(() => {
    cy.deleteModel(Cypress.env("modelZUID"));
  });

  it("should only be available to the content, code and blocks app", () => {
    cy.visit("/launchpad");
    cy.getBySelector("AIDrawerToggle").click();
    cy.getBySelector("AIDrawerDisabled").should("not.exist");

    [
      "/schema",
      "/media",
      "/leads",
      "/redirects",
      "/reports",
      "/apps",
      "/settings/instance/general",
    ].forEach((path) => {
      cy.visit(path);
      cy.getBySelector("AIDrawerDisabled").should("exist");
    });

    [
      "/content/6-a1a600-k0b6f0/7-a1be38-1b42ht",
      "/content/6-a1a600-k0b6f0/7-a1be38-1b42ht/meta",
      "/code/file/views/11-eb8dec-6nsjbf",
      "/blocks/6-d8b088cc9c-gwk3w7/7-ee94b5e98d-ss015b",
    ].forEach((path) => {
      cy.visit(path);
      cy.getBySelector("AIDrawerEnabled").should("exist");
    });
  });

  it("should be able to load a chat history", () => {
    cy.clearLocalStorage();
    cy.waitOn("/v1/content/models*", () => {
      cy.visit(
        `/content/${Cypress.env("modelZUID")}/${Cypress.env("itemZUID")}`
      );
    });
    cy.getBySelector("DuoModeToggle").click({ force: true });

    const prompt = "Hello world";

    cy.intercept("GET", "**/chats/*?*").as("getChat");
    cy.intercept("POST", "**/client").as("postClient");

    cy.getBySelector("AIDrawerToggle").click();
    cy.getBySelector("AIDrawerEnabled").should("exist");
    cy.wait(500);
    cy.getBySelector("AIDrawerComposer").type(prompt);
    cy.getBySelector("AIDrawerSubmitPrompt").click();
    cy.wait("@postClient");
    cy.wait("@getChat");
    cy.getBySelector("AIDrawerUserInput").should("contain", prompt);
    cy.getBySelector("AIDrawerSystemOutput").should("have.length", 1);
    cy.reload();
    cy.wait("@getChat");
    cy.getBySelector("AIDrawerUserInput").should("contain", prompt);
    cy.getBySelector("AIDrawerSystemOutput").should("have.length", 1);
  });

  it("should be able to generate text content and apply them to fields", () => {
    cy.intercept("GET", "**/chats/*?*").as("getChat");
    cy.intercept("POST", "**/client").as("postClient");

    cy.getBySelector("AIDrawerComposer").type(
      "Generate a sensational title for the page_title field"
    );
    cy.getBySelector("AIDrawerSubmitPrompt").click();
    cy.wait("@postClient");
    cy.wait("@getChat");
    cy.getBySelector("AIDrawerSetValue").first().should("exist").click();
    cy.getBySelector("field:page_title")
      .find("input")
      .invoke("val")
      .should("not.be.empty");
  });

  it("should be able to generate images and apply them to image fields", () => {
    cy.intercept("GET", "**/chats/*?*").as("getChat");
    cy.intercept("POST", "**/client").as("postClient");

    cy.getBySelector("AIDrawerComposer").type(
      "Generate an image of the alps for the page_image field"
    );
    cy.getBySelector("AIDrawerSubmitPrompt").click();
    cy.wait("@postClient");
    cy.wait("@getChat");
    cy.getBySelector("AIDrawerSetValue").eq(1).should("exist").click();
    cy.getBySelector("field:page_image")
      .find('[data-cy="mediaItem-container"]')
      .should("exist");
  });

  it("should be able to generate suggestions", () => {
    cy.intercept("GET", "**/chats/*?*").as("getChat");
    cy.intercept("POST", "**/client").as("postClient");

    cy.getBySelector("AIDrawerGenerateSuggestions").click();
    cy.wait("@postClient");
    cy.wait("@getChat");
    cy.getBySelector("AIDrawerSystemSuggestion").should("have.length", 3);
    cy.getBySelector("AIDrawerSystemSuggestion").first().click();
    cy.getBySelector("AIDrawerComposer")
      .find("textarea")
      .first()
      .invoke("val")
      .should("not.be.empty");
  });

  it("should be able to generate blocks", () => {
    cy.intercept("GET", "**/chats/*?*").as("getChat");
    cy.intercept("POST", "**/client").as("postClient");

    cy.getBySelector("AIDrawerComposer").type(
      "{selectall}{del}Generate a block for a dog profile"
    );
    cy.getBySelector("AIDrawerSubmitPrompt").click();
    cy.wait("@postClient");
    cy.wait("@getChat");
    cy.getBySelector("AIDrawerNavigate").should("exist");
  });

  it("should be able to auto apply generated content", () => {
    cy.intercept("GET", "**/chats/*?*").as("getChat");
    cy.intercept("POST", "**/client").as("postClient");

    cy.getBySelector("field:page_title")
      .find("input")
      .clear()
      .should("have.value", "");
    cy.getBySelector("AIDrawerSettings").click();
    cy.getBySelector("AIDrawerAutoApplyToggle").click();
    cy.getBySelector("AIDrawerComposer").type(
      "Generate a title for people who love to fish for the page_title field"
    );
    cy.getBySelector("AIDrawerSubmitPrompt").click();
    cy.wait("@postClient");
    cy.wait("@getChat");
    cy.getBySelector("field:page_title")
      .find("input")
      .invoke("val")
      .should("not.be.empty");
  });

  it("should be able to create a new chat session", () => {
    cy.getBySelector("AIDrawerClearChat").click();
    cy.getBySelector("AIDrawerUserInput").should("not.exist");
  });

  it("should be able to edit code", () => {
    cy.intercept("GET", "**/chats/*?*").as("getChat");
    cy.intercept("POST", "**/client").as("postClient");
    cy.intercept("GET", "**/v1/web/views/*").as("getView");

    cy.getBySelector("ContentItemMoreButton").click();
    cy.getBySelector("EditTemplate").click();
    cy.contains("Don't Save").click();
    cy.wait("@getView");
    cy.getBySelector("AIDrawerEnabled").should("exist");
    cy.getBySelector("AIDrawerComposer").type(
      "Generate a code with an H1 wrapping the page_title field"
    );
    cy.getBySelector("AIDrawerSubmitPrompt").click();
    cy.wait("@postClient");
    cy.wait("@getChat");
    cy.getBySelector("AIDrawerSetValue").should("exist");
  });
});

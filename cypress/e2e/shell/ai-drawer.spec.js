// Purposedly setting this to 1 minute as the client call sometimes takes a while to respond
// causing some tests to fail intermittently
const AI_CLIENT_TIMEOUT = { timeout: 60000 };

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

  describe.skip("availability", () => {
    it("only renders the toggle button on the content, code and blocks apps", () => {
      [
        "/launchpad",
        "/schema",
        "/media",
        "/leads",
        "/redirects",
        "/reports",
        "/apps",
        "/settings/instance/general",
      ].forEach((path) => {
        cy.visit(path);
        cy.getBySelector("AIDrawerToggle").should("not.exist");
      });

      // The first supported path opens the drawer; `showAiDrawer` is a global
      // (not per-page) flag, so every subsequent supported path below should
      // render it open without clicking the toggle again.
      cy.visit("/content/6-a1a600-k0b6f0/7-a1be38-1b42ht");
      cy.getBySelector("AIDrawerToggle").should("exist").click();
      cy.getBySelector("AIDrawerEnabled").should("exist");

      [
        "/content/6-a1a600-k0b6f0/7-a1be38-1b42ht/meta",
        "/code/file/views/11-eb8dec-6nsjbf",
        "/blocks/6-d8b088cc9c-gwk3w7/7-ee94b5e98d-ss015b",
      ].forEach((path) => {
        cy.visit(path);
        cy.getBySelector("AIDrawerToggle").should("exist");
        cy.getBySelector("AIDrawerEnabled").should("exist");
      });
    });

    it("hides the drawer on an unsupported app even while the global toggle is still on", () => {
      cy.visit("/schema");
      cy.getBySelector("AIDrawerToggle").should("not.exist");
      cy.getBySelector("AIDrawerEnabled").should("not.exist");
    });
  });

  describe("chat history and conversation flow", () => {
    it("shows a loading state then an empty composer when a page has no chat history yet", () => {
      cy.clearLocalStorage();
      cy.intercept("GET", "**/chats", (req) => {
        req.on("response", (res) => {
          res.setDelay(1000);
        });
      }).as("getChatSessions");

      cy.waitOn("/v1/content/models*", () => {
        cy.visit(
          `/content/${Cypress.env("modelZUID")}/${Cypress.env("itemZUID")}`
        );
      });
      cy.getBySelector("DuoModeToggle").click({ force: true });
      cy.getBySelector("AIDrawerToggle").click();
      cy.getBySelector("AIDrawerEnabled").should("exist");

      // While sessions are still loading, neither the empty composer nor any
      // history row should be shown yet.
      cy.getBySelector("AIDrawerComposer").should("not.exist");
      cy.getBySelector("ChatHistoryRow").should("not.exist");

      cy.wait("@getChatSessions");

      // No sessions exist for this brand new item, so the empty composer
      // renders directly - no back button, since there's no history to go back to.
      cy.getBySelector("AIDrawerComposer").should("exist");
      cy.getBySelector("AIDrawerBackButton").should("not.exist");
      // Only visible on a totally empty thread - covered fully in the next test.
      cy.getBySelector("AIDrawerGenerateSuggestions").should("exist");
    });

    it("should be able to generate suggestions", () => {
      cy.intercept("GET", "**/chats/*?*").as("getChat");
      cy.intercept("GET", "**/chats").as("getChatSessions");
      cy.intercept("POST", "**/client").as("postClient");

      cy.getBySelector("AIDrawerGenerateSuggestions").click();
      cy.wait("@postClient", AI_CLIENT_TIMEOUT).then((interception) => {
        Cypress.env("sessionAZuid", interception.response.body.chatZuid);
      });
      cy.wait("@getChat");
      cy.wait("@getChatSessions");
      cy.getBySelector("AIDrawerSystemSuggestion").should("have.length", 3);
      cy.getBySelector("AIDrawerSystemSuggestion").first().click();
      cy.getBySelector("AIDrawerComposer")
        .find("textarea")
        .first()
        .invoke("val")
        .should("not.be.empty");

      // The button generated the thread's first message, so it should no
      // longer be available for the remainder of this (now non-empty) chat.
      cy.getBySelector("AIDrawerGenerateSuggestions").should("not.exist");
    });

    it("should be able to load a chat history", () => {
      const prompt = "Hello world";

      cy.intercept("GET", "**/chats/*?*").as("getChat");
      cy.intercept("POST", "**/client").as("postClient");

      // Clears the suggestion seeded into the composer by the previous test.
      cy.getBySelector("AIDrawerComposer").type(
        `{selectall}{del}${prompt}{enter}`
      );
      cy.wait("@postClient", AI_CLIENT_TIMEOUT);
      cy.wait("@getChat");
      cy.getBySelector("AIDrawerUserInput").should("contain", prompt);
      cy.getBySelector("AIDrawerSystemOutput").should(
        "have.length.greaterThan",
        0
      );

      cy.reload();
      cy.wait("@getChat");
      cy.getBySelector("AIDrawerEnabled").should("exist");
      cy.getBySelector("AIDrawerUserInput").should("contain", prompt);
      cy.getBySelector("AIDrawerSystemOutput").should(
        "have.length.greaterThan",
        0
      );
    });

    it("should be able to generate text content and apply them to fields", () => {
      cy.intercept("GET", "**/chats/*?*").as("getChat");
      cy.intercept("POST", "**/client").as("postClient");

      cy.getBySelector("AIDrawerComposer").type(
        "Generate a sensational title for the page_title field{enter}"
      );
      cy.wait("@postClient", AI_CLIENT_TIMEOUT);
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
        "Generate an image of the alps for the page_image field{enter}"
      );
      cy.wait("@postClient", AI_CLIENT_TIMEOUT);
      cy.wait("@getChat");
      cy.getBySelector("AIDrawerSetValue").eq(1).should("exist").click();
      cy.getBySelector("field:page_image")
        .find('[data-cy="mediaItem-container"]')
        .should("exist");
    });

    it("should be able to generate blocks", () => {
      cy.intercept("GET", "**/chats/*?*").as("getChat");
      cy.intercept("POST", "**/client").as("postClient");

      cy.getBySelector("AIDrawerComposer").type(
        "{selectall}{del}Generate a block for a dog profile{enter}"
      );
      cy.wait("@postClient", AI_CLIENT_TIMEOUT);
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
        "Generate a title for people who are into fishing for the page_title field{enter}"
      );
      cy.wait("@postClient", AI_CLIENT_TIMEOUT);
      cy.wait("@getChat");
      cy.getBySelector("field:page_title")
        .find("input")
        .invoke("val")
        .should("not.be.empty");

      // autoApply lives in AIDrawer, not ChatThread, so it survives every
      // later ChatThread mount/unmount unless turned back off here - leaving
      // it on would let later SET_VALUE responses dispatch enqueueAction
      // against content fields (stealing focus) with no test coverage for it.
      cy.getBySelector("AIDrawerAutoApplyToggle").click();
      cy.getBySelector("AIDrawerSettings").click();
    });

    it("should return to chat history (not a blank thread) when clearing an existing chat", () => {
      cy.getBySelector("AIDrawerClearChat").click();

      // With existing history for this page, clearing goes back to the list
      // instead of a bare empty composer.
      cy.getBySelector("AIDrawerComposer").should("not.exist");
      cy.getBySelector("ChatHistoryRow").should("have.length", 1);
      cy.getBySelector("AIDrawerNewChat").should("exist");
    });

    it("filters chat history by search term without losing unmatched sessions", () => {
      cy.getBySelector("AIDrawerHistorySearch")
        .find("input")
        .type("this-search-term-should-not-match-anything");
      cy.getBySelector("ChatHistoryRow").should("not.exist");
      cy.contains("No chat history available for").should("exist");

      cy.getBySelector("AIDrawerHistorySearch").find("input").clear();
      cy.getBySelector("ChatHistoryRow").should("have.length", 1);
    });

    it("New Chat opens an empty composer with a back button and creates a second, independent session", () => {
      const secondPrompt = "Second chat session prompt";

      cy.intercept("GET", "**/chats/*?*").as("getChat");
      cy.intercept("GET", "**/chats").as("getChatSessions");
      cy.intercept("POST", "**/client").as("postClient");

      cy.getBySelector("AIDrawerNewChat").click();

      cy.getBySelector("AIDrawerComposer").should("exist");
      cy.getBySelector("AIDrawerUserInput").should("not.exist");
      cy.getBySelector("AIDrawerGenerateSuggestions").should("exist");
      cy.getBySelector("AIDrawerBackButton").should("exist");

      cy.getBySelector("AIDrawerComposer").type(`${secondPrompt}{enter}`);
      cy.wait("@postClient", AI_CLIENT_TIMEOUT).then((interception) => {
        Cypress.env("sessionBZuid", interception.response.body.chatZuid);
      });
      cy.wait("@getChat");
      cy.getBySelector("AIDrawerUserInput")
        .should("have.length", 1)
        .and("contain", secondPrompt);

      cy.wait("@getChatSessions");

      // Use the Back button (not Clear Chat) to return to history - Clear
      // Chat's own effect on navigation is already covered by the dedicated
      // "clearing an existing chat" test above.
      cy.getBySelector("AIDrawerBackButton").click();
      cy.getBySelector("AIDrawerComposer").should("not.exist");
      cy.getBySelector("ChatHistoryRow").should("have.length", 2);
    });

    it("loads each session's own conversation when clicking its history row", () => {
      // Target rows by their actual chatZuid (captured from the /client
      // responses when each session was created) rather than by position -
      // history row order isn't guaranteed to stay stable across renders.
      cy.get(`[data-chat-zuid="${Cypress.env("sessionAZuid")}"]`).click();
      cy.getBySelector("AIDrawerUserInput")
        .first()
        .should("contain", "Generate suggestions for my content fields");

      cy.getBySelector("AIDrawerBackButton").click();

      cy.get(`[data-chat-zuid="${Cypress.env("sessionBZuid")}"]`).click();
      cy.getBySelector("AIDrawerUserInput")
        .should("have.length", 1)
        .and("contain", "Second chat session prompt");
    });
  });

  describe("code editor", () => {
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
        "Generate a code with an H1 wrapping the page_title field{enter}"
      );
      cy.wait("@postClient", AI_CLIENT_TIMEOUT);
      cy.wait("@getChat");
      cy.getBySelector("AIDrawerSetValue").should("exist");
    });
  });
});

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

  // Stubbed, so the reply is fixed instead of whatever the model writes.
  describe("replies the drawer has to handle", () => {
    const CHAT_ZUID = "e2e-stub-chat";

    const CODE_EDITOR_REPLY = JSON.stringify([
      {
        type: "SET_VALUE",
        payload: { refKey: "code-editor", value: "<h1>Hi</h1>" },
      },
    ]);

    // An image with no field to fill: shown, never applied.
    const GENERATED_IMAGE_REPLY = JSON.stringify([
      {
        type: "SET_VALUE",
        payload: { refKey: "generated-image", value: "3-e2e000-stub00" },
      },
    ]);

    const IMAGE_ZUID = "3-e2e-stub-image";
    const IMAGE_REPLY = JSON.stringify([
      {
        type: "SET_VALUE",
        payload: { refKey: "generated-image", value: IMAGE_ZUID },
      },
      {
        type: "SYSTEM_OUTPUT",
        payload: { value: "Generated an image of the alps." },
      },
    ]);

    const openDrawerWithReply = (response, beforePrompt = () => {}) => {
      cy.intercept("GET", "**/chats", { body: { data: [] } });
      cy.intercept("POST", "**/client", {
        body: { chatZuid: CHAT_ZUID, data: response, message: "", tools: [] },
      }).as("postClient");
      cy.intercept("GET", `**/chats/${CHAT_ZUID}?*`, {
        body: {
          data: {
            chatZuid: CHAT_ZUID,
            prompts: [
              {
                promptZuid: "e2e-stub-prompt",
                chatZuid: CHAT_ZUID,
                prompt: "Stubbed prompt",
                response,
                approval: "0",
              },
            ],
          },
        },
      }).as("getChat");
      cy.intercept("PATCH", "**/chats/*/prompt/*", { body: {} }).as("approve");

      cy.clearLocalStorage();
      cy.waitOn("/v1/content/models*", () => {
        cy.visit(
          `/content/${Cypress.env("modelZUID")}/${Cypress.env("itemZUID")}`
        );
      });
      cy.getBySelector("DuoModeToggle").click({ force: true });
      cy.getBySelector("AIDrawerToggle").click();
      beforePrompt();
      cy.getBySelector("AIDrawerComposer").type("Stubbed prompt{enter}");
      cy.wait("@postClient");
      cy.wait("@getChat");
    };

    it("renders a prose reply as a message", () => {
      openDrawerWithReply("Here is a friendlier headline.");

      cy.getBySelector("AIDrawerMessage").should(
        "contain.text",
        "Here is a friendlier headline."
      );
      cy.contains("Error parsing AI response").should("not.exist");
    });

    it("warns instead of applying a suggestion for a ref not on the page", () => {
      openDrawerWithReply(CODE_EDITOR_REPLY);

      cy.getBySelector("AIDrawerSetValue").click();
      cy.getBySelector("toast").should("contain.text", '"code-editor"');
      cy.getBySelector("AIDrawerSetValue").should("not.be.disabled");
      cy.get("@approve.all").should("have.length", 0);
    });

    it("warns instead of auto-applying a suggestion for a ref not on the page", () => {
      openDrawerWithReply(CODE_EDITOR_REPLY, () => {
        cy.getBySelector("AIDrawerSettings").click();
        cy.getBySelector("AIDrawerAutoApplyToggle").find("input").check();
      });

      cy.getBySelector("toast").should("contain.text", '"code-editor"');
      cy.get("@approve.all").should("have.length", 0);
    });

    it("shows a generated image with no Apply and no warning", () => {
      openDrawerWithReply(GENERATED_IMAGE_REPLY);

      cy.getBySelector("AIDrawerGeneratedImage").should("exist");
      cy.getBySelector("AIDrawerSetValue").should("not.exist");
      cy.getBySelector("toast").should("not.exist");
    });

    it("does not auto-apply a generated image", () => {
      // The code-editor warning shows that auto-apply ran over the reply.
      // Only the last of one pass's warnings is shown, so the image goes last.
      const reply = JSON.stringify([
        ...JSON.parse(CODE_EDITOR_REPLY),
        ...JSON.parse(GENERATED_IMAGE_REPLY),
      ]);
      openDrawerWithReply(reply, () => {
        cy.getBySelector("AIDrawerSettings").click();
        cy.getBySelector("AIDrawerAutoApplyToggle").find("input").check();
      });

      cy.getBySelector("AIDrawerGeneratedImage").should("exist");
      cy.getBySelector("toast")
        .should("contain.text", '"code-editor"')
        .and("not.contain.text", '"generated-image"');
      cy.get("@approve.all").should("have.length", 0);
    });

    it("generates alt text for a generated image and saves it to the file", () => {
      openDrawerWithReply(IMAGE_REPLY);
      cy.intercept("POST", "**/api/alt-text", {
        body: { data: { altText: "A stubbed alt text" }, message: "ok" },
      }).as("altText");
      cy.intercept("PATCH", `**/file/${IMAGE_ZUID}`, { body: {} }).as(
        "saveAltText"
      );

      // The save refetches the chat log; the server has logged the alt-text
      // turn by then. Registered before the click so the refetch cannot
      // outrun it, and held until the live turn has been checked so it cannot
      // replace that turn first. The logged text differs from the live one so
      // the restored turn can be told apart from the local one it replaces.
      let releaseChatLog;
      const chatLogGate = new Promise((resolve) => {
        releaseChatLog = resolve;
      });
      const restoredChatLog = {
        body: {
          data: {
            chatZuid: CHAT_ZUID,
            prompts: [
              {
                promptZuid: "e2e-stub-prompt",
                chatZuid: CHAT_ZUID,
                prompt: "Stubbed prompt",
                response: IMAGE_REPLY,
                approval: "0",
              },
              {
                promptZuid: "e2e-stub-alt-prompt",
                chatZuid: CHAT_ZUID,
                prompt: "Generate alt text for this image (Stubbed prompt)",
                response: JSON.stringify([
                  {
                    type: "SYSTEM_OUTPUT",
                    payload: { value: "A restored alt text" },
                  },
                ]),
                metadata: {
                  fileZuid: IMAGE_ZUID,
                  context: "Stubbed prompt",
                  altText: "A restored alt text",
                },
                approval: "0",
              },
            ],
          },
        },
      };
      cy.intercept("GET", `**/chats/${CHAT_ZUID}?*`, (req) =>
        chatLogGate.then(() => req.reply(restoredChatLog))
      ).as("getChatWithAltText");

      // Follows the reply's text, as the last entry of the turn.
      cy.contains("Generated an image of the alps.");
      cy.getBySelector("AIDrawerGenerateAltText").should("be.visible").click();

      cy.wait("@altText")
        .its("request.body")
        .should((body) => {
          expect(body.fileZuid).to.equal(IMAGE_ZUID);
          expect(body.context).to.equal("Stubbed prompt");
        });
      cy.wait("@saveAltText")
        .its("request.body")
        .should("deep.equal", { title: "A stubbed alt text" });
      cy.getBySelector("AIDrawerAltTextSaved")
        .should("contain", "Alt text saved to the image")
        .and("contain", "A stubbed alt text")
        .and("be.visible");
      cy.getBySelector("AIDrawerAltTextOpenInMedia").should(
        "have.attr",
        "href",
        `/media?fileId=${IMAGE_ZUID}`
      );

      // The refetched log replaces the local turn; its metadata rebuilds it.
      cy.then(() => releaseChatLog());
      cy.wait("@getChatWithAltText");
      cy.getBySelector("AIDrawerAltTextSaved")
        .should("have.length", 1)
        .and("contain", "A restored alt text")
        .and("be.visible");
      cy.getBySelector("AIDrawerAltTextOpenInMedia").should(
        "have.attr",
        "href",
        `/media?fileId=${IMAGE_ZUID}`
      );
      cy.getBySelector("AIDrawerUserInput")
        .last()
        .should("have.text", "Generate an alt tag for this image");
      cy.contains("Generate alt text for this image").should("not.exist");
    });

    it("shows the server's message and saves nothing when alt text fails", () => {
      openDrawerWithReply(IMAGE_REPLY);
      cy.intercept("POST", "**/api/alt-text", {
        statusCode: 400,
        body: { message: "Media file not found" },
      }).as("altText");
      cy.intercept("PATCH", `**/file/${IMAGE_ZUID}`, { body: {} }).as(
        "saveAltText"
      );

      cy.getBySelector("AIDrawerGenerateAltText").click();
      cy.wait("@altText");
      cy.contains("Media file not found").should("be.visible");
      cy.get("@saveAltText.all").should("have.length", 0);
    });
  });

  // Stubbed: the media library and the reply are fixed.
  describe("attaching images to a prompt", () => {
    const CHAT_ZUID = "e2e-stub-attachments-chat";
    const BIN = {
      id: "1-e2e-bin",
      name: "E2E bin",
      default: true,
      storage_driver: "gcp",
      storage_name: "e2e-bucket",
    };
    const FOLDER_ID = "2-e2e-ai-attachments";
    const CREATED_FOLDER_ID = "2-e2e-created";
    const CDN = "https://e2e.media.zestyio.com";
    // A 1x1 PNG, so the thumbnail renders.
    const PNG = Cypress.Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
      "base64"
    );
    const image = (fileName, contents = PNG, mimeType = "image/png") => ({
      contents,
      fileName,
      mimeType,
      lastModified: Date.now(),
    });
    const megabytes = (count) => Cypress.Buffer.alloc(count * 1024 * 1024);
    const fileZUID = (fileName) => `3-e2e-${fileName.replace(/\W/g, "-")}`;
    const MISSING_IMAGE = "missing.png";
    // What the stubbed CDN serves: a text body, which a reply keeps intact.
    const SVG =
      '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>';

    beforeEach(() => {
      // Refuses any upload a test's own stub does not catch, so none reaches
      // the real media library. Registered first, so the stubs below win.
      cy.intercept("POST", "**/upload/**", { statusCode: 500 }).as(
        "unstubbedUpload"
      );
      // The stubbed uploads' CDN, so a sent image loads.
      cy.intercept("GET", new RegExp(`^${CDN}/`), (req) => {
        if (req.url.includes(MISSING_IMAGE)) {
          req.reply({ statusCode: 404 });
          return;
        }
        req.reply({ headers: { "content-type": "image/svg+xml" }, body: SVG });
      });
    });

    const bodyText = (body) =>
      typeof body === "string" ? body : new TextDecoder().decode(body);
    const uploadedFileName = (req) =>
      bodyText(req.body).match(/name="file"; filename="([^"]+)"/)[1];

    const stubMediaLibrary = ({
      groups = [
        {
          id: FOLDER_ID,
          bin_id: BIN.id,
          group_id: BIN.id,
          name: "AI Attachments",
        },
      ],
      failing = [],
      uploadDelay = 0,
    } = {}) => {
      cy.intercept("GET", "**/site/*/bins", { body: { data: [BIN] } });
      cy.intercept("GET", "**/eco/*/bins", { body: { data: [] } });
      cy.intercept("GET", `**/bin/${BIN.id}/groups`, {
        body: { data: groups },
      }).as("getGroups");
      cy.intercept("POST", "**/group", {
        statusCode: 201,
        body: { data: [{ id: CREATED_FOLDER_ID }] },
      }).as("createGroup");
      cy.intercept(
        "POST",
        `**/upload/${BIN.storage_driver}/${BIN.storage_name}`,
        (req) => {
          const fileName = uploadedFileName(req);
          if (failing.includes(fileName)) {
            req.reply({ statusCode: 500, body: { message: "Upload failed" } });
            return;
          }
          req.reply({
            statusCode: 201,
            delay: uploadDelay,
            body: {
              data: [{ id: fileZUID(fileName), url: `${CDN}/${fileName}` }],
            },
          });
        }
      ).as("upload");
    };

    const stubChat = ({ inputArtifacts, delay = 0 } = {}) => {
      cy.intercept("GET", "**/chats", { body: { data: [] } });
      cy.intercept("POST", "**/client", {
        body: { chatZuid: CHAT_ZUID, data: "Noted.", message: "", tools: [] },
      }).as("postClient");
      cy.intercept("GET", `**/chats/${CHAT_ZUID}?*`, {
        delay,
        body: {
          data: {
            chatZuid: CHAT_ZUID,
            prompts: [
              {
                promptZuid: "e2e-stub-attachments-prompt",
                chatZuid: CHAT_ZUID,
                prompt: "Describe these",
                response: "Noted.",
                approval: "0",
                ...(inputArtifacts && { inputArtifacts }),
              },
            ],
          },
        },
      }).as("getChat");
    };

    const openDrawer = ({ chatZUID } = {}) => {
      const pathname = `/content/${Cypress.env("modelZUID")}/${Cypress.env(
        "itemZUID"
      )}`;
      cy.clearLocalStorage();
      cy.waitOn("/v1/content/models*", () => {
        cy.visit(pathname, {
          onBeforeLoad: (win) => {
            if (chatZUID) {
              win.localStorage.setItem(
                `ai-drawer-${pathname}-chatZUID`,
                JSON.stringify(chatZUID)
              );
            }
          },
        });
      });
      cy.getBySelector("DuoModeToggle").click({ force: true });
      cy.getBySelector("AIDrawerToggle").click();
    };

    const attach = (...files) =>
      cy.getBySelector("AIDrawerAttachInput").selectFile(files, {
        // The input is hidden behind the attach button.
        force: true,
      });

    it("shows a thumbnail for each attached image, and removes one before sending", () => {
      stubMediaLibrary();
      stubChat();
      openDrawer();

      attach(image("first.png"), image("second.png"));
      cy.getBySelector("AIDrawerAttachment").should("have.length", 2);
      cy.getBySelector("AIDrawerAttachment")
        .first()
        .find("img")
        .should("have.prop", "naturalWidth", 1);

      cy.getBySelector("AIDrawerAttachmentRemove").first().click();
      cy.getBySelector("AIDrawerAttachment")
        .should("have.length", 1)
        .find("img")
        .should("have.attr", "alt", "second.png");
      cy.get("@upload.all").should("have.length", 0);
    });

    it("uploads each image into AI Attachments and sends its ZUID with the prompt", () => {
      stubMediaLibrary();
      // The reload carries no images, so any shown come from the send itself.
      stubChat({ delay: 5000 });
      openDrawer();

      attach(image("first.png"), image("second.png"));
      cy.getBySelector("AIDrawerComposer").type("Describe these{enter}");

      cy.wait("@postClient").then(({ request }) => {
        expect(request.body.imageFileZuids).to.deep.equal([
          fileZUID("first.png"),
          fileZUID("second.png"),
        ]);
      });
      cy.get("@upload.all").then((uploads) => {
        expect(uploads).to.have.length(2);
        uploads.forEach(({ request }) => {
          const body = bodyText(request.body);
          expect(body).to.match(
            new RegExp(`name="group_id"\\r\\n\\r\\n${FOLDER_ID}\\r\\n`)
          );
          expect(body).to.match(
            new RegExp(`name="bin_id"\\r\\n\\r\\n${BIN.id}\\r\\n`)
          );
        });
      });
      cy.get("@createGroup.all").should("have.length", 0);

      cy.getBySelector("AIDrawerUserInputImage")
        .should("have.length", 2)
        .first()
        .should("have.attr", "src", `${CDN}/first.png?width=200`)
        .and("have.prop", "naturalWidth", 1);
      cy.getBySelector("AIDrawerUserInput").should(
        "contain.text",
        "Describe these"
      );
      cy.getBySelector("AIDrawerAttachment").should("not.exist");
    });

    it("creates the AI Attachments folder at the bin root when there is none", () => {
      stubMediaLibrary({
        // Same name, but not at the root.
        groups: [
          {
            id: "2-e2e-nested",
            bin_id: BIN.id,
            group_id: "2-e2e-parent",
            name: "AI Attachments",
          },
        ],
      });
      stubChat();
      openDrawer();

      attach(image("first.png"));
      cy.getBySelector("AIDrawerComposer").type("Describe this{enter}");

      cy.wait("@createGroup").then(({ request }) => {
        expect(request.body).to.deep.equal({
          name: "AI Attachments",
          bin_id: BIN.id,
          group_id: BIN.id,
        });
      });
      cy.wait("@upload").then(({ request }) => {
        expect(bodyText(request.body)).to.match(
          new RegExp(`name="group_id"\\r\\n\\r\\n${CREATED_FOLDER_ID}\\r\\n`)
        );
      });
      cy.wait("@postClient")
        .its("request.body.imageFileZuids")
        .should("deep.equal", [fileZUID("first.png")]);
    });

    it("refuses files over the limits, or of another type, before uploading", () => {
      stubMediaLibrary();
      stubChat();
      openDrawer();

      attach(image("animated.gif", PNG, "image/gif"));
      cy.getBySelector("AIDrawerAttachError").should(
        "have.text",
        "animated.gif wasn't added: only these image types can be attached: PNG, JPEG, WebP, HEIC, HEIF."
      );

      // The browser's MIME type decides, not the name.
      attach(image("renamed.png", PNG, "image/gif"));
      cy.getBySelector("AIDrawerAttachError").should(
        "have.text",
        "renamed.png wasn't added: only these image types can be attached: PNG, JPEG, WebP, HEIC, HEIF."
      );
      cy.getBySelector("AIDrawerAttachment").should("not.exist");

      // A non-standard name for a PNG is still a PNG.
      attach(image("legacy.png", PNG, "image/x-png"));
      cy.getBySelector("AIDrawerAttachment").should("have.length", 1);
      cy.getBySelector("AIDrawerAttachmentRemove").click();
      cy.getBySelector("AIDrawerAttachment").should("not.exist");

      attach(image("huge.png", megabytes(21)));
      cy.getBySelector("AIDrawerAttachError").should(
        "have.text",
        "huge.png wasn't added: each image can be at most 20 MB."
      );

      attach(
        image("big-one.png", megabytes(11)),
        image("big-two.png", megabytes(11))
      );
      cy.getBySelector("AIDrawerAttachError").should(
        "have.text",
        "big-two.png wasn't added: a prompt's images can total at most 20 MB."
      );
      cy.getBySelector("AIDrawerAttachment").should("have.length", 1);
      cy.getBySelector("AIDrawerAttachmentRemove").click();

      attach(...["1", "2", "3", "4", "5", "6"].map((n) => image(`${n}.png`)));
      cy.getBySelector("AIDrawerAttachError").should(
        "have.text",
        "6.png wasn't added: a prompt can have at most 5 images."
      );
      cy.getBySelector("AIDrawerAttachment").should("have.length", 5);
      cy.getBySelector("AIDrawerAttach").should("be.disabled");

      cy.get("@upload.all").should("have.length", 0);
    });

    it("does not send the prompt when an upload fails, and names the file", () => {
      stubMediaLibrary({ failing: ["second.png"] });
      stubChat();
      openDrawer();

      attach(image("first.png"), image("second.png"));
      cy.getBySelector("AIDrawerComposer").type("Describe these{enter}");

      cy.getBySelector("AIDrawerAttachError").should(
        "have.text",
        "second.png couldn't be uploaded, so the prompt wasn't sent."
      );
      cy.get("@upload.all").should("have.length", 2);
      cy.get("@postClient.all").should("have.length", 0);
      cy.getBySelector("AIDrawerAttachment").should("have.length", 2);
      cy.getBySelector("AIDrawerComposer")
        .find("textarea:not([aria-hidden])")
        .should("have.value", "Describe these");
      cy.getBySelector("AIDrawerUserInput").should("not.exist");
    });

    it("sends nothing when the drawer closes before the uploads finish", () => {
      stubMediaLibrary({ uploadDelay: 2000 });
      stubChat();
      openDrawer();

      attach(image("first.png"));
      cy.getBySelector("AIDrawerComposer").type("Describe this{enter}");
      cy.getBySelector("AIDrawerAttachUploading").should("exist");
      cy.getBySelector("AIDrawerClearChat").should("be.disabled");

      cy.getBySelector("AIDrawerToggle").click();
      cy.getBySelector("AIDrawerEnabled").should("not.exist");
      cy.wait("@upload");
      // Time for a stale send to go out.
      cy.wait(1000);
      cy.get("@postClient.all").should("have.length", 0);
    });

    it("shows a reloaded prompt's attached images", () => {
      stubMediaLibrary();
      stubChat({
        inputArtifacts: [
          {
            type: "image",
            fileZuid: fileZUID("first.png"),
            url: `${CDN}/first.png`,
          },
          { type: "image", url: `${CDN}/${MISSING_IMAGE}` },
        ],
      });
      openDrawer({ chatZUID: CHAT_ZUID });

      cy.wait("@getChat");
      cy.getBySelector("AIDrawerUserInputImage").should("have.length", 2);
      cy.getBySelector("AIDrawerUserInputImage")
        .first()
        .should("have.attr", "src", `${CDN}/first.png?width=200`)
        .and("have.prop", "naturalWidth", 1);
      // One that no longer loads shows an icon instead.
      cy.getBySelector("AIDrawerUserInputImage")
        .last()
        .should("not.match", "img")
        .find("svg")
        .should("exist");
    });
  });
});

describe("Studio AI Assistant", () => {
  const MCP_CLIENT = /\/client$/;
  const PVL = /\/-\/pvl\//;
  const ADDED_LINE = '  <p class="studio-e2e-ai">Added by AI</p>';

  let studioPath = "/";
  let itemZUID = "";
  let modelZUID = "";
  let viewZUID = "";
  let viewFileName = "";

  before(() => {
    cy.task("seed:content", "fixtures/studio.json").then(
      ({ model, items, view }) => {
        itemZUID = items[0].meta.ZUID;
        modelZUID = model.ZUID;
        studioPath = `/${items[0].web.pathPart}`;
        viewZUID = view?.ZUID || "";
        viewFileName = view?.fileName || "";
        expect(viewZUID, "seeded view").to.match(/^11-/);
      }
    );
  });

  // The transcript persists per page in localStorage, and this suite does not
  // isolate storage between tests.
  const clearChatHistory = (win) =>
    Object.keys(win.localStorage)
      .filter((key) => key.startsWith("ai-drawer-"))
      .forEach((key) => win.localStorage.removeItem(key));

  beforeEach(() => {
    cy.stubStaffUser();
    cy.waitOn("/v1/content/models**", () => {
      cy.visit(`/studio?path=${studioPath}`, {
        onBeforeLoad: clearChatHistory,
      });
    });
  });

  const mcpReply = (actions) => ({
    data: `\`\`\`json\n${JSON.stringify(actions)}\n\`\`\``,
    message: "",
    tools: [],
  });

  const setValue = (value) => ({
    type: "SET_VALUE",
    payload: { refKey: "code-editor", value },
  });

  // One line added after the <h1>, one removed: the last plain div.
  const editSource = (code) =>
    code
      .replace("</h1>\n", `</h1>\n${ADDED_LINE}\n`)
      .replace(/\n[^\n]*studio-e2e-two[^\n]*/, "");

  // Replies to each MCP call in turn with `replies[n](requestBody)`.
  const stubMcp = (...replies) => {
    let call = 0;
    cy.intercept({ method: "POST", url: MCP_CLIENT }, (req) => {
      const reply = replies[Math.min(call++, replies.length - 1)];
      req.reply({ statusCode: 200, body: reply(req.body) });
    }).as("mcp");
  };

  // The preflight is stubbed too, so the spec does not depend on how the
  // preview host answers CORS for /-/pvl/.
  const stubPvl = (response) => {
    cy.intercept({ method: "OPTIONS", url: PVL }, (req) =>
      req.reply({
        statusCode: 204,
        headers: {
          "access-control-allow-origin": "*",
          "access-control-allow-methods": "POST, GET, OPTIONS",
          "access-control-allow-headers": "authorization",
        },
      })
    ).as("pvlPreflight");
    cy.intercept({ method: "POST", url: PVL }, (req) =>
      req.reply({
        headers: { "access-control-allow-origin": "*" },
        ...response,
      })
    ).as("pvl");
  };

  const openAiPanel = () => {
    cy.getBySelector("StudioAIButton").click();
    cy.getBySelector("StudioAIPanel").should("exist");
  };

  const sendPrompt = (prompt) => {
    cy.get('[data-cy="AIChatPrompt"] textarea:not([aria-hidden])').type(prompt);
    cy.getBySelector("AIChatSend").click();
    cy.wait("@mcp");
  };

  it("replaces the right column with the AI panel and closes it again", () => {
    openAiPanel();
    cy.getBySelector("StudioInspectorPanel").should("not.exist");
    cy.getBySelector("StudioSidePanel").should("not.exist");
    cy.getBySelector("StudioAIButton").should(
      "have.attr",
      "aria-pressed",
      "true"
    );

    cy.getBySelector("AIChatClose").click();
    cy.getBySelector("StudioAIPanel").should("not.exist");
  });

  it("offers the AI only where layout editing is available", () => {
    cy.getBySelector("StudioAIButton").should("exist");
    cy.getBySelector("StudioModeToggleOption-content").click();
    cy.getBySelector("StudioAIButton").should("not.exist");
  });

  it("sends the page's own view with its full field objects", () => {
    stubMcp(() => mcpReply([]));
    openAiPanel();
    sendPrompt("Add a line under the heading");

    cy.get("@mcp")
      .its("request.body")
      .then((body) => {
        expect(body.filename).to.eq(viewFileName);
        expect(body.code).to.contain('class="studio-e2e-title"');
        expect(body.modelZuid).to.eq(modelZUID);
        expect(body.itemZuid).to.eq(itemZUID);
        expect(body.registryKeys).to.include("code-editor");
        expect(body.fields).to.be.an("array").and.not.be.empty;
        body.fields.forEach((field) => {
          expect(field).to.include.keys(
            "ZUID",
            "contentModelZUID",
            "name",
            "datatype"
          );
          expect(field.contentModelZUID).to.eq(modelZUID);
        });
      });
  });

  it("stages an edit, summarises it and previews it through PVL", () => {
    stubMcp((body) => mcpReply([setValue(editSource(body.code))]));
    stubPvl({
      statusCode: 200,
      body: '<p class="studio-e2e-ai">Rendered by PVL</p>',
    });
    openAiPanel();
    sendPrompt("Add a line under the heading");

    cy.wait("@pvl").then(({ request }) => {
      expect(request.url).to.match(/^https:\/\/[^/]+\/-\/pvl\//);
      expect(request.headers.authorization).to.match(/^Bearer \S+/);
      expect(request.body).to.contain('name="parsley"');
      expect(request.body).to.contain(ADDED_LINE);
      expect(request.body).to.contain('name="zuid"');
      expect(request.body).to.contain(itemZUID);
    });

    cy.getBySelector("StudioAIPreviewFrame")
      .should("have.attr", "sandbox", "allow-scripts")
      .and("have.attr", "srcdoc")
      .and("contain", "Rendered by PVL")
      .and("contain", "/site.css")
      .and("contain", "/site.js");

    cy.getBySelector("AIChatCodeEdit")
      .should("contain.text", viewFileName)
      .and("contain.text", "+1")
      .and("contain.text", "−1");
    cy.getBySelector("StudioAIPanel").should("not.contain", "studio-e2e");

    cy.getBySelector("StudioSaveStatus").should("contain.text", "Not Saved");
    cy.getBySelector("StudioLayersPanel").should(
      "have.attr",
      "aria-disabled",
      "true"
    );
    cy.getBySelector("StudioLayoutSaveBar").should("exist");
  });

  it("renders a prose reply as a message, and a NAVIGATE beside it", () => {
    stubMcp(
      () => ({ data: "Background and text updated.", message: "", tools: [] }),
      () =>
        mcpReply([
          "The text is being pulled from Studio Page's title.",
          {
            type: "NAVIGATE",
            payload: { path: `/content/${modelZUID}/${itemZUID}` },
          },
        ])
    );
    openAiPanel();

    sendPrompt("Change the background");
    cy.getBySelector("AIChatMessage").should(
      "contain.text",
      "Background and text updated."
    );
    cy.getBySelector("StudioAIPanel").should(
      "not.contain",
      "Error parsing AI response"
    );

    sendPrompt("Change the heading text");
    cy.getBySelector("AIChatMessage").should("have.length", 2);
    cy.getBySelector("AIChatNavigate").should("exist");
    cy.getBySelector("StudioAIPreview").should("not.exist");
  });

  it("refuses to preview a file over the PVL size limit", () => {
    stubMcp((body) =>
      mcpReply([setValue(`${body.code}\n<!--${"x".repeat(1100 * 1024)}-->`)])
    );
    stubPvl({ statusCode: 200, body: "<p>unused</p>" });
    openAiPanel();
    sendPrompt("Pad the file");

    cy.getBySelector("StudioAIPreviewError").should("contain.text", "1 MiB");
    cy.get("@pvl.all").should("have.length", 0);
    cy.getBySelector("StudioLayoutSaveBar").should("exist");
  });

  it("names an external stylesheet when the preview request fails", () => {
    stubMcp((body) =>
      mcpReply([
        setValue(
          `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter">\n${body.code}`
        ),
      ])
    );
    cy.intercept({ method: "POST", url: PVL }, { forceNetworkError: true });
    openAiPanel();
    sendPrompt("Use the Inter font");

    cy.getBySelector("StudioAIPreviewError").should(
      "contain.text",
      "external stylesheet"
    );
  });

  it("cancel drops every staged turn and returns to the live canvas", () => {
    stubMcp((body) => mcpReply([setValue(editSource(body.code))]));
    stubPvl({ statusCode: 200, body: "<p>preview</p>" });
    openAiPanel();
    sendPrompt("Add a line under the heading");
    cy.getBySelector("StudioAIPreview").should("exist");

    cy.getBySelector("StudioLayoutCancelButton").click();
    cy.getBySelector("StudioAIPreview").should("not.exist");
    cy.getBySelector("StudioLayoutSaveBar").should("not.exist");
    cy.getBySelector("StudioSaveStatus").should("not.exist");
    cy.getBySelector("StudioLayersPanel").should(
      "not.have.attr",
      "aria-disabled"
    );
  });

  it("prompts before leaving Studio with a staged change", () => {
    stubMcp(
      (body) => mcpReply([setValue(editSource(body.code))]),
      () =>
        mcpReply([
          {
            type: "NAVIGATE",
            payload: { path: `/content/${modelZUID}/${itemZUID}` },
          },
        ])
    );
    stubPvl({ statusCode: 200, body: "<p>preview</p>" });
    openAiPanel();
    sendPrompt("Add a line under the heading");
    cy.getBySelector("StudioAIPreview").should("exist");
    sendPrompt("Take me to the content item");

    cy.getBySelector("AIChatNavigate").click();
    cy.getBySelector("PendingEditsModal").should("exist");
    cy.getBySelector("PendingEditsModalCancel").click();
    cy.location("pathname").should("eq", "/studio");
    cy.getBySelector("StudioAIPreview").should("exist");

    cy.getBySelector("AIChatNavigate").click();
    cy.getBySelector("PendingEditsModalDiscard").click();
    cy.location("pathname").should("eq", `/content/${modelZUID}/${itemZUID}`);
  });

  // Last: it writes the seeded view.
  it("saves every accumulated turn in one write of the exact staged source", () => {
    let firstTurn = "";
    let secondTurnInput = "";
    let staged = "";
    stubMcp(
      (body) => {
        firstTurn = editSource(body.code);
        staged = firstTurn;
        return mcpReply([setValue(staged)]);
      },
      (body) => {
        secondTurnInput = body.code;
        // DOMParser would re-serialize <br/> as <br>; the save must not.
        staged = `${body.code}\n<br/>\n<!-- second turn -->`;
        return mcpReply([setValue(staged)]);
      }
    );
    stubPvl({ statusCode: 200, body: "<p>preview</p>" });
    cy.intercept("PUT", `/v1/web/views/${viewZUID}`).as("updateWebView");

    // Each staged turn renders a preview, so waiting on PVL waits for the
    // stage itself — the engine queue holds each action 1.5s after the last.
    openAiPanel();
    sendPrompt("Add a line under the heading");
    cy.wait("@pvl");
    sendPrompt("Add a comment at the end");
    cy.wait("@pvl");
    cy.getBySelector("AIChatCodeEdit").should("have.length", 2);
    // The second turn is built on the first turn's staged file.
    cy.then(() => expect(secondTurnInput).to.eq(firstTurn));

    cy.getBySelector("StudioLayoutSaveChangesButton").click();
    cy.getBySelector("StudioSaveAllButton").click();

    cy.wait("@updateWebView").then(({ request }) => {
      expect(request.body.code).to.eq(staged);
    });
    cy.getBySelector("StudioSaveStatus").should("have.text", "Saved");
    cy.getBySelector("StudioAIPreview").should("not.exist");
    cy.get("@updateWebView.all").should("have.length", 1);
  });
});

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

  const visitStudio = () =>
    cy.waitOn("/v1/content/models**", () => {
      cy.visit(`/studio?path=${studioPath}`, {
        onBeforeLoad: clearChatHistory,
      });
    });

  beforeEach(() => {
    cy.stubStaffUser();
    visitStudio();
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
    cy.getBySelector("StudioLayersPanel")
      .should("have.attr", "aria-disabled", "true")
      .and("have.attr", "inert");
    cy.getBySelector("StudioLayoutSaveBar").should("exist");
  });

  it("previews the page inside the loader, with the instance's head tags", () => {
    const instanceZUID = new URL(Cypress.config("baseUrl")).host.split(".")[0];
    const loader = [
      "(** loader comment **)",
      '<script src="https://example.test/a.js"></script>',
      '<nav class="e2e-loader">loader</nav>',
      "{{current_view}}",
      "<script>window.e2eLoader = 1;</script>",
    ].join("\n");
    cy.intercept("GET", "**/v1/web/views?status=dev", (req) =>
      req.continue((res) => {
        const views = res.body.data.filter((v) => v.fileName !== "loader");
        views.push({
          ...views[0],
          ZUID: "11-e2e-loader",
          fileName: "loader",
          code: loader,
          contentModelZUID: null,
        });
        res.body.data = views;
      })
    );
    cy.intercept("GET", "**/v1/web/headtags", {
      data: [
        {
          ZUID: "21-e2e-1",
          type: "link",
          resourceZUID: instanceZUID,
          sort: 1,
          attributes: {
            rel: "stylesheet",
            href: 'https://fonts.test/css?a=1&b="2"',
          },
        },
        {
          ZUID: "21-e2e-2",
          type: "meta",
          resourceZUID: "7-not-this-page",
          sort: 2,
          attributes: { name: "e2e-other-item" },
        },
        {
          ZUID: "21-e2e-3",
          type: "img src=x onerror",
          resourceZUID: instanceZUID,
          sort: 3,
          attributes: {},
        },
      ],
    });
    stubMcp((body) => mcpReply([setValue(editSource(body.code))]));
    stubPvl({ statusCode: 200, body: "<p>Rendered by PVL</p>" });
    visitStudio();
    openAiPanel();
    sendPrompt("Add a line under the heading");

    cy.wait("@pvl").then(({ request }) => {
      expect(request.body).to.contain('<nav class="e2e-loader">loader</nav>');
      expect(request.body).to.contain(ADDED_LINE);
      expect(request.body).not.to.contain("current_view");
      expect(request.body).not.to.contain("<script");
      expect(request.body).not.to.contain("loader comment");
    });
    cy.getBySelector("StudioAIPreviewFrame")
      .should("have.attr", "srcdoc")
      .and(
        "contain",
        '<link rel="stylesheet" href="https://fonts.test/css?a=1&amp;b=&quot;2&quot;">'
      )
      .and("not.contain", "e2e-other-item")
      .and("not.contain", "onerror")
      .and("contain", "/site.css");
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

  it("survives replies it cannot render", () => {
    stubMcp(
      () => ({ data: null, message: "", tools: [] }),
      // Unvalidated, the scalar reaches the transcript and the render reads
      // `payload` off it.
      () => mcpReply([42, { type: "NAVIGATE" }]),
      () => mcpReply([{ type: "SET_VALUE" }]),
      () => mcpReply([setValue("  \n ")])
    );
    openAiPanel();

    sendPrompt("First");
    cy.getBySelector("StudioAIPanel").should(
      "contain",
      "Error parsing AI response"
    );

    sendPrompt("Second");
    cy.getBySelector("AIChatMessage").should("have.text", "42");
    cy.getBySelector("AIChatNavigate").should("not.exist");

    sendPrompt("Third");
    cy.getBySelector("AIChatUserInput").should("have.length", 3);
    cy.getBySelector("StudioHeader").should("exist");
    cy.getBySelector("StudioAIPreview").should("not.exist");

    // A blank file is refused, and no line counts are shown for it.
    sendPrompt("Fourth");
    cy.contains("The assistant returned an empty file").should("exist");
    cy.getBySelector("AIChatCodeEdit").should("not.exist");
    cy.getBySelector("StudioLayoutSaveBar").should("not.exist");
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

    cy.getBySelector("StudioAIPreviewError")
      .should("contain.text", "rejected the file or could not be reached")
      .and("contain.text", "external stylesheet")
      .and("contain.text", "Review the change before saving");
  });

  it("leaves a staged AI change alone when a mode switch discards content", () => {
    let staged = "";
    let nextTurnInput = "";
    stubMcp(
      (body) => {
        staged = editSource(body.code);
        return mcpReply([setValue(staged)]);
      },
      (body) => {
        nextTurnInput = body.code;
        return mcpReply([]);
      }
    );
    stubPvl({ statusCode: 200, body: "<p>preview</p>" });
    openAiPanel();
    sendPrompt("Add a line under the heading");
    cy.wait("@pvl");

    cy.window().then((win) => {
      win.zestyStore.dispatch({ type: "MARK_ITEM_DIRTY", itemZUID });
      // Discarding content reloads the preview; its bridge re-sends the
      // template map, which must not replace the staged file.
      win.__templateMaps = 0;
      win.addEventListener("message", (evt) => {
        if (evt.data?.message?.type === "TEMPLATE_SOURCE_MAP") {
          win.__templateMaps++;
        }
      });
    });
    cy.getBySelector("StudioModeToggleOption-layout").click();
    cy.getBySelector("PendingEditsModalDiscard").click();
    cy.getBySelector("PendingEditsModal").should("not.exist");

    cy.getBySelector("StudioModeToggleOption-layout").should(
      "have.attr",
      "aria-pressed",
      "true"
    );
    cy.getBySelector("StudioAIPreview").should("exist");
    cy.getBySelector("StudioLayoutSaveBar").should("exist");

    cy.window().its("__templateMaps", { timeout: 30000 }).should("be.gte", 1);
    sendPrompt("Anything else?");
    cy.then(() => expect(nextTurnInput).to.eq(staged));
  });

  it("cancel drops every staged turn and returns to the live canvas", () => {
    stubMcp((body) => mcpReply([setValue(editSource(body.code))]));
    stubPvl({ statusCode: 200, body: "<p>preview</p>" });
    // Whether a reload or tab close would be held for confirmation.
    const holdsUnload = () =>
      cy.window().then((win) => {
        const evt = new win.Event("beforeunload", { cancelable: true });
        win.dispatchEvent(evt);
        return evt.defaultPrevented;
      });
    holdsUnload().should("eq", false);
    openAiPanel();
    sendPrompt("Add a line under the heading");
    cy.getBySelector("StudioAIPreview").should("exist");
    holdsUnload().should("eq", true);

    cy.getBySelector("StudioLayoutCancelButton").click();
    cy.getBySelector("StudioAIPreview").should("not.exist");
    holdsUnload().should("eq", false);
    cy.getBySelector("StudioLayoutSaveBar").should("not.exist");
    cy.getBySelector("StudioSaveStatus").should("not.exist");
    cy.getBySelector("StudioLayersPanel").should(
      "not.have.attr",
      "aria-disabled"
    );
  });

  it("keeps the transcript for the page's lifetime only", () => {
    stubMcp(() => ({ data: "Nothing to change.", message: "", tools: [] }));
    openAiPanel();
    sendPrompt("Anything to change?");
    cy.getBySelector("AIChatMessage").should("have.length", 1);

    cy.getBySelector("AIChatClose").click();
    openAiPanel();
    cy.getBySelector("AIChatMessage").should("have.length", 1);
    cy.window().then((win) => {
      const stored = Object.keys(win.localStorage).filter((key) =>
        key.startsWith("ai-drawer-")
      );
      expect(stored, "nothing persisted").to.be.empty;
    });

    cy.reload();
    openAiPanel();
    cy.getBySelector("AIChatUserInput").should("not.exist");
    cy.getBySelector("AIChatMessage").should("not.exist");
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

  // Writes the seeded view.
  it("saves the staged AI change when leaving replaces a mode-switch prompt", () => {
    stubMcp((body) => mcpReply([setValue(editSource(body.code))]));
    stubPvl({ statusCode: 200, body: "<p>preview</p>" });
    cy.intercept("PUT", `/v1/web/views/${viewZUID}`).as("updateWebView");
    openAiPanel();
    sendPrompt("Add a line under the heading");
    cy.wait("@pvl");

    cy.window().then((win) =>
      win.zestyStore.dispatch({ type: "MARK_ITEM_DIRTY", itemZUID })
    );
    cy.getBySelector("StudioModeToggleOption-layout").click();
    cy.getBySelector("PendingEditsModal").should("exist");

    // Browser Back while the mode-switch prompt is open: the route-leave
    // prompt takes it over.
    cy.window().then((win) => {
      win.history.pushState(null, "", "/launchpad");
      win.dispatchEvent(new win.PopStateEvent("popstate", { state: null }));
    });
    cy.getBySelector("PendingEditsModalSave").click();

    cy.wait("@updateWebView");
    // pushState already set the URL; Studio unmounting is the navigation.
    cy.getBySelector("StudioHeader").should("not.exist");
    cy.location("pathname").should("eq", "/launchpad");
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

    // A later, non-AI layout edit is not "Saved".
    cy.window().then((win) => {
      const post = (message) =>
        win.postMessage({ source: "studio-bridge", message }, "*");
      post({
        type: "TEMPLATE_SOURCE_MAP",
        templateSourceByCodeId: {
          "11-ai-other-view": '<div data-layout-id="1">One</div>',
        },
      });
      post({
        type: "REORDER_OUTPUT",
        regions: [
          {
            codeId: "11-ai-other-view",
            orderedLayoutIds: ["1"],
            layoutStructure: [{ layoutId: "1", parentLayoutId: null }],
          },
        ],
        primaryCodeId: "11-ai-other-view",
      });
    });
    cy.getBySelector("StudioLayoutSaveBar").should("exist");
    cy.getBySelector("StudioSaveStatus").should("not.exist");
    cy.getBySelector("StudioLayoutCancelButton").click();
  });
});

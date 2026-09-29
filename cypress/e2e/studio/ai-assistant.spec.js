describe("Studio AI Assistant", () => {
  const MCP_CLIENT = /\/client$/;
  const PVL = /\/-\/pvl\//;
  // The literal $& catches a string replacer anywhere between reply and PVL.
  const ADDED_LINE = '  <p class="studio-e2e-ai">Added by AI $&</p>';

  let studioPath = "/";
  let itemZUID = "";
  let modelZUID = "";
  let viewZUID = "";
  let viewFileName = "";
  let otherPath = "/";

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
    cy.task("seed:content", "fixtures/studio.json").then(({ items }) => {
      otherPath = `/${items[0].web.pathPart}`;
    });
  });

  // The transcript persists per page in localStorage, and this suite does not
  // isolate storage between tests.
  const clearChatHistory = (win) =>
    Object.keys(win.localStorage)
      .filter((key) => key.startsWith("ai-drawer-"))
      .forEach((key) => win.localStorage.removeItem(key));

  // Waits for the page's view list too, so a test that visits again never
  // aborts a request an intercept of its own has caught.
  const visitStudio = () => {
    cy.intercept("GET", "**/v1/web/views?status=dev").as("webViews");
    cy.waitOn("/v1/content/models**", () => {
      cy.visit(`/studio?path=${studioPath}`, {
        onBeforeLoad: clearChatHistory,
      });
    });
    cy.wait("@webViews");
  };

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
      .replace("</h1>\n", () => `</h1>\n${ADDED_LINE}\n`)
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

  // A staged AI change locks layout editing for as long as its preview shows.
  const expectPreviewing = (previewing) =>
    previewing
      ? cy
          .getBySelector("StudioLayersPanel")
          .should("have.attr", "aria-disabled", "true")
      : cy
          .getBySelector("StudioLayersPanel")
          .should("not.have.attr", "aria-disabled");

  // Stands in for the preview document: the real preview is cross-origin, so
  // commands the host sends it are echoed back to the parent to be read. The
  // bridge's replies are posted from the parent, as the bridge would.
  const HOST_COMMAND = "E2E_HOST_COMMAND";
  const CANVAS_LOADED = "E2E_CANVAS_LOADED";
  const serveEchoCanvas = () =>
    cy.intercept(
      // PVL is a POST, so only the canvas document matches.
      { method: "GET", url: /[?&]studio=bridge/ },
      {
        headers: { "content-type": "text/html" },
        body:
          "<!doctype html><html><body><p>canvas</p><script>" +
          "parent.postMessage({source:'studio-bridge',message:{type:'" +
          CANVAS_LOADED +
          "'}},'*');" +
          "window.addEventListener('message',function(e){" +
          "var d=e.data;if(!d||d.source!=='zesty-studio-host')return;" +
          "parent.postMessage({source:'studio-bridge',message:{type:'" +
          HOST_COMMAND +
          "',payload:d.message.payload}},'*');});" +
          "</script></body></html>",
      }
    );
  const recordHostCommands = () =>
    cy.window().then((win) => {
      win.__hostCommands = [];
      win.__canvasLoads = 0;
      win.addEventListener("message", (evt) => {
        if (evt.data?.message?.type === HOST_COMMAND) {
          win.__hostCommands.push(evt.data.message.payload);
        }
        if (evt.data?.message?.type === CANVAS_LOADED) win.__canvasLoads++;
      });
    });
  // The canvas document may still be loading when a test starts, and a
  // command posted before its listener exists is lost. Each retry has the
  // host post again (its answer to BRIDGE_READY) until one is echoed.
  const awaitEchoCanvas = () =>
    cy.window().should((win) => {
      win.dispatchEvent(
        new win.MessageEvent("message", {
          data: { source: "studio-bridge", message: { type: "BRIDGE_READY" } },
        })
      );
      expect(win.__hostCommands.map((c) => c.action)).to.include(
        "requestLayersTree"
      );
    });
  const paintCommand = () =>
    cy
      .window()
      .its("__hostCommands")
      .should((commands) => {
        expect(
          commands.filter((c) => c.action === "replaceCodeRegion")
        ).to.have.length(1);
      })
      .then((commands) =>
        commands.find((c) => c.action === "replaceCodeRegion")
      );
  const replyFromBridge = (message) =>
    cy
      .window()
      .then((win) =>
        win.postMessage({ source: "studio-bridge", message }, "*")
      );

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
      expect(request.url).to.match(
        /^https:\/\/[^/]+\/-\/pvl\/\?studio=bridge$/
      );
      expect(request.headers.authorization).to.match(/^Bearer \S+/);
      expect(request.body).to.contain('name="parsley"');
      expect(request.body).to.contain(ADDED_LINE);
      expect(request.body).to.contain('name="zuid"');
      expect(request.body).to.contain(itemZUID);
    });

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

  it("paints the PVL render into the canvas through the bridge", () => {
    serveEchoCanvas();
    stubMcp((body) => mcpReply([setValue(editSource(body.code))]));
    stubPvl({ statusCode: 200, body: '<p class="studio-e2e-ai">Painted</p>' });
    visitStudio();
    recordHostCommands();
    awaitEchoCanvas();
    openAiPanel();
    sendPrompt("Add a line under the heading");

    cy.wait("@pvl");
    cy.getBySelector("StudioAIPreviewStatus").should(
      "contain.text",
      "Rendering the preview"
    );
    paintCommand().then((command) => {
      expect(command.codeId).to.eq(viewZUID);
      expect(command.html).to.eq('<p class="studio-e2e-ai">Painted</p>');
      replyFromBridge({
        type: "CODE_REGION_REPLACED",
        codeId: viewZUID,
        ok: true,
        count: 1,
        requestId: command.requestId,
      });
    });
    cy.getBySelector("StudioAIPreviewStatus").should("not.exist");
    cy.getBySelector("StudioAIPreviewError").should("not.exist");
    expectPreviewing(true);
    cy.getBySelector("StudioLayoutSaveBar").should("exist");

    // The canvas is locked as soon as the change is staged, before the paint,
    // and unlocked when it is dropped.
    const locks = (commands) =>
      commands
        .filter((c) => c.action === "setPreviewLock")
        .map((c) => c.locked);
    cy.window()
      .its("__hostCommands")
      .then((commands) => {
        const actions = commands.map((c) => c.action);
        expect(locks(commands)).to.deep.eq([true]);
        expect(actions.indexOf("setPreviewLock")).to.be.lessThan(
          actions.indexOf("replaceCodeRegion")
        );
      });
    cy.getBySelector("StudioLayoutCancelButton").click();
    cy.window()
      .its("__hostCommands")
      .should((commands) => expect(locks(commands)).to.deep.eq([true, false]));
  });

  it("repaints and relocks the canvas when it reloads under a staged change", () => {
    serveEchoCanvas();
    stubMcp((body) => mcpReply([setValue(editSource(body.code))]));
    stubPvl({ statusCode: 200, body: '<p class="studio-e2e-ai">Painted</p>' });
    visitStudio();
    recordHostCommands();
    awaitEchoCanvas();
    openAiPanel();
    sendPrompt("Add a line under the heading");
    paintCommand().then((command) =>
      replyFromBridge({
        type: "CODE_REGION_REPLACED",
        codeId: viewZUID,
        ok: true,
        count: 1,
        requestId: command.requestId,
      })
    );
    cy.getBySelector("StudioAIPreviewStatus").should("not.exist");

    // Discarding content through a mode switch reloads the canvas and leaves
    // the AI change staged.
    cy.window().then((win) => {
      win.zestyStore.dispatch({ type: "MARK_ITEM_DIRTY", itemZUID });
      win.__canvasLoads = 0;
    });
    cy.getBySelector("StudioModeToggleOption-layout").click();
    cy.getBySelector("PendingEditsModalDiscard").click();
    cy.window().its("__canvasLoads", { timeout: 30000 }).should("be.gte", 1);
    expectPreviewing(true);

    // The reloaded canvas announces itself as the bridge would.
    cy.window().then((win) => {
      win.__hostCommands = [];
    });
    awaitEchoCanvas();
    cy.window()
      .its("__hostCommands")
      .should((commands) => {
        expect(
          commands.some((c) => c.action === "setPreviewLock" && c.locked)
        ).to.eq(true);
        const repaints = commands.filter(
          (c) => c.action === "replaceCodeRegion"
        );
        expect(repaints).to.have.length.of.at.least(1);
        repaints.forEach((c) => {
          expect(c.codeId).to.eq(viewZUID);
          expect(c.html).to.eq('<p class="studio-e2e-ai">Painted</p>');
        });
      });
    cy.getBySelector("StudioAIPreviewStatus").should(
      "contain.text",
      "Rendering the preview"
    );
  });

  it("ignores a reply for an earlier paint, and still takes a late one", () => {
    serveEchoCanvas();
    stubMcp((body) => mcpReply([setValue(editSource(body.code))]));
    stubPvl({ statusCode: 200, body: "<p>preview</p>" });
    visitStudio();
    recordHostCommands();
    awaitEchoCanvas();
    openAiPanel();
    sendPrompt("Add a line under the heading");

    paintCommand().then((command) => {
      replyFromBridge({
        type: "CODE_REGION_REPLACED",
        codeId: viewZUID,
        ok: true,
        count: 1,
        requestId: command.requestId + 100,
      });
      // Not taken as this paint's answer: the canvas still times out.
      cy.getBySelector("StudioAIPreviewError").should(
        "contain.text",
        "did not respond"
      );
      // The real answer, arriving after the timeout, still counts.
      replyFromBridge({
        type: "CODE_REGION_REPLACED",
        codeId: viewZUID,
        ok: true,
        count: 1,
        requestId: command.requestId,
      });
    });
    cy.getBySelector("StudioAIPreviewError").should("not.exist");
    cy.getBySelector("StudioAIPreviewStatus").should("not.exist");
  });

  it("says so when the canvas cannot paint the preview", () => {
    serveEchoCanvas();
    stubMcp((body) => mcpReply([setValue(editSource(body.code))]));
    stubPvl({ statusCode: 200, body: "<p>preview</p>" });
    visitStudio();
    recordHostCommands();
    awaitEchoCanvas();
    openAiPanel();

    // The bridge answers that the view's region is not on the page.
    sendPrompt("Add a line under the heading");
    paintCommand().then((command) =>
      replyFromBridge({
        type: "CODE_REGION_REPLACED",
        codeId: viewZUID,
        ok: false,
        count: 0,
        reason: "region-not-found",
        requestId: command.requestId,
      })
    );
    cy.getBySelector("StudioAIPreviewError")
      .should("contain.text", "does not show this page's view")
      .and("contain.text", "still staged");
    cy.getBySelector("StudioLayoutSaveBar").should("exist");

    // A canvas without the bridge never answers.
    sendPrompt("Add another line");
    cy.getBySelector("StudioAIPreviewStatus").should("exist");
    cy.getBySelector("StudioAIPreviewError").should(
      "contain.text",
      "did not respond"
    );
    expectPreviewing(true);
  });

  it("ignores canvas gestures while a preview is showing", () => {
    serveEchoCanvas();
    stubMcp((body) => mcpReply([setValue(editSource(body.code))]));
    stubPvl({ statusCode: 200, body: "<p>preview</p>" });
    visitStudio();
    recordHostCommands();
    awaitEchoCanvas();
    const bridgeMessage = (win, message) =>
      new win.MessageEvent("message", {
        data: { source: "studio-bridge", message },
      });
    // A canvas mousedown, then a BRIDGE_READY probe the host answers with
    // requestLayersTree. Both are handled synchronously and the canvas echoes
    // commands in order, so once the probe's answer is back, a selection the
    // mousedown caused would already have been posted.
    const selectThenProbe = () =>
      cy.window().then((win) => {
        win.__hostCommands = [];
        win.dispatchEvent(
          bridgeMessage(win, {
            type: "DOM_EVENT",
            eventType: "mousedown",
            element: { dataset: { codeId: viewZUID, layoutId: "2" } },
            breadcrumb: [{ layoutId: "2", label: "h1" }],
          })
        );
        win.dispatchEvent(bridgeMessage(win, { type: "BRIDGE_READY" }));
      });
    const selectionPosted = () =>
      cy
        .window()
        .its("__hostCommands")
        .should((commands) =>
          expect(commands.map((c) => c.action)).to.include("requestLayersTree")
        )
        .then((commands) =>
          commands.some(
            (c) =>
              c.action === "addClassByLayoutId" &&
              c.className === "studio-selected"
          )
        );

    // Control: with nothing staged the mousedown selects. Retried, because
    // the listener picks up layout mode in an effect after the render that
    // shows it, and a mousedown in content mode selects nothing.
    cy.getBySelector("StudioAIButton").should("exist");
    cy.window().then((win) => {
      win.__hostCommands = [];
    });
    cy.window().should((win) => {
      win.dispatchEvent(
        bridgeMessage(win, {
          type: "DOM_EVENT",
          eventType: "mousedown",
          element: { dataset: { codeId: viewZUID, layoutId: "2" } },
          breadcrumb: [{ layoutId: "2", label: "h1" }],
        })
      );
      expect(
        win.__hostCommands.some(
          (c) =>
            c.action === "addClassByLayoutId" &&
            c.className === "studio-selected"
        )
      ).to.eq(true);
    });

    openAiPanel();
    sendPrompt("Add a line under the heading");
    expectPreviewing(true);
    selectThenProbe();
    selectionPosted().should("eq", false);
  });
  it("stages a reply that lands in the same render as a fields update", () => {
    stubMcp((body) => mcpReply([setValue(editSource(body.code))]));
    stubPvl({ statusCode: 200, body: "<p>preview</p>" });
    openAiPanel();
    // Rebuild the fields store in the same dispatch that resolves the MCP
    // call, so React commits both together, as a field fetch landing with
    // the reply does.
    cy.window().then((win) => {
      let fired = false;
      win.zestyStore.subscribe(() => {
        if (fired) return;
        const mutations = win.zestyStore.getState().mcpApi?.mutations || {};
        const resolved = Object.values(mutations).some(
          (m) =>
            m?.endpointName === "geminiGeneration" && m.status === "fulfilled"
        );
        if (!resolved) return;
        fired = true;
        win.zestyStore.dispatch({ type: "FETCH_FIELDS_SUCCESS", payload: {} });
      });
    });
    sendPrompt("Add a line under the heading");

    cy.getBySelector("AIChatCodeEdit").should("exist");
    expectPreviewing(true);
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
    expectPreviewing(false);
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
    expectPreviewing(false);

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
      .and("contain.text", "content filter")
      .and("contain.text", "external stylesheet")
      .and("contain.text", "still staged");
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
    expectPreviewing(true);
    cy.getBySelector("StudioLayoutSaveBar").should("exist");

    cy.window().its("__templateMaps", { timeout: 30000 }).should("be.gte", 1);
    sendPrompt("Anything else?");
    cy.then(() => expect(nextTurnInput).to.eq(staged));
  });

  it("notes a discard only in the transcript of the page it happened on", () => {
    const navigate = (path) =>
      mcpReply([
        { type: "NAVIGATE", payload: { path: `/studio?path=${path}` } },
      ]);
    const edit = (body) => mcpReply([setValue(editSource(body.code))]);
    stubMcp(
      edit,
      () => navigate(otherPath),
      edit,
      () => navigate(studioPath)
    );
    stubPvl({ statusCode: 200, body: "<p>preview</p>" });
    openAiPanel();

    // Page A: stage, then cancel.
    sendPrompt("Add a line under the heading");
    expectPreviewing(true);
    cy.getBySelector("StudioLayoutCancelButton").click();
    cy.getBySelector("AIChatNotice").should("have.length", 1);

    // Page B, in-app: stage, then cancel.
    sendPrompt("Go to the other page");
    cy.getBySelector("AIChatNavigate").last().click();
    cy.location("search").should("eq", `?path=${otherPath}`);
    cy.getBySelector("AIChatNotice").should("not.exist");
    sendPrompt("Add a line under the heading");
    expectPreviewing(true);
    cy.getBySelector("StudioLayoutCancelButton").click();
    cy.getBySelector("AIChatNotice").should("have.length", 1);

    // Back on A, its transcript still records only its own discard.
    sendPrompt("Go back");
    cy.getBySelector("AIChatNavigate").last().click();
    cy.location("search").should("eq", `?path=${studioPath}`);
    cy.getBySelector("AIChatCodeEdit").should("have.length", 1);
    cy.getBySelector("AIChatNotice").should("have.length", 1);
  });

  it("notes a discard made while the panel is closed, once", () => {
    stubMcp((body) => mcpReply([setValue(editSource(body.code))]));
    stubPvl({ statusCode: 200, body: "<p>preview</p>" });
    openAiPanel();
    sendPrompt("Add a line under the heading");
    expectPreviewing(true);

    cy.getBySelector("AIChatClose").click();
    cy.getBySelector("StudioLayoutCancelButton").click();
    expectPreviewing(false);
    openAiPanel();
    cy.getBySelector("AIChatNotice").should("have.length", 1);
  });

  it("cancel drops every staged turn and returns to the live canvas", () => {
    stubMcp((body) => mcpReply([setValue(editSource(body.code))]));
    stubPvl({ statusCode: 200, body: "<p>preview</p>" });
    // Whether a reload or tab close would be held for confirmation. Retried,
    // since the listener is attached in a passive effect.
    const holdsUnload = (expected) =>
      cy.window().should((win) => {
        const evt = new win.Event("beforeunload", { cancelable: true });
        win.dispatchEvent(evt);
        expect(evt.defaultPrevented).to.eq(expected);
      });
    holdsUnload(false);
    openAiPanel();
    sendPrompt("Add a line under the heading");
    expectPreviewing(true);
    holdsUnload(true);

    cy.getBySelector("StudioLayoutCancelButton").click();
    expectPreviewing(false);
    holdsUnload(false);
    cy.getBySelector("AIChatNotice").should("have.text", "Changes discarded");
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
    expectPreviewing(true);
    sendPrompt("Take me to the content item");

    cy.getBySelector("AIChatNavigate").click();
    cy.getBySelector("PendingEditsModal").should("exist");
    cy.getBySelector("PendingEditsModalCancel").click();
    cy.location("pathname").should("eq", "/studio");
    expectPreviewing(true);

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
  // Writes the seeded view.
  it("keeps canvas edits sent during a preview out of the saved view", () => {
    // A staged file with elements that carry layout ids, so a canvas edit or
    // reorder would have something to act on. Appended rather than found:
    // earlier tests save their own versions of this view.
    stubMcp((body) =>
      mcpReply([
        setValue(
          `${body.code}\n<div class="e2e-canvas-one" data-layout-id="5">One</div>\n<div class="e2e-canvas-two" data-layout-id="6">Two</div>\n`
        ),
      ])
    );
    stubPvl({ statusCode: 200, body: "<p>preview</p>" });
    cy.intercept("PUT", `/v1/web/views/${viewZUID}`).as("updateWebView");
    openAiPanel();
    sendPrompt("Add a line under the heading");
    cy.wait("@pvl");
    expectPreviewing(true);

    cy.window().then((win) => {
      const fromCanvas = (message) =>
        win.dispatchEvent(
          new win.MessageEvent("message", {
            data: { source: "studio-bridge", message },
          })
        );
      fromCanvas({
        type: "LAYOUT_CONTENT_UPDATE",
        codeId: viewZUID,
        layoutId: "5",
        innerHtml: "Typed on the canvas",
      });
      fromCanvas({
        type: "REORDER_OUTPUT",
        regions: [
          {
            codeId: viewZUID,
            orderedLayoutIds: ["6", "5"],
            layoutStructure: [
              { layoutId: "6", parentLayoutId: null },
              { layoutId: "5", parentLayoutId: null },
            ],
          },
        ],
        primaryCodeId: viewZUID,
      });
    });

    cy.getBySelector("StudioLayoutSaveChangesButton").click();
    cy.getBySelector("StudioSaveAllButton").click();
    cy.wait("@updateWebView").then(({ request }) => {
      // The ids make the save re-serialize the file, so it is compared by
      // what the canvas edits would have changed rather than byte for byte.
      const code = request.body.code;
      expect(code).to.contain('<div class="e2e-canvas-one">One</div>');
      expect(code).not.to.contain("Typed on the canvas");
      expect(code.indexOf("e2e-canvas-two")).to.be.greaterThan(
        code.indexOf("e2e-canvas-one")
      );
    });
  });

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
    expectPreviewing(false);
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

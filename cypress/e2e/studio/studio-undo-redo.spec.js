// Studio undo/redo — the host half.
//
// The canvas DOM is restored by the bridge from its own snapshots, and the
// real preview is cross-origin, so these specs cover what the host does: the
// buttons and their capability gate, the staged state an undo puts back, and
// the history commands it sends the canvas. The preview document is served by
// an intercept that echoes every host command back to the parent, which is
// how the commands are read; the bridge's own messages are posted from the
// parent, as the other studio specs do.
describe("Studio Undo / Redo", () => {
  const MCP_CLIENT = /\/client$/;
  const ORIGINAL_TITLE = "Studio Title";
  const EDITED_TITLE = "Studio Title Undo Redo";

  let studioPath = "/";
  let itemZUID = "";
  let modelZUID = "";
  let titleFieldZUID = "";
  let seededPage = null;

  before(() => {
    cy.task("seed:content", "fixtures/studio.json").then(
      ({ model, fields, items }) => {
        itemZUID = items[0].meta.ZUID;
        modelZUID = model.ZUID;
        studioPath = `/${items[0].web.pathPart}`;
        seededPage = items[0];
        titleFieldZUID = fields.find((field) => field.name === "title")?.ZUID;
        expect(titleFieldZUID, "seeded title field").to.be.a("string").and.not
          .be.empty;
      }
    );
  });

  after(() => {
    if (modelZUID) cy.deleteModel(modelZUID);
  });

  // The search index is eventually consistent; a page seeded moments ago can
  // be missing from Studio's one path search. Fill it in only when empty.
  const indexSeededPage = () =>
    cy
      .intercept(
        { method: "GET", url: "**/search/items**", query: { field: "path" } },
        (req) =>
          req.continue((res) => {
            const data = res.body?.data;
            const isSeeded =
              seededPage &&
              req.query.q.replace(/^\/|\/$/g, "") === seededPage.web.pathPart;
            if (isSeeded && Array.isArray(data) && data.length === 0) {
              data.push(seededPage);
            }
          })
      )
      .as("resolveItemByPath");

  const HOST_COMMAND = "E2E_HOST_COMMAND";
  const serveEchoCanvas = () =>
    cy.intercept(
      { method: "GET", url: /[?&]studio=bridge/ },
      {
        headers: { "content-type": "text/html" },
        body:
          "<!doctype html><html><body><p>canvas</p><script>" +
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
      win.addEventListener("message", (evt) => {
        if (evt.data?.message?.type === HOST_COMMAND) {
          win.__hostCommands.push(evt.data.message.payload);
        }
      });
    });

  // Queries only, so a following .should retries the whole read.
  const hostCommands = (action) =>
    cy
      .window()
      .its("__hostCommands")
      .invoke("filter", (cmd) => cmd.action === action);

  const postBridgeMessage = (message) =>
    cy.window().then(
      (win) =>
        new Cypress.Promise((resolve) => {
          win.requestAnimationFrame(() => {
            win.requestAnimationFrame(() => {
              win.postMessage({ source: "studio-bridge", message }, "*");
              resolve();
            });
          });
        })
    );

  // The canvas may still be loading when a test starts, and a command posted
  // before its listener exists is lost. Each retry posts BRIDGE_READY again
  // until the host's answer to it is echoed.
  const bridgeReady = (capabilities) =>
    cy.window().should((win) => {
      win.dispatchEvent(
        new win.MessageEvent("message", {
          data: {
            source: "studio-bridge",
            message: { type: "BRIDGE_READY", capabilities },
          },
        })
      );
      expect(win.__hostCommands.map((cmd) => cmd.action)).to.include(
        "requestLayersTree"
      );
    });

  const storedTitle = () =>
    cy
      .window()
      .its("zestyStore")
      .invoke("getState")
      .its("content")
      .its(itemZUID)
      .its("data.title");

  // Content mode, with the page's title field open in the side panel.
  const openTitleField = () => {
    cy.getBySelector("StudioModeToggleOption-content").click();
    cy.getBySelector("StudioSidePanel").should("exist");
    cy.window().should((win) => {
      expect(
        win.zestyStore.getState().content[itemZUID]?.data?.title,
        "page item hydrated in store"
      ).to.eq(ORIGINAL_TITLE);
    });
    // Resolving the page clears the selection, and can land after a click.
    // Re-select until the field is open.
    cy.get("body").should(($body) => {
      if (!$body.find('[data-cy="EditorField-title"]').length) {
        const win = $body[0].ownerDocument.defaultView;
        win.dispatchEvent(
          new win.MessageEvent("message", {
            data: {
              source: "studio-bridge",
              message: {
                type: "DOM_EVENT",
                eventType: "click",
                element: {
                  dataset: {
                    studioId: `${itemZUID}:title`,
                    fieldZuid: titleFieldZUID,
                    fieldType: "text",
                    itemZuid: itemZUID,
                    modelZuid: modelZUID,
                  },
                },
              },
            },
          })
        );
      }
      expect($body.find('[data-cy="EditorField-title"]')).to.have.length(1);
    });
    cy.getBySelector("EditorField-title").should("have.value", ORIGINAL_TITLE);
  };

  // Types into the panel and waits out its debounce, so the store holds it.
  const editTitle = () => {
    cy.getBySelector("EditorField-title").clear().type(EDITED_TITLE);
    cy.window().should((win) => {
      expect(win.zestyStore.getState().content[itemZUID]?.data?.title).to.eq(
        EDITED_TITLE
      );
    });
  };

  const pressUndoKey = (subject) =>
    subject.trigger("keydown", {
      eventConstructor: "KeyboardEvent",
      key: "z",
      ctrlKey: true,
      bubbles: true,
    });

  beforeEach(() => {
    cy.stubStaffUser();
    indexSeededPage();
    serveEchoCanvas();
    cy.waitOn("/v1/content/models**", () => {
      cy.visit(`/studio?path=${studioPath}`);
    });
    cy.getBySelector("StudioHeader").should("exist");
    recordHostCommands();
  });

  it("shows undo and redo only when the bridge reports the history capability", () => {
    bridgeReady([]);
    // The host has answered this BRIDGE_READY, so the buttons have had their
    // chance to render.
    cy.getBySelector("StudioUndoButton").should("not.exist");
    cy.getBySelector("StudioRedoButton").should("not.exist");
    hostCommands("historyReset").should("have.length", 0);

    bridgeReady(["history"]);
    cy.getBySelector("StudioUndoButton").should("be.disabled");
    cy.getBySelector("StudioRedoButton").should("be.disabled");
    hostCommands("historyReset").should("have.length.at.least", 1);
  });

  it("undoes a side-panel edit back to the saved value and redoes it", () => {
    bridgeReady(["history"]);
    openTitleField();
    editTitle();

    cy.getBySelector("StudioContentSaveBar").should("exist");
    cy.getBySelector("StudioUndoButton").should("not.be.disabled");
    cy.getBySelector("StudioRedoButton").should("be.disabled");

    cy.getBySelector("StudioUndoButton").click();

    storedTitle().should("eq", ORIGINAL_TITLE);
    cy.getBySelector("EditorField-title").should("have.value", ORIGINAL_TITLE);
    // Back at the save point: nothing is pending, so the bar goes (AC 8).
    cy.getBySelector("StudioContentSaveBar").should("not.exist");
    cy.getBySelector("StudioUndoButton").should("be.disabled");
    cy.getBySelector("StudioRedoButton").should("not.be.disabled");

    // The step was snapshotted with the field it touched, then restored.
    hostCommands("historySnapshot").then((snapshots) => {
      expect(snapshots).to.have.length(1);
      expect(snapshots[0].fields).to.deep.eq([
        { fieldZuid: titleFieldZUID, itemZuid: itemZUID },
      ]);
      hostCommands("historyRestore").should("deep.eq", [
        {
          action: "historyRestore",
          stepId: snapshots[0].stepId,
          direction: "undo",
        },
      ]);
    });

    cy.getBySelector("StudioRedoButton").click();

    storedTitle().should("eq", EDITED_TITLE);
    cy.getBySelector("EditorField-title").should("have.value", EDITED_TITLE);
    cy.getBySelector("StudioContentSaveBar").should("exist");
    cy.getBySelector("StudioRedoButton").should("be.disabled");
    hostCommands("historyRestore")
      .its(1)
      .should("include", { direction: "redo" });
  });

  it("undoes on Ctrl+Z outside a text input and leaves it to the input inside one", () => {
    bridgeReady(["history"]);
    openTitleField();
    editTitle();

    // Inside the input its own undo is in charge.
    pressUndoKey(cy.getBySelector("EditorField-title"));
    storedTitle().should("eq", EDITED_TITLE);
    hostCommands("historyRestore").should("have.length", 0);

    pressUndoKey(cy.get("body"));
    storedTitle().should("eq", ORIGINAL_TITLE);
    hostCommands("historyRestore")
      .should("have.length", 1)
      .its(0)
      .should("include", { direction: "undo" });
  });

  it("undoes when the canvas forwards the shortcut", () => {
    bridgeReady(["history"]);
    openTitleField();
    editTitle();

    postBridgeMessage({ type: "HISTORY_KEY", action: "undo" });
    storedTitle().should("eq", ORIGINAL_TITLE);

    postBridgeMessage({ type: "HISTORY_KEY", action: "redo" });
    storedTitle().should("eq", EDITED_TITLE);
  });

  it("starts a fresh history when the canvas reloads", () => {
    bridgeReady(["history"]);
    openTitleField();
    editTitle();
    cy.getBySelector("StudioUndoButton").click();
    cy.getBySelector("StudioRedoButton").should("not.be.disabled");
    hostCommands("historyReset").then((resets) => {
      const before = resets.length;

      postBridgeMessage({ type: "BRIDGE_READY", capabilities: ["history"] });

      hostCommands("historyReset").should("have.length", before + 1);
    });
    cy.getBySelector("StudioUndoButton").should("be.disabled");
    cy.getBySelector("StudioRedoButton").should("be.disabled");
  });

  it("drops the history but keeps the staged edit when the canvas cannot restore", () => {
    bridgeReady(["history"]);
    openTitleField();
    editTitle();
    cy.getBySelector("StudioUndoButton").click();
    cy.getBySelector("StudioRedoButton").click();
    storedTitle().should("eq", EDITED_TITLE);
    cy.getBySelector("StudioUndoButton").should("not.be.disabled");
    hostCommands("historyReset").then((resets) => {
      const before = resets.length;

      postBridgeMessage({
        type: "HISTORY_RESTORED",
        stepId: 1,
        direction: "redo",
        ok: false,
        reason: "region-not-found",
      });

      hostCommands("historyReset").should("have.length", before + 1);
    });
    cy.getBySelector("StudioUndoButton").should("be.disabled");
    cy.getBySelector("StudioRedoButton").should("be.disabled");
    // The staged edit is still what a save would write.
    storedTitle().should("eq", EDITED_TITLE);
    cy.getBySelector("StudioContentSaveBar").should("exist");
  });

  it("disables undo while an AI request is in flight", () => {
    // Held until released, so the in-flight state can be asserted without a
    // timed wait.
    let releaseReply;
    const replyGate = new Promise((resolve) => {
      releaseReply = resolve;
    });
    cy.intercept({ method: "POST", url: MCP_CLIENT }, (req) =>
      replyGate.then(() =>
        req.reply({
          statusCode: 200,
          body: { data: "```json\n[]\n```", message: "", tools: [] },
        })
      )
    ).as("mcp");

    bridgeReady(["history"]);
    cy.window().should((win) => {
      expect(
        win.zestyStore.getState().content[itemZUID]?.meta?.ZUID,
        "page item hydrated in store"
      ).to.eq(itemZUID);
    });
    // Every content write is recorded, whatever dispatched it.
    cy.window().then((win) => {
      win.zestyStore.dispatch({
        type: "SET_ITEM_DATA",
        itemZUID,
        key: "title",
        value: EDITED_TITLE,
      });
    });
    cy.getBySelector("StudioUndoButton").should("not.be.disabled");

    cy.getBySelector("StudioAIButton").click();
    cy.getBySelector("StudioAIPanel").should("exist");
    cy.get('[data-cy="AIDrawerComposer"] textarea:not([aria-hidden])').type(
      "Make the heading shorter"
    );
    cy.getBySelector("AIDrawerSend").click();
    cy.getBySelector("StudioUndoButton").should("be.disabled");

    cy.then(() => releaseReply());
    cy.wait("@mcp");
    cy.getBySelector("StudioUndoButton").should("not.be.disabled");
  });
});

// Studio undo/redo — the host half.
//
// The canvas DOM is restored by the bridge from its own snapshots, and the
// real preview is cross-origin, so these specs cover what the host does: the
// buttons and their capability gate, the staged state an undo puts back, and
// the history commands it sends the canvas. The preview document is served by
// an intercept that echoes every host command back to the parent, which is
// how the commands are read; the bridge's own messages are posted from the
// parent, as the other studio specs do.
import { v4 as uuidv4 } from "uuid";

describe("Studio Undo / Redo", () => {
  const MCP_CLIENT = /\/client$/;
  const ORIGINAL_TITLE = "Studio Title";
  const EDITED_TITLE = "Studio Title Undo Redo";

  let studioPath = "/";
  let itemZUID = "";
  let modelZUID = "";
  let titleFieldZUID = "";
  let viewZUID = "";
  let seededPage = null;

  before(() => {
    cy.task("seed:content", "fixtures/studio.json").then(
      ({ model, fields, items, view }) => {
        viewZUID = view?.ZUID || "";
        expect(viewZUID, "seeded view").to.match(/^11-/);
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
      .as("pathSearch");

  const HOST_COMMAND = "E2E_HOST_COMMAND";
  const CANVAS_LOADED = "E2E_CANVAS_LOADED";
  const serveEchoCanvas = () =>
    cy.intercept(
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

  // Also answers each historyRestore as the bridge would, per
  // `win.__restoreReply`: "ok"; "fail" (refused, nothing swapped); "throw"
  // (failed mid-swap); or "none" for no answer at all.
  const recordHostCommands = () =>
    cy.window().then((win) => {
      win.__hostCommands = [];
      win.__restoreReply = "ok";
      win.__canvasLoads = 0;
      win.addEventListener("message", (evt) => {
        if (evt.data?.message?.type === CANVAS_LOADED) win.__canvasLoads++;
        if (evt.data?.message?.type !== HOST_COMMAND) return;
        const command = evt.data.message.payload;
        win.__hostCommands.push(command);
        if (command.action !== "historyRestore") return;
        // `__restoreReplies`, when set, answers restores one by one.
        const reply = win.__restoreReplies?.length
          ? win.__restoreReplies.shift()
          : win.__restoreReply;
        if (reply === "none") return;
        const ok = reply === "ok";
        const reason = reply === "throw" ? "restore-failed" : "no-snapshot";
        win.postMessage(
          {
            source: "studio-bridge",
            message: {
              type: "HISTORY_RESTORED",
              stepId: command.stepId,
              direction: command.direction,
              codeIds: [],
              ok,
              ...(ok ? {} : { reason }),
            },
          },
          "*"
        );
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

  // The page item and its model's fields are in the store, so a content
  // write resolves to the field the bridge snapshots.
  const waitForPageHydrated = () =>
    cy.window().should((win) => {
      const state = win.zestyStore.getState();
      expect(
        state.content[itemZUID]?.meta?.ZUID,
        "page item hydrated in store"
      ).to.eq(itemZUID);
      expect(
        Object.values(state.fields || {}).some(
          (field) =>
            field?.contentModelZUID === modelZUID && field?.name === "title"
        ),
        "page model fields in store"
      ).to.eq(true);
    });

  const storedTitle = () =>
    cy
      .window()
      .its("zestyStore")
      .invoke("getState")
      .its("content")
      .its(itemZUID)
      .its("data.title");

  // Selects the title field as a canvas click on it would.
  const selectTitleField = (win) =>
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
        selectTitleField($body[0].ownerDocument.defaultView);
      }
      expect($body.find('[data-cy="EditorField-title"]')).to.have.length(1);
    });
    cy.getBySelector("EditorField-title").should("have.value", ORIGINAL_TITLE);
  };

  // Enters the edit in the panel, as typing would, and waits out its
  // debounce, so the store holds it. The page's late path resolution can
  // clear the selection or reload the field mid-edit; then the field is
  // reopened and the value entered again.
  const editTitle = () => {
    cy.get("body").should(($body) => {
      const win = $body[0].ownerDocument.defaultView;
      const stored = win.zestyStore.getState().content[itemZUID]?.data?.title;
      if (stored !== EDITED_TITLE) {
        const input = $body.find('[data-cy="EditorField-title"]')[0];
        if (!input) selectTitleField(win);
        else if (!input.disabled && input.value !== EDITED_TITLE) {
          Object.getOwnPropertyDescriptor(
            win.HTMLInputElement.prototype,
            "value"
          ).set.call(input, EDITED_TITLE);
          input.dispatchEvent(new win.Event("input", { bubbles: true }));
        }
      }
      expect(stored).to.eq(EDITED_TITLE);
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
    // It is re-snapshotted as it goes; every snapshot is the one step's.
    hostCommands("historySnapshot").then((snapshots) => {
      expect(snapshots).to.have.length.at.least(1);
      const { stepId } = snapshots[0];
      snapshots.forEach((snapshot) => {
        expect(snapshot.stepId).to.eq(stepId);
        expect(snapshot.fields).to.deep.eq([
          { fieldZuid: titleFieldZUID, itemZuid: itemZUID },
        ]);
      });
      hostCommands("historyRestore").should("deep.eq", [
        { action: "historyRestore", stepId, direction: "undo" },
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

  it("lands a panel edit still in its debounce before undoing it", () => {
    bridgeReady(["history"]);
    openTitleField();
    // An earlier step on another field, so Undo is enabled before the typing
    // below has committed.
    cy.window().then((win) => {
      win.zestyStore.dispatch({
        type: "SET_ITEM_DATA",
        itemZUID,
        key: "body",
        value: "Edited body",
      });
    });
    cy.getBySelector("StudioUndoButton").should("not.be.disabled");

    // Undo straight after typing, inside the panel's 500ms debounce: the
    // typing is what gets undone, not the earlier step.
    cy.getBySelector("EditorField-title").type(" more");
    cy.getBySelector("StudioUndoButton").click();

    storedTitle().should("eq", ORIGINAL_TITLE);
    cy.getBySelector("EditorField-title").should("have.value", ORIGINAL_TITLE);
    cy.window()
      .its("zestyStore")
      .invoke("getState")
      .its("content")
      .its(itemZUID)
      .its("data.body")
      .should("eq", "Edited body");
    cy.getBySelector("StudioRedoButton").click();
    storedTitle().should("eq", `${ORIGINAL_TITLE} more`);
  });

  it("leaves the shortcut alone while a modal is open over Studio", () => {
    bridgeReady(["history"]);
    openTitleField();
    editTitle();

    cy.getBySelector("StudioContentSaveChangesButton").click();
    cy.getBySelector("StudioSaveChangesModal").should("exist");
    pressUndoKey(cy.get("body"));
    postBridgeMessage({ type: "HISTORY_KEY", action: "undo" });
    storedTitle().should("eq", EDITED_TITLE);
    hostCommands("historyRestore").should("have.length", 0);

    cy.getBySelector("StudioSaveChangesCancelButton").click();
    cy.getBySelector("StudioSaveChangesModal").should("not.exist");
    // Messages are handled in order, so exactly one restore means the one
    // sent behind the modal was ignored.
    postBridgeMessage({ type: "HISTORY_KEY", action: "undo" });
    storedTitle().should("eq", ORIGINAL_TITLE);
    hostCommands("historyRestore").should("have.length", 1);
  });

  it("discards a snapshotted step that ended where it started", () => {
    bridgeReady(["history"]);
    waitForPageHydrated();
    storedTitle().then((titleBefore) => {
      // Typed, snapshotted mid-edit, then typed back.
      cy.window().then((win) => {
        win.zestyStore.dispatch({
          type: "SET_ITEM_DATA",
          itemZUID,
          key: "title",
          value: `${titleBefore} ${uuidv4()}`,
        });
      });
      hostCommands("historySnapshot")
        .invoke("filter", (cmd) => cmd.fields?.length > 0)
        .should("have.length.at.least", 1)
        .then((snapshots) => {
          const stepId = snapshots[0].stepId;
          cy.window().then((win) => {
            win.zestyStore.dispatch({
              type: "SET_ITEM_DATA",
              itemZUID,
              key: "title",
              value: titleBefore,
            });
          });
          postBridgeMessage({
            type: "DOM_EVENT",
            eventType: "escape",
            element: { dataset: {} },
          });
          // Folded into the base, its mid-edit canvas would become the
          // "before" of every later step.
          hostCommands("historyDrop").should("deep.include", {
            action: "historyDrop",
            stepIds: [stepId],
            discard: true,
          });
        });
    });
    cy.getBySelector("StudioUndoButton").should("be.disabled");
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

  it("applies nothing and drops the history when the canvas cannot restore", () => {
    bridgeReady(["history"]);
    openTitleField();
    editTitle();
    cy.window().then((win) => {
      win.__restoreReply = "fail";
    });
    hostCommands("historyReset").then((resets) => {
      const before = resets.length;

      cy.getBySelector("StudioUndoButton").click();

      hostCommands("historyRestore").should("have.length", 1);
      hostCommands("historyReset").should("have.length", before + 1);
    });
    cy.getBySelector("StudioUndoButton").should("be.disabled");
    cy.getBySelector("StudioRedoButton").should("be.disabled");
    // The canvas did not change, so neither did the staged edit.
    storedTitle().should("eq", EDITED_TITLE);
    cy.getBySelector("EditorField-title").should("have.value", EDITED_TITLE);
    cy.getBySelector("StudioContentSaveBar").should("exist");
  });

  it("reloads the canvas when a restore is never answered, and ignores a late reply", () => {
    bridgeReady(["history"]);
    openTitleField();
    editTitle();
    cy.window().then((win) => {
      win.__restoreReply = "none";
    });
    cy.window()
      .its("__canvasLoads")
      .then((loads) => {
        cy.getBySelector("StudioUndoButton").click();
        // Blocked while the restore is in flight.
        cy.getBySelector("StudioUndoButton").should("be.disabled");
        // The bridge may have swapped and be slow to say so: reload it.
        cy.window()
          .its("__canvasLoads")
          .should("eq", loads + 1);
      });
    // The late reply finds nothing pending.
    hostCommands("historyRestore")
      .its(0)
      .then((restore) =>
        postBridgeMessage({
          type: "HISTORY_RESTORED",
          stepId: restore.stepId,
          direction: restore.direction,
          codeIds: [],
          ok: true,
        })
      );
    storedTitle().should("eq", EDITED_TITLE);
    cy.getBySelector("StudioContentSaveBar").should("exist");
  });

  it("reloads the canvas when a restore fails part-way through", () => {
    bridgeReady(["history"]);
    openTitleField();
    editTitle();
    cy.window().then((win) => {
      win.__restoreReply = "throw";
    });
    cy.window()
      .its("__canvasLoads")
      .then((loads) => {
        cy.getBySelector("StudioUndoButton").click();
        cy.window()
          .its("__canvasLoads")
          .should("eq", loads + 1);
      });
    // Nothing applied: the reload shows what is staged.
    storedTitle().should("eq", EDITED_TITLE);
    cy.getBySelector("StudioContentSaveBar").should("exist");
  });

  it("keeps the save bar after a save that failed and did not reload", () => {
    bridgeReady(["history"]);
    openTitleField();
    editTitle();
    cy.intercept("PUT", `**/items/${itemZUID}`, (req) =>
      req.reply({ statusCode: 500, body: { error: "e2e failure" } })
    ).as("failedSave");
    cy.getBySelector("StudioContentSaveChangesButton").click();
    cy.getBySelector("StudioSaveAllButton").click();
    cy.wait("@failedSave");
    // A failed item keeps the modal open.
    cy.getBySelector("StudioSaveChangesCancelButton").click();
    cy.getBySelector("StudioSaveChangesModal").should("not.exist");

    cy.getBySelector("StudioUndoButton").should("not.be.disabled").click();
    storedTitle().should("eq", ORIGINAL_TITLE);
    // After a save attempt, pointer 0 is not known to be the stored state,
    // so the item stays dirty.
    cy.getBySelector("StudioContentSaveBar").should("exist");
  });

  // The staged layout source, as a save would PUT it. The PUT is answered
  // here, so nothing reaches the seeded view.
  const savedLayoutCode = () => {
    cy.intercept("PUT", `**/web/views/${viewZUID}`, (req) =>
      req.reply({ statusCode: 200, body: { data: { ...req.body } } })
    ).as("updateWebView");
    // A staged content edit is answered here too, so the save writes nothing.
    cy.intercept("PUT", `**/items/${itemZUID}`, (req) =>
      req.reply({ statusCode: 200, body: { data: {} } })
    );
    cy.get(
      '[data-cy="StudioLayoutSaveChangesButton"], [data-cy="StudioContentSaveChangesButton"]'
    ).click();
    cy.getBySelector("StudioSaveAllButton").click();
    return cy.wait("@updateWebView").its("request.body.code");
  };

  const LAYOUT_SOURCE =
    '<div data-layout-id="1">One</div>\n<div data-layout-id="2">Two</div>';

  it("undoes an inline layout edit back to nothing staged and redoes it", () => {
    bridgeReady(["history"]);
    postBridgeMessage({
      type: "TEMPLATE_SOURCE_MAP",
      templateSourceByCodeId: { [viewZUID]: LAYOUT_SOURCE },
    });
    postBridgeMessage({
      type: "LAYOUT_CONTENT_UPDATE",
      codeId: viewZUID,
      layoutId: "1",
      innerHtml: "One edited",
    });
    cy.getBySelector("StudioLayoutSaveBar").should("exist");
    // Snapshotted while open, before anything closes it.
    hostCommands("historySnapshot").should("have.length.at.least", 1);

    cy.getBySelector("StudioUndoButton").click();
    cy.getBySelector("StudioLayoutSaveBar").should("not.exist");

    cy.getBySelector("StudioRedoButton").click();
    cy.getBySelector("StudioLayoutSaveBar").should("exist");
    savedLayoutCode().should(
      "match",
      /<div>One edited<\/div>\s*<div>Two<\/div>/
    );
  });

  it("keeps a canvas drag out of the step before it", () => {
    // Unique, so the warm cache cannot already hold it and make the edit a
    // no-op.
    const draggedTitle = `${EDITED_TITLE} ${uuidv4()}`;
    bridgeReady(["history"]);
    postBridgeMessage({
      type: "TEMPLATE_SOURCE_MAP",
      templateSourceByCodeId: { [viewZUID]: LAYOUT_SOURCE },
    });
    postBridgeMessage({
      type: "LAYOUT_CONTENT_UPDATE",
      codeId: viewZUID,
      layoutId: "1",
      innerHtml: "One edited",
    });
    cy.getBySelector("StudioLayoutSaveBar").should("exist");
    waitForPageHydrated();
    // A host-side edit, left open: nothing has ended it when the drag lands.
    cy.window().then((win) => {
      win.zestyStore.dispatch({
        type: "SET_ITEM_DATA",
        itemZUID,
        key: "title",
        value: draggedTitle,
      });
    });
    // The edit's own snapshot — the one naming the title field — taken while
    // it is still open.
    hostCommands("historySnapshot")
      .invoke("filter", (cmd) => cmd.fields?.length > 0)
      .should("have.length.at.least", 1)
      .then((snapshots) => {
        const editStepId = snapshots[snapshots.length - 1].stepId;

        // The canvas has already moved the block when this arrives. The marker
        // records where in the command stream the drag happened.
        cy.window().then(
          (win) =>
            new Cypress.Promise((resolve) => {
              win.requestAnimationFrame(() => {
                win.__hostCommands.push({ action: "e2e-drag" });
                win.postMessage(
                  {
                    source: "studio-bridge",
                    message: {
                      type: "REORDER_OUTPUT",
                      regions: [
                        {
                          codeId: viewZUID,
                          selector: "[data-layout-id]",
                          orderedLayoutIds: ["2", "1"],
                          layoutStructure: [
                            { layoutId: "2", parentLayoutId: null },
                            { layoutId: "1", parentLayoutId: null },
                          ],
                          outputHtml: "",
                        },
                      ],
                      primaryCodeId: viewZUID,
                      selectedLayoutBreadcrumb: [
                        { layoutId: "1", label: "div" },
                      ],
                    },
                  },
                  "*"
                );
                resolve();
              });
            })
        );

        // The reorder step is snapshotted when it ends; the edit step is not
        // snapshotted again once the drag has happened.
        cy.window()
          .its("__hostCommands")
          .should((commands) => {
            const afterDrag = commands.slice(
              commands.findIndex((cmd) => cmd.action === "e2e-drag")
            );
            const snapshots = afterDrag.filter(
              (cmd) => cmd.action === "historySnapshot"
            );
            expect(
              snapshots.filter((cmd) => cmd.stepId > editStepId),
              "reorder step snapshot"
            ).to.have.length.at.least(1);
            expect(
              snapshots.filter((cmd) => cmd.stepId === editStepId),
              "edit step snapshot after the drag"
            ).to.have.length(0);
          });

        cy.getBySelector("StudioUndoButton").click();
        hostCommands("historyRestore")
          .its(0)
          .its("stepId")
          .should("be.gt", editStepId);
      });

    // Undoing the drag leaves both edits staged, in the original order.
    storedTitle().should("eq", draggedTitle);
    savedLayoutCode().should(
      "match",
      /<div>One edited<\/div>\s*<div>Two<\/div>/
    );
  });

  // Stubs the MCP reply (append a line to the view) and PVL. Returns a
  // function that releases the PVL reply when `holdPvl` is set.
  const stubAiTurn = ({ holdPvl = false, chatZuid } = {}) => {
    let releasePvl = () => {};
    const pvlGate = holdPvl
      ? new Promise((resolve) => {
          releasePvl = resolve;
        })
      : Promise.resolve();
    cy.intercept({ method: "POST", url: MCP_CLIENT }, (req) =>
      req.reply({
        statusCode: 200,
        body: {
          data: [
            {
              type: "SET_VALUE",
              payload: {
                refKey: "code-editor",
                value: `${req.body.code}\n<p class="studio-e2e-ai">Added</p>`,
              },
            },
          ],
          message: "",
          tools: [],
          chatZuid,
        },
      })
    ).as("mcp");
    cy.intercept({ method: "OPTIONS", url: /\/-\/pvl\// }, (req) =>
      req.reply({
        statusCode: 204,
        headers: {
          "access-control-allow-origin": "*",
          "access-control-allow-methods": "POST, GET, OPTIONS",
          "access-control-allow-headers": "authorization",
        },
      })
    );
    cy.intercept({ method: "POST", url: /\/-\/pvl\// }, (req) =>
      pvlGate.then(() =>
        req.reply({
          statusCode: 200,
          headers: { "access-control-allow-origin": "*" },
          body: "<p>preview</p>",
        })
      )
    ).as("pvl");
    return () => releasePvl();
  };

  const sendAiPrompt = () => {
    cy.getBySelector("StudioAIButton").click();
    cy.get('[data-cy="AIDrawerComposer"] textarea:not([aria-hidden])').type(
      "Add a line"
    );
    cy.getBySelector("AIDrawerSend").click();
    cy.wait("@mcp");
  };

  // Answers the paint the way the bridge would.
  const answerPaint = () =>
    hostCommands("replaceCodeRegion")
      .should("have.length", 1)
      .its(0)
      .then((command) =>
        postBridgeMessage({
          type: "CODE_REGION_REPLACED",
          codeId: viewZUID,
          ok: true,
          count: 1,
          requestId: command.requestId,
        })
      );

  const previewing = (on) =>
    on
      ? cy
          .getBySelector("StudioLayersPanel")
          .should("have.attr", "aria-disabled", "true")
      : cy
          .getBySelector("StudioLayersPanel")
          .should("not.have.attr", "aria-disabled");

  it("undoes and redoes an AI turn, unlocking and relocking the canvas", () => {
    stubAiTurn();
    bridgeReady(["history"]);
    sendAiPrompt();
    answerPaint();
    previewing(true);
    cy.getBySelector("StudioUndoButton").should("not.be.disabled").click();
    previewing(false);
    // Unlocked only after the canvas restored.
    cy.window()
      .its("__hostCommands")
      .should((commands) => {
        const restore = commands.findIndex(
          (cmd) => cmd.action === "historyRestore"
        );
        const unlock = commands.findIndex(
          (cmd) => cmd.action === "setPreviewLock" && cmd.locked === false
        );
        expect(restore).to.be.gte(0);
        expect(unlock).to.be.gt(restore);
      });

    cy.getBySelector("StudioRedoButton").click();
    previewing(true);
    // Locked before the painted preview comes back.
    cy.window()
      .its("__hostCommands")
      .should((commands) => {
        const redo = commands.findIndex(
          (cmd) => cmd.action === "historyRestore" && cmd.direction === "redo"
        );
        expect(redo).to.be.gte(0);
        expect(commands[redo - 1]).to.deep.include({
          action: "setPreviewLock",
          locked: true,
        });
      });
  });

  // The server replays a session's earlier turns, the undone one included.
  it("starts a new AI chat session after an AI turn is undone", () => {
    stubAiTurn({ chatZuid: "e2e-chat-one" });
    bridgeReady(["history"]);
    sendAiPrompt();
    answerPaint();
    previewing(true);
    cy.getBySelector("StudioUndoButton").should("not.be.disabled").click();
    previewing(false);

    cy.get('[data-cy="AIDrawerComposer"] textarea:not([aria-hidden])').type(
      "Add another line"
    );
    cy.getBySelector("AIDrawerSend").click();
    cy.wait("@mcp").its("request.body").should("not.have.property", "chatZuid");
  });

  it("puts back the canvas lock when a redo into an AI change fails", () => {
    stubAiTurn();
    bridgeReady(["history"]);
    sendAiPrompt();
    answerPaint();
    previewing(true);
    cy.getBySelector("StudioUndoButton").should("not.be.disabled").click();
    previewing(false);

    cy.window().then((win) => {
      win.__restoreReply = "fail";
    });
    cy.getBySelector("StudioRedoButton").click();
    // Locked ahead of the redo, then unlocked again once it failed: the host
    // has nothing staged.
    cy.window()
      .its("__hostCommands")
      .should((commands) => {
        const redo = commands.findIndex(
          (cmd) => cmd.action === "historyRestore" && cmd.direction === "redo"
        );
        expect(redo).to.be.gte(0);
        const locks = commands
          .slice(redo + 1)
          .filter((cmd) => cmd.action === "setPreviewLock");
        expect(locks).to.deep.eq([{ action: "setPreviewLock", locked: false }]);
      });
    previewing(false);
    cy.getBySelector("StudioRedoButton").should("be.disabled");
  });

  it("keeps a content write made while the AI render loads in the AI's step", () => {
    const releasePvl = stubAiTurn({ holdPvl: true });
    const writtenTitle = `${EDITED_TITLE} ${uuidv4()}`;
    bridgeReady(["history"]);
    waitForPageHydrated();
    storedTitle().as("titleBefore");
    sendAiPrompt();
    cy.window().then((win) => {
      win.zestyStore.dispatch({
        type: "SET_ITEM_DATA",
        itemZUID,
        key: "title",
        value: writtenTitle,
      });
    });
    // Saving now would close the AI's step before its render lands.
    cy.get(
      '[data-cy="StudioLayoutSaveChangesButton"], [data-cy="StudioContentSaveChangesButton"]'
    ).should("be.disabled");
    cy.getBySelector("StudioUndoButton").should("be.disabled");

    cy.then(() => releasePvl());
    cy.wait("@pvl");
    // The marker records where in the command stream the paint landed.
    hostCommands("replaceCodeRegion")
      .should("have.length", 1)
      .its(0)
      .then((command) =>
        cy.window().then(
          (win) =>
            new Cypress.Promise((resolve) => {
              win.requestAnimationFrame(() => {
                win.__hostCommands.push({ action: "e2e-painted" });
                win.postMessage(
                  {
                    source: "studio-bridge",
                    message: {
                      type: "CODE_REGION_REPLACED",
                      codeId: viewZUID,
                      ok: true,
                      count: 1,
                      requestId: command.requestId,
                    },
                  },
                  "*"
                );
                resolve();
              });
            })
        )
      );
    previewing(true);
    // One step, snapshotted once its paint is on the canvas.
    cy.window()
      .its("__hostCommands")
      .should((commands) => {
        const painted = commands.findIndex(
          (cmd) => cmd.action === "e2e-painted"
        );
        const after = commands
          .slice(painted)
          .filter((cmd) => cmd.action === "historySnapshot");
        expect(after, "snapshot after the paint").to.have.length.at.least(1);
      });

    cy.getBySelector("StudioUndoButton").should("not.be.disabled").click();
    previewing(false);
    cy.get("@titleBefore").then((titleBefore) =>
      storedTitle().should("eq", titleBefore)
    );
    hostCommands("historyRestore").should("have.length", 1);
  });

  const clickSaveBarCancel = () =>
    cy
      .get(
        '[data-cy="StudioLayoutCancelButton"], [data-cy="StudioContentCancelButton"]'
      )
      .click();

  const stageLayoutAndContent = (title) => {
    postBridgeMessage({
      type: "TEMPLATE_SOURCE_MAP",
      templateSourceByCodeId: { [viewZUID]: LAYOUT_SOURCE },
    });
    postBridgeMessage({
      type: "LAYOUT_CONTENT_UPDATE",
      codeId: viewZUID,
      layoutId: "1",
      innerHtml: "One edited",
    });
    cy.getBySelector("StudioLayoutSaveBar").should("exist");
    waitForPageHydrated();
    cy.window().then((win) => {
      win.zestyStore.dispatch({
        type: "SET_ITEM_DATA",
        itemZUID,
        key: "title",
        value: title,
      });
    });
    hostCommands("historySnapshot")
      .invoke("filter", (cmd) => cmd.fields?.length > 0)
      .should("have.length.at.least", 1);
  };

  it("cancels by undoing to the saved state, without reloading the canvas", () => {
    stubAiTurn();
    bridgeReady(["history"]);
    storedTitle().as("titleBefore");
    stageLayoutAndContent(`${EDITED_TITLE} ${uuidv4()}`);
    sendAiPrompt();
    answerPaint();
    previewing(true);
    cy.getBySelector("StudioUndoButton").should("not.be.disabled");

    cy.window()
      .its("__canvasLoads")
      .then((loads) => {
        clickSaveBarCancel();
        // AI turn, content edit, inline edit: three undos, in that order.
        hostCommands("historyRestore")
          .should("have.length", 3)
          .then((restores) => {
            expect(restores.map((cmd) => cmd.direction)).to.deep.eq([
              "undo",
              "undo",
              "undo",
            ]);
          });
        cy.getBySelector("StudioLayoutSaveBar").should("not.exist");
        cy.getBySelector("StudioContentSaveBar").should("not.exist");
        // Redo is still there: the history was undone, not thrown away.
        cy.getBySelector("StudioRedoButton").should("not.be.disabled");
        cy.window().its("__canvasLoads").should("eq", loads);
      });
    previewing(false);
    cy.get("@titleBefore").then((titleBefore) =>
      storedTitle().should("eq", titleBefore)
    );
    // Still no reload once everything has settled.
    cy.window()
      .its("__canvasLoads")
      .then((loads) => {
        cy.getBySelector("StudioRedoButton").should("not.be.disabled");
        cy.window().its("__canvasLoads").should("eq", loads);
      });
    // The staged AI change was dropped, and its transcript says so.
    cy.getBySelector("AIDrawerNotice").should("have.length", 1);
  });

  it("cancels by reloading, with the AI notice, when a restore fails after the AI step was undone", () => {
    stubAiTurn();
    bridgeReady(["history"]);
    stageLayoutAndContent(`${EDITED_TITLE} ${uuidv4()}`);
    sendAiPrompt();
    answerPaint();
    previewing(true);
    cy.getBySelector("StudioUndoButton").should("not.be.disabled");
    cy.window().then((win) => {
      win.__restoreReplies = ["ok", "fail"];
    });
    cy.window()
      .its("__canvasLoads")
      .then((loads) => {
        clickSaveBarCancel();
        hostCommands("historyRestore").should("have.length", 2);
        cy.window()
          .its("__canvasLoads")
          .should("eq", loads + 1);
      });
    cy.getBySelector("AIDrawerNotice").should("have.length", 1);
  });

  it("cancels by reloading when the replay leaves something it never touched pending", () => {
    bridgeReady(["history"]);
    waitForPageHydrated();
    // Dirty without any history step: undo cannot clear it.
    cy.window().then((win) => {
      win.zestyStore.dispatch({ type: "MARK_ITEM_DIRTY", itemZUID });
    });
    postBridgeMessage({
      type: "TEMPLATE_SOURCE_MAP",
      templateSourceByCodeId: { [viewZUID]: LAYOUT_SOURCE },
    });
    postBridgeMessage({
      type: "LAYOUT_CONTENT_UPDATE",
      codeId: viewZUID,
      layoutId: "1",
      innerHtml: "One edited",
    });
    cy.getBySelector("StudioContentSaveBar").should("exist");
    hostCommands("historySnapshot").should("have.length.at.least", 1);
    cy.window()
      .its("__canvasLoads")
      .then((loads) => {
        clickSaveBarCancel();
        hostCommands("historyRestore").should("have.length", 1);
        cy.window()
          .its("__canvasLoads")
          .should("eq", loads + 1);
      });
  });

  it("does not stay covered when the canvas reloads during Cancel's replay", () => {
    bridgeReady(["history"]);
    stageLayoutAndContent(`${EDITED_TITLE} ${uuidv4()}`);
    cy.window().then((win) => {
      win.__restoreReply = "none";
    });
    cy.window()
      .its("__canvasLoads")
      .then((loads) => {
        clickSaveBarCancel();
        hostCommands("historyRestore").should("have.length", 1);
        // Mid-replay: covered, and nothing can be saved.
        cy.getBySelector("StudioPreviewRefreshOverlay").should(
          "have.css",
          "opacity",
          "1"
        );
        cy.get(
          '[data-cy="StudioLayoutSaveChangesButton"], [data-cy="StudioContentSaveChangesButton"]'
        ).should("be.disabled");

        postBridgeMessage({ type: "BRIDGE_READY", capabilities: ["history"] });
        // The replay gives up and Cancel discards by reloading.
        cy.window()
          .its("__canvasLoads")
          .should("eq", loads + 1);
      });
    cy.getBySelector("StudioPreviewRefreshOverlay").should(
      "have.css",
      "opacity",
      "0"
    );
    cy.getBySelector("StudioLayoutSaveBar").should("not.exist");
    cy.getBySelector("StudioContentSaveBar").should("not.exist");
  });

  it("cancels by reloading when a restore fails part-way", () => {
    bridgeReady(["history"]);
    stageLayoutAndContent(`${EDITED_TITLE} ${uuidv4()}`);
    cy.window().then((win) => {
      win.__restoreReply = "fail";
    });
    cy.window()
      .its("__canvasLoads")
      .then((loads) => {
        clickSaveBarCancel();
        hostCommands("historyRestore").should("have.length", 1);
        cy.window()
          .its("__canvasLoads")
          .should("eq", loads + 1);
      });
    cy.getBySelector("StudioLayoutSaveBar").should("not.exist");
  });

  it("cancels by reloading, without undoing, when the base is not the saved state", () => {
    bridgeReady(["history"]);
    openTitleField();
    editTitle();
    cy.intercept("PUT", `**/items/${itemZUID}`, (req) =>
      req.reply({ statusCode: 500, body: { error: "e2e failure" } })
    ).as("failedSave");
    cy.window()
      .its("__canvasLoads")
      .then((loads) => {
        cy.getBySelector("StudioContentSaveChangesButton").click();
        cy.getBySelector("StudioSaveAllButton").click();
        cy.wait("@failedSave");
        cy.getBySelector("StudioSaveChangesCancelButton").click();
        // The failed save still reloads the canvas once.
        cy.window()
          .its("__canvasLoads")
          .should("eq", loads + 1);
        cy.getBySelector("StudioPreviewRefreshOverlay").should(
          "have.css",
          "opacity",
          "0"
        );

        clickSaveBarCancel();
        cy.window()
          .its("__canvasLoads")
          .should("eq", loads + 2);
      });
    hostCommands("historyRestore").should("have.length", 0);
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
    waitForPageHydrated();
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

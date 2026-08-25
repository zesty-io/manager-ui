import { API_ENDPOINTS } from "../../support/api";

// Studio mode — the union of content and layout, and the default for a role
// entitled to both.
//
// The bridge is cross-origin in a real preview, so these specs impersonate it
// from the parent window exactly as the other studio specs do. That is also
// what lets DYNAMIC_EDIT_REQUEST be exercised here before the bridge change
// that emits it has shipped: the host contract is testable on its own.
describe("Studio Full Mode", () => {
  let studioPath = "/";
  let itemZUID = "";
  const codeId = "11-studio-test-view";
  const templateSource = `
    <div data-layout-id="1">One</div>
    <div data-layout-id="2">Two</div>
  `;

  // The account CI signs in as is NOT staff, and `canSelectMode = user.staff`,
  // so the mode toggle does not render for it at all. Any test that drives the
  // toggle has to stub the flag and reload — the gate itself is covered in
  // mode-entitlement.spec.js, so stubbing it here tests full mode, not the gate.
  const reloadAsStaff = () => {
    cy.stubStaffUser();
    cy.waitOn("/v1/content/models**", () => {
      cy.visit(`/studio?path=${studioPath}`);
    });
    cy.getBySelector("StudioHeader").should("exist");
  };

  const postBridgeMessage = (message) => {
    cy.getBySelector("StudioHeader").should("exist");
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
  };

  // Stages a layout change by replaying the reorder the bridge would send.
  const stageLayoutChange = (targetCodeId = codeId) => {
    postBridgeMessage({
      type: "TEMPLATE_SOURCE_MAP",
      templateSourceByCodeId: { [targetCodeId]: templateSource },
    });
    postBridgeMessage({
      type: "REORDER_OUTPUT",
      regions: [
        {
          codeId: targetCodeId,
          selector: "[data-layout-id]",
          orderedLayoutIds: ["2", "1"],
          layoutStructure: [
            { layoutId: "2", parentLayoutId: null },
            { layoutId: "1", parentLayoutId: null },
          ],
          outputHtml:
            '<div data-layout-id="2">Two</div><div data-layout-id="1">One</div>',
        },
      ],
      primaryCodeId: targetCodeId,
      selectedLayoutId: "2",
      selectedLayoutBreadcrumb: [{ layoutId: "2", label: "div" }],
      selector: "[data-layout-id]",
    });
  };

  const stageContentChange = () => {
    cy.window().should((win) => {
      expect(
        win.zestyStore.getState().content[itemZUID]?.meta?.ZUID,
        "page item hydrated in store"
      ).to.eq(itemZUID);
    });
    cy.window().then((win) => {
      win.zestyStore.dispatch({ type: "MARK_ITEM_DIRTY", itemZUID });
    });
  };

  let seededViewZUID = "";
  let seededViewVersion = 1;

  // These specs used to take `/web/views?status=dev`[0] as a scratch code file.
  // That is the instance's HOMEPAGE — 60 call sites wrote to it, leaving it 650+
  // versions deep in test markup. seed:content hands back a disposable view; use
  // that, so a spec only ever edits something it created.
  const withSeededView = (cb) =>
    cy.wrap(null, { log: false }).then(() => {
      expect(seededViewZUID, "seed:content returned a disposable view").to.be.a(
        "string"
      ).and.not.be.empty;
      return cb({ ZUID: seededViewZUID, version: seededViewVersion });
    });

  before(() => {
    cy.task("seed:content", "fixtures/studio.json").then(({ items, view }) => {
      itemZUID = items[0].meta.ZUID;
      studioPath = `/${items[0].web.pathPart}`;
      seededViewZUID = view?.ZUID || "";
      seededViewVersion = view?.version ?? 1;
    });
  });

  beforeEach(() => {
    cy.waitOn("/v1/content/models**", () => {
      cy.visit(`/studio?path=${studioPath}`);
    });
    cy.getBySelector("StudioHeader").should("exist");
  });

  it("defaults to full mode and offers all three options", () => {
    reloadAsStaff();
    cy.getBySelector("StudioModeToggleOption-full").should(
      "have.attr",
      "aria-pressed",
      "true"
    );
    cy.getBySelector("StudioModeToggleOption-content").should("exist");
    cy.getBySelector("StudioModeToggleOption-layout").should("exist");
  });

  it("shows no right panel until something is selected, matching layout", () => {
    cy.getBySelector("StudioPreviewFrame").should("exist");
    // The positive assertion above is what stops this from passing on a page
    // that simply failed to render.
    cy.getBySelector("StudioSidePanel").should("not.exist");
  });

  it("opens the content editor when the bridge reports a bound leaf", () => {
    postBridgeMessage({
      type: "DYNAMIC_EDIT_REQUEST",
      studioId: `${itemZUID}:title`,
      fieldZuid: "fake-field-zuid",
      fieldType: "text",
      itemZuid: itemZUID,
      modelZuid: "fake-model-zuid",
    });

    // Selection is what the message drives; the panel switching to "edit" is
    // the observable consequence.
    cy.getBySelector("StudioSidePanel").should("exist");
  });

  it("writes an inline canvas edit back to the item in full mode", () => {
    // Two-way binding's canvas -> panel half. It was gated on
    // `interactionMode === "content"`, so full mode dropped every inline edit
    // and the side panel never moved. A real field zuid is required: the
    // handler resolves it through `fieldNameByZuid` and bails when it misses,
    // which a fabricated zuid would do for the wrong reason.
    cy.window().then((win) => {
      const state = win.zestyStore.getState();
      const modelZUID = state.content[itemZUID]?.meta?.contentModelZUID;
      const field = Object.values(state.fields).find(
        (f) =>
          f.contentModelZUID === modelZUID &&
          ["text", "textarea"].includes(f.datatype)
      );
      expect(field?.ZUID, "a text field on the seeded model").to.exist;

      postBridgeMessage({
        type: "DOM_EVENT",
        eventType: "input",
        element: {
          dataset: {
            studioId: `${itemZUID}:${field.name}`,
            fieldZuid: field.ZUID,
            fieldType: field.datatype,
            itemZuid: itemZUID,
            modelZuid: modelZUID,
          },
        },
        value: "EDITED_ON_CANVAS",
      });

      cy.window()
        .its(`zestyStore`)
        .then((store) =>
          cy
            .wrap(null)
            .should(() =>
              expect(
                store.getState().content[itemZUID]?.data?.[field.name]
              ).to.eq("EDITED_ON_CANVAS")
            )
        );
    });
  });

  it("tells the user why an inline edit was refused, without naming a mode that does not exist here", () => {
    // The bridge rejects a leaf that is neither statically editable nor bound
    // to one field. Full mode IS content plus layout, so the old copy sent the
    // user to a "Content mode" that full mode already contains.
    postBridgeMessage({ type: "STATIC_EDIT_REJECTED", layoutId: "2" });

    cy.getBySelector("toast")
      .should("contain.text", "not a single connected field")
      .and("not.contain.text", "Switch to Content mode");
  });

  // This case used to be "deliberately not covered": the layout-mode guard on
  // DYNAMIC_EDIT_REQUEST had no observable consequence, because layout renders
  // no right panel whether or not the message is handled. It has one now — the
  // guard tells the user instead of dropping the gesture — so it is testable.
  it("tells a layout-mode user that a bound leaf needs content editing", () => {
    reloadAsStaff();
    cy.getBySelector("StudioModeToggleOption-layout").click();

    postBridgeMessage({
      type: "DYNAMIC_EDIT_REQUEST",
      studioId: `${itemZUID}:title`,
      fieldZuid: "fake-field-zuid",
      fieldType: "text",
      itemZuid: itemZUID,
      modelZuid: "fake-model-zuid",
    });

    cy.getBySelector("toast").should("contain.text", "Switch to Content mode");
    // The panel staying shut is what proves the guard still guards.
    cy.getBySelector("StudioSidePanel").should("not.exist");
  });

  it("shows the layout breadcrumb trail in full mode", () => {
    // Full mode uses layout's drill-down grammar, so it needs layout's way
    // back up. This regressed once: the header still gated the trail on
    // `interactionMode === "layout"`, so full mode could drill with no trail.
    postBridgeMessage({
      type: "DOM_EVENT",
      eventType: "mousedown",
      element: { dataset: { codeId, layoutId: "2" } },
      breadcrumb: [{ layoutId: "2", label: "div" }],
    });

    cy.getBySelector("StudioBreadcrumbs").should("exist");
    cy.getBySelector("StudioBreadcrumbChip").should("contain.text", "div");
  });

  it("discards and reports unsaved layout work when code access is revoked mid-session", () => {
    stageLayoutChange();
    cy.getBySelector("StudioLayoutSaveBar").should("exist");

    // Narrow entitlement underneath the open session, exactly as a background
    // role refetch would. The clamp used to switch mode silently, leaving the
    // edit applied in memory with no save bar and no way back to layout mode.
    cy.window().then((win) => {
      const role = win.zestyStore.getState().userRole;
      win.zestyStore.dispatch({
        type: "FETCH_USER_ROLE_SUCCESS",
        payload: {
          data: {
            ...role,
            systemRoleZUID: "31-71cfc74-c0ntr1b0t0r",
            systemRole: { ...role.systemRole, super: false },
          },
        },
      });
    });

    // The user is told, rather than left with a vanished save bar.
    cy.contains("permissions changed", { timeout: 10000 }).should("exist");
    cy.getBySelector("StudioLayoutSaveBar").should("not.exist");
  });

  it("commits content and layout together from one save bar", () => {
    stageContentChange();
    stageLayoutChange();

    // One bar for both. Its hook keeps the content naming whenever content is
    // pending, which is what the pre-existing specs address it by.
    cy.getBySelector("StudioContentSaveBar").should("exist");
    cy.getBySelector("StudioContentSaveChangesButton").click();

    cy.getBySelector("StudioSaveChangesModal").should("exist");
    // Both sections present, which is the whole point of the merged save.
    cy.getBySelector("StudioSaveChangeSection-Content").should("exist");
    cy.getBySelector("StudioSaveChangeSection-Layout").should("exist");
    cy.getBySelector("StudioSaveChangeRow").should("have.length.at.least", 2);
  });

  it("groups nothing when only one backend is pending", () => {
    stageContentChange();

    cy.getBySelector("StudioContentSaveChangesButton").click();
    cy.getBySelector("StudioSaveChangesModal").should("exist");
    // A lone section header is noise; the row's own type chip already says it.
    cy.getBySelector("StudioSaveChangeRow").should("exist");
    cy.getBySelector("StudioSaveChangeSection-Content").should("not.exist");
    cy.getBySelector("StudioSaveChangeSection-Layout").should("not.exist");
  });

  // NOT COVERED, deliberately: "keeps the modal open when the LAYOUT half
  // fails". Written, then removed — it passed with the fix reverted, through
  // five variants (settling on the failure toast, stubbing the content half
  // green, waiting on both PUTs). A test that survives its own mutation is not
  // evidence, and the team has removed two of these before rather than leave
  // them looking like coverage.
  //
  // The "modal stays open even at failedCount 0" note that used to sit here was
  // WRONG — an artifact of those vacuous attempts, not real behaviour. Driven
  // through Playwright, which can fail the layout PUT that Cypress cannot, a
  // merged save with a forced 500 on the view keeps the modal open and drops it
  // to exactly the failed half (2 rows -> 1), and a fully successful merged save
  // closes it in ~970ms. `runMergedSave` and `closeModalUnlessFailed` behave as
  // documented; the gap is coverage here, not correctness there.

  it("keeps the modal open with only the failed half when content save fails", () => {
    // The layout half has to actually succeed for this test to say anything,
    // which means addressing a real web view — a fabricated code id fails the
    // PUT and leaves BOTH halves pending, which is a different assertion.
    withSeededView((webView) => {
      expect(webView?.ZUID, "a web view to stage a layout change against").to
        .exist;

      cy.intercept("PUT", `/v1/web/views/${webView.ZUID}`, {
        statusCode: 200,
        body: { data: { ZUID: webView.ZUID, version: 1 } },
      }).as("saveWebView");
      cy.intercept(
        { method: "PUT", url: `**/items/${itemZUID}` },
        { statusCode: 500, body: { error: "forced failure" } }
      ).as("saveItemFails");

      stageContentChange();
      stageLayoutChange(webView.ZUID);

      cy.getBySelector("StudioContentSaveChangesButton").click();
      cy.getBySelector("StudioSaveChangesModal").should("exist");
      cy.getBySelector("StudioSaveChangeSection-Layout").should("exist");
      cy.getBySelector("StudioSaveAllButton").click();

      cy.wait("@saveItemFails");
      cy.wait("@saveWebView");

      // The modal stays open, and the layout half — which did save — drops out
      // of the list, because the rows derive from what is still pending rather
      // than from a snapshot taken when the modal opened.
      cy.getBySelector("StudioSaveChangesModal").should("exist");
      cy.getBySelector("StudioSaveChangeRow").should("exist");
      cy.getBySelector("StudioSaveChangeSection-Layout").should("not.exist");
    });
  });
});

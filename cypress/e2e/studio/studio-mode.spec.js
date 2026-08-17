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

  before(() => {
    cy.task("seed:content", "fixtures/studio.json").then(({ items }) => {
      itemZUID = items[0].meta.ZUID;
      studioPath = `/${items[0].web.pathPart}`;
    });
  });

  beforeEach(() => {
    cy.waitOn("/v1/content/models**", () => {
      cy.visit(`/studio?path=${studioPath}`);
    });
    cy.getBySelector("StudioHeader").should("exist");
  });

  it("defaults to full mode and offers all three options", () => {
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

  // Deliberately not covered: "ignores a bound-leaf request in layout mode".
  // The host guard (`interactionMode !== "studio"`) is correct and kept, but
  // it has no observable consequence to assert against — layout mode renders
  // no right panel whether or not the message is handled, so the test passes
  // identically with the guard removed. Asserting it would measure the drawer
  // condition, not the guard.

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

  it("keeps the modal open with only the failed half when content save fails", () => {
    // The layout half has to actually succeed for this test to say anything,
    // which means addressing a real web view — a fabricated code id fails the
    // PUT and leaves BOTH halves pending, which is a different assertion.
    cy.apiRequest({
      url: `${API_ENDPOINTS.devInstance}/web/views?status=dev`,
    }).then(({ data }) => {
      const webView = data?.[0];
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

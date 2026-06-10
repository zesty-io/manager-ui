import { API_ENDPOINTS } from "../../support/api";

describe("Studio Wrapper", () => {
  let studioPath = "/";
  let itemZUID = "";
  let modelZUID = "";
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
              win.postMessage(
                {
                  source: "studio-bridge",
                  message,
                },
                "*"
              );
              resolve();
            });
          });
        })
    );
  };

  const createPendingLayoutSave = (nextCodeId = codeId) => {
    postBridgeMessage({
      type: "TEMPLATE_SOURCE_MAP",
      templateSourceByCodeId: {
        [nextCodeId]: templateSource,
      },
    });

    postBridgeMessage({
      type: "REORDER_OUTPUT",
      regions: [
        {
          codeId: nextCodeId,
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
      primaryCodeId: nextCodeId,
      selectedLayoutId: "2",
      selectedLayoutBreadcrumb: [{ layoutId: "2", label: "div" }],
      selector: "[data-layout-id]",
    });
  };

  const createNestedPendingLayoutSave = (nextCodeId) => {
    const nestedTemplateSource = `
      <div data-layout-id="1">
        <div data-layout-id="2">seeya world</div>
        <div data-layout-id="3">
          {{include a_new_single_page_model_is_here}}
        </div>
        <div data-layout-id="4">goodbye world</div>
        <div data-layout-id="5">hello world</div>
      </div>
    `;

    postBridgeMessage({
      type: "TEMPLATE_SOURCE_MAP",
      templateSourceByCodeId: {
        [nextCodeId]: nestedTemplateSource,
      },
    });

    postBridgeMessage({
      type: "REORDER_OUTPUT",
      regions: [
        {
          codeId: nextCodeId,
          selector: "[data-layout-id]",
          orderedLayoutIds: ["1", "2", "4", "5", "3"],
          layoutStructure: [
            { layoutId: "1", parentLayoutId: null },
            { layoutId: "2", parentLayoutId: "1" },
            { layoutId: "4", parentLayoutId: "1" },
            { layoutId: "5", parentLayoutId: "1" },
            { layoutId: "3", parentLayoutId: "1" },
          ],
          outputHtml: `
        <div data-layout-id="1">
          <div data-layout-id="2">seeya world</div>
          <div data-layout-id="4">goodbye world</div>
          <div data-layout-id="5">hello world</div>
          <div data-layout-id="3">
            <form data-layout-id="1">
              <input data-layout-id="2" />
            </form>
          </div>
        </div>
      `,
        },
      ],
      primaryCodeId: nextCodeId,
      selectedLayoutId: "4",
      selectedLayoutBreadcrumb: [{ layoutId: "4", label: "div" }],
      selector: "[data-layout-id]",
    });
  };

  before(() => {
    cy.task("seed:content", "fixtures/studio.json").then(({ items }) => {
      itemZUID = items[0].meta.ZUID;
      modelZUID = items[0].meta.contentModelZUID;
      studioPath = `/${items[0].web.pathPart}`;
    });
  });

  // Open the Save Changes modal from the given mode's bar and commit via
  // Save All / Save & Publish All.
  const saveAllViaModal = (mode = "layout") => {
    const prefix = mode === "layout" ? "StudioLayout" : "StudioContent";
    cy.getBySelector(`${prefix}SaveChangesButton`).click();
    cy.getBySelector("StudioSaveChangesModal").should("exist");
    cy.getBySelector("StudioSaveAllButton").click();
  };

  const savePublishAllViaModal = (mode = "layout") => {
    const prefix = mode === "layout" ? "StudioLayout" : "StudioContent";
    cy.getBySelector(`${prefix}SaveChangesButton`).click();
    cy.getBySelector("StudioSaveChangesModal").should("exist");
    cy.getBySelector("StudioSaveAndPublishAllButton").click();
  };

  const selectAndDirtyContent = () => {
    cy.window().then((win) => {
      win.zestyStore.dispatch({
        type: "MARK_ITEM_DIRTY",
        itemZUID: itemZUID,
      });
    });
  };

  const selectLayout = (
    nextCodeId = codeId,
    layoutId = "2",
    breadcrumb = [{ layoutId, label: "div" }]
  ) => {
    postBridgeMessage({
      type: "DOM_EVENT",
      eventType: "mousedown",
      element: {
        dataset: {
          codeId: nextCodeId,
          layoutId,
        },
      },
      breadcrumb,
    });
  };

  const setStudioMode = (mode) => {
    cy.getBySelector("StudioHeader").should("exist");
    cy.getBySelector("StudioModeToggle")
      .find('input[type="checkbox"]')
      [mode === "layout" ? "check" : "uncheck"]();
  };

  beforeEach(() => {
    cy.waitOn("/v1/content/models**", () => {
      cy.visit(`/studio?path=${studioPath}`);
    });
  });

  it("renders studio and toggles between content and layout modes", () => {
    cy.getBySelector("StudioHeader").should("exist");
    cy.getBySelector("StudioLogo").should("exist");
    cy.getBySelector("StudioPreviewFrame")
      .should("exist")
      .and("have.attr", "src")
      .and("include", "studio=bridge");

    cy.getBySelector("StudioSidePanel").should("exist");

    setStudioMode("layout");
    cy.getBySelector("StudioSidePanel").should("not.exist");

    setStudioMode("content");
    cy.getBySelector("StudioSidePanel").should("exist");
  });

  it("shows the layout save bar after a reorder output arrives", () => {
    setStudioMode("layout");
    createPendingLayoutSave();

    cy.getBySelector("StudioLayoutSaveBar").should("exist");
    cy.getBySelector("StudioLayoutCancelButton").should("exist");
    cy.getBySelector("StudioLayoutSaveChangesButton").should("exist");
  });

  it("opens the Save Changes modal listing the staged code change", () => {
    setStudioMode("layout");
    createPendingLayoutSave();

    cy.getBySelector("StudioLayoutSaveChangesButton").click();
    cy.getBySelector("StudioSaveChangesModal").should("exist");
    cy.getBySelector("StudioSaveChangeRow").should("have.length", 1);
    cy.getBySelector("StudioSaveChangeRow").should("contain.text", "Code");
    cy.getBySelector("StudioSaveAllButton").should("exist");
    cy.getBySelector("StudioSaveAndPublishAllButton").should("exist");

    cy.getBySelector("StudioSaveChangesCancelButton").click();
    cy.getBySelector("StudioSaveChangesModal").should("not.exist");
    cy.getBySelector("StudioLayoutSaveBar").should("exist");
  });

  it("hides the layout save bar when cancel is clicked", () => {
    setStudioMode("layout");
    createPendingLayoutSave();

    cy.getBySelector("StudioLayoutSaveBar").should("exist");
    cy.getBySelector("StudioLayoutCancelButton").click();
    cy.getBySelector("StudioLayoutSaveBar").should("not.exist");
  });

  it("prompts for unsaved layout changes when leaving layout mode", () => {
    setStudioMode("layout");
    createPendingLayoutSave();

    cy.getBySelector("StudioLayoutSaveBar").should("exist");

    setStudioMode("content");

    cy.getBySelector("DirtyCodeModal").should("exist");
    cy.getBySelector("DirtyCodeModalCancel").should("exist");
    cy.getBySelector("DirtyCodeModalDiscard").should("exist");
    cy.getBySelector("DirtyCodeModalSave").should("exist");

    cy.getBySelector("DirtyCodeModalDiscard").click();

    cy.getBySelector("DirtyCodeModal").should("not.exist");
  });

  it("keeps staged layout changes when selecting another code boundary (multi-file staging)", () => {
    setStudioMode("layout");
    selectLayout(codeId, "2");
    createPendingLayoutSave();

    cy.getBySelector("StudioLayoutSaveBar").should("exist");

    selectLayout("11-other-code-view", "9");

    cy.getBySelector("DirtyCodeModal").should("not.exist");
    cy.getBySelector("StudioLayoutSaveBar").should("exist");
  });

  it("prompts for unsaved content changes when switching to layout mode", () => {
    selectAndDirtyContent();

    setStudioMode("layout");

    cy.getBySelector("PendingEditsModal").should("exist");
    cy.getBySelector("PendingEditsModalCancel").should("exist");
    cy.getBySelector("PendingEditsModalDiscard").should("exist");
    cy.getBySelector("PendingEditsModalSave").should("exist");
  });

  it("renders layout breadcrumbs and truncates them when an ancestor chip is clicked", () => {
    setStudioMode("layout");

    selectLayout(codeId, "11", [
      { layoutId: "10", label: "section" },
      { layoutId: "11", label: "article" },
    ]);

    cy.getBySelector("StudioBreadcrumbs").should("exist");
    cy.getBySelector("StudioBreadcrumbRoot").should("contain.text", codeId);
    cy.getBySelector("StudioBreadcrumbChip").should("have.length", 2);
    cy.getBySelector("StudioBreadcrumbRail")
      .contains("article")
      .should("exist");

    cy.getBySelector("StudioBreadcrumbRail").contains("section").click();

    cy.getBySelector("StudioBreadcrumbChip").should("have.length", 1);
    cy.getBySelector("StudioBreadcrumbRail")
      .contains("section")
      .should("exist");
    cy.getBySelector("StudioBreadcrumbRail")
      .contains("article")
      .should("not.exist");
  });

  it("saves sanitized mapped source for a pending layout draft", () => {
    setStudioMode("layout");
    cy.apiRequest({
      url: `${API_ENDPOINTS.devInstance}/web/views?status=dev`,
    }).then(({ data }) => {
      const webView = data?.[0];
      expect(webView?.ZUID).to.exist;

      cy.intercept("PUT", `/v1/web/views/${webView.ZUID}`).as("updateWebView");

      createPendingLayoutSave(webView.ZUID);

      saveAllViaModal("layout");

      cy.wait("@updateWebView").then(({ request }) => {
        expect(request.body.code).to.contain("<div>Two</div><div>One</div>");
        expect(request.body.code).not.to.contain("data-layout-id");
      });
    });
  });

  it("keeps nested code-region layout nodes out of outer mapped source", () => {
    setStudioMode("layout");
    cy.apiRequest({
      url: `${API_ENDPOINTS.devInstance}/web/views?status=dev`,
    }).then(({ data }) => {
      const webView = data?.[0];
      expect(webView?.ZUID).to.exist;

      cy.intercept("PUT", `/v1/web/views/${webView.ZUID}`).as("updateWebView");

      createNestedPendingLayoutSave(webView.ZUID);

      saveAllViaModal("layout");

      cy.wait("@updateWebView").then(({ request }) => {
        expect(request.body.code).to.contain(
          "{{include a_new_single_page_model_is_here}}"
        );
        expect(request.body.code).to.contain("<div>goodbye world</div>");
        expect(request.body.code).to.contain("<div>hello world</div>");
        expect(request.body.code).not.to.contain("<form");
      });
    });
  });

  it("updates the preview path when the language selector changes", () => {
    cy.getBySelector("StudioPreviewFrame")
      .invoke("attr", "src")
      .then((initialSrc) => {
        cy.getBySelector("language-selector").click();

        cy.get('[role="menu"] [role="menuitem"]').then(($items) => {
          const currentLabel = Cypress.$('[data-cy="language-selector"]')
            .text()
            .trim();
          const nextItem = [...$items].find(
            (item) => Cypress.$(item).text().trim() !== currentLabel
          );

          expect(nextItem, "next language menu item").to.exist;
          cy.wrap(nextItem).click();

          cy.getBySelector("StudioPreviewFrame")
            .should("have.attr", "src")
            .and("not.equal", initialSrc);
        });
      });
  });

  // ── Static inline text editing ─────────────────────────────────────────────

  it("shows save bar after a LAYOUT_CONTENT_UPDATE static edit", () => {
    setStudioMode("layout");
    postBridgeMessage({
      type: "TEMPLATE_SOURCE_MAP",
      templateSourceByCodeId: {
        [codeId]: `<div data-layout-id="leaf-1">Original text</div>`,
      },
    });

    postBridgeMessage({
      type: "LAYOUT_CONTENT_UPDATE",
      codeId,
      layoutId: "leaf-1",
      innerHtml: "Updated text",
    });

    cy.getBySelector("StudioLayoutSaveBar").should("exist");
    cy.getBySelector("StudioLayoutSaveChangesButton").should("exist");
  });

  it("saves static content edit with updated text and no layout-id attributes", () => {
    setStudioMode("layout");
    cy.apiRequest({
      url: `${API_ENDPOINTS.devInstance}/web/views?status=dev`,
    }).then(({ data }) => {
      const webView = data?.[0];
      expect(webView?.ZUID).to.exist;

      cy.intercept("PUT", `/v1/web/views/${webView.ZUID}`).as("updateWebView");

      postBridgeMessage({
        type: "TEMPLATE_SOURCE_MAP",
        templateSourceByCodeId: {
          [webView.ZUID]: `<div data-layout-id="leaf-1">Original text</div>`,
        },
      });

      postBridgeMessage({
        type: "LAYOUT_CONTENT_UPDATE",
        codeId: webView.ZUID,
        layoutId: "leaf-1",
        innerHtml: "Updated text",
      });

      saveAllViaModal("layout");

      cy.wait("@updateWebView").then(({ request }) => {
        expect(request.body.code).to.contain("Updated text");
        expect(request.body.code).not.to.contain("Original text");
        expect(request.body.code).not.to.contain("data-layout-id");
      });
    });
  });

  it("accumulates multiple static edits and saves the latest", () => {
    setStudioMode("layout");
    cy.apiRequest({
      url: `${API_ENDPOINTS.devInstance}/web/views?status=dev`,
    }).then(({ data }) => {
      const webView = data?.[0];
      expect(webView?.ZUID).to.exist;

      cy.intercept("PUT", `/v1/web/views/${webView.ZUID}`).as("updateWebView");

      postBridgeMessage({
        type: "TEMPLATE_SOURCE_MAP",
        templateSourceByCodeId: {
          [webView.ZUID]: `<div data-layout-id="leaf-1">Original text</div>`,
        },
      });

      postBridgeMessage({
        type: "LAYOUT_CONTENT_UPDATE",
        codeId: webView.ZUID,
        layoutId: "leaf-1",
        innerHtml: "First edit",
      });

      postBridgeMessage({
        type: "LAYOUT_CONTENT_UPDATE",
        codeId: webView.ZUID,
        layoutId: "leaf-1",
        innerHtml: "Second edit",
      });

      saveAllViaModal("layout");

      cy.wait("@updateWebView").then(({ request }) => {
        expect(request.body.code).to.contain("Second edit");
        expect(request.body.code).not.to.contain("First edit");
      });
    });
  });

  it("applies static edit on top of a pending reorder without repositioning the block", () => {
    setStudioMode("layout");
    cy.apiRequest({
      url: `${API_ENDPOINTS.devInstance}/web/views?status=dev`,
    }).then(({ data }) => {
      const webView = data?.[0];
      expect(webView?.ZUID).to.exist;

      cy.intercept("PUT", `/v1/web/views/${webView.ZUID}`).as("updateWebView");

      // Establish template with two blocks
      postBridgeMessage({
        type: "TEMPLATE_SOURCE_MAP",
        templateSourceByCodeId: {
          [webView.ZUID]: `<div data-layout-id="1">One</div><div data-layout-id="2">Two</div>`,
        },
      });

      // Reorder: swap block 2 before block 1
      postBridgeMessage({
        type: "REORDER_OUTPUT",
        regions: [
          {
            codeId: webView.ZUID,
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
        primaryCodeId: webView.ZUID,
        selectedLayoutId: "2",
        selectedLayoutBreadcrumb: [],
        selector: "[data-layout-id]",
      });

      // Static edit on block 2 after reorder
      postBridgeMessage({
        type: "LAYOUT_CONTENT_UPDATE",
        codeId: webView.ZUID,
        layoutId: "2",
        innerHtml: "Two (edited)",
      });

      saveAllViaModal("layout");

      cy.wait("@updateWebView").then(({ request }) => {
        // Reorder order preserved: block 2 still before block 1
        const code = request.body.code;
        expect(code.indexOf("Two (edited)")).to.be.lessThan(
          code.indexOf("One")
        );
        expect(code).not.to.contain("data-layout-id");
      });
    });
  });

  // ── Image src replacement via MediaDam ──────────────────────────────────────

  it("opens MediaDam dialog when STATIC_EDIT_IMAGE bridge message is received", () => {
    postBridgeMessage({
      type: "STATIC_EDIT_IMAGE",
      codeId,
      layoutId: "img-1",
      isLeafImg: true,
      imgIndex: 0,
      currentSrc: "https://example.com/old.jpg",
    });

    cy.getBySelector("appSidebarHeaderTitle").should(
      "contain.text",
      "Insert from Media"
    );
  });

  it("closes MediaDam dialog without creating a pending save when dismissed", () => {
    postBridgeMessage({
      type: "STATIC_EDIT_IMAGE",
      codeId,
      layoutId: "img-1",
      isLeafImg: true,
      imgIndex: 0,
      currentSrc: "https://example.com/old.jpg",
    });

    cy.getBySelector("appSidebarHeaderTitle").should("exist");

    cy.get("body").type("{esc}");

    cy.getBySelector("appSidebarHeaderTitle").should("not.exist");
    cy.getBySelector("StudioLayoutSaveBar").should("not.exist");
  });

  it("saves updated image src after selecting from MediaDam", () => {
    setStudioMode("layout");
    cy.apiRequest({
      url: `${API_ENDPOINTS.devInstance}/web/views?status=dev`,
    }).then(({ data }) => {
      const webView = data?.[0];
      expect(webView?.ZUID).to.exist;

      cy.intercept("PUT", `/v1/web/views/${webView.ZUID}`).as("updateWebView");

      postBridgeMessage({
        type: "TEMPLATE_SOURCE_MAP",
        templateSourceByCodeId: {
          [webView.ZUID]: `<img data-layout-id="img-1" src="https://example.com/old.jpg" />`,
        },
      });

      postBridgeMessage({
        type: "STATIC_EDIT_IMAGE",
        codeId: webView.ZUID,
        layoutId: "img-1",
        isLeafImg: true,
        imgIndex: 0,
        currentSrc: "https://example.com/old.jpg",
      });

      cy.getBySelector("appSidebarHeaderTitle").should("exist");

      // Select the first available media thumbnail
      cy.waitOn(`**/bin/**`, () => {
        cy.get("[data-testid='media-thumbnail-content']")
          .first()
          .parent()
          .find("input[type=checkbox]")
          .first()
          .click({ force: true });
      });

      cy.contains("Done").click();

      cy.getBySelector("StudioLayoutSaveBar").should("exist");

      saveAllViaModal("layout");

      cy.wait("@updateWebView").then(({ request }) => {
        expect(request.body.code).not.to.contain("old.jpg");
        expect(request.body.code).not.to.contain("data-layout-id");
        // The src attribute should be a valid URL
        expect(request.body.code).to.match(/<img src="https?:\/\/.+"/);
      });
    });
  });

  it("saves updated src for an img nested inside a layout leaf", () => {
    setStudioMode("layout");
    cy.apiRequest({
      url: `${API_ENDPOINTS.devInstance}/web/views?status=dev`,
    }).then(({ data }) => {
      const webView = data?.[0];
      expect(webView?.ZUID).to.exist;

      cy.intercept("PUT", `/v1/web/views/${webView.ZUID}`).as("updateWebView");

      postBridgeMessage({
        type: "TEMPLATE_SOURCE_MAP",
        templateSourceByCodeId: {
          [webView.ZUID]: `<div data-layout-id="wrap-1"><img src="https://example.com/old.jpg" /><p>Caption</p></div>`,
        },
      });

      postBridgeMessage({
        type: "STATIC_EDIT_IMAGE",
        codeId: webView.ZUID,
        layoutId: "wrap-1",
        isLeafImg: false,
        imgIndex: 0,
        currentSrc: "https://example.com/old.jpg",
      });

      cy.getBySelector("appSidebarHeaderTitle").should("exist");

      cy.waitOn(`**/bin/**`, () => {
        cy.get("[data-testid='media-thumbnail-content']")
          .first()
          .parent()
          .find("input[type=checkbox]")
          .first()
          .click({ force: true });
      });

      cy.contains("Done").click();

      saveAllViaModal("layout");

      cy.wait("@updateWebView").then(({ request }) => {
        expect(request.body.code).not.to.contain("old.jpg");
        expect(request.body.code).to.contain("<p>Caption</p>");
        expect(request.body.code).not.to.contain("data-layout-id");
      });
    });
  });

  it("saves and publishes a pending layout draft", () => {
    setStudioMode("layout");
    cy.apiRequest({
      url: `${API_ENDPOINTS.devInstance}/web/views?status=dev`,
    }).then(({ data }) => {
      const webView = data?.[0];
      expect(webView?.ZUID).to.exist;
      expect(webView?.version).to.be.a("number");

      cy.intercept("PUT", `/v1/web/views/${webView.ZUID}`).as("updateWebView");
      cy.intercept(
        "POST",
        `/v1/web/views/${webView.ZUID}/versions/${
          webView.version + 1
        }?purge_cache=true`
      ).as("publishWebView");

      createPendingLayoutSave(webView.ZUID);

      savePublishAllViaModal("layout");

      cy.wait("@updateWebView").then(({ request }) => {
        expect(request.body.code).to.contain("<div>Two</div><div>One</div>");
        expect(request.body.code).not.to.contain("data-layout-id");
      });

      cy.wait("@publishWebView");
    });
  });

  // ── Content staging (multi-item save) ───────────────────────────────────────

  // Marks the loaded page item dirty so the content save bar appears. Waits for
  // the item to be hydrated into the store first so MARK_ITEM_DIRTY isn't a
  // no-op (the reducer only flips items already present in state.content).
  const dirtyPageContent = () => {
    cy.getBySelector("StudioSidePanel").should("exist");
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

  it("shows the content save bar when a content item is staged", () => {
    dirtyPageContent();

    cy.getBySelector("StudioContentSaveBar").should("exist");
    cy.getBySelector("StudioContentCancelButton").should("exist");
    cy.getBySelector("StudioContentSaveChangesButton").should("exist");
  });

  it("opens the Save Changes modal listing the staged content edit", () => {
    dirtyPageContent();

    cy.getBySelector("StudioContentSaveChangesButton").click();
    cy.getBySelector("StudioSaveChangesModal").should("exist");
    cy.getBySelector("StudioSaveChangeRow").should("have.length", 1);
    cy.getBySelector("StudioSaveChangeRow").should("contain.text", "Content");
    cy.getBySelector("StudioSaveAllButton").should("exist");
    cy.getBySelector("StudioSaveAndPublishAllButton").should("exist");

    cy.getBySelector("StudioSaveChangesCancelButton").click();
    cy.getBySelector("StudioSaveChangesModal").should("not.exist");
    cy.getBySelector("StudioContentSaveBar").should("exist");
  });

  it("discards staged content edits when the bar cancel is clicked", () => {
    dirtyPageContent();

    cy.getBySelector("StudioContentSaveBar").should("exist");
    cy.getBySelector("StudioContentCancelButton").click();
    cy.getBySelector("StudioContentSaveBar").should("not.exist");
  });

  it("saves all staged content edits via the modal", () => {
    dirtyPageContent();

    // saveItem PUTs to the cross-origin instance API
    // (https://<zuid>.api.dev.zesty.io/...), so a path-only intercept never
    // matches — use a glob keyed on the item ZUID.
    cy.intercept({ method: "PUT", url: `**/items/${itemZUID}` }).as("saveItem");

    saveAllViaModal("content");

    cy.wait("@saveItem")
      .its("response.statusCode")
      .should("be.oneOf", [200, 201]);
    cy.getBySelector("StudioSaveChangesModal").should("not.exist");
    cy.getBySelector("StudioContentSaveBar").should("not.exist");
  });

  it("saves and publishes all staged content edits via the modal", () => {
    dirtyPageContent();

    cy.intercept({ method: "PUT", url: `**/items/${itemZUID}` }).as("saveItem");
    cy.intercept({
      method: "POST",
      url: `**/items/${itemZUID}/publishings`,
    }).as("publishItem");

    savePublishAllViaModal("content");

    cy.wait("@saveItem");
    cy.wait("@publishItem");
    cy.getBySelector("StudioContentSaveBar").should("not.exist");
  });

  it("does not prompt when selecting a field on another item while staged (multi-item staging)", () => {
    dirtyPageContent();

    cy.getBySelector("StudioContentSaveBar").should("exist");

    postBridgeMessage({
      type: "DOM_EVENT",
      eventType: "click",
      element: {
        dataset: {
          studioId: "studio-other-item",
          fieldZuid: "12-other-field-zuid",
          itemZuid: "7-other-item-zuid",
          modelZuid: "6-other-model-zuid",
        },
      },
    });

    cy.getBySelector("PendingEditsModal").should("not.exist");
    cy.getBySelector("StudioContentSaveBar").should("exist");
  });
});

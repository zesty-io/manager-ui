import { API_ENDPOINTS } from "../../support/api";

describe("Studio Wrapper", () => {
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
      codeId: nextCodeId,
      selector: "[data-layout-id]",
      orderedLayoutIds: ["2", "1"],
      layoutStructure: [
        { layoutId: "2", parentLayoutId: null },
        { layoutId: "1", parentLayoutId: null },
      ],
      outputHtml:
        '<div data-layout-id="2">Two</div><div data-layout-id="1">One</div>',
      selectedLayoutBreadcrumb: [{ layoutId: "2", label: "div" }],
    });
  };

  before(() => {
    cy.task("seed:content", "fixtures/studio.json").then(({ items }) => {
      itemZUID = items[0].meta.ZUID;
      studioPath = `/${items[0].web.pathPart}`;
    });
  });

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
    createPendingLayoutSave();

    cy.getBySelector("StudioLayoutSaveBar").should("exist");
    cy.getBySelector("StudioLayoutCancelButton").should("exist");
    cy.getBySelector("StudioLayoutSaveButton").should("exist");
    cy.getBySelector("StudioLayoutSavePublishButton").should("exist");
  });

  it("hides the layout save bar when cancel is clicked", () => {
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

  it("prompts for unsaved layout changes when selecting another code boundary", () => {
    setStudioMode("layout");
    selectLayout(codeId, "2");
    createPendingLayoutSave();

    selectLayout("11-other-code-view", "9");

    cy.getBySelector("DirtyCodeModal").should("exist");
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
    cy.apiRequest({
      url: `${API_ENDPOINTS.devInstance}/web/views?status=dev`,
    }).then(({ data }) => {
      const webView = data?.[0];
      expect(webView?.ZUID).to.exist;

      cy.intercept("PUT", `/v1/web/views/${webView.ZUID}`).as("updateWebView");

      createPendingLayoutSave(webView.ZUID);

      cy.getBySelector("StudioLayoutSaveButton").click();

      cy.wait("@updateWebView").then(({ request }) => {
        expect(request.body.code).to.contain("<div>Two</div><div>One</div>");
        expect(request.body.code).not.to.contain("data-layout-id");
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

  it("saves and publishes a pending layout draft", () => {
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

      cy.getBySelector("StudioLayoutSavePublishButton").click();

      cy.wait("@updateWebView").then(({ request }) => {
        expect(request.body.code).to.contain("<div>Two</div><div>One</div>");
        expect(request.body.code).not.to.contain("data-layout-id");
      });

      cy.wait("@publishWebView");
    });
  });
});

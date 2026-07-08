import { API_ENDPOINTS } from "../../support/api";

// The Attributes panel is driven entirely by the in-iframe bridge via a
// `LAYERS_TREE` postMessage. As every studio spec does, we impersonate the
// bridge from the parent window (the real cross-origin preview is never
// touched) and assert on the host React UI plus the same-origin web/views PUT.
describe("Studio Attributes Panel", () => {
  let studioPath = "/";
  let modelZUID = "";

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

  const feedTree = (node) =>
    postBridgeMessage({ type: "LAYERS_TREE", tree: [node] });

  const setStudioMode = (mode) => {
    cy.getBySelector("StudioHeader").should("exist");
    cy.getBySelector("StudioModeToggle")
      .find('input[type="checkbox"]')
      [mode === "layout" ? "check" : "uncheck"]();
  };

  const saveAllViaModal = (mode = "layout") => {
    const prefix = mode === "layout" ? "StudioLayout" : "StudioContent";
    cy.getBySelector(`${prefix}SaveChangesButton`).click();
    cy.getBySelector("StudioSaveChangesModal").should("exist");
    cy.getBySelector("StudioSaveAllButton").click();
    // Let the modal fade out before any subsequent query.
    cy.getBySelector("StudioSaveChangesModal").should("not.exist");
  };

  // Open a MUI TextField `select` (the data-cy sits on its hidden native input,
  // whose InputBase parent is the clickable control) and pick an option by its
  // stable semantic value.
  const selectMuiOption = (dataCy, optionValue) => {
    cy.getBySelector(dataCy).parent().click();
    cy.get(`[role="option"][data-value="${optionValue}"]`).click();
  };

  const attrSlot = (attr, label, value = "") => ({
    kind: "attribute",
    key: attr,
    attr,
    label,
    isDynamic: false,
    value,
    layoutEditable: true,
    control: "text",
  });

  const boolSlot = (attr, label, trueLabel, falseLabel) => ({
    kind: "attribute",
    key: attr,
    attr,
    label,
    isDynamic: false,
    value: "false",
    layoutEditable: true,
    control: "select",
    booleanAttr: true,
    options: [
      { value: "true", label: trueLabel },
      { value: "false", label: falseLabel },
    ],
  });

  const elementNode = (codeId, tagName, slots) => ({
    id: `${codeId}:1`,
    kind: "element",
    tagName,
    codeId,
    layoutId: "1",
    layoutPatch: {
      codeId,
      layoutId: "1",
      isSelf: true,
      tagName,
      elementIndex: 0,
    },
    slots,
    children: [],
  });

  const imgNode = (codeId) =>
    elementNode(codeId, "img", [
      attrSlot("src", "Source", "a.jpg"),
      attrSlot("alt", "Alt text", "hero"),
    ]);

  const videoNode = (codeId) =>
    elementNode(codeId, "video", [
      attrSlot("src", "Source", "a.mp4"),
      boolSlot("controls", "Video Control Visibility", "Show", "Hide"),
      boolSlot("autoplay", "Autoplay", "Yes", "No"),
      boolSlot("muted", "Mute Video", "Yes", "No"),
      boolSlot("loop", "Loop Video", "Yes", "No"),
      attrSlot("poster", "Video Poster"),
    ]);

  const headingNode = (codeId) =>
    elementNode(codeId, "h1", [
      {
        kind: "text",
        key: "text",
        label: "Text",
        isDynamic: false,
        value: "Hello",
        layoutEditable: true,
        control: "text",
      },
    ]);

  // Click a specific tree row by node id (robust against any tree the real
  // preview iframe might also emit) and confirm the panel opened.
  const openPanelFor = (node) => {
    cy.get(`[data-cy="StudioLayersRow"][data-node-id="${node.id}"]`).click();
    cy.getBySelector("StudioAttributesPanel").should("exist");
  };

  // Seed the template source for a code region so layout-mode edits have a
  // source to patch, then feed + open the matching element node.
  const seedLayoutElement = (codeId, source, node) => {
    postBridgeMessage({
      type: "TEMPLATE_SOURCE_MAP",
      templateSourceByCodeId: { [codeId]: source },
    });
    feedTree(node);
    openPanelFor(node);
  };

  before(() => {
    cy.task("seed:content", "fixtures/studio.json").then(({ model, items }) => {
      modelZUID = model.ZUID;
      studioPath = `/${items[0].web.pathPart}`;
    });
  });

  after(() => {
    if (modelZUID) cy.deleteModel(modelZUID);
  });

  beforeEach(() => {
    cy.waitOn("/v1/content/models**", () => {
      cy.visit(`/studio?path=${studioPath}`);
    });
  });

  it("opens the attributes panel with read-only src + alt for an img in content mode", () => {
    const node = imgNode("code-1");
    feedTree(node);
    openPanelFor(node);

    // Content mode is read-only for static attributes.
    cy.getBySelector("StudioAttrInput-src").should("exist").and("be.disabled");
    cy.getBySelector("StudioAttrInput-alt").should("exist").and("be.disabled");

    cy.getBySelector("StudioAttributesPanelClose").click();
    cy.getBySelector("StudioAttributesPanel").should("not.exist");
  });

  it("surfaces the full video attribute set", () => {
    const node = videoNode("code-1");
    feedTree(node);
    openPanelFor(node);

    // Media Type selector (img/video family) + the six video attributes.
    cy.getBySelector("StudioTagSelect").should("exist");
    ["src", "controls", "autoplay", "muted", "loop", "poster"].forEach(
      (key) => {
        cy.getBySelector(`StudioAttrInput-${key}`).should("exist");
      }
    );
  });

  it("changes a heading's tag (h1 → h2) and saves it to the view code", () => {
    setStudioMode("layout");
    cy.apiRequest({
      url: `${API_ENDPOINTS.devInstance}/web/views?status=dev`,
    }).then(({ data }) => {
      const webView = data?.[0];
      expect(webView?.ZUID).to.exist;
      cy.intercept("PUT", `/v1/web/views/${webView.ZUID}`).as("updateWebView");

      seedLayoutElement(
        webView.ZUID,
        `<h1 data-layout-id="1">Hello</h1>`,
        headingNode(webView.ZUID)
      );

      selectMuiOption("StudioTagSelect", "h2");

      cy.getBySelector("StudioLayoutSaveBar").should("exist");
      saveAllViaModal("layout");

      cy.wait("@updateWebView").then(({ request }) => {
        expect(request.body.code).to.contain("<h2");
        expect(request.body.code).to.contain("Hello");
        expect(request.body.code).not.to.contain("<h1");
      });
    });
  });

  it("swaps an img to a video (Media Type) and saves the new tag", () => {
    setStudioMode("layout");
    cy.apiRequest({
      url: `${API_ENDPOINTS.devInstance}/web/views?status=dev`,
    }).then(({ data }) => {
      const webView = data?.[0];
      expect(webView?.ZUID).to.exist;
      cy.intercept("PUT", `/v1/web/views/${webView.ZUID}`).as("updateWebView");

      seedLayoutElement(
        webView.ZUID,
        `<img data-layout-id="1" src="a.jpg" alt="hero">`,
        imgNode(webView.ZUID)
      );

      selectMuiOption("StudioTagSelect", "video");
      // The panel reflects the swap immediately.
      cy.getBySelector("StudioAttributesPanel").should("contain", "Video");

      cy.getBySelector("StudioLayoutSaveBar").should("exist");
      saveAllViaModal("layout");

      cy.wait("@updateWebView").then(({ request }) => {
        expect(request.body.code).to.contain("<video");
        expect(request.body.code).to.contain("a.jpg");
        expect(request.body.code).not.to.contain("<img");
      });
    });
  });

  it("toggles a boolean video attribute (controls) and saves its presence", () => {
    setStudioMode("layout");
    cy.apiRequest({
      url: `${API_ENDPOINTS.devInstance}/web/views?status=dev`,
    }).then(({ data }) => {
      const webView = data?.[0];
      expect(webView?.ZUID).to.exist;
      cy.intercept("PUT", `/v1/web/views/${webView.ZUID}`).as("updateWebView");

      seedLayoutElement(
        webView.ZUID,
        `<video data-layout-id="1" src="a.mp4"></video>`,
        videoNode(webView.ZUID)
      );

      // "Show" adds the bare `controls` attribute.
      selectMuiOption("StudioAttrInput-controls", "true");

      cy.getBySelector("StudioLayoutSaveBar").should("exist");
      saveAllViaModal("layout");

      cy.wait("@updateWebView").then(({ request }) => {
        expect(request.body.code).to.contain("controls");
        expect(request.body.code).to.contain("<video");
      });
    });
  });
});

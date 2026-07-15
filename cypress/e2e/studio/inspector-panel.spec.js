import { API_ENDPOINTS } from "../../support/api";

// The Inspector panel is driven entirely by the in-iframe bridge via a
// `LAYERS_TREE` postMessage. As every studio spec does, we impersonate the
// bridge from the parent window (the real cross-origin preview is never
// touched) and assert on the host React UI plus the same-origin web/views PUT.
describe("Studio Inspector Panel", () => {
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

  // Slots mirror exactly what the bridge emits: a STRUCTURAL description, with
  // no human-facing copy (the panel owns labels, keyed off `key`).
  //
  // They carry BOTH views: `value` (resolved, content mode) and `sourceValue`
  // (raw template, layout mode). Those only differ when the template holds a
  // Parsley expression — precisely the case layout mode must never overwrite
  // with the resolved output.
  const attrSlot = (attr, value = "", sourceValue = value) => ({
    kind: "attribute",
    key: attr,
    attr,
    isDynamic: sourceValue !== value,
    value,
    sourceValue,
    layoutEditable: true,
    control: "text",
  });

  // The panel derives the on/off options from `booleanAttr` — the bridge only
  // flags the kind.
  const boolSlot = (attr) => ({
    kind: "attribute",
    key: attr,
    attr,
    isDynamic: false,
    value: "false",
    sourceValue: "false",
    layoutEditable: true,
    control: "select",
    booleanAttr: true,
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
      attrSlot("src", "a.jpg"),
      attrSlot("alt", "hero"),
    ]);

  const videoNode = (codeId) =>
    elementNode(codeId, "video", [
      attrSlot("src", "a.mp4"),
      boolSlot("controls"),
      boolSlot("autoplay"),
      boolSlot("muted"),
      boolSlot("loop"),
      attrSlot("poster"),
    ]);

  // A link. Its `href` is bound to a field, so the raw template value is a
  // Parsley expression while the rendered page shows the resolved URL.
  const linkNode = (codeId, resolvedHref, sourceHref) =>
    elementNode(codeId, "a", [attrSlot("href", resolvedHref, sourceHref)]);

  // A heading element carries no text slot — just the Tag selector (its `slots`
  // array is present but empty). Its inner text lives on a separate text node.
  const headingNode = (codeId) => elementNode(codeId, "h1", []);

  const leafPatch = (codeId) => ({
    codeId,
    layoutId: "1",
    isSelf: true,
    tagName: "h1",
    elementIndex: 0,
  });

  // A static text run carries `textIndex` — its position among the runs its
  // element owns — so it can be written without disturbing anything else in the
  // element. A dynamic field's Value IS the whole binding, so it has none.
  const textSlot = (
    value,
    isDynamic = false,
    sourceValue = value,
    textIndex = undefined
  ) => ({
    kind: "text",
    key: "text",
    control: "text",
    isDynamic,
    value,
    sourceValue,
    layoutEditable: true,
    ...(textIndex === undefined ? {} : { textIndex }),
  });

  // A dynamic field row. Its Value slot carries the resolved output AND the raw
  // template expression — layout mode must surface the latter.
  const fieldNode = (codeId, codeRef, resolved) => ({
    id: `${codeId}:field:studio-1:1`,
    kind: "field",
    tagName: null,
    codeId,
    layoutId: null,
    studioId: "studio-1",
    fieldZuid: "7-abc-123",
    fieldType: "text",
    label: "Title",
    layoutPatch: leafPatch(codeId),
    slots: [textSlot(resolved, true, codeRef)],
    children: [],
  });

  // A text run inside its enclosing element, addressed by layout id + run index,
  // exposing the editable Value slot.
  const textNode = (codeId, value, textIndex = 0) => ({
    id: `${codeId}:textOf:1:${textIndex}`,
    kind: "text",
    tagName: null,
    codeId,
    layoutId: null,
    label: value,
    layoutPatch: leafPatch(codeId),
    slots: [textSlot(value, false, value, textIndex)],
    children: [],
  });

  // A <div> whose only content is text. The bridge reports the text hanging
  // straight off the container; the host synthesizes the text element around it.
  const bareTextDivNode = (codeId, value) => ({
    ...elementNode(codeId, "div", []),
    children: [textNode(codeId, value)],
  });

  // Click a specific tree row by node id (robust against any tree the real
  // preview iframe might also emit) and confirm the panel opened.
  const openPanelFor = (node) => {
    cy.get(`[data-cy="StudioLayersRow"][data-node-id="${node.id}"]`).click();
    cy.getBySelector("StudioInspectorPanel").should("exist");
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

  it("opens the inspector panel with read-only src + alt for an img in content mode", () => {
    const node = imgNode("code-1");
    feedTree(node);
    openPanelFor(node);

    // Content mode is read-only for static attributes.
    cy.getBySelector("StudioSlotInput-src").should("exist").and("be.disabled");
    cy.getBySelector("StudioSlotInput-alt").should("exist").and("be.disabled");

    cy.getBySelector("StudioInspectorPanelClose").click();
    cy.getBySelector("StudioInspectorPanel").should("not.exist");
  });

  it("shows a connected attribute as the same field chip in content mode", () => {
    // A dynamic (bound) src renders as the connected field chip — the same UI as
    // layout mode — not a raw input. A static attribute stays a plain input.
    const node = elementNode("code-1", "img", [
      {
        kind: "attribute",
        key: "src",
        attr: "src",
        isDynamic: true,
        fieldType: "images",
        value: "Hero Image",
        sourceValue: "{{this.image.getImage()}}",
        layoutEditable: true,
        control: "text",
      },
      attrSlot("alt", "hero"),
    ]);
    feedTree(node);
    openPanelFor(node);

    cy.getBySelector("StudioConnectedField").should(
      "contain.text",
      "Hero Image"
    );
    cy.getBySelector("StudioSlotInput-src").should("not.exist");
    cy.getBySelector("StudioSlotInput-alt").should("exist").and("be.disabled");
  });

  it("surfaces the full video attribute set", () => {
    const node = videoNode("code-1");
    feedTree(node);
    openPanelFor(node);

    // Media Type selector (img/video family) + the six video attributes.
    cy.getBySelector("StudioTagSelect").should("exist");
    ["src", "controls", "autoplay", "muted", "loop", "poster"].forEach(
      (key) => {
        cy.getBySelector(`StudioSlotInput-${key}`).should("exist");
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

      // The element panel is tag-only — no Text input on the element itself.
      cy.getBySelector("StudioSlotInput-text").should("not.exist");

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

  it("edits text that shares its element with a <span>, without touching the span", () => {
    setStudioMode("layout");
    cy.apiRequest({
      url: `${API_ENDPOINTS.devInstance}/web/views?status=dev`,
    }).then(({ data }) => {
      const webView = data?.[0];
      expect(webView?.ZUID).to.exist;
      cy.intercept("PUT", `/v1/web/views/${webView.ZUID}`).as("updateWebView");

      // `hello` is loose text sharing its <div> with a <span> that has its own
      // layout id and its own (dynamic) content.
      postBridgeMessage({
        type: "TEMPLATE_SOURCE_MAP",
        templateSourceByCodeId: {
          [webView.ZUID]: `<div data-layout-id="1">hello<span data-layout-id="2">{{this.title}}</span></div>`,
        },
      });

      const hello = textNode(webView.ZUID, "hello", 0);
      feedTree({
        ...elementNode(webView.ZUID, "div", []),
        children: [hello],
      });

      // This run had no slot at all before it was addressable — the panel could
      // not reach text that shared its element with another node.
      openPanelFor(hello);
      cy.getBySelector("StudioSlotInput-text").should("have.value", "hello");

      // The bridge writes the one run and echoes the leaf's innerHTML; the host
      // folds that into the source. Stand in for that echo — the real bridge is
      // cross-origin — carrying the span's RESOLVED output, as the live DOM has.
      postBridgeMessage({
        type: "LAYOUT_CONTENT_UPDATE",
        codeId: webView.ZUID,
        layoutId: "1",
        innerHtml: `howdy<span data-layout-id="2">Resolved Title</span>`,
      });

      cy.getBySelector("StudioLayoutSaveBar").should("exist");
      saveAllViaModal("layout");

      cy.wait("@updateWebView").then(({ request }) => {
        expect(request.body.code).to.contain("howdy");
        // The nested layout is restored from the TEMPLATE, so its Parsley
        // survives — the span's rendered output must never be baked into source.
        expect(request.body.code).to.contain("{{this.title}}");
        expect(request.body.code).not.to.contain("Resolved Title");
      });
    });
  });

  it("wraps loose text in a read-only Text placeholder", () => {
    setStudioMode("layout");
    cy.apiRequest({
      url: `${API_ENDPOINTS.devInstance}/web/views?status=dev`,
    }).then(({ data }) => {
      const webView = data?.[0];
      expect(webView?.ZUID).to.exist;

      postBridgeMessage({
        type: "TEMPLATE_SOURCE_MAP",
        templateSourceByCodeId: {
          [webView.ZUID]: `<div data-layout-id="1">Hello</div>`,
        },
      });
      feedTree(bareTextDivNode(webView.ZUID, "Hello"));

      // The host inserts a text element the bridge never sent, so loose text
      // reads exactly like <h1>Hello</h1> does: a text element, value beneath.
      // The row is named for what it IS ("Text"); that it has no tag is a fact
      // about its tag, and lives in the selector.
      cy.get(
        `[data-cy="StudioLayersRow"][data-node-id="${webView.ZUID}:textOf:1:0:noTag"]`
      )
        .should("contain.text", "Text")
        .click();
      cy.getBySelector("StudioInspectorPanel").should("exist");

      // Presentational only: the placeholder is not an element in the markup, so
      // its tag cannot be changed (that would mean WRAPPING the text in a new
      // element, which needs an address loose text doesn't have).
      cy.getBySelector("StudioTagSelect").should("be.disabled");
    });
  });

  it("edits a text node's content (not the element) and saves it", () => {
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
        textNode(webView.ZUID, "Hello")
      );

      // A text node shows the Text input, no Tag selector.
      cy.getBySelector("StudioTagSelect").should("not.exist");
      cy.getBySelector("StudioSlotInput-text")
        .should("exist")
        .clear()
        .type("Goodbye");

      // An addressed run is written by the bridge, which edits that one run and
      // echoes the leaf's innerHTML — the host stages from that echo, not from
      // the keystrokes. Stand in for the (cross-origin) bridge's echo.
      postBridgeMessage({
        type: "LAYOUT_CONTENT_UPDATE",
        codeId: webView.ZUID,
        layoutId: "1",
        innerHtml: "Goodbye",
      });

      cy.getBySelector("StudioLayoutSaveBar").should("exist");
      saveAllViaModal("layout");

      cy.wait("@updateWebView").then(({ request }) => {
        expect(request.body.code).to.contain("Goodbye");
        expect(request.body.code).not.to.contain("Hello");
      });
    });
  });

  it("shows a dynamic binding as a connected field, then disconnects to rewrite it", () => {
    setStudioMode("layout");
    cy.apiRequest({
      url: `${API_ENDPOINTS.devInstance}/web/views?status=dev`,
    }).then(({ data }) => {
      const webView = data?.[0];
      expect(webView?.ZUID).to.exist;
      cy.intercept("PUT", `/v1/web/views/${webView.ZUID}`).as("updateWebView");

      seedLayoutElement(
        webView.ZUID,
        `<h1 data-layout-id="1">{{this.title}}</h1>`,
        // Resolved output is "My Real Title"; the template holds the expression.
        fieldNode(webView.ZUID, "{{this.title}}", "My Real Title")
      );

      // A dynamic binding renders as a CONNECTED field chip — never the resolved
      // output ("My Real Title"), never the raw "{{this.title}}" in a free-form
      // input. No Tag selector, and the action is Disconnect.
      cy.getBySelector("StudioTagSelect").should("not.exist");
      cy.getBySelector("StudioConnectedField").should("contain.text", "title");
      cy.getBySelector("StudioSlotInput-text").should("not.exist");

      // Disconnect returns a free-form input; a new expression saves to the code.
      cy.getBySelector("StudioDisconnect-text").click();
      cy.getBySelector("StudioSlotInput-text")
        .should("exist")
        .and("have.value", "")
        .type("{{this.content}}", { parseSpecialCharSequences: false });

      cy.getBySelector("StudioLayoutSaveBar").should("exist");
      saveAllViaModal("layout");

      cy.wait("@updateWebView").then(({ request }) => {
        expect(request.body.code).to.contain("{{this.content}}");
        expect(request.body.code).not.to.contain("{{this.title}}");
      });
    });
  });

  it("connects a text field, shown as a connected field, then disconnects", () => {
    setStudioMode("layout");
    cy.apiRequest({
      url: `${API_ENDPOINTS.devInstance}/web/views?status=dev`,
    }).then(({ data }) => {
      const webView = data?.[0];
      expect(webView?.ZUID).to.exist;

      seedLayoutElement(
        webView.ZUID,
        `<h1 data-layout-id="1">Hello</h1>`,
        textNode(webView.ZUID, "Hello")
      );

      // Pick a text field. The raw "{{this.title}}" is hidden behind the field
      // chip — which renders only when the value EXACTLY equals the field's
      // Parsley, so its presence also proves the emitted expression. The
      // free-form input is gone and the action flips to Disconnect.
      cy.getBySelector("StudioConnectContent-text").click();
      cy.getBySelector("StudioConnectField-title").click();
      cy.getBySelector("StudioConnectedField").should("contain.text", "title");
      cy.getBySelector("StudioSlotInput-text").should("not.exist");

      // Disconnect returns a free-form, empty input.
      cy.getBySelector("StudioDisconnect-text").click();
      cy.getBySelector("StudioSlotInput-text")
        .should("exist")
        .and("have.value", "");
    });
  });

  it("connects media + external-URL fields to an image src, each with the right expression", () => {
    setStudioMode("layout");
    cy.apiRequest({
      url: `${API_ENDPOINTS.devInstance}/web/views?status=dev`,
    }).then(({ data }) => {
      const webView = data?.[0];
      expect(webView?.ZUID).to.exist;
      cy.intercept("PUT", `/v1/web/views/${webView.ZUID}`).as("updateWebView");

      seedLayoutElement(
        webView.ZUID,
        `<img data-layout-id="1" src="a.jpg" />`,
        imgNode(webView.ZUID)
      );

      // The src dropdown offers MEDIA + external-URL fields (never text). A media
      // asset connects as a getImage() expression; the connected chip renders
      // only on an exact match, so seeing it proves the expression.
      cy.getBySelector("StudioConnectContent-src").click();
      cy.getBySelector("StudioConnectField-title").should("not.exist");
      cy.getBySelector("StudioConnectField-hero_image").click();
      cy.getBySelector("StudioConnectedField").should(
        "contain.text",
        "Hero Image"
      );
      cy.getBySelector("StudioSlotInput-src").should("not.exist");

      // Disconnect, then connect an external-URL field — referenced plain, no
      // method. Saving writes exactly that expression to the code.
      cy.getBySelector("StudioDisconnect-src").click();
      cy.getBySelector("StudioConnectContent-src").click();
      cy.getBySelector("StudioConnectField-external_url").click();
      cy.getBySelector("StudioConnectedField").should(
        "contain.text",
        "External URL"
      );

      cy.getBySelector("StudioLayoutSaveBar").should("exist");
      saveAllViaModal("layout");
      cy.wait("@updateWebView").then(({ request }) => {
        expect(request.body.code).to.contain("{{this.external_url}}");
        expect(request.body.code).not.to.contain("getImage");
      });
    });
  });

  it("connects a text field to an image alt attribute (text fields, not media)", () => {
    setStudioMode("layout");
    cy.apiRequest({
      url: `${API_ENDPOINTS.devInstance}/web/views?status=dev`,
    }).then(({ data }) => {
      const webView = data?.[0];
      expect(webView?.ZUID).to.exist;

      seedLayoutElement(
        webView.ZUID,
        `<img data-layout-id="1" src="a.jpg" alt="hero" />`,
        imgNode(webView.ZUID)
      );

      // `alt` holds words, so it offers TEXT fields (title) — never media.
      cy.getBySelector("StudioConnectContent-alt").click();
      cy.getBySelector("StudioConnectField-hero_image").should("not.exist");
      cy.getBySelector("StudioConnectField-title").click();
      cy.getBySelector("StudioConnectedField").should("contain.text", "title");
    });
  });

  it("connects a yes/no field to a boolean video attribute, written verbatim", () => {
    setStudioMode("layout");
    cy.apiRequest({
      url: `${API_ENDPOINTS.devInstance}/web/views?status=dev`,
    }).then(({ data }) => {
      const webView = data?.[0];
      expect(webView?.ZUID).to.exist;
      cy.intercept("PUT", `/v1/web/views/${webView.ZUID}`).as("updateWebView");

      seedLayoutElement(
        webView.ZUID,
        `<video data-layout-id="1" controls></video>`,
        videoNode(webView.ZUID)
      );

      // The boolean "controls" attr offers yes/no fields only (the seed's
      // show_controls) — never text/media. Connecting writes the field reference
      // verbatim as the attribute value; Zesty drops the attribute when falsy.
      cy.getBySelector("StudioConnectContent-controls").click();
      cy.getBySelector("StudioConnectField-title").should("not.exist");
      cy.getBySelector("StudioConnectField-show_controls").click();
      cy.getBySelector("StudioConnectedField").should(
        "contain.text",
        "Show Controls"
      );

      cy.getBySelector("StudioLayoutSaveBar").should("exist");
      saveAllViaModal("layout");
      cy.wait("@updateWebView").then(({ request }) => {
        expect(request.body.code).to.contain(
          'controls="{{this.show_controls}}"'
        );
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
      cy.getBySelector("StudioInspectorPanel").should("contain", "Video");

      cy.getBySelector("StudioLayoutSaveBar").should("exist");
      saveAllViaModal("layout");

      cy.wait("@updateWebView").then(({ request }) => {
        expect(request.body.code).to.contain("<video");
        expect(request.body.code).to.contain("a.jpg");
        expect(request.body.code).not.to.contain("<img");
      });
    });
  });

  it("edits a link's bound href as its template expression, with no Tag selector", () => {
    setStudioMode("layout");
    cy.apiRequest({
      url: `${API_ENDPOINTS.devInstance}/web/views?status=dev`,
    }).then(({ data }) => {
      const webView = data?.[0];
      expect(webView?.ZUID).to.exist;
      cy.intercept("PUT", `/v1/web/views/${webView.ZUID}`).as("updateWebView");

      seedLayoutElement(
        webView.ZUID,
        `<a data-layout-id="1" href="{{this.link.getUrl()}}">Read more</a>`,
        // Rendered page resolves to a real URL; the template holds the binding.
        linkNode(webView.ZUID, "/resolved/page", "{{this.link.getUrl()}}")
      );

      // A link isn't tag-swappable (that would destroy its semantics).
      cy.getBySelector("StudioTagSelect").should("not.exist");

      // Layout mode must show the template expression, never the resolved URL —
      // writing the latter back would bake the rendered link over the binding.
      cy.getBySelector("StudioSlotInput-href")
        .should("exist")
        .and("have.value", "{{this.link.getUrl()}}")
        .and("not.have.value", "/resolved/page")
        .clear()
        .type("{{this.altLink.getUrl()}}", {
          parseSpecialCharSequences: false,
        });

      cy.getBySelector("StudioLayoutSaveBar").should("exist");
      saveAllViaModal("layout");

      cy.wait("@updateWebView").then(({ request }) => {
        expect(request.body.code).to.contain("{{this.altLink.getUrl()}}");
        expect(request.body.code).not.to.contain("/resolved/page");
      });
    });
  });

  it("swaps a container tag (div → section), preserving children, and saves it", () => {
    setStudioMode("layout");
    cy.apiRequest({
      url: `${API_ENDPOINTS.devInstance}/web/views?status=dev`,
    }).then(({ data }) => {
      const webView = data?.[0];
      expect(webView?.ZUID).to.exist;
      cy.intercept("PUT", `/v1/web/views/${webView.ZUID}`).as("updateWebView");

      seedLayoutElement(
        webView.ZUID,
        `<div data-layout-id="1"><p data-layout-id="2">Hi</p></div>`,
        elementNode(webView.ZUID, "div", [])
      );

      // A container's panel is tag-only — no attribute or text inputs.
      cy.getBySelector("StudioSlotInput-text").should("not.exist");

      selectMuiOption("StudioTagSelect", "section");

      cy.getBySelector("StudioLayoutSaveBar").should("exist");
      saveAllViaModal("layout");

      cy.wait("@updateWebView").then(({ request }) => {
        expect(request.body.code).to.contain("<section");
        expect(request.body.code).to.contain("<p>Hi</p>");
        expect(request.body.code).not.to.contain("<div");
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
      selectMuiOption("StudioSlotInput-controls", "true");

      cy.getBySelector("StudioLayoutSaveBar").should("exist");
      saveAllViaModal("layout");

      cy.wait("@updateWebView").then(({ request }) => {
        expect(request.body.code).to.contain("controls");
        expect(request.body.code).to.contain("<video");
      });
    });
  });
});

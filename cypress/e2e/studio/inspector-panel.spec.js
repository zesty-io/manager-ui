import { API_ENDPOINTS } from "../../support/api";

// The Inspector panel is driven entirely by the in-iframe bridge via a
// `LAYERS_TREE` postMessage. As every studio spec does, we impersonate the
// bridge from the parent window (the real cross-origin preview is never
// touched) and assert on the host React UI plus the same-origin web/views PUT.
describe("Studio Inspector Panel", () => {
  let studioPath = "/";
  let modelZUID = "";
  // The second seeded model + item, used as the cross-item link target.
  let linkedModelZUID = "";
  let linkedModelName = "";
  let linkedModelLabel = "";
  let linkedItemZUID = "";
  let linkedItemTitle = "";

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
  // Parsley expression while the rendered page shows the resolved URL. `target`
  // mirrors the bridge's SUPPORTED_ELEMENTS.a, which exposes both.
  const linkNode = (codeId, resolvedHref, sourceHref, target = "") =>
    elementNode(codeId, "a", [
      attrSlot("href", resolvedHref, sourceHref),
      attrSlot("target", target),
    ]);

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

  // Open the link dialog for a slot and pick the seeded "Studio Linked" item.
  const openLinkDialogAndPickItem = (slotKey) => {
    cy.getBySelector(`StudioConnectContent-${slotKey}`).click();
    cy.getBySelector(`StudioConnectOtherItem-${slotKey}`).click();
    cy.getBySelector("StudioLinkItemDialog").should("exist");
    // Nothing picked yet.
    cy.getBySelector("StudioLinkItemConfirm").should("be.disabled");

    cy.get('[data-cy="StudioLinkItemSearchInput"] input').type("Studio Linked");
    cy.wait("@linkSearch");
    // Match by name rather than position — the store also holds the studio page
    // item, and option order is by createdAt.
    cy.contains('[role="option"]', "Studio Linked").click();

    // Item picked, field not — still blocked.
    cy.getBySelector("StudioLinkItemConfirm").should("be.disabled");
  };

  // Open the "Field to connect" select and pick an option. The select is
  // disabled while the other model's fields load, and a click on a disabled MUI
  // Select is silently swallowed — so wait for it to enable first rather than
  // clicking into a dead control.
  const pickLinkField = (fieldName) => {
    cy.getBySelector("StudioLinkItemFieldSelect").should("not.be.disabled");
    selectMuiOption("StudioLinkItemFieldSelect", fieldName);
  };

  // The link controls bind to an ITEM (its page URL via getUrl()), not to a
  // field, so their Connect Item button opens the picker straight away and the
  // picked item is on its own enough to confirm.
  const pickLinkedItem = (triggerDataCy) => {
    cy.getBySelector(triggerDataCy).click();
    cy.getBySelector("StudioLinkItemDialog").should("exist");
    cy.getBySelector("StudioLinkItemConfirm").should("be.disabled");

    cy.get('[data-cy="StudioLinkItemSearchInput"] input').type("Studio Linked");
    cy.wait("@linkSearch");
    cy.contains('[role="option"]', "Studio Linked").click();

    // No field step at all — that is the difference from a field binding.
    cy.getBySelector("StudioLinkItemFieldSelect").should("not.exist");
    cy.getBySelector("StudioLinkItemConfirm").should("not.be.disabled").click();
    cy.getBySelector("StudioLinkItemDialog").should("not.exist");
  };

  // Drives the "Link from other content item" dialog end to end: search, pick
  // the seeded item, pick a field, confirm.
  const linkOtherItem = (slotKey, fieldName) => {
    openLinkDialogAndPickItem(slotKey);
    pickLinkField(fieldName);
    cy.getBySelector("StudioLinkItemConfirm").should("not.be.disabled").click();
    cy.getBySelector("StudioLinkItemDialog").should("not.exist");
  };

  // The search index is eventually consistent, so a freshly seeded item may not
  // come back from /search/items yet. Stub ONLY this query — the studio's own
  // path resolution also searches, and blanket-stubbing would break it. The
  // stubbed body carries the REAL model + item ZUIDs, so content/models and
  // content/models/:zuid/fields are still hit for real and the model-name and
  // field-datatype resolution chain is genuinely exercised.
  const stubLinkSearch = () =>
    cy
      .intercept(
        {
          method: "GET",
          url: "**/search/items**",
          query: { q: "Studio Linked" },
        },
        {
          statusCode: 200,
          body: {
            data: [
              {
                meta: {
                  ZUID: linkedItemZUID,
                  contentModelZUID: linkedModelZUID,
                  langID: 1,
                  createdAt: "2020-01-01T00:00:00Z",
                },
                web: {
                  metaTitle: linkedItemTitle,
                  metaLinkText: linkedItemTitle,
                  path: "/studio-linked/",
                },
                data: { company_name: "Acme Corp" },
                publishing: null,
              },
            ],
          },
        }
      )
      .as("linkSearch");

  before(() => {
    cy.task("seed:content", "fixtures/studio.json").then(({ model, items }) => {
      modelZUID = model.ZUID;
      studioPath = `/${items[0].web.pathPart}`;
    });
    cy.task("seed:content", "fixtures/studio-linked.json").then(
      ({ model, items }) => {
        linkedModelZUID = model.ZUID;
        // The Parsley reference name — formatName(label), not the label.
        linkedModelName = model.name;
        linkedModelLabel = model.label;
        linkedItemZUID = items[0].meta.ZUID;
        linkedItemTitle = items[0].web.metaTitle;
      }
    );
  });

  after(() => {
    if (modelZUID) cy.deleteModel(modelZUID);
    if (linkedModelZUID) cy.deleteModel(linkedModelZUID);
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

      // The tree defaults to one level: the host wraps `hello` in a Text
      // placeholder (div → No Tag → hello), which starts collapsed. Expand it
      // via its chevron — clicking the row itself would open ITS panel.
      cy.get(`[data-cy="StudioLayersRow"][data-node-id="${hello.id}:noTag"]`)
        .find('[data-cy="StudioLayersRowChevron"]')
        .click();

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

  it("connects a media asset to an image src, saving a getImage() expression", () => {
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

      // The src dropdown offers MEDIA + external-URL fields, never text.
      cy.getBySelector("StudioConnectContent-src").click();
      cy.getBySelector("StudioConnectField-title").should("not.exist");
      cy.getBySelector("StudioConnectField-hero_image").click();
      cy.getBySelector("StudioConnectedField").should(
        "contain.text",
        "Hero Image"
      );
      cy.getBySelector("StudioSlotInput-src").should("not.exist");

      // A media asset resolves via getImage().
      cy.getBySelector("StudioLayoutSaveBar").should("exist");
      saveAllViaModal("layout");
      cy.wait("@updateWebView").then(({ request }) => {
        expect(request.body.code).to.contain("{{this.hero_image.getImage()}}");
      });
    });
  });

  it("connects an external-URL field to an image src, saved verbatim (no method)", () => {
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

      // An external-URL field is a URL already — referenced plain, no method.
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

  it("closes the Inspector after a successful save", () => {
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
      cy.getBySelector("StudioInspectorPanel").should("exist");

      selectMuiOption("StudioTagSelect", "h2");
      saveAllViaModal("layout");
      cy.wait("@updateWebView");

      // A save rebuilds the tree and reloads the preview, so the row and the
      // canvas are both deselected — the Inspector must not be left describing a
      // selection nothing else agrees with.
      cy.getBySelector("StudioInspectorPanel").should("not.exist");
    });
  });

  it("closes the Inspector after discarding via Cancel", () => {
    setStudioMode("layout");
    cy.apiRequest({
      url: `${API_ENDPOINTS.devInstance}/web/views?status=dev`,
    }).then(({ data }) => {
      const webView = data?.[0];
      expect(webView?.ZUID).to.exist;

      seedLayoutElement(
        webView.ZUID,
        `<h1 data-layout-id="1">Hello</h1>`,
        headingNode(webView.ZUID)
      );
      cy.getBySelector("StudioInspectorPanel").should("exist");

      selectMuiOption("StudioTagSelect", "h2");
      cy.getBySelector("StudioLayoutCancelButton").should("exist").click();

      // Discard reloads the preview and rebuilds the tree exactly like a save
      // does, so it has to leave the same clean slate behind.
      cy.getBySelector("StudioInspectorPanel").should("not.exist");
      cy.getBySelector("StudioLayoutCancelButton").should("not.exist");
    });
  });

  it("offers Link from other content item below the current item's fields", () => {
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

      cy.getBySelector("StudioConnectContent-text").click();
      // The current item's fields are still offered; the cross-item row is
      // appended after them, never in place of them.
      cy.getBySelector("StudioConnectField-title").should("exist");
      cy.getBySelector("StudioConnectOtherItem-text")
        .should("exist")
        .and("contain.text", "Link from other content item");
    });
  });

  it("links a text field from another content item, saving a filter() expression", () => {
    setStudioMode("layout");
    stubLinkSearch();
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

      linkOtherItem("text", "company_name");

      // Shown as a chip naming the field, with the source model underneath —
      // never the raw expression in an editable input.
      cy.getBySelector("StudioConnectedField").should(
        "contain.text",
        "Company Name"
      );
      cy.getBySelector("StudioSlotInput-text").should("not.exist");

      // An addressed text run is staged from the bridge's echo, not from the
      // host's write — the bridge puts the Parsley in the run, snapshots the
      // leaf's innerHTML, and echoes THAT (then swaps in the resolved value for
      // display). Stand in for the (cross-origin) bridge.
      const expression = `{{${linkedModelName}.filter(${linkedItemZUID}).company_name}}`;
      postBridgeMessage({
        type: "LAYOUT_CONTENT_UPDATE",
        codeId: webView.ZUID,
        layoutId: "1",
        innerHtml: expression,
      });

      cy.getBySelector("StudioLayoutSaveBar").should("exist");
      saveAllViaModal("layout");
      cy.wait("@updateWebView").then(({ request }) => {
        expect(request.body.code).to.contain(expression);
      });
    });
  });

  it("links a media field from another item to an img src, emitting getImage()", () => {
    setStudioMode("layout");
    stubLinkSearch();
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

      openLinkDialogAndPickItem("src");

      // A media slot filters the OTHER model's fields the same way it filters
      // the current item's — media only, never text.
      cy.getBySelector("StudioLinkItemFieldSelect").should("not.be.disabled");
      cy.getBySelector("StudioLinkItemFieldSelect").parent().click();
      cy.getBySelector("StudioLinkItemField-logo").should("exist");
      cy.getBySelector("StudioLinkItemField-company_name").should("not.exist");
      cy.getBySelector("StudioLinkItemField-logo").click();
      cy.getBySelector("StudioLinkItemConfirm").click();

      cy.getBySelector("StudioSlotInput-src").should("not.exist");
      cy.getBySelector("StudioLayoutSaveBar").should("exist");
      saveAllViaModal("layout");
      cy.wait("@updateWebView").then(({ request }) => {
        expect(request.body.code).to.contain(
          `{{${linkedModelName}.filter(${linkedItemZUID}).logo.getImage()}}`
        );
      });
    });
  });

  it("offers only text fields when linking another item to an alt attribute", () => {
    setStudioMode("layout");
    stubLinkSearch();
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

      openLinkDialogAndPickItem("alt");

      cy.getBySelector("StudioLinkItemFieldSelect").should("not.be.disabled");
      cy.getBySelector("StudioLinkItemFieldSelect").parent().click();
      cy.getBySelector("StudioLinkItemField-company_name").should("exist");
      cy.getBySelector("StudioLinkItemField-logo").should("not.exist");
    });
  });

  it("closes the link dialog without committing, from Cancel and from the X", () => {
    setStudioMode("layout");
    stubLinkSearch();
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

      // The field select only appears once an item is chosen.
      cy.getBySelector("StudioConnectContent-text").click();
      cy.getBySelector("StudioConnectOtherItem-text").click();
      cy.getBySelector("StudioLinkItemFieldSelect").should("not.exist");
      cy.getBySelector("StudioLinkItemCancel").click();
      cy.getBySelector("StudioLinkItemDialog").should("not.exist");

      cy.getBySelector("StudioConnectContent-text").click();
      cy.getBySelector("StudioConnectOtherItem-text").click();
      cy.getBySelector("StudioLinkItemDialogClose").click();
      cy.getBySelector("StudioLinkItemDialog").should("not.exist");

      // Neither route wrote anything.
      cy.getBySelector("StudioSlotInput-text")
        .should("exist")
        .and("have.value", "Hello");
      cy.getBySelector("StudioLayoutSaveBar").should("not.exist");
    });
  });

  it("reads back an existing cross-item binding as a connected field chip", () => {
    setStudioMode("layout");
    cy.apiRequest({
      url: `${API_ENDPOINTS.devInstance}/web/views?status=dev`,
    }).then(({ data }) => {
      const webView = data?.[0];
      expect(webView?.ZUID).to.exist;

      const expression = `{{${linkedModelName}.filter(${linkedItemZUID}).company_name}}`;
      const node = {
        ...textNode(webView.ZUID, "Acme Corp"),
        slots: [textSlot("Acme Corp", false, expression, 0)],
      };

      seedLayoutElement(
        webView.ZUID,
        `<h1 data-layout-id="1">${expression}</h1>`,
        node
      );

      // Connected on sight — parsing is synchronous, so no input is ever
      // rendered that a keystroke could clobber the binding through.
      cy.getBySelector("StudioSlotInput-text").should("not.exist");
      cy.getBySelector("StudioConnectedField").should("exist");
      cy.getBySelector("StudioDisconnect-text").should("exist");

      // The label and caption arrive once models + fields resolve, proving the
      // model-name -> ZUID -> fields chain ran against the real API.
      cy.getBySelector("StudioConnectedField").should(
        "contain.text",
        "Company Name"
      );
      cy.getBySelector("StudioConnectedFieldCaption").should(
        "contain.text",
        linkedModelLabel
      );

      // The caption must name the ITEM as well as the model. `filter()` pins one
      // specific item and a model's locale siblings all share its label, so the
      // model alone can't tell you which one this points at. The langCode prefix
      // is the tell: it can only come from resolving the item, never from the
      // model label. (Falls back to the raw ZUID when the item isn't cached.)
      cy.getBySelector("StudioConnectedFieldCaption").should(
        "contain.text",
        "(en-US)"
      );

      // Disconnect returns a free-form, empty input.
      cy.getBySelector("StudioDisconnect-text").click();
      cy.getBySelector("StudioSlotInput-text")
        .should("exist")
        .and("have.value", "");
    });
  });

  it("reads back a cross-item getImage() binding on an img src", () => {
    setStudioMode("layout");
    cy.apiRequest({
      url: `${API_ENDPOINTS.devInstance}/web/views?status=dev`,
    }).then(({ data }) => {
      const webView = data?.[0];
      expect(webView?.ZUID).to.exist;

      const expression = `{{${linkedModelName}.filter(${linkedItemZUID}).logo.getImage()}}`;
      const node = elementNode(webView.ZUID, "img", [
        attrSlot("src", "resolved.jpg", expression),
        attrSlot("alt", "hero"),
      ]);

      seedLayoutElement(
        webView.ZUID,
        `<img data-layout-id="1" src="${expression}" alt="hero" />`,
        node
      );

      // The media half of read-back. app-freestyle's equivalent parser handles
      // neither first() nor filter(), so its cross-item image bindings never
      // render a chip and can't be cleared — this pins that we don't regress
      // into the same shape.
      cy.getBySelector("StudioSlotInput-src").should("not.exist");
      cy.getBySelector("StudioConnectedField").should("contain.text", "Logo");
      cy.getBySelector("StudioDisconnect-src").should("exist");
    });
  });

  it("flags a cross-item binding whose model no longer exists", () => {
    setStudioMode("layout");
    cy.apiRequest({
      url: `${API_ENDPOINTS.devInstance}/web/views?status=dev`,
    }).then(({ data }) => {
      const webView = data?.[0];
      expect(webView?.ZUID).to.exist;

      // A model that was deleted after the binding was written — the state you
      // land in whenever a linked model is removed. It must still render as a
      // connected chip (never a raw input a keystroke can destroy) but say so.
      const expression = `{{model_deleted_${Date.now()}.filter(${linkedItemZUID}).company_name}}`;
      const node = {
        ...textNode(webView.ZUID, "Acme Corp"),
        slots: [textSlot("Acme Corp", false, expression, 0)],
      };

      seedLayoutElement(
        webView.ZUID,
        `<h1 data-layout-id="1">${expression}</h1>`,
        node
      );

      cy.getBySelector("StudioSlotInput-text").should("not.exist");
      cy.getBySelector("StudioConnectedField").should("exist");
      cy.getBySelector("StudioConnectedFieldCaption").should(
        "contain.text",
        "no longer exists"
      );
      cy.getBySelector("StudioDisconnect-text").should("exist");
    });
  });

  it("flags a cross-item binding whose field no longer exists on a live model", () => {
    setStudioMode("layout");
    cy.apiRequest({
      url: `${API_ENDPOINTS.devInstance}/web/views?status=dev`,
    }).then(({ data }) => {
      const webView = data?.[0];
      expect(webView?.ZUID).to.exist;

      // Model resolves, field doesn't — a different branch from the above, and
      // the one that catches a field renamed out from under a binding.
      const expression = `{{${linkedModelName}.filter(${linkedItemZUID}).field_deleted_${Date.now()}}}`;
      const node = {
        ...textNode(webView.ZUID, "Acme Corp"),
        slots: [textSlot("Acme Corp", false, expression, 0)],
      };

      seedLayoutElement(
        webView.ZUID,
        `<h1 data-layout-id="1">${expression}</h1>`,
        node
      );

      cy.getBySelector("StudioSlotInput-text").should("not.exist");
      cy.getBySelector("StudioConnectedFieldCaption").should(
        "contain.text",
        "no longer exists"
      );
    });
  });

  it("reads back a reference written with whitespace inside the braces", () => {
    setStudioMode("layout");
    cy.apiRequest({
      url: `${API_ENDPOINTS.devInstance}/web/views?status=dev`,
    }).then(({ data }) => {
      const webView = data?.[0];
      expect(webView?.ZUID).to.exist;

      // Hand-written Parsley is spaced however its author felt like. The parser
      // tolerates it deliberately — we're reading template text we didn't write,
      // so byte-identity with our own builder's output isn't available.
      const expression = `{{ ${linkedModelName} . filter( ${linkedItemZUID} ) . company_name }}`;
      const node = {
        ...textNode(webView.ZUID, "Acme Corp"),
        slots: [textSlot("Acme Corp", false, expression, 0)],
      };

      seedLayoutElement(
        webView.ZUID,
        `<h1 data-layout-id="1">${expression}</h1>`,
        node
      );

      cy.getBySelector("StudioSlotInput-text").should("not.exist");
      cy.getBySelector("StudioConnectedField").should("exist");
      cy.getBySelector("StudioDisconnect-text").should("exist");
    });
  });

  it("reads back a binding whose field name contains characters formatName strips", () => {
    setStudioMode("layout");
    cy.apiRequest({
      url: `${API_ENDPOINTS.devInstance}/web/views?status=dev`,
    }).then(({ data }) => {
      const webView = data?.[0];
      expect(webView?.ZUID).to.exist;

      // Names created straight through the API or a JS SDK never pass through
      // formatName(), so hyphens (and worse) genuinely occur in the wild. The
      // parser must key off the delimiters, not an assumed alphabet — matching
      // only [\w]+ here silently drops the binding back to a raw text input,
      // where the next keystroke destroys it.
      const expression = `{{articles.filter(7-a2eed7bef2-slw088).node-sdk_updateItem_1733876716599}}`;
      const node = {
        ...textNode(webView.ZUID, "Resolved value"),
        slots: [textSlot("Resolved value", false, expression, 0)],
      };

      seedLayoutElement(
        webView.ZUID,
        `<h1 data-layout-id="1">${expression}</h1>`,
        node
      );

      cy.getBySelector("StudioSlotInput-text").should("not.exist");
      cy.getBySelector("StudioConnectedField").should("exist");
      cy.getBySelector("StudioDisconnect-text").should("exist");
    });
  });

  it("keeps a cross-item src chip when the layers tree re-emits the node", () => {
    setStudioMode("layout");
    cy.apiRequest({
      url: `${API_ENDPOINTS.devInstance}/web/views?status=dev`,
    }).then(({ data }) => {
      const webView = data?.[0];
      expect(webView?.ZUID).to.exist;

      const expression = `{{${linkedModelName}.filter(${linkedItemZUID}).logo.getImage()}}`;
      const node = elementNode(webView.ZUID, "img", [
        attrSlot("src", "resolved.jpg", expression),
        attrSlot("alt", "hero"),
      ]);

      seedLayoutElement(
        webView.ZUID,
        `<img data-layout-id="1" src="${expression}" alt="hero" />`,
        node
      );
      cy.getBySelector("StudioConnectedField").should("exist");

      // The panel's `values` buffer is re-seeded for src/poster on every tree
      // emit. If a re-emit ever fed the RESOLVED src back in, the chip would
      // flip to an input holding the resolved URL and the next save would bake
      // it over the binding.
      feedTree(node);
      cy.getBySelector("StudioConnectedField").should("exist");
      cy.getBySelector("StudioSlotInput-src").should("not.exist");
    });
  });

  // The <a> a wrap creates carries no data-layout-id — layout ids come from the
  // render pipeline and are stripped again before save — so it is addressed as
  // the PARENT of the element the panel already has coordinates for, and the
  // panel reads it back out of the cached template rather than off the tree.
  it("wraps the selected element in a link and saves the <a>", () => {
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

      // Unlinked: the only affordance is Add Link.
      cy.getBySelector("StudioLinkToInput").should("not.exist");
      cy.getBySelector("StudioAddLink").click();

      // A fresh wrapper has no href, so there is nothing to open in a new tab.
      cy.getBySelector("StudioLinkToInput").should("have.value", "");
      cy.getBySelector("StudioOpenInNewTab").should("not.exist");
      // Wrapping is itself an edit, even before a URL is typed.
      cy.getBySelector("StudioAddLink").should("not.exist");
      cy.getBySelector("StudioLayoutSaveBar").should("exist");

      saveAllViaModal("layout");
      cy.wait("@updateWebView").then(({ request }) => {
        // The <a> holds no attributes yet — an unfinished link is not a link.
        expect(request.body.code).to.contain(
          '<a><img src="a.jpg" alt="hero"></a>'
        );
      });
    });
  });

  it("saves a URL typed into an existing link wrapper", () => {
    setStudioMode("layout");
    cy.apiRequest({
      url: `${API_ENDPOINTS.devInstance}/web/views?status=dev`,
    }).then(({ data }) => {
      const webView = data?.[0];
      expect(webView?.ZUID).to.exist;
      cy.intercept("PUT", `/v1/web/views/${webView.ZUID}`).as("updateWebView");

      seedLayoutElement(
        webView.ZUID,
        `<a><img data-layout-id="1" src="a.jpg" alt="hero"></a>`,
        imgNode(webView.ZUID)
      );

      cy.getBySelector("StudioOpenInNewTab").should("not.exist");
      cy.getBySelector("StudioLinkToInput").type("https://www.zesty.io/");
      cy.getBySelector("StudioOpenInNewTab").should("exist");

      // The URL write is debounced, so the save bar appearing IS the signal
      // that it reached the template — nothing else has been edited here.
      cy.getBySelector("StudioLayoutSaveBar").should("exist");
      saveAllViaModal("layout");
      cy.wait("@updateWebView").then(({ request }) => {
        expect(request.body.code).to.contain(
          '<a href="https://www.zesty.io/"><img'
        );
      });
    });
  });

  it("hides Open in new tab for a fragment href", () => {
    setStudioMode("layout");
    cy.apiRequest({
      url: `${API_ENDPOINTS.devInstance}/web/views?status=dev`,
    }).then(({ data }) => {
      const webView = data?.[0];
      expect(webView?.ZUID).to.exist;

      seedLayoutElement(
        webView.ZUID,
        `<img data-layout-id="1" src="a.jpg" alt="hero">`,
        imgNode(webView.ZUID)
      );

      cy.getBySelector("StudioAddLink").click();

      // A fragment never leaves the page, so the row is meaningless for it.
      cy.getBySelector("StudioLinkToInput").type("#section-two");
      cy.getBySelector("StudioOpenInNewTab").should("not.exist");

      // …and comes back the moment the destination can open a tab.
      cy.getBySelector("StudioLinkToInput").clear().type("/about/");
      cy.getBySelector("StudioOpenInNewTab").should("exist");
    });
  });

  it("writes target=_blank from Open in new tab, and removes it again", () => {
    setStudioMode("layout");
    cy.apiRequest({
      url: `${API_ENDPOINTS.devInstance}/web/views?status=dev`,
    }).then(({ data }) => {
      const webView = data?.[0];
      expect(webView?.ZUID).to.exist;
      cy.intercept("PUT", `/v1/web/views/${webView.ZUID}`).as("updateWebView");

      // Already wrapped, so the panel opens straight into the linked state.
      seedLayoutElement(
        webView.ZUID,
        `<a href="/about/"><img data-layout-id="1" src="a.jpg" alt="hero"></a>`,
        imgNode(webView.ZUID)
      );

      cy.getBySelector("StudioAddLink").should("not.exist");
      cy.getBySelector("StudioLinkToInput").should("have.value", "/about/");

      selectMuiOption("StudioOpenInNewTab", "_blank");
      // The select's displayed value is read back off the template, so this
      // only passes once the write has actually landed there.
      cy.getBySelector("StudioOpenInNewTab").should("have.value", "_blank");

      // "No" must REMOVE the attribute — `target=""` is noise in saved code.
      selectMuiOption("StudioOpenInNewTab", "");
      cy.getBySelector("StudioOpenInNewTab").should("have.value", "");

      saveAllViaModal("layout");
      cy.wait("@updateWebView").then(({ request }) => {
        expect(request.body.code).to.contain('<a href="/about/">');
        expect(request.body.code).not.to.contain("target");
      });
    });
  });

  it("removes the link, leaving the element and its siblings in place", () => {
    setStudioMode("layout");
    cy.apiRequest({
      url: `${API_ENDPOINTS.devInstance}/web/views?status=dev`,
    }).then(({ data }) => {
      const webView = data?.[0];
      expect(webView?.ZUID).to.exist;
      cy.intercept("PUT", `/v1/web/views/${webView.ZUID}`).as("updateWebView");

      // The wrapper holds a caption as well as the addressed image — unwrapping
      // must move both out, not just the element the panel is pointing at.
      seedLayoutElement(
        webView.ZUID,
        `<a href="/about/" target="_blank"><img data-layout-id="1" src="a.jpg" alt="hero"><span>Caption</span></a>`,
        imgNode(webView.ZUID)
      );

      cy.getBySelector("StudioRemoveLink").click();
      cy.getBySelector("StudioLinkToInput").should("not.exist");
      cy.getBySelector("StudioAddLink").should("exist");

      saveAllViaModal("layout");
      cy.wait("@updateWebView").then(({ request }) => {
        expect(request.body.code).not.to.contain("<a ");
        expect(request.body.code).to.contain("<img");
        expect(request.body.code).to.contain("<span>Caption</span>");
      });
    });
  });

  it("binds a link to another content item, saving getUrl()", () => {
    setStudioMode("layout");
    stubLinkSearch();
    cy.apiRequest({
      url: `${API_ENDPOINTS.devInstance}/web/views?status=dev`,
    }).then(({ data }) => {
      const webView = data?.[0];
      expect(webView?.ZUID).to.exist;
      cy.intercept("PUT", `/v1/web/views/${webView.ZUID}`).as("updateWebView");

      seedLayoutElement(
        webView.ZUID,
        `<a href=""><img data-layout-id="1" src="a.jpg" alt="hero"></a>`,
        imgNode(webView.ZUID)
      );

      pickLinkedItem("StudioLinkConnectItem");

      // The binding is to the ITEM, so the chip names the item and the raw
      // input is gone — a keystroke must not be able to land on it.
      cy.getBySelector("StudioLinkToInput").should("not.exist");
      cy.getBySelector("StudioConnectedField").should("exist");

      saveAllViaModal("layout");
      cy.wait("@updateWebView").then(({ request }) => {
        expect(request.body.code).to.contain(
          `{{${linkedModelName}.filter(${linkedItemZUID}).getUrl()}}`
        );
      });
    });
  });

  it("reads back a getUrl() link as a connected item, never a resolved URL", () => {
    setStudioMode("layout");
    cy.apiRequest({
      url: `${API_ENDPOINTS.devInstance}/web/views?status=dev`,
    }).then(({ data }) => {
      const webView = data?.[0];
      expect(webView?.ZUID).to.exist;

      const expression = `{{${linkedModelName}.filter(${linkedItemZUID}).getUrl()}}`;
      seedLayoutElement(
        webView.ZUID,
        `<a href="${expression}"><img data-layout-id="1" src="a.jpg" alt="hero"></a>`,
        imgNode(webView.ZUID)
      );

      // Connected on sight — the parse is synchronous, so the input is never
      // rendered for even one frame.
      cy.getBySelector("StudioLinkToInput").should("not.exist");
      cy.getBySelector("StudioConnectedField").should("exist");
      // Resolving the model name proves the read-back ran, not just the parse.
      cy.getBySelector("StudioConnectedFieldCaption").should(
        "contain.text",
        linkedModelLabel
      );

      // Disconnect is local: it returns a free-form input without committing,
      // so the binding survives until something replaces it.
      cy.getBySelector("StudioLinkDisconnect").click();
      cy.getBySelector("StudioLinkToInput")
        .should("exist")
        .and("have.value", "");
      cy.getBySelector("StudioLayoutSaveBar").should("not.exist");
    });
  });

  it("gives a link its own href and Open in new tab controls, but no Add Link", () => {
    setStudioMode("layout");
    cy.apiRequest({
      url: `${API_ENDPOINTS.devInstance}/web/views?status=dev`,
    }).then(({ data }) => {
      const webView = data?.[0];
      expect(webView?.ZUID).to.exist;

      // An <a> edits its own href through its slot; nesting links is invalid.
      seedLayoutElement(
        webView.ZUID,
        `<a data-layout-id="1" href="/about/">Read more</a>`,
        linkNode(webView.ZUID, "/about/", "/about/")
      );

      cy.getBySelector("StudioAddLink").should("not.exist");
      cy.getBySelector("StudioSlotInput-href").should("have.value", "/about/");
      // `target` is exposed as the same Yes/No choice, not as a raw string.
      cy.getBySelector("StudioSlotInput-target").should("have.value", "");
      // …and its destination can be bound to an item, like a wrapper's can.
      cy.getBySelector("StudioConnectContent-href").should("exist");
    });
  });

  it("offers no Add Link for an element already inside a link", () => {
    setStudioMode("layout");
    cy.apiRequest({
      url: `${API_ENDPOINTS.devInstance}/web/views?status=dev`,
    }).then(({ data }) => {
      const webView = data?.[0];
      expect(webView?.ZUID).to.exist;

      // A link further up rules out wrapping, but isn't this element's to edit
      // either — it belongs to whichever element it directly wraps.
      seedLayoutElement(
        webView.ZUID,
        `<a href="/about/"><span><img data-layout-id="1" src="a.jpg" alt="hero"></span></a>`,
        imgNode(webView.ZUID)
      );

      cy.getBySelector("StudioSlotInput-src").should("exist");
      cy.getBySelector("StudioAddLink").should("not.exist");
      cy.getBySelector("StudioLinkToInput").should("not.exist");
    });
  });
});

// Studio's content round trip, against a REAL rendered page.
//
// Every other studio spec impersonates the bridge from the parent window and
// asserts only host-side consequences, because the seeded page never rendered:
// a new pageset model's auto-created view is `{{this.autolayout()}}`, which
// answers 504, so the preview was blank and no bridge ever loaded. The
// `studio-complex` fixture ships its own view, so the page here renders, the
// deployed bridge runs in the iframe, and the canvas is real.
//
// That matters because the panel -> canvas half of two-way binding has no
// host-side consequence at all. It shipped broken in full mode (both halves
// were gated `interactionMode === "content"`) and nothing caught it.
//
// The preview is cross-origin, so its DOM is unreadable from here. It does not
// need to be: the bridge re-emits LAYERS_TREE when the canvas mutates, and
// that message arrives in the parent. A repaint is therefore observable as a
// tree carrying the new value.
describe("Studio two-way binding", () => {
  let itemZUID = "";
  let studioPath = "/";
  let fieldByName = {};

  before(() => {
    cy.task("seed:content", "fixtures/studio-complex.json", {
      timeout: 120000,
    }).then(({ items, fields }) => {
      itemZUID = items[0].meta.ZUID;
      studioPath = `/${items[0].web.pathPart}`;
      fieldByName = Object.fromEntries(fields.map((f) => [f.name, f]));
    });
  });

  beforeEach(() => {
    cy.waitOn("/v1/content/models**", () => {
      cy.visit(`/studio?path=${studioPath}`);
    });
    cy.getBySelector("StudioHeader").should("exist");

    // Capture what the real bridge posts. Installed per test so each one reads
    // only its own traffic.
    cy.window().then((win) => {
      win.__studioMessages = [];
      win.__studioListener = (e) => {
        const message = e.data?.message;
        if (message?.type) win.__studioMessages.push(message);
      };
      win.addEventListener("message", win.__studioListener);
    });

    // Nothing below means anything until the bridge in the iframe is alive AND
    // has resolved the page's field bindings. The bridge posts an early tree
    // before #studio-entities is parsed, whose nodes carry no fieldZuid —
    // waiting on "a tree arrived" accepts that one and reads back nothing.
    cy.window({ timeout: 60000 }).should((win) => {
      expect(
        boundFieldZuids(win).length,
        "the real bridge posted a layers tree carrying bound fields"
      ).to.be.greaterThan(0);
    });
  });

  // Selection normally comes from a double-click on the canvas, which a
  // cross-origin iframe will not accept from the test. The canvas is real
  // either way — only the gesture is stood in for.
  const eachNode = (tree, visit) => {
    const walk = (nodes) =>
      (nodes || []).forEach((n) => {
        visit(n);
        walk(n.children);
      });
    walk(tree?.nodes || tree?.tree || []);
  };

  // The most recent tree that actually carries bindings, which is not always
  // the most recent tree.
  const lastBoundTree = (win) =>
    win.__studioMessages
      .filter((m) => m.type === "LAYERS_TREE")
      .filter((tree) => {
        let any = false;
        eachNode(tree, (n) => {
          if (n.fieldZuid) any = true;
        });
        return any;
      })
      .pop();

  const boundFieldZuids = (win) => {
    const seen = [];
    eachNode(lastBoundTree(win), (n) => n.fieldZuid && seen.push(n.fieldZuid));
    return seen;
  };

  // Every value here is read back out of what the REAL bridge reported, rather
  // than fabricated. `studioId` in particular is load-bearing: the repaint
  // effect bails without it, so a request that omits it looks like a working
  // selection and silently paints nothing.
  const bridgeNodeFor = (win, fieldZuid) => {
    let found = null;
    eachNode(lastBoundTree(win), (n) => {
      if (!found && n.fieldZuid === fieldZuid) found = n;
    });
    return found;
  };

  const selectField = (name) =>
    cy.window().then((win) => {
      const field = fieldByName[name];
      const node = bridgeNodeFor(win, field.ZUID);
      expect(node, `${name} present in the bridge's layers tree`).to.exist;
      expect(node.studioId, `${name} carries a studio id`).to.exist;
      win.postMessage(
        {
          source: "studio-bridge",
          message: {
            type: "DYNAMIC_EDIT_REQUEST",
            studioId: node.studioId,
            fieldZuid: field.ZUID,
            fieldType: field.datatype,
            itemZuid: node.itemZuid || itemZUID,
            modelZuid: node.modelZuid || field.contentModelZUID,
          },
        },
        "*"
      );
    });

  // The repaint effect reads the OPEN editor's value, so it needs the panel
  // mounted and the item hydrated in the store. Dispatching before either is
  // true produces a green-looking no-op.
  const editInPanel = (name, value) => {
    cy.getBySelector("StudioSidePanel").should("exist");
    cy.window().should((win) => {
      expect(
        win.zestyStore.getState().content[itemZUID]?.meta?.ZUID,
        "page item hydrated in store"
      ).to.eq(itemZUID);
    });
    cy.window().then((win) => {
      win.__studioMessages.length = 0;
      win.zestyStore.dispatch({
        type: "SET_ITEM_DATA",
        itemZUID,
        key: name,
        value,
      });
    });
  };

  const canvasShows = (value) =>
    cy.window({ timeout: 20000 }).should((win) => {
      const painted = win.__studioMessages
        .filter((m) => m.type === "LAYERS_TREE")
        .some((tree) => JSON.stringify(tree).includes(value));
      expect(painted, `canvas repainted with "${value}"`).to.be.true;
    });

  it("repaints the canvas when a text field is edited in the panel", () => {
    selectField("title");
    editInPanel("title", "REPAINTED_TITLE");
    canvasShows("REPAINTED_TITLE");
  });

  it("repaints the canvas when a rich text field is edited in the panel", () => {
    // wysiwyg takes the setHtmlByField branch, a different path from text.
    selectField("body");
    editInPanel("body", "<p>REPAINTED_BODY</p>");
    canvasShows("REPAINTED_BODY");
  });

  it("writes an inline canvas edit back to the item", () => {
    const field = fieldByName.title;
    cy.window().then((win) => {
      win.postMessage(
        {
          source: "studio-bridge",
          message: {
            type: "DOM_EVENT",
            eventType: "input",
            element: {
              dataset: {
                fieldZuid: field.ZUID,
                fieldType: field.datatype,
                itemZuid: itemZUID,
                modelZuid: field.contentModelZUID,
              },
            },
            value: "EDITED_ON_REAL_CANVAS",
          },
        },
        "*"
      );
    });

    cy.window({ timeout: 20000 }).should((win) => {
      expect(win.zestyStore.getState().content[itemZUID]?.data?.title).to.eq(
        "EDITED_ON_REAL_CANVAS"
      );
    });
  });

  it("reports every bound field to the layers tree", () => {
    // A contract test against the REAL bridge rather than our fixtures: if the
    // marker format or the entity payload drifts, this fails here instead of
    // silently in production.
    cy.window().should((win) => {
      const seen = boundFieldZuids(win);
      ["title", "subtitle", "summary", "body"].forEach((name) =>
        expect(seen, `${name} is addressable on the canvas`).to.include(
          fieldByName[name].ZUID
        )
      );
    });
  });
});

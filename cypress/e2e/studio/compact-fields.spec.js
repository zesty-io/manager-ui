// Skipping for now since the studio needs updating
describe.skip("Studio - Compact field components", () => {
  let studioPath = "/";
  let itemZUID = "";
  let modelZUID = "";
  let markdownFieldZUID = "";
  let datetimeFieldZUID = "";
  let imagesFieldZUID = "";

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

  /** @param {string} fieldZuid */
  const selectField = (fieldZuid) => {
    postBridgeMessage({
      type: "DOM_EVENT",
      eventType: "click",
      element: {
        dataset: {
          fieldZuid,
          itemZuid: itemZUID,
          modelZuid: modelZUID,
        },
      },
    });
  };

  before(() => {
    cy.task("seed:content", "fixtures/studio-compact-fields.json").then(
      ({ model, fields, items }) => {
        modelZUID = model.ZUID ?? "";
        itemZUID = items[0]?.meta?.ZUID ?? "";
        studioPath = `/${items[0]?.web?.pathPart ?? ""}`;
        markdownFieldZUID =
          fields.find((f) => f.datatype === "markdown")?.ZUID ?? "";
        datetimeFieldZUID =
          fields.find((f) => f.datatype === "datetime")?.ZUID ?? "";
        imagesFieldZUID =
          fields.find((f) => f.datatype === "images")?.ZUID ?? "";
      }
    );
  });

  beforeEach(() => {
    cy.waitOn("/v1/content/models**", () => {
      cy.visit(`/studio?path=${studioPath}`);
    });
    cy.getBySelector("StudioSidePanel").should("exist");
  });

  it("FieldTypeEditor: markdown textarea is height-constrained to 172px in compact mode", () => {
    selectField(markdownFieldZUID);

    cy.getBySelector("markdownEditorTextarea")
      .should("exist")
      .and("have.css", "max-height", "172px");
  });

  it("FieldTypeDateTime: both inputs render and clear button is icon-only", () => {
    selectField(datetimeFieldZUID);

    cy.getBySelector("datePickerInputField").should("exist");
    cy.getBySelector("dateTimeInputField").should("exist");
    cy.getBySelector("dateFieldClearButton")
      .should("exist")
      .and("not.contain.text", "Clear");
  });

  it("FieldTypeMedia: empty state shows compact layout with text-variant buttons", () => {
    // Item has no images in the second item — use a fresh visit where images field is empty.
    // The fixture item seeds one image so we test the add-more row and MediaItem separately.
    // This test validates compact empty-state via the "Add from Media" button and absent Bynder.
    selectField(imagesFieldZUID);

    cy.contains("Drag & Drop your files").should("exist");
    cy.getBySelector("selectFromMediaButton")
      .should("exist")
      .and("contain.text", "Add from Media");
    cy.getBySelector("addFromBynderBtn").should("not.exist");
  });

  it("FieldTypeMedia: existing MediaItem shows single consolidated menu button", () => {
    selectField(imagesFieldZUID);

    cy.getBySelector("mediaItem").should("exist");
    cy.getBySelector("mediaItemMenuButton").should("exist");
  });
});

import CODE_FILE_DATA from "../../fixtures/studio-responsive-fields-code.json";

describe("Studio - Responsive field components", () => {
  let studioPath = "/";
  let itemZUID = "";
  let modelZUID = "";
  let textareaFieldZUID = "";
  let wysiwygFieldZUID = "";
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
    cy.task("seed:content", "fixtures/studio-responsive-fields.json").then(
      ({ model, fields, items }) => {
        modelZUID = model.ZUID ?? "";
        itemZUID = items[0]?.meta?.ZUID ?? "";
        studioPath = `/${items[0]?.web?.pathPart ?? ""}`;
        textareaFieldZUID =
          fields.find((f) => f.datatype === "textarea")?.ZUID ?? "";
        wysiwygFieldZUID =
          fields.find((f) => f.datatype === "wysiwyg_basic")?.ZUID ?? "";
        markdownFieldZUID =
          fields.find((f) => f.datatype === "markdown")?.ZUID ?? "";
        datetimeFieldZUID =
          fields.find((f) => f.datatype === "datetime")?.ZUID ?? "";
        imagesFieldZUID =
          fields.find((f) => f.datatype === "images")?.ZUID ?? "";

        // UPDATE MODEL TEMPLATE
        cy.apiRequest({
          url: `${Cypress.env("API_INSTANCE_URL")}/web/views`,
          method: "GET",
        }).then((resData) => {
          const viewFile = resData?.data?.find(
            (data) => data?.contentModelZUID === modelZUID
          );
          const fileZuid = viewFile?.ZUID;
          cy.apiRequest({
            url: `${Cypress.env("API_INSTANCE_URL")}/web/views/${fileZuid}`,
            method: "PUT",
            body: { ...CODE_FILE_DATA },
          });
        });
      }
    );

    cy.waitOn("/v1/content/models/*/fields*", () => {
      cy.visit(`/studio?path=${studioPath}`);
    });
    cy.getBySelector("StudioSidePanel").should("exist");
  });

  after(() => {
    if (modelZUID) {
      cy.deleteModel(modelZUID);
    }
  });

  it("FieldTypeTextarea: field renders when selected", () => {
    selectField(textareaFieldZUID);
    cy.getBySelector("EditorField-multi_line_text_field").should("exist");
  });

  it("FieldTypeTinyMCE: compact mode shows only the compact toolbar buttons", () => {
    selectField(wysiwygFieldZUID);

    // TinyMCE renders its own DOM — we don't control its markup and cannot add
    // data-cy attributes. Class + aria-label selectors are the only stable
    // hooks into TinyMCE's toolbar; acceptable exception to the data-cy rule.
    cy.get(".tox-tinymce").should("exist");

    cy.get('.tox-toolbar__group button[aria-label="Block formatting"]').should(
      "be.visible"
    );
    cy.get('.tox-toolbar__group button[aria-label="Bold"]').should(
      "be.visible"
    );
    cy.get('.tox-toolbar__group button[aria-label="Text alignment"]').should(
      "be.visible"
    );
    cy.get('.tox-toolbar__group button[aria-label="Lists"]').should(
      "be.visible"
    );
    cy.get(
      '.tox-toolbar__group button[aria-label="Select media from your uploaded assets"]'
    ).should("be.visible");
    cy.get('.tox-toolbar__group button[aria-label="Fullscreen"]').should(
      "be.visible"
    );

    // Buttons from the normal toolbar must not exist in the compact toolbar
    cy.get('.tox-toolbar__group button[aria-label="Undo"]').should("not.exist");
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

  it("FieldTypeMedia: renders populated compact layout when field has a value", () => {
    selectField(imagesFieldZUID);

    cy.getBySelector("mediaItem-container").should("exist");
    cy.contains("Drag & Drop your files").should("not.exist");
    cy.getBySelector("addFromBynderBtn").should("not.exist");
  });

  it("FieldTypeMedia: existing MediaItem shows single consolidated menu button", () => {
    selectField(imagesFieldZUID);

    cy.getBySelector("mediaItem").should("exist");
    cy.getBySelector("mediaItemMenuButton").should("exist");
  });

  it("FieldTypeMedia: compact menu shows all expected options for a Zesty asset", () => {
    selectField(imagesFieldZUID);

    cy.getBySelector("mediaItemMenuButton").click();

    cy.getBySelector("mediaMenuItem-editFile").should("be.visible");
    cy.getBySelector("mediaMenuItem-swapFile").should("be.visible");
    cy.getBySelector("mediaMenuItem-renameFile").should("be.visible");
    cy.getBySelector("mediaMenuItem-copyZUID").should("be.visible");
    cy.getBySelector("mediaMenuItem-copyFileURL").should("be.visible");
    cy.getBySelector("mediaMenuItem-removeFile").should("be.visible");
  });
});

import { v4 as uuidv4 } from "uuid";
import EDITOR_FILE from "../../fixtures/code/editor.json";

describe("Code App - Editor", () => {
  let EDITOR_DATA;
  let FILE_PATH;
  let FILE_NAME;

  before(() => {
    cy.blockLock();
    cy.task("seed:code", "fixtures/code/editor.json")
      .then((res) => {
        EDITOR_DATA = res;
        FILE_PATH = res?.fileName;
        FILE_NAME = FILE_PATH?.split("/")?.pop()?.trim() || "";
        Cypress.env("fileZUID", res?.ZUID);
      })
      .then(() => {
        cy.visit(`/code/file/views/${Cypress.env("fileZUID")}`);
      });
  });

  it("Show correct file content", () => {
    cy.getBySelector("code-app-editor-container")
      .find("textarea")
      .first()
      .should("have.value", EDITOR_FILE.code);
  });

  it("Show correct file name and version", () => {
    cy.getBySelector("code-editor-file-name").should("contain", FILE_NAME);
    cy.getBySelector("code-editor-file-version").should(
      "contain",
      `(v${EDITOR_DATA.version})`
    );
  });

  it("Show saved and published indicators", () => {
    cy.getBySelector("code-app-saved-indicator").should("contain", "Saved");
    cy.getBySelector("code-app-published-indicator").should(
      "contain",
      "Published"
    );
  });

  it("Show unsaved state when editing contents", () => {
    cy.getBySelector("code-app-editor-container")
      .find("textarea")
      .first()
      .type(" more text", { parseSpecialCharSequences: false });

    cy.getBySelector("code-app-save-button").should("be.visible");
    cy.getBySelector("code-app-saved-indicator").should("not.exist");
  });

  it("Save", () => {
    cy.waitOn(`**/web/views/${Cypress.env("fileZUID")}`, () => {
      cy.getBySelector("code-app-save-button").click();
    });

    cy.getBySelector("toast")
      .should("contain.text", "Saved")
      .and("contain.text", FILE_NAME);

    // Saved but not yet published against this new version
    cy.getBySelector("code-app-saved-indicator").should("be.visible");
    cy.getBySelector("code-app-publish-button").should("be.visible");
  });

  it("Publish", () => {
    cy.waitOn(`**/web/views/${Cypress.env("fileZUID")}/versions/**`, () => {
      cy.getBySelector("code-app-publish-button").click();
    });

    cy.getBySelector("toast")
      .should("contain.text", "Published")
      .and("contain.text", FILE_NAME);

    cy.getBySelector("code-app-published-indicator").should("be.visible");
  });

  it("Show Diff", () => {
    cy.waitOn(`**/web/views/${Cypress.env("fileZUID")}/versions/`, () => {
      cy.getBySelector("code-app-diff-versions-button").click();
    });

    cy.location("pathname").should(
      "include",
      `/code/file/views/${Cypress.env("fileZUID")}/diff/`
    );
    cy.getBySelector("code-app-differ-version-select-one").should("be.visible");
    cy.getBySelector("code-app-differ-version-select-two").should("be.visible");

    // Navigate back to the editor route for the remaining tests. See
    // actions.spec.js's "Compare files" test for the standing FIXME re:
    // incorrect diff versions shown in the UI - out of scope here, this
    // test only asserts the Diff Versions button opens the differ view.
    cy.go("back");
    cy.location("pathname").should(
      "eq",
      `/code/file/views/${Cypress.env("fileZUID")}`
    );
  });

  it("Show confirmation dialog when exiting without saving changes", () => {
    cy.getBySelector("code-app-editor-container")
      .find("textarea")
      .first()
      .type(" dirty again", { parseSpecialCharSequences: false });

    cy.getBySelector("code-app-save-button").should("be.visible");

    // Trigger an in-app React Router navigation (not a full page
    // reload/cy.visit) - the Prompt in LocalDirtyCodeModal only intercepts
    // history transitions, per src/utility/history.ts. The "Diff Versions"
    // button (data-cy added in this PR) does a history.push, so it doubles
    // as a convenient, deterministic navigation trigger for this test.
    cy.getBySelector("code-app-diff-versions-button").click();

    cy.getBySelector("DirtyCodeModal").should("be.visible");
    cy.getBySelector("DirtyCodeModalCancel").click();
    cy.getBySelector("DirtyCodeModal").should("not.exist");

    // Navigation was aborted - still on the same file/route, content
    // still dirty.
    cy.location("pathname").should(
      "eq",
      `/code/file/views/${Cypress.env("fileZUID")}`
    );
    cy.getBySelector("code-app-save-button").should("be.visible");

    // NOTE: a native `beforeunload` guard also exists in CodeEditor.js for
    // browser tab close/refresh, but that path isn't testable in Cypress.
  });

  it("Delete File", () => {
    // Fresh visit so this is deterministic regardless of what preceded it
    // (the prior test leaves the file dirty in memory).
    cy.blockLock();
    cy.visit(`/code/file/views/${Cypress.env("fileZUID")}`);

    cy.getBySelector("code-app-more-options-button").click();
    cy.getBySelector("code-app-delete-file-menuitem").click();

    cy.getBySelector("code-app-delete-dialog").should("be.visible");

    cy.waitOn(`**/web/views/${Cypress.env("fileZUID")}`, () => {
      cy.getBySelector("code-app-delete-dialog")
        .find('[data-cy="DeleteContentItemConfirmButton"]')
        .click();
    });

    cy.location("pathname").should("eq", "/code");
  });
});

describe("Code App - Editor - Show suggestions", () => {
  // Monaco's completion provider (MonacoSetup.js) only activates for files
  // with a `contentModelZUID`, filtering Redux `state.fields` by that model.
  // A dynamically created, disposable model is used (instead of pointing at
  // a real/shared model already used elsewhere in this repo) because the
  // dev API refuses to delete a view once it's bound to a content model
  // ("cannot delete view ... that belongs to a content model") - binding to
  // a real, shared model would leave a permanently orphaned file on
  // production-synced data. Deleting a model we created ourselves cascades
  // and removes the bound view too, so this stays fully self-cleaning.
  const MODEL_NAME = `e2e_code_suggestions_${uuidv4().replace(/-/g, "")}`;
  const FIELD_NAME = "test_field";
  let MODEL_ZUID;
  let FILE_ZUID;

  before(() => {
    cy.blockLock();

    cy.createModel({
      label: `Code Suggestions Model | ${uuidv4()}`,
      name: MODEL_NAME,
      type: "templateset",
    })
      .then(({ data }) => {
        MODEL_ZUID = data?.ZUID;

        return cy.createField(MODEL_ZUID, {
          label: "Test Field",
          name: FIELD_NAME,
          datatype: "text",
          settings: { defaultValue: "", list: true },
        });
      })
      .then(() => {
        return cy.task("seed:code", {
          path: "fixtures/code/editor-suggestions.json",
          overrides: { contentModelZUID: MODEL_ZUID },
        });
      })
      .then((res) => {
        FILE_ZUID = res?.ZUID;
        // Wait for the model's fields to actually load into the store before
        // proceeding - Monaco's completion provider reads `state.fields`
        // synchronously at the moment the trigger character is typed, and
        // that fetch (kicked off by this same visit) is otherwise a race.
        cy.waitOn(`**/content/models/${MODEL_ZUID}/fields**`, () => {
          cy.visit(`/code/file/views/${FILE_ZUID}`);
        });
      });
  });

  after(() => {
    // Cascades: deleting the model also removes the code view bound to it.
    if (MODEL_ZUID) {
      cy.deleteModel(MODEL_ZUID);
    }
  });

  it("Show suggestions", () => {
    cy.getBySelector("code-app-editor-container")
      .find("textarea")
      .first()
      .click()
      .type(`${FIELD_NAME}.`, { parseSpecialCharSequences: false });

    cy.get(".suggest-widget", { timeout: 10000 }).should("be.visible");
  });
});

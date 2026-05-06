import EDITOR_FILE from "../../fixtures/code/editor.json";

describe("Code App - Editor", () => {
  let EDITOR_DATA;
  let FILE_PATH;
  let FILE_NAME;

  before(() => {
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
});

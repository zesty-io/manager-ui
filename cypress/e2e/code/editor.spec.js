describe("Code Editor", () => {
  // sidebar.spec.js stops at location.pathname and actions.spec.js covers the
  // diff editor, so nothing else asserts the editor itself mounts.
  it("renders the Monaco editor when a view file is opened", () => {
    cy.waitOn("/v1/web/views*", () => {
      cy.visit("/code/file/views/11-98e7d0-148d5r");
    });

    cy.get(".react-monaco-editor-container", { timeout: 20000 }).should(
      "exist"
    );
    cy.get(".monaco-editor .view-lines", { timeout: 20000 }).should(
      "be.visible"
    );
  });
});

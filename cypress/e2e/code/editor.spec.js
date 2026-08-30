describe("Code Editor", () => {
  // Opening a file mounts MonacoEditor and runs editorDidMount, which applies the
  // custom "parsleyDark" theme. No other code spec asserts the editor actually
  // rendered — sidebar.spec.js stops at location.pathname, and actions.spec.js
  // exercises the diff editor, which takes a different mount path. A theme or
  // monaco-version fault therefore shows up as an ErrorBoundary in the editor
  // pane while every existing spec stays green.
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

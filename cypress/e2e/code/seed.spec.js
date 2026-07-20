describe("seed:code task", () => {
  it("seeds a view (snippet) file", () => {
    cy.task("seed:code", "fixtures/code/view.json").then((view) => {
      expect(view.ZUID).to.be.a("string");
      expect(view.fileName).to.contain("seed-code-view");
    });
  });

  it("seeds a stylesheet file", () => {
    cy.task("seed:code", "fixtures/code/stylesheet.json").then((stylesheet) => {
      expect(stylesheet.ZUID).to.be.a("string");
      expect(stylesheet.fileName).to.contain("seed-code-stylesheet.css");
    });
  });

  it("seeds a script file", () => {
    cy.task("seed:code", "fixtures/code/script.json").then((script) => {
      expect(script.ZUID).to.be.a("string");
      expect(script.fileName).to.contain("seed-code-script.js");
    });
  });
});

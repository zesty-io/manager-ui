describe("Code Editor: Create File", () => {
  before(() => {
    cy.login();
    cy.visit("/code");
  });

  it("Create File", () => {
    cy.get(".CreateFileBtn--2qcds").click();
    cy.get(".CreateFile--tzV8A")
      .get(".Select")
      .get(".selections")
      .get("li", { force: true });

    cy.get('input[type="text"]').type("mySnnipet");

    cy.get('button[kind="save"]').click();
  });
});

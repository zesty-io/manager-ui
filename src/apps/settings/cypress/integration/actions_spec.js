describe("Actions in settings", () => {
  before(() => {
    cy.login();
    cy.visit("/settings/styles/1");
  });

  it("Edits settings input", () => {
    cy.get("input")
      .first()
      .type("1180px", { force: true });
    cy.get("#SaveSettings").should("not.be.disabled");
    cy.get("#SaveSettings").click();
  });
});

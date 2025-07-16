describe("Settings sidebar", () => {
  before(() => {
    cy.visit("/settings");
  });

  it("can navigate media folders in the sidebar", () => {
    cy.contains("Bynder").click();
    cy.location("pathname").should("eq", "/settings/instance/bynder");
  });
});

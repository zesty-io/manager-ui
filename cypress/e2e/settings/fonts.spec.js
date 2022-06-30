describe("Fonts", () => {
  before(() => {
    cy.visit("/settings");
  });

  it("Install font", () => {
    cy.get("[data-cy=SettingsNav]").contains("Browse fonts").click();
    cy.get("[data-cy=SubApp] input[type=checkbox]").first().check();

    cy.get("#InstallFont").click();

    cy.contains("Font installed").should("exist");
  });

  it("Removes a font", () => {
    cy.get("[data-cy=SettingsNav]").contains("Installed fonts").click();
    cy.get("#RemoveFont").first().click();

    cy.contains("Font has been removed").should("exist");
  });
});

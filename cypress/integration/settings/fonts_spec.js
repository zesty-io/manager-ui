describe("Browse fonts", () => {
  before(() => {
    cy.login();
    cy.visit("/settings/fonts/browse");
  });

  it("Install font", () => {
    cy.get('[type="checkbox"]')
      .first()
      .check();

    cy.get("#InstallFont").click();

    cy.contains("Font installed", { timeout: 5000 }).should("exist");
  });
});

describe("Fonts installed", () => {
  before(() => {
    cy.login();
    cy.visit("/settings/fonts/installed");
  });

  it("Removes a font", () => {
    cy.get("#RemoveFont")
      .first()
      .click();

    cy.contains("Font has been removed", { timeout: 5000 }).should("exist");
  });
});

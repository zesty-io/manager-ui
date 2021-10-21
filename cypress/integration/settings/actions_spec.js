describe("Settings Actions", () => {
  before(() => {
    cy.login();
    cy.visit("/settings");
  });
  const SAVED_MESSAGE = "Settings Saved";

  it("Body Colors & Spacing", () => {
    cy.get("[data-cy=SettingsNav]").contains("Body Colors & Spacing").click();
    cy.get("input[name='container-large-desktop']")
      .first()
      .clear()
      .type("1180px");
    cy.get("#SaveSettings").click();
    cy.contains(SAVED_MESSAGE).should("exist");
  });

  it("Typography", () => {
    cy.get("[data-cy=SettingsNav]").contains("Typography").click();
    cy.get("[data-cy=SubApp] .Select").first().click();
    cy.get("[data-cy=SubApp] .Select .selections li").first().click();
    cy.get("#SaveSettings").click();
    cy.contains(SAVED_MESSAGE).should("exist");
  });
  
  // skipping flakey test in preparation for CI
  it.skip("Links", () => {
    cy.get("[data-cy=SettingsNav]").contains("Links").click();
    cy.get("[data-cy=SubApp] .Select").first().click();
    cy.get("[data-cy=SubApp] .Select .selections li").first().click();
    cy.get("#SaveSettings").click();
    cy.contains(SAVED_MESSAGE).should("exist");
  });

  // skipping flakey test in preparation for CI
  it.skip("Navigation", () => {
    cy.get("[data-cy=SettingsNav]").contains("Navigation").click();
    cy.get("[data-cy=SubApp] input[type=text]").first().clear().type("40px");
    cy.get("#SaveSettings").click();
    cy.contains(SAVED_MESSAGE).should("exist");
  });

  it("Buttons", () => {
    cy.get("[data-cy=SettingsNav]").contains("Buttons").click();
    cy.get("[data-cy=SubApp] input[type=text]").first().clear().type("normal");
    cy.get("#SaveSettings").click();
    cy.contains(SAVED_MESSAGE).should("exist");
  });

  // skipping flakey test in preparation for CI
  it.skip("HTML Elements", () => {
    cy.get("[data-cy=SettingsNav]").contains("HTML Elements").click();
    cy.get("[data-cy=SubApp] input[type=text]").first().clear().type("8px");
    cy.get("#SaveSettings").click();
    cy.contains(SAVED_MESSAGE).should("exist");
  });

  it("Responsive Grid", () => {
    cy.get("[data-cy=SettingsNav]").contains("HTML Elements").click();
    cy.get("[data-cy=SubApp] input[type=text]").first().clear().type("10px");
    cy.get("#SaveSettings").click();
    cy.contains(SAVED_MESSAGE).should("exist");
  });
  // skipping flakey test in preparation for CI
  it.skip("Interactive Elements", () => {
    cy.get("[data-cy=SettingsNav]").contains("Interactive Elements").click();
    cy.get("[data-cy=SubApp] input[type=text]").first().clear().type("300px");
    cy.get("#SaveSettings").click();
    cy.contains(SAVED_MESSAGE).should("exist");
  });

  it("Forms", () => {
    cy.get("[data-cy=SettingsNav]").contains("Forms").click();
    cy.get("[data-cy=SubApp] input[type=text]").first().clear().type("15px");
    cy.get("#SaveSettings").click();
    cy.contains(SAVED_MESSAGE).should("exist");
  });
});

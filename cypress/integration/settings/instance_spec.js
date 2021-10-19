describe("Instance", () => {
  before(() => {
    cy.login();
    cy.visit("/settings");
  });
  const SAVED_MESSAGE = "Settings Saved";

  it("General", () => {
    cy.get("[data-cy=SubApp] textarea").first().clear().type("example");

    cy.get("#saveSettings").click();
    cy.contains(SAVED_MESSAGE).should("exist");
  });

  it("Developer", () => {
    cy.get("[data-cy=SettingsNav]").contains("developer").click();
    cy.get('input[type="text"]').type("test test test").clear();
    cy.wait(3000);

    cy.get("[data-cy=SubApp] button").first().click({ force: true });

    cy.get("#saveSettings").click({ force: true });
    cy.contains(SAVED_MESSAGE).should("exist");
  });

  it("Contact Form", () => {
    cy.get("[data-cy=SettingsNav]").contains("contact form").click();
    cy.get("[data-cy=SubApp] input").first().type("fakeemail@example.com");

    cy.get("#saveSettings").click();
    cy.contains(SAVED_MESSAGE).should("exist");
  });

  // TODO: fix these tests
  it.skip("Edits Keybase filename", () => {
    cy.visit("/settings/instance/contact-form");
    cy.get("input").first().type("example");

    cy.get("#saveSettings").click();
    cy.contains(SAVED_MESSAGE).should("exist");
  });

  it.skip("Edits Content set id override", () => {
    cy.visit("/settings/instance/seo");
    cy.get("input").first().type("example");

    cy.get("#saveSettings").click();
    cy.contains(SAVED_MESSAGE).should("exist");
  });

  it.skip("Edits google tag manager id", () => {
    cy.visit("/settings/instance/tag_manager");
    cy.get("input").first().type("example");

    cy.get("#saveSettings").click();
    cy.contains(SAVED_MESSAGE).should("exist");
  });

  it.skip("Edits google urchin id", () => {
    cy.visit("/settings/instance/analytics");
    cy.get("input").first().type("example");

    cy.get("#saveSettings").click();
    cy.contains(SAVED_MESSAGE).should("exist");
  });

  it.skip("Edits consumer key", () => {
    cy.visit("/settings/instance/twitter");
    cy.get("input").first().type("example");

    cy.get("#saveSettings").click();
    cy.contains(SAVED_MESSAGE).should("exist");
  });

  it.skip("Edits store is live", () => {
    cy.visit("/settings/instance/stripe");
    cy.get("input").first().type("example");

    cy.get("#saveSettings").click();
    cy.contains(SAVED_MESSAGE).should("exist");
  });
});

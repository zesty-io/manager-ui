describe("Instance", () => {
  const SAVED_MESSAGE = "Settings Saved";

  before(() => {
    cy.waitOn("/v1/env/settings", () => {
      cy.visit("/settings");
    });
  });

  it("General", () => {
    cy.get("[data-cy=SubApp] textarea").first().clear().type("example");

    cy.get("#saveSettings").click();

    cy.contains(SAVED_MESSAGE).should("exist");
  });

  it("Developer", () => {
    cy.getBySelector("InstanceSettingsTree")
      .find(".MuiTreeItem-root")
      .next()
      .contains("Developer")
      .click();
    cy.get('[data-cy=SubApp] input[type="text"]')
      .last()
      .type("test test test")
      .clear();

    cy.get("#saveSettings").click({ force: true });

    cy.get("#saveSettings").click({ force: true });
    cy.contains(SAVED_MESSAGE).should("exist");
  });

  it("Contact Form", () => {
    cy.getBySelector("InstanceSettingsTree")
      .find(".MuiTreeItem-root")
      .next()
      .contains("Contact Form")
      .click();
    cy.get("[data-cy=SubApp] input").last().type("fakeemail@example.com");

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

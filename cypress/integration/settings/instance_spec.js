describe("Instance", () => {
  before(() => {
    cy.login();
  });

  describe("General", () => {
    before(() => {
      cy.visit("/settings/instance/general");
    });

    it("Edits Search engine crawler", () => {
      cy.get("input")
        .first()
        .type("example", { force: true });
      cy.get("#saveSettings").should("not.be.disabled");
      cy.get("#saveSettings").click();
      cy.contains("Data has been updated", { timeout: 5000 }).should("exist");
    });
  });

  describe("Developer", () => {
    before(() => {
      cy.visit("/settings/instance/developer");
    });

    it("Edits Use parsley debugger", () => {
      cy.get("input")
        .first()
        .type("example", { force: true });
      cy.get("#saveSettings").should("not.be.disabled");
      cy.get("#saveSettings").click();
      cy.contains("Data has been updated", { timeout: 5000 }).should("exist");
    });
  });

  describe("Contact form", () => {
    before(() => {
      cy.visit("/settings/instance/contact-form");
    });

    it("Edits Sending email", () => {
      cy.get("input")
        .first()
        .type("myemail@gmail", { force: true });
      cy.get("#saveSettings").should("not.be.disabled");
      cy.get("#saveSettings").click();
      cy.contains("Data has been updated", { timeout: 5000 }).should("exist");
    });
  });

  describe("Verification", () => {
    before(() => {
      cy.visit("/settings/instance/contact-form");
    });

    it("Edits Keybase filename", () => {
      cy.get("input")
        .first()
        .type("example", { force: true });
      cy.get("#saveSettings").should("not.be.disabled");
      cy.get("#saveSettings").click();
      cy.contains("Data has been updated", { timeout: 5000 }).should("exist");
    });
  });

  describe("SEO", () => {
    before(() => {
      cy.visit("/settings/instance/seo");
    });

    it("Edits Content set id override", () => {
      cy.get("input")
        .first()
        .type("example", { force: true });
      cy.get("#saveSettings").should("not.be.disabled");
      cy.get("#saveSettings").click();
      cy.contains("Data has been updated", { timeout: 5000 }).should("exist");
    });
  });

  describe("Tag manager", () => {
    before(() => {
      cy.visit("/settings/instance/tag_manager");
    });

    it("Edits google tag manager id", () => {
      cy.get("input")
        .first()
        .type("example", { force: true });
      cy.get("#saveSettings").should("not.be.disabled");
      cy.get("#saveSettings").click();
      cy.contains("Data has been updated", { timeout: 5000 }).should("exist");
    });
  });

  describe("Analytics", () => {
    before(() => {
      cy.visit("/settings/instance/analytics");
    });

    it("Edits google urchin id", () => {
      cy.get("input")
        .first()
        .type("example", { force: true });
      cy.get("#saveSettings").should("not.be.disabled");
      cy.get("#saveSettings").click();
      cy.contains("Data has been updated", { timeout: 5000 }).should("exist");
    });
  });

  describe("Twitter", () => {
    before(() => {
      cy.visit("/settings/instance/twitter");
    });

    it("Edits consumer key", () => {
      cy.get("input")
        .first()
        .type("example", { force: true });
      cy.get("#saveSettings").should("not.be.disabled");
      cy.get("#saveSettings").click();
      cy.contains("Data has been updated", { timeout: 5000 }).should("exist");
    });
  });

  describe("stripe", () => {
    before(() => {
      cy.visit("/settings/instance/stripe");
    });

    it("Edits store is live", () => {
      cy.get("input")
        .first()
        .type("example", { force: true });
      cy.get("#saveSettings").should("not.be.disabled");
      cy.get("#saveSettings").click();
      cy.contains("Data has been updated", { timeout: 5000 }).should("exist");
    });
  });
});

describe("General", () => {
  before(() => {
    cy.login();
    cy.visit("/settings/instance/general");
  });

  it("Edits Search engine crawler", () => {
    cy.get("input")
      .first()
      .check(1, { force: true });
    cy.get("#SaveSettings").should("not.be.disabled");
    cy.get("#SaveSettings").click();
  });
});

describe("Developer", () => {
  before(() => {
    cy.login();
    cy.visit("/settings/instance/developer");
  });

  it("Edits Use parsley debugger", () => {
    cy.get("input")
      .first()
      .check(1, { force: true });
    cy.get("#SaveSettings").should("not.be.disabled");
    cy.get("#SaveSettings").click();
  });
});

describe("Contact form", () => {
  before(() => {
    cy.login();
    cy.visit("/settings/instance/contact-form");
  });

  it("Edits Sending email", () => {
    cy.get("input")
      .first()
      .type("myemail@gmail", { force: true });
    cy.get("#SaveSettings").should("not.be.disabled");
    cy.get("#SaveSettings").click();
  });
});

describe("Verification", () => {
  before(() => {
    cy.login();
    cy.visit("/settings/instance/contact-form");
  });

  it("Edits Keybase filename", () => {
    cy.get("input")
      .first()
      .type("example", { force: true });
    cy.get("#SaveSettings").should("not.be.disabled");
    cy.get("#SaveSettings").click();
  });
});

describe("SEO", () => {
  before(() => {
    cy.login();
    cy.visit("/settings/instance/seo");
  });

  it("Edits Content set id override", () => {
    cy.get("input")
      .first()
      .type("example", { force: true });
    cy.get("#SaveSettings").should("not.be.disabled");
    cy.get("#SaveSettings").click();
  });
});

describe("Tag manager", () => {
  before(() => {
    cy.login();
    cy.visit("/settings/instance/tag_manager");
  });

  it("Edits google tag manager id", () => {
    cy.get("input")
      .first()
      .type("example", { force: true });
    cy.get("#SaveSettings").should("not.be.disabled");
    cy.get("#SaveSettings").click();
  });
});

describe("Analytics", () => {
  before(() => {
    cy.login();
    cy.visit("/settings/instance/analytics");
  });

  it("Edits google urchin id", () => {
    cy.get("input")
      .first()
      .type("example", { force: true });
    cy.get("#SaveSettings").should("not.be.disabled");
    cy.get("#SaveSettings").click();
  });
});

describe("Twitter", () => {
  before(() => {
    cy.login();
    cy.visit("/settings/instance/twitter");
  });

  it("Edits consumer key", () => {
    cy.get("input")
      .first()
      .type("example", { force: true });
    cy.get("#SaveSettings").should("not.be.disabled");
    cy.get("#SaveSettings").click();
  });
});

describe("stripe", () => {
  before(() => {
    cy.login();
    cy.visit("/settings/instance/stripe");
  });

  it("Edits store is live", () => {
    cy.get("input")
      .first()
      .check(1, { force: true });
    cy.get("#SaveSettings").should("not.be.disabled");
    cy.get("#SaveSettings").click();
  });
});

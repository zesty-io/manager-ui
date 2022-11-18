describe("Mature Home", () => {
  before(() => {
    cy.visit("/");
  });
  it("Root gets redirected to home", () => {
    cy.url().should("include", "/home");
  });
  it("Displays user first name", () => {
    cy.contains("Good Morning, FirstName");
  });
  it("Displays delta percentage on metric card if instance is over 2 months old", () => {
    // Test instance is over 2 months old
    cy.contains("VS PRIOR 30 DAYS");
  });
  it("Opens Quick Start Guide in new tab", () => {
    cy.window().then((win) => {
      cy.stub(win, "open").as("open");
    });
    cy.contains("Get Started").click();
    cy.get("@open").should(
      "have.been.calledOnceWith",
      "https://zesty.org/quick-start-guide"
    );
  });
  it("Opens Platform Docs in new tab ", () => {
    cy.window().then((win) => {
      cy.stub(win, "open").as("open");
    });
    cy.contains("Platform Docs").click();
    cy.get("@open").should("have.been.calledOnceWith", "https://zesty.org/");
  });
  it("Opens Instance API Docs in new tab ", () => {
    cy.window().then((win) => {
      cy.stub(win, "open").as("open");
    });
    cy.contains("Instance API Docs").click();
    cy.get("@open").should(
      "have.been.calledOnceWith",
      "https://instances-api.zesty.org/"
    );
  });
  it("Opens GraphQL Docs in new tab ", () => {
    cy.window().then((win) => {
      cy.stub(win, "open").as("open");
    });
    cy.contains("GraphQL Docs").click();
    cy.get("@open").should(
      "have.been.calledOnceWith",
      "https://github.com/zesty-io/graphql-zesty"
    );
  });
  it("Opens Parsley Docs in new tab ", () => {
    cy.window().then((win) => {
      cy.stub(win, "open").as("open");
    });
    cy.contains("Parsley Docs").click();
    cy.get("@open").should(
      "have.been.calledOnceWith",
      "https://parsley.zesty.io/"
    );
  });
  it("Opens Release Notes in new tab ", () => {
    cy.window().then((win) => {
      cy.stub(win, "open").as("open");
    });
    cy.contains("Release Notes").click();
    cy.get("@open").should(
      "have.been.calledOnceWith",
      "https://www.zesty.io/mindshare/product-announcements"
    );
  });
});

describe("Single Page Analytics", () => {
  before(() => {
    cy.waitOn("*properties*", () => {
      cy.visit("/content/6-a1a600-k0b6f0/7-a1be38-1b42ht/analytics");
    });
  });
  it("Renders the page with the zesty.pw property", () => {
    cy.contains("zesty.pw");
  });
  it("Filters properties on search input", () => {
    cy.getBySelector("analytics-settings").click();
    cy.get('input[placeholder="Search Google Analytics Properties"]').type(
      "zesty.pw"
    );

    cy.get('[role="presentation"]')
      .find(".MuiList-root .MuiListItemButton-root")
      .should("have.length", 1);
    cy.get("body").type("{esc}");
  });
  it("Allows property switching by updating instance setting", () => {
    cy.getBySelector("analytics-settings").click({ force: true });
    cy.waitOn("*/env/settings/*", () => {
      cy.get('[role="presentation"]')
        .contains("zesty.pw")
        .click({ force: true });
    });
  });
  it("Allows selecting a page to compare by showing recent publishings", () => {
    cy.waitOn("*publishings*", () => {
      cy.contains("Compare Page").click({ force: true });
    });
    cy.get(".MuiList-root .MuiListItemButton-root").should("have.length.gt", 0);
    cy.get("body").type("{esc}");
  });
  it("Allows searching pages to compare by calling search api", () => {
    cy.contains("Compare Page").click({ force: true });
    cy.waitOn("*/search/items?q=t*", () => {
      cy.get('input[placeholder="Search"]').type("t");
    });
    cy.get(".MuiList-root .MuiListItemButton-root").should("have.length.gt", 0);
    cy.get("body").type("{esc}");
  });
  it("Displays linked google account information", () => {
    cy.getBySelector("analytics-settings").click({ force: true });
    cy.contains("GA Settings").click({ force: true });
    cy.getBySelector("loggedInGa4Account")
      .find("span")
      .invoke("text")
      .should("be.oneOf", ["Andres Galindo", "Lunar Jay  Cuenca"]);
    cy.wait(1000);
    cy.get("body").type("{esc}");
  });
  it("Applies selected date filter to url params", () => {
    cy.url().should("include", "datePreset=last_14_days");
    cy.getBySelector("date_default").click({ force: true });
    cy.contains("Last 7 days").click({ force: true });
    cy.url().should("include", "datePreset=last_7_days");
  });
});

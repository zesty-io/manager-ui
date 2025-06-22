const options = { timeout: 20000 };

describe("Analytics dashboard", () => {
  before(() => {
    cy.waitOn("*properties*", () => {
      cy.visit("/content");
    });
  });
  it("Renders the page with the zesty.pw property", () => {
    cy.contains("zesty.pw");
  });
  it("Filters properties on search input", () => {
    cy.getBySelector("analytics-settings", options).click({ force: true });
    cy.get(
      'input[placeholder="Search Google Analytics Properties"]',
      options
    ).type("zesty.pw");

    cy.get('[role="presentation"]', options)
      .find(".MuiList-root .MuiListItemButton-root")
      .should("have.length", 1);
    cy.get("body").type("{esc}");
  });
  it("Allows property switching by updating instance setting", () => {
    cy.getBySelector("analytics-settings", options).click({ force: true });
    cy.waitOn("*/env/settings/*", () => {
      cy.get('[role="presentation"]', options)
        .contains("zesty.pw")
        .click({ force: true });
    });
  });
  it("Displays linked google account information", () => {
    cy.visit("content?datePreset=last_14_days");
    cy.get('[data-cy="analytics-settings"]', options).click({ force: true });
    cy.get('button:contains("GA Settings")', options).click({ force: true });
    cy.get('[data-cy="loggedInGa4Account"]', options)
      .contains(/(Andres Galindo|Lunar Jay Cuenca)/i)
      .should("exist");

    cy.get("body").type("{esc}");
  });
  it("Applies selected date filter to url params", () => {
    cy.url().should("include", "datePreset=last_14_days");
    cy.getBySelector("date_default", options).click({ force: true });
    cy.contains("Last 7 days", options).click({ force: true });
    cy.url().should("include", "datePreset=last_7_days");
  });
});

describe("Analytics dashboard", () => {
  before(() => {
    cy.waitOn("*getPropertyList*", () => {
      cy.visit("/content");
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
    cy.getBySelector("analytics-settings").click();
    cy.waitOn("*/env/settings/*", () => {
      cy.get('[role="presentation"]').contains("zesty.pw").click();
    });
  });
  it("Displays linked google account information", () => {
    cy.getBySelector("analytics-settings").click();
    cy.contains("GA Settings").click();
    cy.getBySelector("loggedInGa4Account")
      .find("span")
      .invoke("text")
      .should("be.oneOf", ["Andres Galindo", "Lunar Jay  Cuenca"]);
    cy.get("body").type("{esc}");
  });
  it("Applies selected date filter to url params", () => {
    cy.url().should("include", "datePreset=last_14_days");
    cy.getBySelector("date_default").click();
    cy.contains("Last 7 days").click();
    cy.url().should("include", "datePreset=last_7_days");
  });
});

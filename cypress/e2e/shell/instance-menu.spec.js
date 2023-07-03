describe("Shell: Instance Menu", () => {
  it("Opens  the instance menu", () => {
    cy.waitOn("https://accounts.api.dev.zesty.io/v1/instances", () => {
      cy.visit("/");
    });

    cy.getBySelector("InstanceMenuButton").should("exist").click();
    cy.getBySelector("InstanceMenu").should("exist");
  });

  it("Opens the instance switcher", () => {
    cy.waitOn("https://accounts.api.dev.zesty.io/v1/instances", () => {
      cy.visit("/");
    });

    cy.getBySelector("InstanceMenuButton").should("exist").click();
    cy.getBySelector("InstanceMenu").should("exist");

    // Hover on the instance switcher menu item
    cy.getBySelector("InstanceSwitcher").should("exist").trigger("mouseover");
    cy.getBySelector("InstancesList").should("exist");
  });

  it("Opens the domain switcher", () => {
    cy.waitOn("https://accounts.api.dev.zesty.io/v1/instances", () => {
      cy.visit("/");
    });

    cy.getBySelector("InstanceMenuButton").should("exist").click();
    cy.getBySelector("InstanceMenu").should("exist");

    // Hover on the domain switcher menu item
    cy.getBySelector("DomainSwitcherMenuItem")
      .should("exist")
      .trigger("mouseover");
    cy.getBySelector("DomainsList").should("exist");
  });
});

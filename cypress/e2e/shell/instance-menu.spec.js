describe("Shell: Instance Menu", () => {
  before(() => {
    cy.waitOn("https://accounts.api.dev.zesty.io/v1/instances", () => {
      cy.visit("/");
    });
  });

  it("Opens  the instance menu", () => {
    cy.getBySelector("InstanceMenuButton").should("exist").click();
    cy.getBySelector("InstanceMenu").should("exist");
    cy.get("body").type("{esc}");
  });

  it("Opens the instance switcher", () => {
    cy.getBySelector("InstanceMenuButton").should("exist").click();
    cy.getBySelector("InstanceMenu").should("exist");

    // Hover on the instance switcher menu item
    cy.getBySelector("InstanceSwitcher").should("exist").trigger("mouseover");
    cy.getBySelector("InstancesList").should("exist");
    // cy.getBySelector("InstanceSwitcher").trigger("mouseleave");
    cy.get("body").click();
    cy.get("body").type("{esc}");
  });

  it("Opens the domain switcher", () => {
    cy.getBySelector("InstanceMenuButton").should("exist").click();
    cy.getBySelector("InstanceMenu").should("exist");

    // Hover on the domain switcher menu item
    cy.getBySelector("DomainSwitcherMenuItem")
      .should("exist")
      .trigger("mouseover");
    cy.getBySelector("DomainsList").should("exist");
  });
});

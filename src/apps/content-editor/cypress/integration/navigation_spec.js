describe("Navigation through content editor", () => {
  before(() => {
    //initial login to set the cookie
    cy.login();
    cy.goHome();
  });

  it("Opens homepage item", () => {
    cy.get("#MainNavigation", { timeout: 5000 })
      .contains("Page")
      .click({ force: true });
    cy.contains("Page Title").should("exist");
    cy.contains("Page Content").should("exist");
  });
  it("Opens list view", () => {
    cy.get("#MainNavigation")
      .contains("Group with visible fields in list")
      .click({ force: true });
    cy.get("#ListColumns").should("exist");
  });
  it("Opens the add item view", () => {
    cy.get("#AddItemButton").click();
    cy.contains("title").should("exist");
    cy.contains("New Item").should("exist");
    cy.get("#CreateItemSaveButton").should("exist");
  });
  it("Opens the reorder nav modal", () => {
    cy.get("#ReorderNavButton").click();
    cy.get("#CloseReorderModal").should("exist");
    cy.get("#CloseReorderModal").click();
  });
  it("Creates a new item from the menu", () => {
    cy.get(".CreateItemDropdown").click();
    cy.get('[data-value="link"]').click();
    cy.get("#CreateLinkButton").should("exist");
  });
  it("Opens list view", () => {
    cy.get("#MainNavigation")
      .contains("Group with visible fields in list")
      .click({ force: true });
    cy.contains("Turkey Run").should("exist");
    cy.contains("Turkey Run").click();
  });
  it.skip("Navigates back to the list view using breadcrumb", () => {
    cy.get("#MainNavigation")
      .contains("Group with visible fields in list")
      .click({ force: true });
    cy.get("#ListColumns").should("exist");
    cy.contains("Turkey Run").click();
  });
  it.skip("Navigates back to the dashboard using breadcrumb", () => {
    cy.get('[href="/content/home"] > .fa').click();
    cy.get(".content-nav").should("exist");
    cy.contains("Pageview/Traffic").should("exist");
  });
});

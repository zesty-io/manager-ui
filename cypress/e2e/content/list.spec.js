describe("Content List", () => {
  before(() => {
    cy.blockAnnouncements();
    cy.waitOn("/v1/content/models*", () => {
      cy.visit("/content/6-0c960c-d1n0kx");
    });
  });

  it("Filters list items based on search term", () => {
    cy.get("input[name='filter']").type("turkey");
    cy.get(".ItemList article").contains("Turkey Run");
    cy.get("input[name='filter']").clear();
  });

  it("Sorts list items", () => {
    cy.get(".ItemList .SortBy").first().click();
    cy.get(".ItemList article")
      .first()
      .contains("Parent pre selection with fast typing");

    cy.get(".ItemList .SortBy").eq(1).click();
    cy.get(".ItemList article").first().contains("Self-Defense Class");
  });

  it("Bulk Edits Toggle and Number Values", () => {
    cy.waitOn("/v1/content/models*", () => {
      cy.visit("/content/6-e3d0e0-965qp6");
    });

    cy.get(".ItemList article").first().get(".SortCell button").first().click();
    cy.get(".ItemList article")
      .first()
      .get(".ToggleCell button")
      .first()
      .click();
    cy.contains("Save All Changes").click();
    cy.contains("changes saved").should("exist");
  });

  it("Opens the add item view", () => {
    cy.getBySelector("AddItemButton").click();
    cy.getBySelector("CreateItemSaveButton").should("exist");
  });
});

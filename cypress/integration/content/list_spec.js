describe("List View CRUD", () => {
  before(() => {
    //initial login to set the cookie
    cy.login();
  });
  it("Filters list items based on search term", () => {
    cy.visit("/content/6-0c960c-d1n0kx");
    cy.get("input[name='filter']").type("turkey");
    cy.contains("Turkey Run").should("exist");
  });

  it("Sorts list items", () => {
    cy.visit("/content/6-0c960c-d1n0kx");
    cy.get(".ItemList .SortBy")
      .first()
      .click();
    cy.get(".ItemList article")
      .first()
      .contains("Parent pre selection with fast typing");

    cy.get(".ItemList .SortBy")
      .last()
      .click();
    cy.get(".ItemList article")
      .first()
      .contains("Self-Defense Class");
  });

  it("Bulk Edits Toggle and Number Values", () => {
    cy.visit("/content/6-e3d0e0-965qp6");
    cy.get(".ItemList article")
      .first()
      .get(".SortCell button")
      .first()
      .click();
    cy.get(".ItemList article")
      .first()
      .get(".ToggleCell button")
      .first()
      .click();
    cy.contains("Save All Changes").click();
    cy.contains("changes saved").should("exist");
  });
  it("Opens the add item view", () => {
    cy.get("#AddItemButton").click();
    cy.contains("title").should("exist");
    cy.contains("New Item").should("exist");
    cy.get("#CreateItemSaveButton").should("exist");
  });
});

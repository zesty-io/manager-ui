describe("Content List", () => {
  before(() => {
    cy.waitOn("/v1/content/models*", () => {
      cy.visit("/content/6-0c960c-d1n0kx");
    });
  });

  it("Filters list items based on search term", () => {
    cy.getBySelector("MultiPageTableSearchField").type("turkey");
    cy.get(".MuiDataGrid-cell").contains("Turkey Run");
    cy.getBySelector("MultiPageTableSearchField").type("{selectAll}{del}");
  });

  it("Sorts list items", () => {
    cy.getBySelector("sortByFilter_default").click();
    cy.getBySelector("dateCreatedFilterOption").click();
    cy.get(".MuiDataGrid-cell[data-colindex='3']").contains(
      "Parent pre selection with fast typing"
    );
    cy.getBySelector("sortByFilter_default").click();
    cy.getBySelector("dateSavedFilterOption").click();
  });

  it("Saves bulk edits", () => {
    cy.waitOn("/v1/content/models*", () => {
      cy.waitOn("/bin/*", () => {
        cy.visit("/content/6-e3d0e0-965qp6");
      });
    });

    cy.wait(5000);

    cy.getBySelector("sortCell").first().find("button").first().click();
    cy.getBySelector("sortCell").eq(1).find("button").first().click();
    cy.getBySelector("MultiPageTableSaveChanges").click();

    cy.intercept("PUT", "/v1/content/models/*/items/batch").as("batchSave");
    cy.wait("@batchSave").its("response.statusCode").should("equal", 200);
  });

  it.only("Opens the add item view", () => {
    cy.getBySelector("AddItemButton").click();
    cy.getBySelector("CreateItemSaveButton").should("exist");
  });
});

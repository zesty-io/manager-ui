describe("Content List Filters", () => {
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

  it("Filters items based on date saved", () => {
    cy.getBySelector("date_default").click();
    cy.get(".MuiMenuItem-root").eq(1).click();
    cy.getBySelector("NoResults").should("exist");
    cy.getBySelector("date_clearFilter").click();
    cy.getBySelector("NoResults").should("not.exist");
  });

  it("Filters by publish status", () => {
    cy.getBySelector("statusFilter_default").click();
    cy.getBySelector("scheduledFilterOption").click();
    cy.getBySelector("NoResults").should("exist");
    cy.getBySelector("statusFilter_clearFilter").click();
    cy.getBySelector("NoResults").should("not.exist");
  });

  it("Filters by creator", () => {
    cy.getBySelector("user_default").click();
    cy.getBySelector("filter_value_5-da8c91c9da-l9cqsz").click();
    cy.getBySelector("NoResults").should("exist");
    cy.getBySelector("user_clearFilter").click();
    cy.getBySelector("NoResults").should("not.exist");
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
});

describe("Content List Actions", () => {
  before(() => {
    cy.waitOn("/v1/content/models*", () => {
      cy.waitOn("/bin/*", () => {
        cy.visit("/content/6-e3d0e0-965qp6");
      });
    });
  });

  it("Saves bulk edits", () => {
    cy.wait(5000);

    cy.getBySelector("sortCell").first().find("button").first().click();
    cy.getBySelector("sortCell").eq(1).find("button").first().click();
    cy.getBySelector("MultiPageTableSaveChanges").click();

    cy.intercept("PUT", "/v1/content/models/*/items/batch").as("batchSave");
    cy.wait("@batchSave").its("response.statusCode").should("equal", 200);
  });

  it("Opens the add item view", () => {
    cy.getBySelector("AddItemButton").click();
    cy.getBySelector("CreateItemSaveButton").should("exist");
  });
});

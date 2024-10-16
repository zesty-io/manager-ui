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

describe("Content List Navigation", () => {
  before(() => {
    cy.waitOn("/v1/content/models*", () => {
      cy.waitOn("/bin/*", () => {
        cy.visit("/content/6-0c960c-d1n0kx");
      });
    });
  });

  it("Opens the content item on click", () => {
    cy.get(".MuiDataGrid-cell[data-colindex='1']").first().click();
    cy.getBySelector("DuoModeToggle").should("exist");
    cy.getBySelector("breadcrumbs").find(".MuiBreadcrumbs-li").eq(2).click();
    cy.url().should("include", "/content/6-0c960c-d1n0kx");
  });

  it("Navigates to the import csv page", () => {
    cy.getBySelector("MultiPageTableMoreMenu").click();
    cy.getBySelector("ImportCSVNavButton").click();
    cy.url().should("include", "/content/6-0c960c-d1n0kx/import");
  });

  it("Navigates to edit the model page", () => {
    cy.getBySelector("MultiPageTableMoreMenu").click();
    cy.getBySelector("EditModelNavButton").click();
    cy.url().should("include", "/schema/6-0c960c-d1n0kx/fields");
  });

  it("Navigates to edit the template page", () => {
    cy.waitOn("/v1/content/models*", () => {
      cy.waitOn("/bin/*", () => {
        cy.visit("/content/6-0c960c-d1n0kx");
      });
    });

    cy.getBySelector("MultiPageTableMoreMenu").click();
    cy.getBySelector("EditTemplateNavButton").click();
    cy.url().should("include", "/code/file/views");
  });
});

describe("Content List Actions", () => {
  before(() => {
    cy.waitOn("/v1/content/models*", () => {
      cy.visit("/content/6-a8bae2f4d7-rffln5");
    });
  });

  it("Saves bulk edits", () => {
    cy.intercept("PUT", "/v1/content/models/*/items/batch").as("batchSave");
    cy.getBySelector("sortCell").first().find("button").first().click();
    cy.getBySelector("sortCell").eq(1).find("button").first().click();
    cy.getBySelector("MultiPageTableSaveChanges").click();

    cy.wait("@batchSave").its("response.statusCode").should("equal", 200);
  });

  it("Saves and publishes bulk edits", () => {
    cy.intercept("PUT", "/v1/content/models/*/items/batch").as("batchSave");
    cy.intercept("POST", "/v1/content/models/*/items/publishings/batch").as(
      "batchPublish"
    );
    cy.getBySelector("sortCell").first().find("button").first().click();
    cy.getBySelector("sortCell").eq(1).find("button").first().click();
    cy.getBySelector("MultiPageTablePublish").click();
    cy.getBySelector("ConfirmPublishButton").click();

    cy.wait("@batchSave").its("response.statusCode").should("equal", 200);
    cy.wait("@batchPublish").its("response.statusCode").should("equal", 201);
  });

  it.only("Selects items and publishes", () => {
    cy.intercept("PUT", "/v1/content/models/*/items/batch").as("batchSave");
    cy.intercept("POST", "/v1/content/models/*/items/publishings/batch").as(
      "batchPublish"
    );
    cy.get("input[type=checkbox]").eq(1).click();
    cy.get("input[type=checkbox]").eq(2).click();
    cy.getBySelector("MultiPageTablePublish").click();
    cy.getBySelector("ConfirmPublishButton").click();

    cy.wait("@batchPublish").its("response.statusCode").should("equal", 201);
  });

  it("Opens the create new item view", () => {
    cy.getBySelector("AddItemButton").click();
    cy.getBySelector("CreateItemSaveButton").should("exist");
    cy.url().should("include", "/content/6-e3d0e0-965qp6/new");
  });
});

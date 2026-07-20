describe("Content List Filters", () => {
  let contentItems = [];
  before(() => {
    cy.task("seed:content", "fixtures/lists.json").then(
      ({ model, fields, items }) => {
        Cypress.env("modelZUID", model?.ZUID);
        Cypress.env("itemZUID", items[0]?.meta?.ZUID);
        contentItems = items;
        // Visit inside .then() so model ZUID is available before the URL is built
        cy.visit(`/content/${model?.ZUID}`);
      }
    );
    // Content may load from IndexedDB cache — wait for rows to be interactive
    cy.getBySelector("listItemTable")
      .find('[data-cy="itemListRow"]')
      .should("have.length.greaterThan", 0);
  });

  it("Filters list items based on search term", () => {
    cy.getBySelector("MultiPageTableSearchField").type(
      contentItems[1].data.text
    );
    cy.get(".MuiDataGrid-cell").contains(contentItems[1].data.text);
    cy.getBySelector("MultiPageTableSearchField").clear();
  });

  it("Filters items based on date saved", () => {
    cy.getBySelector("MultiPageTableSearchField")
      .find("input")
      .should("be.empty");
    cy.getBySelector("date_default").click({ force: true });
    cy.getBySelector("DateFilterMenu")
      .find("ul li")
      .contains("Yesterday")
      .should("exist")
      .click({ force: true });
    cy.getBySelector("NoResults").should("exist");
    cy.getBySelector("date_clearFilter")
      .should("exist")
      .should("be.enabled")
      .click({ force: true });
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
    cy.getBySelector("createdOnFilterOption").click();

    cy.get(".MuiDataGrid-cell[data-colindex='2']")
      .should("exist")
      .contains(contentItems[4].data.text);
    cy.getBySelector("sortByFilter_default").click();
    cy.getBySelector("createdOnFilterOption").click();
  });
});

describe("Content List Navigation", () => {
  before(() => {
    cy.visit(`/content/${Cypress.env("modelZUID")}`);
    // Content may load from IndexedDB cache — wait for UI instead of network
    cy.getBySelector("listItemTable")
      .find('[data-cy="itemListRow"]')
      .should("have.length.greaterThan", 0);
  });

  it("Opens the content item on click", () => {
    cy.get(".MuiDataGrid-cell[data-colindex='1']").first().click();
    cy.getBySelector("DuoModeToggle").should("exist");
    cy.getBySelector("breadcrumbs").find(".MuiBreadcrumbs-li").eq(1).click();
    cy.url().should("include", `/content/${Cypress.env("modelZUID")}`);
  });

  it("Navigates to the import csv page", () => {
    cy.getBySelector("MultiPageTableMoreMenu").click();
    cy.getBySelector("ImportCSVNavButton").click();
    cy.url().should("include", `/content/${Cypress.env("modelZUID")}`);
  });

  it("Navigates to edit the model page", () => {
    cy.getBySelector("MultiPageTableMoreMenu").click();
    cy.getBySelector("EditModelNavButton").click();
    cy.url().should("include", `/schema/${Cypress.env("modelZUID")}/fields`);
  });

  it("Navigates to edit the template page", () => {
    cy.visit(`/content/${Cypress.env("modelZUID")}`);
    cy.getBySelector("listItemTable")
      .find('[data-cy="itemListRow"]')
      .should("have.length.greaterThan", 0);

    cy.getBySelector("MultiPageTableMoreMenu").click();
    cy.getBySelector("EditTemplateNavButton").click();
    cy.url().should("include", "/code/file/views");
  });
});

describe("Content List Actions", () => {
  before(() => {
    cy.visit(`/content/${Cypress.env("modelZUID")}`);
    // Content may load from IndexedDB cache — wait for UI instead of network
    cy.getBySelector("listItemTable")
      .find('[data-cy="itemListRow"]')
      .should("have.length.greaterThan", 0);
  });

  it("Saves bulk edits", () => {
    cy.intercept("PUT", "/v1/content/models/*/items/batch").as("batchSave");

    cy.getBySelector("listItemTable")
      .find('[data-cy="itemListRow"]')
      .eq(0)
      .find('[data-field="yes_no"] button')
      .eq(1)
      .click();
    cy.getBySelector("listItemTable")
      .find('[data-cy="itemListRow"]')
      .eq(1)
      .find('[data-field="yes_no"] button')
      .eq(1)
      .click();

    cy.getBySelector("MultiPageTableSaveChanges").click();

    cy.wait("@batchSave").its("response.statusCode").should("equal", 200);
    cy.getBySelector("MultiPageTableSaveChanges").should("not.exist");
    cy.getBySelector("listItemTable")
      .find('[data-cy="itemListRow"]')
      .eq(0)
      .find('[data-field="yes_no"] button')
      .eq(1)
      .should("have.attr", "aria-pressed", "true");
    cy.getBySelector("listItemTable")
      .find('[data-cy="itemListRow"]')
      .eq(1)
      .find('[data-field="yes_no"] button')
      .eq(1)
      .should("have.attr", "aria-pressed", "true");
  });
  it("Saves and publishes bulk edits", () => {
    cy.intercept("PUT", "/v1/content/models/*/items/batch").as("batchSave");
    cy.intercept("POST", "/v1/content/models/*/items/publishings/batch").as(
      "batchPublish"
    );
    // "Saves bulk edits" left yes_no=1 for these rows. Click eq(0) to toggle
    // back to 0 so the ToggleButtonGroup registers a real change (clicking the
    // already-selected value returns null and is a no-op).
    cy.getBySelector("listItemTable")
      .find('[data-cy="itemListRow"]')
      .eq(0)
      .find('[data-field="yes_no"] button')
      .eq(0)
      .click();

    cy.getBySelector("listItemTable")
      .find('[data-cy="itemListRow"]')
      .eq(1)
      .find('[data-field="yes_no"] button')
      .eq(0)
      .click();
    cy.getBySelector("MultiPageTablePublish").click();
    cy.getBySelector("ConfirmPublishButton").click();

    cy.wait("@batchSave").its("response.statusCode").should("equal", 200);
    cy.wait("@batchPublish").its("response.statusCode").should("equal", 201);
  });

  it("Selects items and publishes", () => {
    cy.intercept("PUT", "/v1/content/models/*/items/batch").as("batchSave");
    cy.intercept("POST", "/v1/content/models/*/items/publishings/batch").as(
      "batchPublish"
    );
    cy.getBySelector("listItemTable")
      .find("input[type=checkbox]")
      .eq(1)
      .click();

    cy.getBySelector("listItemTable")
      .find("input[type=checkbox]")
      .eq(2)
      .click();

    cy.getBySelector("MultiPageTablePublish").click();
    cy.getBySelector("ConfirmPublishButton").click();

    cy.wait("@batchPublish").its("response.statusCode").should("equal", 201);
  });

  it("Opens the create new item view", () => {
    cy.getBySelector("AddItemButton").click();
    cy.getBySelector("CreateItemSaveButton").should("exist");
    cy.url().should("include", `/content/${Cypress.env("modelZUID")}/new`);
  });
});

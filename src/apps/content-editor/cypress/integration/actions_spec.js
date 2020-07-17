describe("Actions in content editor", () => {
  before(() => {
    //initial login to set the cookie
    cy.login();
    cy.visit("/content/6-556370-8sh47g/7-82a5c7ffb0-07vj1c");
  });

  const timestamp = Date.now();

  it("Saves homepage item metadata", () => {
    // go to Meta Tab
    cy.get("[data-cy=meta]").click();
    cy.get("textarea")
      .first()
      .type("{selectall}{backspace}This is an item meta description");

    cy.get("textarea")
      .first()
      .should("have.value", "This is an item meta description");
    cy.get("#SaveItemButton").click();
    cy.contains("Saved a new ", { timeout: 5000 }).should("exist");
  });

  // TODO: Publishing Does not work
  it.skip("Publishes an item", () => {
    cy.get("#PublishButton").click();
    cy.contains("Published version", { timeout: 5000 }).should("exist");
  });

  // TODO: Unpublish button is missing
  it.skip("Unpublishes an item", () => {
    // go to Content Tab
    cy.get("[data-cy=content]").click();
    cy.get("article.Unpublish").click();
    cy.get("#UnpublishItemButton").click();
    cy.contains("Successfully sent unpublish request", {
      timeout: 5000
    }).should("exist");
  });

  // TODO: Schedule button doesn't work
  it.skip("Schedules a Publish for an item", () => {
    cy.get("#PublishScheduleButton").click();
    // select date and time
    cy.get(".form-control").click();
    cy.focused().type(
      "{rightarrow}{rightarrow}{rightarrow}{rightarrow}{rightarrow}{enter}{esc}"
    );
    cy.get("#SchedulePublishButton").click({ force: true });

    cy.contains("Scheduled version", { timeout: 5000 }).should("exist");
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

  it("Creates a new item", () => {
    cy.visit("/content/6-a1a600-k0b6f0/new");

    cy.contains("Lead in Title", { timeout: 5000 })
      .find("input")
      .click()
      .type(timestamp);
    cy.get("#CreateItemSaveButton").click();

    cy.contains("Created new ", { timeout: 5000 }).should("exist");
  });

  it("Saved item becomes publishable", () => {
    cy.get("#PublishButton").should("exist");
    cy.get("#PublishButton").should("contain", "1");
  });

  it("Displays a new item in the list", () => {
    cy.visit("/content/6-a1a600-k0b6f0");
    cy.contains(timestamp, { timeout: 5000 }).should("exist");
  });

  it("Deletes an item", () => {
    cy.contains(timestamp).click();
    cy.get("article.Delete").click();
    cy.get("#DeleteItemButton").click();
    cy.get("#deleteConfirmButton").should("exist");
    cy.get("#deleteConfirmButton").click();
    cy.contains("Successfully deleted item", { timeout: 5000 }).should("exist");
  });

  // TODO: Workflow request doesn't work
  it.skip("Makes a workflow request", () => {
    cy.get("#MainNavigation")
      .contains("Homepage")
      .click({ force: true });
    cy.get("#WorkflowRequestButton").click();
    cy.contains("Grant Test").click();
    cy.get("#WorkflowRequestSendButton").click();
    // these waits are due to a delay
    // dealing with these specific endpoints
    // the local environment is slow
    cy.contains("Successfully sent workflow request", { timeout: 5000 }).should(
      "exist"
    );
  });

  // it("Refreshes the CDN cache", () => {
  //   cy.get("#RefreshCache").click();
  //   // these waits are due to a delay
  //   // dealing with these specific endpoints
  //   // in any test environment we expect this to fail and display a message
  //   cy.contains("There was an issue trying to purge the CDN cache", { timeout: 5000 }).should(
  //     "exist"
  //   );
  //   // cy.contains("The item has been purged from the CDN cache", { timeout: 5000 }).should("exist");
  // });

  it.skip("Unlists an item", () => {
    cy.get("p > input").click();
    cy.get("#SaveItemButton").click();
    cy.contains("Saved a new ", { timeout: 5000 }).should("exist");
  });
});

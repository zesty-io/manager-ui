describe("Actions in content editor", () => {
  before(() => {
    //initial login to set the cookie
    cy.login();
    cy.goHome();
  });

  const timestamp = Date.now();

  it("Edits homepage item", () => {
    cy.get("#MainNavigation")
      .contains("Homepage")
      .click({ force: true });

    cy.get(".ProseMirror").type("Editing the Homepage");
  });

  it("Saves homepage item data", () => {
    cy.get("#SaveItemButton").click();
    cy.contains("Saved a new ", { timeout: 5000 }).should("exist");
  });

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

  it("Publishes an item", () => {
    cy.get("#PublishButton").click();
    cy.contains("Published version", { timeout: 5000 }).should("exist");
  });

  it("Unpublishes an item", () => {
    // go to Content Tab
    cy.get("[data-cy=content]").click();
    cy.get("#UnpublishItemButton").click();
    cy.contains("Successfully sent unpublish request", {
      timeout: 5000
    }).should("exist");
  });

  it("Schedules a Publish for an item", () => {
    cy.get("#PublishScheduleButton").click();
    // select date and time
    cy.get(".form-control").click();
    cy.focused().type(
      "{rightarrow}{rightarrow}{rightarrow}{rightarrow}{rightarrow}{enter}{esc}"
    );
    cy.get("#SchedulePublishButton").click({ force: true });

    cy.contains("Scheduled version", { timeout: 5000 }).should("exist");
  });

  it("Creates a new item", () => {
    cy.contains("Group").click({ force: true });

    cy.contains("Title")
      .find("input")
      .click()
      .type(timestamp);
    cy.get("#CreateItemSaveButton").click();

    cy.contains("Created new ", { timeout: 5000 }).should("exist");
  });

  it("Saves a new item", () => {
    cy.get("#PublishButton").should("exist");
    cy.get("#PublishButton").should("contain", "1");
    // cy.get("#zestyGrowler").should("contain", "Created ");
  });

  it("Displays a new item in the list", () => {
    cy.get('[href="/content/6-aa7788-9dhmdf"]')
      .first()
      .click({ force: true });
    cy.contains(timestamp).should("exist");
  });

  // it("Deletes an item", () => {
  //   cy.contains(timestamp).click();
  //   cy.get("#DeleteItemButton").click();
  //   cy.get("#deleteConfirmButton").should("exist");
  //   cy.get("#deleteConfirmButton").click();
  //   cy.contains("Successfully deleted", { timeout: 5000 }).should("exist");
  // });

  it("Makes a workflow request", () => {
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

  it("Unlists an item", () => {
    cy.get("p > input").click();
    cy.get("#SaveItemButton").click();
    cy.contains("Saved a new ", { timeout: 5000 }).should("exist");
  });
});

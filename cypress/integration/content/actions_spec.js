describe("Actions in content editor", () => {
  before(() => {
    //initial login to set the cookie
    cy.login();
    cy.visit("/");
  });

  const timestamp = Date.now();

  it("not save when missing required Field", () => {
    // TODO: update field ZUID to be correct synced ZUID when prod syncs down
    cy.visit("/schema/6-556370-8sh47g");

    cy.get("[data-cy=fieldLabel]").contains("required field 1").click();
    cy.contains("Reactivate").click();

    cy.visit("/content/6-556370-8sh47g/7-82a5c7ffb0-07vj1c");
    cy.get("input[type=text]")
      .first()
      .type("{selectall}{backspace}test" + timestamp);
    cy.get("#SaveItemButton").click();
    cy.contains("missing data in required field 1").should("exist");
  });
  it("save when missing required deactivated field", () => {
    cy.visit("/schema/6-556370-8sh47g");
    cy.contains("required field 1").click();
    cy.contains("Deactivate").click();
    cy.visit("/content/6-556370-8sh47g/7-82a5c7ffb0-07vj1c");
    cy.get("input[type=text]")
      .first()
      .type("{selectall}{backspace}test" + timestamp);
    cy.get("#SaveItemButton").click();
    cy.contains("Saved a new test version").should("exist");
  });
  it("Saves homepage item metadata", () => {
    cy.visit("/content/6-556370-8sh47g/7-82a5c7ffb0-07vj1c");
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

  // TODO: get publishing working in Dev environment
  it.skip("Publishes an item", () => {
    cy.get("#PublishButton").click();
    cy.contains("Published version", { timeout: 5000 }).should("exist");
    cy.get("#PublishButton").should("be.disabled");
    // TODO: fix race condition
    // TODO: fix isScheduled/isPublished race condition so it never appears as isScheduled here
    // cy.get("#PublishScheduleButton").should("be.disabled");
  });

  // TODO: get publishing working in Dev environment
  it.skip("Unpublishes an item", () => {
    // go to Content Tab
    cy.get("[data-cy=SubApp]").click();
    cy.get("article.Unpublish").click();
    // TODO: fix race condition so unpublish will not be disabled
    // cy.get("#UnpublishItemButton").should.not("be.disabled");
    cy.get("#UnpublishItemButton").click({ force: true });
    cy.contains("Unpublished Item", {
      timeout: 5000,
    }).should("exist");
  });

  // TODO: fix race condition so schedule publish will work
  it.skip("Schedules a Publish for an item", () => {
    // TODO: remove reload when UI state is consistent
    cy.reload();
    cy.get("#PublishScheduleButton").click();
    // select date and time
    cy.get(".form-control").first().click();
    cy.get(".flatpickr-calendar.open .flatpickr-next-month").click();
    cy.get(".flatpickr-calendar.open .flatpickr-day:not(.prevMonthDay)")
      .first()
      .click();
    cy.get(".flatpickr-calendar.open .flatpickr-confirm").click();
    cy.get("#SchedulePublishButton").click();
    cy.contains("Scheduled version").should("exist");
    cy.get("#SchedulePublishClose").click();
  });

  it.skip("Unschedules a Publish for an item", () => {
    cy.get("#PublishScheduleButton").click();
    cy.get("#UnschedulePublishButton").click();
    cy.get("#SchedulePublishClose").click();
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
    cy.get("#MainNavigation").contains("Homepage").click({ force: true });
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
});

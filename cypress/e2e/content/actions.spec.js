describe("Actions in content editor", () => {
  const timestamp = Date.now();

  it("Must not save when missing required Field", () => {
    cy.waitOn("/v1/content/models*", () => {
      cy.visit("/content/6-556370-8sh47g/7-82a5c7ffb0-07vj1c");
    });

    cy.get("#12-13d590-9v2nr2 input").clear().should("have.value", "");
    cy.get("#SaveItemButton").click();

    cy.get("[data-cy=toast]").contains("You are missing data");
  });

  /**
   *  NOTE: this depends upon `toggle` field on the schema being marked as being required and deactivated. Because it's deactivated it doesn't render in the content editor and the expectation is the content item should save. there fore there is nothing to do and confirm that this item saves successfully. Adding this notes because nothing really happens inside this test but it's important this test remains.
   * */
  it("Save when missing required deactivated field", () => {
    cy.waitOn("/v1/content/models*", () => {
      cy.visit("/content/6-0c960c-d1n0kx/7-c882ba84ce-c4smnp");
    });

    // Test deactivated field is not in DOM
    cy.get("#12-f8efe4e0f5-xj7pj6 input").should("not.exist");

    // Make an edit to enable save button
    cy.get("#12-849844-t8v5l6 input").clear().type(timestamp);

    // save to api
    cy.waitOn(
      "/v1/content/models/6-0c960c-d1n0kx/items/7-c882ba84ce-c4smnp",
      () => {
        cy.get("#SaveItemButton").click();
      }
    );

    cy.get("[data-cy=toast]").contains("Saved a new ");
  });

  it("Saves homepage item metadata", () => {
    cy.waitOn("/v1/content/models*", () => {
      cy.visit("/content/6-a1a600-k0b6f0/7-a1be38-1b42ht/meta");
    });

    cy.get("textarea")
      .first()
      .type("{selectall}{backspace}This is an item meta description")
      .should("have.value", "This is an item meta description");

    cy.waitOn(
      "/v1/content/models/6-a1a600-k0b6f0/items/7-a1be38-1b42ht",
      () => {
        cy.get("#SaveItemButton").click();
      }
    );

    cy.get("[data-cy=toast]").contains("Saved a new ");
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
    cy.get("[data-cy=SchedulePublishButton]").click();
    cy.contains("Scheduled version").should("exist");
    cy.get("#SchedulePublishClose").click();
  });

  it("Only allows future dates to be scheduled for publish", () => {
    cy.waitOn("/v1/content/models*", () => {
      cy.visit("/content/6-556370-8sh47g/7-82a5c7ffb0-07vj1c");
    });

    cy.get("#PublishScheduleButton").click();
    cy.get(
      ".ModalAligner--ptdt- .MuiOutlinedInput-root .MuiInputAdornment-root .MuiButtonBase-root"
    ).click();

    cy.get(
      '.MuiCalendarPicker-root .MuiPickersArrowSwitcher-root button[aria-label="Previous month"]'
    ).should("be.disabled");
    cy.get(
      '.MuiCalendarPicker-root .MuiPickersArrowSwitcher-root button[aria-label="Next month"]'
    ).should("not.be.disabled");
  });

  it.skip("Unschedules a Publish for an item", () => {
    cy.get("#PublishScheduleButton").click();
    cy.get("[data-cy=UnschedulePublishButton]").click();
    cy.get("#SchedulePublishClose").click();
  });

  it("Creates a new item", () => {
    cy.waitOn("/v1/content/models*", () => {
      cy.visit("/content/6-a1a600-k0b6f0/new");
    });

    cy.get("input[name=title]", { timeout: 5000 }).click().type(timestamp);
    cy.get("#CreateItemSaveButton").click();

    cy.contains("Created new ", { timeout: 5000 }).should("exist");
  });

  it("Saved item becomes publishable", () => {
    cy.get("#PublishButton").should("exist");
    cy.get("#PublishButton").should("contain", "1");
  });

  it("Displays a new item in the list", () => {
    cy.waitOn("/v1/content/models*", () => {
      cy.visit("/content/6-a1a600-k0b6f0");
    });

    cy.contains(timestamp, { timeout: 5000 }).should("exist");
  });

  it("Deletes an item", () => {
    cy.contains(timestamp).click();
    cy.get('[data-cy="WidgetDeleteAccordion"]').click();
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

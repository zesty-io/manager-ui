import moment from "moment";

const yesterdayTimestamp = moment()
  .hour(0)
  .minute(0)
  .second(0)
  .millisecond(0)
  .subtract(1, "day")
  .format("x");

describe("Actions in content editor", () => {
  const timestamp = Date.now();

  it("Must not save when missing required Field", () => {
    cy.waitOn("/v1/content/models*", () => {
      cy.visit("/content/6-556370-8sh47g/7-82a5c7ffb0-07vj1c");
    });

    cy.get("#12-13d590-9v2nr2 input").clear().should("have.value", "");
    cy.get("#SaveItemButton").click();

    cy.get("[data-cy=toast]").contains("Missing Data in Required Fields");
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

    cy.get("[data-cy=toast]").contains("Item Saved");
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

    cy.get("[data-cy=toast]").contains("Item Saved");
  });

  it("Publishes an item", () => {
    cy.getBySelector("PublishButton").click();
    cy.getBySelector("ConfirmPublishModal").should("exist");
    cy.getBySelector("ConfirmPublishButton").click();

    cy.intercept("GET", "**/publishings").as("publish");
    cy.wait("@publish");

    cy.getBySelector("ContentPublishedIndicator").should("exist");
  });

  it("Unpublishes an item", () => {
    cy.getBySelector("ContentPublishedIndicator").should("exist");
    cy.getBySelector("PublishMenuButton").click();
    cy.getBySelector("UnpublishContentButton").click({ force: true });
    cy.getBySelector("ConfirmUnpublishButton").click();

    cy.intercept("GET", "**/publishings").as("publish");
    cy.wait("@publish");

    cy.getBySelector("PublishButton").should("exist");
  });

  it("Schedules a Publish for an item", () => {
    cy.waitOn("/v1/content/models*", () => {
      cy.visit("/content/6-a1a600-k0b6f0/7-a1be38-1b42ht/meta");
    });

    cy.getBySelector("PublishMenuButton").click();
    cy.getBySelector("PublishScheduleButton").click({ force: true });
    cy.getBySelector("SchedulePublishButton").click();
    cy.getBySelector("ContentScheduledIndicator").should("exist");
  });

  it("Unschedules a Publish for an item", () => {
    cy.getBySelector("PublishMenuButton").click();
    cy.getBySelector("PublishScheduleButton").click();
    cy.getBySelector("UnschedulePublishButton").click();
    cy.getBySelector("ContentScheduledIndicator").should("not.exist");
  });

  it("Only allows future dates to be scheduled for publish", () => {
    cy.waitOn("/v1/content/models*", () => {
      cy.visit("/content/6-a1a600-k0b6f0/7-a1be38-1b42ht/meta");
    });

    cy.getBySelector("PublishMenuButton").click();
    cy.getBySelector("PublishScheduleButton").click();
    cy.getBySelector("PublishScheduleModal")
      .find("[data-cy='datePickerInputField']")
      .click();

    cy.get(
      '.MuiPickersArrowSwitcher-root button[aria-label="Previous month"]'
    ).should("be.disabled");
    cy.get(
      '.MuiPickersArrowSwitcher-root button[aria-label="Next month"]'
    ).should("not.be.disabled");
    cy.getBySelector("CancelSchedulePublishButton").click({ force: true });
  });

  it("Fills in default values for a new item", () => {
    cy.waitOn("/v1/content/models*", () => {
      cy.visit("/content/6-a1a600-k0b6f0/new");
    });

    cy.get("#12-0c3934-8dz720 input").should(
      "have.value",
      "default single line text field"
    );
    cy.get("#12-d39a38-85sqdt").contains("zesty-io-logo-horizontal-dark.png");
    cy.get("#12-bcd1dcc5f4-2rpm9p").contains(
      "5 Tricks to Teach Your Pitbull: Fun & Easy Tips for You & Your Dog!"
    );
  });

  it("Fills in default values for a new item", () => {
    cy.waitOn("/v1/content/models*", () => {
      cy.visit("/content/6-a1a600-k0b6f0/new");
    });

    cy.get("#12-0c3934-8dz720 input").should(
      "have.value",
      "default single line text field"
    );
    cy.get("#12-d39a38-85sqdt").contains("zesty-io-logo-horizontal-dark.png");
    cy.get("#12-bcd1dcc5f4-2rpm9p").contains(
      "5 Tricks to Teach Your Pitbull: Fun & Easy Tips for You & Your Dog!"
    );
  });

  it("Creates a new item", () => {
    cy.waitOn("/v1/content/models*", () => {
      cy.visit("/content/6-a1a600-k0b6f0/new");
    });

    cy.get("input[name=title]", { timeout: 5000 }).click().type(timestamp);
    cy.getBySelector("CreateItemSaveButton").click();

    cy.contains("Created Item", { timeout: 5000 }).should("exist");
  });

  it("Saved item becomes publishable", () => {
    cy.get("#PublishButton").should("exist");
  });

  it("Displays a new item in the list", () => {
    cy.waitOn("/v1/content/models*", () => {
      cy.visit("/content/6-a1a600-k0b6f0");
    });

    cy.contains(timestamp, { timeout: 5000 }).should("exist");
  });

  it("Deletes an item", () => {
    cy.contains(timestamp).click();
    cy.getBySelector("ContentItemMoreButton").click();
    cy.getBySelector("DeleteContentItem").click();
    cy.getBySelector("DeleteContentItemConfirmButton").click();

    cy.waitOn("/v1/content/models*", () => {
      cy.visit("/content/6-a1a600-k0b6f0");
    });

    cy.contains(timestamp).should("not.exist");
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
  //   cy.contains("There was an issue trying to purge the CDN cache", {
  //     timeout: 5000,
  //   }).should("exist");
  //   // cy.contains("The item has been purged from the CDN cache", { timeout: 5000 }).should("exist");
  // });
});

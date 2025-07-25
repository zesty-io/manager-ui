import moment from "moment";
import { API_ENDPOINTS } from "../../support/api";
const TIMEOUT = { timeout: 15_000 };
const yesterdayTimestamp = moment()
  .hour(0)
  .minute(0)
  .second(0)
  .millisecond(0)
  .subtract(1, "day")
  .format("x");

const SUFFIX = "---TEST";

const TEST_DATA = {
  newItem: `new_item${SUFFIX}`,
};

describe("Actions in content editor", () => {
  before(() => {
    cleanTestData();
  });

  const timestamp = Date.now();

  it("Must not save when missing required Field", () => {
    cy.waitOn("/v1/content/models*", () => {
      cy.visit("/content/6-556370-8sh47g/7-82a5c7ffb0-07vj1c");
    });

    cy.get("#12-13d590-9v2nr2 input", TIMEOUT).clear().should("have.value", "");
    cy.get("#SaveItemButton", TIMEOUT).trigger("click");

    cy.get("[data-cy=toast]", TIMEOUT).contains(
      "Missing Data in Required Fields",
      TIMEOUT
    );
  });

  it("Must not save when exceeding or lacking characters", () => {
    cy.waitOn("/v1/content/models*", () => {
      cy.visit("/content/6-a4f5f1beaa-zc5l6v/7-ce9ca8cfb0-cc1mnz");
    });

    cy.get("#12-e6a5cfe3f6-k94nbg input", TIMEOUT).clear().type("aa");
    cy.get("#SaveItemButton", TIMEOUT).trigger("click");
    cy.getBySelector("FieldErrorsList").should("exist");
    cy.getBySelector("FieldErrorsList")
      .find("ol")
      .find("li")
      .first()
      .contains("Requires 8 more characters.");
    cy.get("#12-e6a5cfe3f6-k94nbg input")
      .clear()
      .type("Lorem ipsum dolor sit amet, consect");
    cy.get("#SaveItemButton", TIMEOUT).trigger("click");
    cy.getBySelector("FieldErrorsList").should("exist");
    cy.getBySelector("FieldErrorsList")
      .find("ol")
      .find("li")
      .first()
      .contains("Exceeding by 5 characters.");
    cy.get("#12-e6a5cfe3f6-k94nbg input", TIMEOUT)
      .clear({ force: true })
      .wait(500)
      .type("Lorem ipsum");
    cy.get("#SaveItemButton", TIMEOUT).click();
    cy.get("[data-cy=toast]", TIMEOUT).contains(
      "Item Saved: New Schema All Fields"
    );
  });

  it("Must not save when regex is not matched", () => {
    cy.waitOn("/v1/content/models*", () => {
      cy.visit("/content/6-a4f5f1beaa-zc5l6v/7-ce9ca8cfb0-cc1mnz");
    });

    cy.get("#12-b6d09d92d0-7911ld textarea", TIMEOUT)
      .first()
      .clear()
      .type("aa");
    cy.get("#SaveItemButton", TIMEOUT).trigger("click");
    cy.getBySelector("FieldErrorsList").should("exist");
    cy.getBySelector("FieldErrorsList")
      .find("ol")
      .find("li")
      .first()
      .contains("Must be an email (e.g. hello@zesty.io)");
    cy.get("#12-b6d09d92d0-7911ld  textarea")
      .first()
      .clear()
      .wait(500)
      .type("hello@zesty.io");
    cy.get("#SaveItemButton", TIMEOUT).click();
    cy.get("[data-cy=toast]", TIMEOUT).contains(
      "Item Saved: New Schema All Fields"
    );
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
    cy.get("#12-849844-t8v5l6 input", TIMEOUT)
      .clear()
      .wait(500)
      .type(TEST_DATA?.newItem);

    // save to api
    cy.waitOn(
      "/v1/content/models/6-0c960c-d1n0kx/items/7-c882ba84ce-c4smnp",
      () => {
        cy.get("#SaveItemButton").click({ force: true, ...TIMEOUT });
      }
    );

    cy.get("[data-cy=toast]", TIMEOUT).contains("Item Saved");
  });

  it("Saves homepage item metadata", () => {
    cy.waitOn("/v1/content/models*", () => {
      cy.visit("/content/6-a1a600-k0b6f0/7-a1be38-1b42ht/meta");
    });

    cy.get("textarea", TIMEOUT)
      .first()
      .wait(500)
      .type("{selectall}{backspace}This is an item meta description", TIMEOUT)
      .should("have.value", "This is an item meta description");

    cy.waitOn(
      "/v1/content/models/6-a1a600-k0b6f0/items/7-a1be38-1b42ht",
      () => {
        cy.get("#SaveItemButton", TIMEOUT).trigger("click");
      }
    );

    cy.get("[data-cy=toast]", TIMEOUT).contains("Item Saved");
  });

  it("Publishes an item", () => {
    cy.getBySelector("PublishButton", TIMEOUT).click();
    cy.getBySelector("ConfirmPublishModal").should("exist");
    cy.getBySelector("ConfirmPublishButton").click();

    cy.intercept("GET", "**/publishings").as("publish");
    cy.wait("@publish");

    cy.getBySelector("ContentPublishedIndicator").should("exist");
  });

  it("Unpublishes an item", () => {
    cy.getBySelector("ContentPublishedIndicator").should("exist");
    cy.getBySelector("PublishMenuButton", TIMEOUT).click();
    cy.getBySelector("UnpublishContentButton", TIMEOUT).click();
    cy.getBySelector("ConfirmUnpublishButton").click();

    cy.intercept("GET", "**/publishings").as("publish");
    cy.wait("@publish");

    cy.getBySelector("PublishButton", TIMEOUT).should("exist");
  });

  it("Schedules a Publish for an item", () => {
    cy.waitOn("/v1/content/models*", () => {
      cy.visit("/content/6-a1a600-k0b6f0/7-a1be38-1b42ht/meta");
    });

    cy.getBySelector("PublishMenuButton", TIMEOUT).click();
    cy.getBySelector("PublishScheduleButton").click();
    cy.getBySelector("SchedulePublishButton").click();
    cy.getBySelector("ContentScheduledIndicator").should("exist");
  });

  it("Unschedules a Publish for an item", () => {
    cy.getBySelector("PublishMenuButton", TIMEOUT).click();
    cy.getBySelector("PublishScheduleButton").click();
    cy.getBySelector("UnschedulePublishButton").click();
    cy.getBySelector("ContentScheduledIndicator").should("not.exist");
  });

  it("Only allows future dates to be scheduled for publish", () => {
    cy.waitOn("/v1/content/models*", () => {
      cy.visit("/content/6-a1a600-k0b6f0/7-a1be38-1b42ht/meta");
    });

    cy.getBySelector("PublishMenuButton", TIMEOUT).click();
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
    cy.getBySelector("CancelSchedulePublishButton").click();
  });

  it("Fills in default values for a new item", () => {
    cy.waitOn("/v1/content/models*", () => {
      cy.visit("/content/6-a1a600-k0b6f0/new");
    });

    cy.get("#12-0c3934-8dz720 input", TIMEOUT).should(
      "have.value",
      "default single line text field"
    );
    cy.get("#12-d39a38-85sqdt", TIMEOUT).contains(
      "zesty-io-logo-horizontal-dark.png"
    );
    cy.get("#12-bcd1dcc5f4-2rpm9p", TIMEOUT).contains(
      "5 Tricks to Teach Your Pitbull: Fun & Easy Tips for You & Your Dog!"
    );
  });

  it("Fills in default values for a new item", () => {
    cy.waitOn("/v1/content/models*", () => {
      cy.visit("/content/6-a1a600-k0b6f0/new");
    });

    cy.get("#12-0c3934-8dz720 input", TIMEOUT).should(
      "have.value",
      "default single line text field"
    );
    cy.get("#12-d39a38-85sqdt").contains("zesty-io-logo-horizontal-dark.png");
    cy.get("#12-bcd1dcc5f4-2rpm9p").contains(
      "5 Tricks to Teach Your Pitbull: Fun & Easy Tips for You & Your Dog!"
    );
  });

  it("Creates a new item", () => {
    cleanTestData();
    cy.waitOn("/v1/content/models*", () => {
      cy.visit("/content/6-a1a600-k0b6f0/new");
    });

    cy.get("input[name=title]", TIMEOUT)
      .wait(500)
      .type(TEST_DATA?.newItem, TIMEOUT);
    cy.getBySelector("ManualMetaFlow").click();
    cy.getBySelector("metaDescription")
      .find("textarea")
      .first()
      .wait(500)
      .type(TEST_DATA?.newItem);
    cy.getBySelector("CreateItemSaveButton", TIMEOUT).click();

    cy.contains("Created Item", TIMEOUT).should("exist");
  });

  it("Saved item becomes publishable", () => {
    cy.get("#PublishButton", TIMEOUT).should("exist");
  });

  it("Displays a new item in the list", () => {
    cy.waitOn("/v1/content/models*", () => {
      cy.visit("/content/6-a1a600-k0b6f0");
    });

    cy.contains(TEST_DATA?.newItem, { timeout: 50_000 }).should("exist");
  });

  it("Deletes an item", () => {
    cy.contains(TEST_DATA?.newItem, TIMEOUT).click();
    cy.getBySelector("ContentItemMoreButton", TIMEOUT).click();
    cy.getBySelector("DeleteContentItem").click();
    cy.getBySelector("DeleteContentItemConfirmButton").click();

    cy.waitOn("/v1/content/models*", () => {
      cy.visit("/content/6-a1a600-k0b6f0");
    });

    cy.contains(TEST_DATA?.newItem).should("not.exist");
  });

  // TODO: Workflow request doesn't work
  it.skip("Makes a workflow request", () => {
    cy.get("#MainNavigation", TIMEOUT).contains("Homepage").click();
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

  it.only("Creates a new content item using AI-generated data", () => {
    cy.waitOn("/v1/content/models*", () => {
      cy.waitOn("/v1/content/models/*/fields?showDeleted=true", () => {
        cy.visit("/content/6-a1a600-k0b6f0/new");
      });
    });

    // Generate AI content for single line text
    cy.get("#12-0c3934-8dz720", { timeout: 30_000 })
      .find("[data-cy='AIOpen']")
      .click();
    cy.getBySelector("AITopicField").type("biking");
    cy.getBySelector("AIAudienceField").type("young adults");
    cy.getBySelector("AIGenerate").click();

    cy.get("[data-cy='AIApprove']", { timeout: 50_000 }).click();

    // Generate AI content for wysiwyg
    cy.get("#12-717920-6z46t7", { timeout: 30_000 })
      .find("[data-cy='AIOpen']")
      .click();
    cy.getBySelector("AITopicField").type("biking");
    cy.getBySelector("AIAudienceField").type("young adults");
    cy.get("[data-cy='AIGenerate']", { timeout: 30_000 }).click();

    cy.get("[data-cy='AIApprove']", { timeout: 50_000 }).click();

    // Select AI-assisted metadata generation flow
    cy.getBySelector("ManualMetaFlow").click();

    // Generate AI content for meta title
    cy.getBySelector("metaTitle").find("input").clear();
    cy.getBySelector("metaTitle").find("[data-cy='AIOpen']").click();
    cy.get("[data-cy='AIGenerate']", { timeout: 30_000 }).click();

    cy.get("[data-cy='AISuggestion1']", { timeout: 30_000 }).click();

    cy.get("[data-cy='AIApprove']", { timeout: 50_000 }).click();

    // Generate AI content for meta description
    cy.getBySelector("metaDescription")
      .find("textarea[name='metaDescription']")
      .clear();
    cy.getBySelector("metaDescription").find("[data-cy='AIOpen']").click();
    cy.getBySelector("AIGenerate").click();

    cy.get("[data-cy='AISuggestion1']", { timeout: 50_000 }).click();

    cy.get("[data-cy='AIApprove']", { timeout: 50_000 }).click();

    cy.getBySelector("CreateItemSaveButton").click();

    cy.contains("Created Item", { timeout: 15000 }).should("exist");
  });
});

function cleanTestData() {
  cy.apiRequest({
    url: `${API_ENDPOINTS.devInstance}/content/models/6-a1a600-k0b6f0/items?limit=5000&page=1&lang=en-US`,
  }).then((response) => {
    const zuids = response?.data
      ?.filter((resData) => resData?.data?.title?.includes(SUFFIX))
      ?.map((item) => item?.meta?.ZUID);

    cy.apiRequest({
      url: `${API_ENDPOINTS.devInstance}/content/models/6-a1a600-k0b6f0/items/batch`,
      method: "DELETE",
      body: JSON.stringify(zuids),
    });
  });
}

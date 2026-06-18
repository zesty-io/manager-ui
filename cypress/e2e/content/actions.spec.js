const timestamp = Date.now();
const TEST_DATA = {
  new: `New Item:${timestamp}`,
  ai: `AI Generated:${timestamp}`,
};
// Generous timeout: the publish/item data requests can be slow under load.
const requestTimeout = 30000;

describe("Actions in content editor", () => {
  let CONTENT_ITEMS = null;
  let FIELDS = null;
  before(() => {
    cy.task("seed:content", "fixtures/actions.json").then(
      ({ model, fields, items }) => {
        //Set modelZUID as Cypress env variable for global test access
        Cypress.env("modelZUID", model?.ZUID);
        //Set itemZUID as Cypress env variable for global test access
        Cypress.env("itemZUID", items[0]?.meta?.ZUID);
        CONTENT_ITEMS = items;
        FIELDS = fields;
        // Delete fontawesome field to test deactivated fields scenario
        const fontAwesomeField =
          Array.isArray(fields) &&
          fields?.find((field) => field.datatype === "fontawesome");
        cy.apiRequest({
          url: `${Cypress.env("API_INSTANCE_URL")}/content/models/${
            model?.ZUID
          }/fields/${fontAwesomeField?.ZUID}`,
          method: "DELETE",
        });
      }
    );
  });

  it("Must not save when missing required Field", () => {
    cy.waitOn("/v1/content/models**", () => {
      cy.visit(
        `/content/${Cypress.env("modelZUID")}/${Cypress.env("itemZUID")}`
      );
    });

    cy.getBySelector("field:markdown")
      .find("textarea")
      // Wait for hydration (seeded value) before clearing, so the save sees it empty.
      .should("have.value", "markdown")
      .click()
      .clear()
      .should("have.value", "");

    cy.getBySelector("SaveItemButton")
      .should("exist")
      .should("be.enabled")
      .trigger("click");

    cy.getBySelector("toast").contains("Missing Data in Required Fields", {
      matchCase: false,
    });
    cy.getBySelector("field:markdown")
      .find("textarea")
      .click()
      .clear()
      .type("markdown");
  });

  it("Must not save when exceeding or lacking characters", () => {
    cy.getBySelector("field:text")
      .find("input")
      .click()
      .clear()
      .type("aa")
      .wait(500);
    cy.getBySelector("SaveItemButton")
      .should("exist")
      .should("be.enabled")
      .trigger("click");
    cy.getBySelector("FieldErrorsList").should("exist");
    cy.getBySelector("FieldErrorsList")
      .find("ol")
      .find("li")
      .first()
      .contains("Requires 8 more characters.");
    cy.getBySelector("field:text")
      .find("input")
      .click()
      .clear()
      .type("Lorem ipsum dolor sit amet, consect")
      .wait(500);
    cy.getBySelector("SaveItemButton")
      .should("exist")
      .should("be.enabled")
      .trigger("click");
    cy.getBySelector("FieldErrorsList").should("exist");
    cy.getBySelector("FieldErrorsList")
      .find("ol")
      .find("li")
      .first()
      .contains("Exceeding by 5 characters.");
    cy.getBySelector("field:text")
      .find("input")
      .click()
      .clear()
      .type("Lorem ipsum")
      .wait(500);
    cy.getBySelector("SaveItemButton")
      .should("exist")
      .should("be.enabled")
      .trigger("click");
    cy.getBySelector("toast").contains(
      `Item Saved: ${CONTENT_ITEMS?.[0].web.metaTitle}`,
      {
        matchCase: false,
      }
    );
    cy.getBySelector("field:text")
      .find("input")
      .click()
      .clear()
      .type("Mitchell Wilder");
  });

  it("Must not save when regex is not matched", () => {
    cy.getBySelector("field:textarea")
      .find("textarea")
      .first()
      .click()
      .clear()
      .type("aa");
    cy.getBySelector("SaveItemButton")
      .should("exist")
      .should("be.enabled")
      .trigger("click");
    cy.getBySelector("FieldErrorsList").should("exist");
    cy.getBySelector("FieldErrorsList")
      .find("ol")
      .find("li")
      .first()
      .contains("Must be an email (e.g. hello@zesty.io)");
    cy.getBySelector("field:textarea")
      .find("textarea")
      .first()
      .click()
      .clear()
      .type("hello@zesty.io")
      .wait(500);
    cy.getBySelector("SaveItemButton")
      .should("exist")
      .should("be.enabled")
      .trigger("click");
    cy.getBySelector("toast").contains(
      `Item Saved: ${CONTENT_ITEMS?.[0].web.metaTitle}`,
      {
        matchCase: false,
      }
    );
    cy.getBySelector("field:textarea")
      .find("textarea")
      .first()
      .click()
      .clear()
      .type("test_email@zesty.io");
  });

  /**
   *  NOTE: this depends upon `toggle` field on the schema being marked as being required and deactivated. Because it's deactivated it doesn't render in the content editor and the expectation is the content item should save. there fore there is nothing to do and confirm that this item saves successfully. Adding this notes because nothing really happens inside this test but it's important this test remains.
   * */
  it("Save when missing required deactivated field", () => {
    // Test deactivated field is not in DOM
    cy.get(`[data-cy="field:fontawesome"] input`).should("not.exist");

    // Make an edit to enable save button
    cy.getBySelector("field:text")
      .find("input")
      .click()
      .clear()
      .type(TEST_DATA?.new);

    cy.getBySelector("SaveItemButton")
      .should("exist")
      .should("be.enabled")
      .trigger("click");

    cy.getBySelector("toast").contains("Item Saved");
  });

  it("Saves page item metadata", () => {
    cy.waitOn("/v1/content/models**", () => {
      cy.visit(
        `/content/${Cypress.env("modelZUID")}/${Cypress.env("itemZUID")}/meta`
      );
    });

    cy.getBySelector("metaDescription")
      .find("textarea")
      .first()
      .click()
      .clear()
      .type("{selectall}{backspace}This is an item meta description")
      .should("have.value", "This is an item meta description");

    cy.getBySelector("itemRoute").find("input").click().clear().type("/");
    cy.getBySelector("itemRouteListBox").find("li").first().click();

    cy.waitOn(
      `/v1/content/models/${Cypress.env("modelZUID")}/items/${Cypress.env(
        "itemZUID"
      )}`,
      () => {
        cy.getBySelector("SaveItemButton")
          .should("exist")
          .should("be.enabled")
          .trigger("click");
      }
    );

    cy.getBySelector("toast").contains("Item Saved");
  });

  it("Publishes an item", () => {
    const { items, publishItem, publishings } = awaitRequests();
    cy.visit(
      `/content/${Cypress.env("modelZUID")}/${CONTENT_ITEMS?.[4]?.meta?.ZUID}`
    );

    // Apply extended timeout for potentially slow-loading item and publishing data
    cy.wait([items, publishings], { requestTimeout });

    cy.getBySelector("PublishButton").should("exist").should("be.enabled");
    cy.getBySelector("PublishButton").trigger("click");

    cy.getBySelector("ConfirmPublishModal")
      .should("exist")
      .within(() => {
        cy.getBySelector("ConfirmPublishButton").should("exist");
        cy.getBySelector("ConfirmPublishButton").trigger("click");
      });

    cy.wait(publishItem);
    cy.wait(publishings);

    cy.getBySelector("ContentPublishedIndicator").should("exist");
  });

  it("Unpublishes an item", () => {
    const { items, deletePublishedItem, publishings } = awaitRequests();
    cy.visit(
      `/content/${Cypress.env("modelZUID")}/${CONTENT_ITEMS?.[4]?.meta?.ZUID}`
    );
    cy.wait([items, publishings], { requestTimeout });

    cy.getBySelector("PublishMenuButton").should("exist").should("be.enabled");
    cy.getBySelector("PublishMenuButton").trigger("click");

    cy.getBySelector("publishingMenu")
      .should("exist")
      .within(() => {
        cy.getBySelector("UnpublishContentButton").should("exist");
        cy.getBySelector("UnpublishContentButton").trigger("click");
      });

    cy.getBySelector("unpublishDialog")
      .should("exist")
      .within(() => {
        cy.getBySelector("ConfirmUnpublishButton").should("exist");
        cy.getBySelector("ConfirmUnpublishButton").trigger("click");
      });

    cy.wait(deletePublishedItem);
    cy.wait(publishings);

    cy.getBySelector("PublishButton").should("exist").should("be.enabled");
  });

  it("Schedules a Publish for an item", () => {
    const { items, publishItem, publishings } = awaitRequests();
    cy.visit(
      `/content/${Cypress.env("modelZUID")}/${CONTENT_ITEMS?.[4]?.meta?.ZUID}`
    );

    // Apply extended timeout for potentially slow-loading item and publishing data
    cy.wait([items, publishings], { requestTimeout });

    cy.getBySelector("PublishMenuButton").should("exist").should("be.enabled");
    cy.getBySelector("PublishMenuButton").trigger("click");

    cy.getBySelector("publishingMenu")
      .should("exist")
      .within(() => {
        cy.getBySelector("PublishScheduleButton").should("exist");
        cy.getBySelector("PublishScheduleButton").trigger("click");
      });

    cy.getBySelector("SchedulePublishModal")
      .should("exist")
      .within(() => {
        cy.getBySelector("SchedulePublishButton").should("exist");
        cy.getBySelector("SchedulePublishButton").trigger("click");
      });

    cy.wait(publishItem);
    cy.wait(publishings);

    cy.getBySelector("ContentScheduledIndicator").should("exist");
  });

  it("Unschedules a Publish for an item", () => {
    const { items, deletePublishedItem, publishings } = awaitRequests();
    // Re-visit so this test reads the scheduled item fresh, independent of the
    // previous test's open modal.
    cy.visit(
      `/content/${Cypress.env("modelZUID")}/${CONTENT_ITEMS?.[4]?.meta?.ZUID}`
    );
    cy.wait([items, publishings], { requestTimeout });

    cy.getBySelector("PublishMenuButton").should("exist").should("be.enabled");
    cy.getBySelector("PublishMenuButton").trigger("click");

    cy.getBySelector("publishingMenu")
      .should("exist")
      .within(() => {
        cy.getBySelector("PublishScheduleButton").should("exist");
        cy.getBySelector("PublishScheduleButton").trigger("click");
      });

    cy.getBySelector("SchedulePublishModal")
      .should("exist")
      .within(() => {
        cy.getBySelector("UnschedulePublishButton").should("exist");
        cy.getBySelector("UnschedulePublishButton").trigger("click");
      });

    cy.wait([deletePublishedItem, publishings], { requestTimeout });

    cy.getBySelector("ContentScheduledIndicator").should("not.exist");
  });

  it("Only allows future dates to be scheduled for publish", () => {
    cy.getBySelector("PublishMenuButton").should("exist").should("be.enabled");
    cy.getBySelector("PublishMenuButton").trigger("click");

    cy.getBySelector("publishingMenu")
      .should("exist")
      .within(() => {
        cy.getBySelector("PublishScheduleButton").should("exist");
        cy.getBySelector("PublishScheduleButton").trigger("click");
      });

    cy.getBySelector("PublishScheduleModal")
      .should("exist")
      .within(() => {
        cy.getBySelector("datePickerInputField").should("exist");
        cy.getBySelector("datePickerInputField").trigger("click");
      });

    cy.get(
      '.MuiPickersArrowSwitcher-root button[aria-label="Previous month"]'
    ).should("be.disabled");

    cy.get(
      '.MuiPickersArrowSwitcher-root button[aria-label="Next month"]'
    ).should("not.be.disabled");

    cy.getBySelector("CancelSchedulePublishButton").should("exist");
    cy.getBySelector("CancelSchedulePublishButton").trigger("click");
  });

  it("Fills in default values for a new item", () => {
    cy.waitOn("/v1/content/models**", () => {
      cy.visit(`/content/${Cypress.env("modelZUID")}/new`);
    });

    cy.getBySelector("field:text")
      .find("input")
      .should(
        "have.value",
        FIELDS.find((field) => field.name === "text").settings.defaultValue
      );
    cy.getBySelector("field:textarea")
      .find("textarea")
      .first()
      .should(
        "have.value",
        FIELDS.find((field) => field.name === "textarea").settings.defaultValue
      );
    cy.getBySelector("field:markdown")
      .find("textarea")
      .should(
        "have.value",
        FIELDS.find((field) => field.name === "markdown").settings.defaultValue
      );
  });

  it("Creates a new item", () => {
    cy.waitOn("/v1/content/models**", () => {
      cy.visit(`/content/${Cypress.env("modelZUID")}/new`);
    });

    cy.getBySelector("field:text")
      .find("input")
      .click()
      .clear()
      .type(TEST_DATA?.new);

    cy.getBySelector("ManualMetaFlow").click();
    cy.getBySelector("metaDescription")
      .find("textarea")
      .first()
      .click()
      .type(TEST_DATA?.new);
    cy.getBySelector("CreateItemSaveButton").click();

    cy.getBySelector("toast")
      .contains(`Created Item: ${TEST_DATA?.new}`, { matchCase: false })
      .should("exist");
  });

  it("Saved item becomes publishable", () => {
    cy.get("#PublishButton").should("exist");
  });

  it("Displays a new item in the list", () => {
    cy.waitOn("/v1/content/models**", () => {
      cy.visit(`/content/${Cypress.env("modelZUID")}`);
    });

    cy.contains(TEST_DATA?.new).should("exist");
  });

  it("Deletes an item", () => {
    cy.contains(TEST_DATA?.new).should("exist").click();
    cy.getBySelector("ContentItemMoreButton").click();
    cy.getBySelector("DeleteContentItem").click();
    cy.getBySelector("DeleteContentItemConfirmButton").should("exist").click();

    cy.waitOn("/v1/content/models**", () => {
      cy.visit(`/content/${Cypress.env("modelZUID")}`);
    });

    cy.contains(TEST_DATA?.new).should("not.exist");
  });

  // TODO: Workflow request doesn't work
  it.skip("Makes a workflow request", () => {
    cy.get("#MainNavigation").contains("Homepage").click();
    cy.get("#WorkflowRequestButton").should("exist").click();
    cy.contains("Grant Test").click();
    cy.get("#WorkflowRequestSendButton").should("exist").click();
    // these waits are due to a delay
    // dealing with these specific endpoints
    // the local environment is slow
    cy.contains("Successfully sent workflow request").should("exist");
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

  it("Creates a new content item using AI-generated data", () => {
    cy.waitOn("/v1/content/models**", () => {
      cy.waitOn("/v1/content/models/*/fields?showDeleted=true", () => {
        cy.visit(`/content/${Cypress.env("modelZUID")}/new`);
      });
    });

    // Increase timeout to account for longer AI generation times.
    const aiDataGenerationTimeout = { timeout: 60_000 };

    cy.getBySelector("field:text")
      .find("input")
      .click()
      .clear()
      .type(TEST_DATA?.ai);

    // Generate AI content for markdown
    cy.getBySelector("field:markdown").find("[data-cy='AIOpen']").click();
    cy.getBySelector("AITopicField").type("biking");
    cy.getBySelector("AIAudienceField").type("young adults");
    cy.getBySelector("AIGenerate").click();

    cy.get("[data-cy='AIApprove']", aiDataGenerationTimeout).click();

    // Generate AI content for wysiwyg_basic
    cy.getBySelector("field:wysiwyg_basic").find("[data-cy='AIOpen']").click();
    cy.getBySelector("AITopicField").type("biking");
    cy.getBySelector("AIAudienceField").type("young adults");
    cy.getBySelector("AIGenerate").click();

    cy.get("[data-cy='AIApprove']", aiDataGenerationTimeout)
      .should("exist")
      .click();

    // Select AI-assisted metadata generation flow
    cy.getBySelector("ManualMetaFlow").click();

    // Generate AI content for meta title
    cy.getBySelector("metaTitle").find("input").click().clear();
    cy.getBySelector("metaTitle").find("[data-cy='AIOpen']").click();
    cy.get("[data-cy='AIGenerate']").click();

    cy.get("[data-cy='AISuggestion1']", aiDataGenerationTimeout).click();

    cy.get("[data-cy='AIApprove']", aiDataGenerationTimeout).click();

    // Generate AI content for meta description
    cy.getBySelector("metaDescription")
      .find("textarea[name='metaDescription']")
      .click()
      .clear();
    cy.getBySelector("metaDescription").find("[data-cy='AIOpen']").click();
    cy.getBySelector("AIGenerate").click();

    cy.get("[data-cy='AISuggestion1']", aiDataGenerationTimeout).click();

    cy.get("[data-cy='AIApprove']", aiDataGenerationTimeout).click();

    cy.getBySelector("CreateItemSaveButton").click();

    cy.contains("Created Item", aiDataGenerationTimeout).should("exist");
  });
});

function awaitRequests() {
  cy.intercept("GET", "/v1/content/models/*/items/*/publishings").as(
    "publishings"
  );
  cy.intercept("GET", "/v1/content/models/*/items*").as("items");
  cy.intercept("POST", "/v1/content/models/*/items/*/publishings").as(
    "publishItem"
  );
  cy.intercept("DELETE", "/v1/content/models/*/items/*/publishings/*").as(
    "deletePublishedItem"
  );

  return {
    publishings: "@publishings",
    items: "@items",
    publishItem: "@publishItem",
    deletePublishedItem: "@deletePublishedItem",
  };
}

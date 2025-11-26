import { API_ENDPOINTS } from "../../support/api";

const timestamp = Date.now();
const TEST_DATA = {
  new: `New Item:${timestamp}`,
  ai: `AI Generated:${timestamp}`,
};

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
          url: `${API_ENDPOINTS.devInstance}/content/models/${model?.ZUID}/fields/${fontAwesomeField?.ZUID}`,
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

    cy.get(`[data-cy="field:markdown"] textarea`)
      .clear()
      .should("have.value", "")
      .wait(500);
    cy.get("#SaveItemButton").trigger("click");

    cy.get("[data-cy=toast]").contains("Missing Data in Required Fields", {
      matchCase: false,
    });
    cy.get(`[data-cy="field:markdown"] textarea`).clear().type("markdown");
  });

  it("Must not save when exceeding or lacking characters", () => {
    cy.get(`[data-cy="field:text"] input`).clear().type("aa").wait(500);
    cy.get("#SaveItemButton").trigger("click");
    cy.getBySelector("FieldErrorsList").should("exist");
    cy.getBySelector("FieldErrorsList")
      .find("ol")
      .find("li")
      .first()
      .contains("Requires 8 more characters.");
    cy.get(`[data-cy="field:text"] input`)
      .clear()
      .type("Lorem ipsum dolor sit amet, consect")
      .wait(500);
    cy.get("#SaveItemButton").trigger("click");
    cy.getBySelector("FieldErrorsList").should("exist");
    cy.getBySelector("FieldErrorsList")
      .find("ol")
      .find("li")
      .first()
      .contains("Exceeding by 5 characters.");
    cy.get(`[data-cy="field:text"] input`)
      .clear()
      .type("Lorem ipsum")
      .wait(500);
    cy.get("#SaveItemButton").click();
    cy.get("[data-cy=toast]").contains(
      `Item Saved: ${CONTENT_ITEMS?.[0].web.metaTitle}`,
      {
        matchCase: false,
      }
    );
    cy.get(`[data-cy="field:text"] input`).clear().type("Mitchell Wilder");
  });

  it("Must not save when regex is not matched", () => {
    cy.get(`[data-cy="field:textarea"] textarea:eq(0)`).clear().type("aa");
    cy.get("#SaveItemButton").trigger("click");
    cy.getBySelector("FieldErrorsList").should("exist");
    cy.getBySelector("FieldErrorsList")
      .find("ol")
      .find("li")
      .first()
      .contains("Must be an email (e.g. hello@zesty.io)");
    cy.get(`[data-cy="field:textarea"]  textarea:eq(0)`)
      .first()
      .clear()
      .type("hello@zesty.io")
      .wait(500);
    cy.get("#SaveItemButton").trigger("click");
    cy.get("[data-cy=toast]").contains(
      `Item Saved: ${CONTENT_ITEMS?.[0].web.metaTitle}`,
      {
        matchCase: false,
      }
    );
    cy.get(`[data-cy="field:textarea"] textarea:eq(0)`)
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
    cy.get(`[data-cy="field:text"] input`)
      .clear()
      .type(TEST_DATA?.new)
      .wait(500);

    cy.get("#SaveItemButton").trigger("click");

    cy.get("[data-cy=toast]").contains("Item Saved");
  });

  it("Saves page item metadata", () => {
    cy.waitOn("/v1/content/models**", () => {
      cy.visit(
        `/content/${Cypress.env("modelZUID")}/${Cypress.env("itemZUID")}/meta`
      );
    });

    cy.get("textarea")
      .first()
      .wait(500)
      .type("{selectall}{backspace}This is an item meta description")
      .should("have.value", "This is an item meta description");

    cy.get('[data-cy="itemRoute"] input').type("/");
    cy.get(".MuiAutocomplete-listbox li:eq(0)").click();

    cy.waitOn(
      `/v1/content/models/${Cypress.env("modelZUID")}/items/${Cypress.env(
        "itemZUID"
      )}`,
      () => {
        cy.get("#SaveItemButton").trigger("click");
      }
    );

    cy.get("[data-cy=toast]").contains("Item Saved");
  });

  it("Publishes an item", () => {
    cy.waitOn("/v1/content/models**", () => {
      cy.visit(
        `/content/${Cypress.env("modelZUID")}/${CONTENT_ITEMS?.[4]?.meta?.ZUID}`
      );
    });
    cy.intercept("**/publishings").as("publish");
    cy.getBySelector("PublishButton")
      .should("exist")
      .should("be.enabled")
      .click();
    cy.getBySelector("ConfirmPublishModal").should("exist").wait(500);
    cy.getBySelector("ConfirmPublishButton").should("exist").click();

    cy.wait("@publish");
    cy.getBySelector("ContentPublishedIndicator").should("exist");
  });

  it("Unpublishes an item", () => {
    cy.intercept("**/publishings/**").as("publish");
    cy.getBySelector("PublishMenuButton")
      .should("exist")
      .should("be.enabled")
      .click();
    cy.getBySelector("UnpublishContentButton").should("exist").click();
    cy.get(".MuiDialog-root").should("exist").wait(500);
    cy.getBySelector("ConfirmUnpublishButton").should("exist").click();

    cy.wait("@publish");
    cy.getBySelector("PublishButton").should("exist");
  });

  it("Schedules a Publish for an item", () => {
    cy.waitOn("/v1/content/models**", () => {
      cy.visit(
        `/content/${Cypress.env("modelZUID")}/${CONTENT_ITEMS?.[4]?.meta?.ZUID}`
      );
    });
    cy.intercept("**/publishings").as("publish");
    cy.getBySelector("PublishMenuButton")
      .should("exist")
      .should("be.enabled")
      .click();
    cy.getBySelector("PublishScheduleButton").should("exist").click();
    cy.getBySelector("SchedulePublishModal").should("exist").wait(500);
    cy.getBySelector("SchedulePublishButton").should("exist").click();
    cy.wait("@publish");
    cy.getBySelector("ContentScheduledIndicator").should("exist");
  });

  it("Unschedules a Publish for an item", () => {
    cy.intercept("**/publishings**").as("publish");
    cy.getBySelector("PublishMenuButton")
      .should("exist")
      .should("be.enabled")
      .click();
    cy.getBySelector("PublishScheduleButton").should("exist").click();
    cy.getBySelector("SchedulePublishModal").should("exist").wait(500);
    cy.getBySelector("UnschedulePublishButton").should("exist").click();
    cy.wait("@publish");
    cy.getBySelector("ContentScheduledIndicator").should("not.exist");
  });

  it("Only allows future dates to be scheduled for publish", () => {
    cy.getBySelector("PublishMenuButton")
      .should("exist")
      .should("be.enabled")
      .click();
    cy.getBySelector("PublishScheduleButton").should("exist").click();
    cy.getBySelector("PublishScheduleModal").should("exist").wait(500);
    cy.getBySelector("PublishScheduleModal")
      .find("[data-cy='datePickerInputField']")
      .should("exist")
      .click();

    cy.get(
      '.MuiPickersArrowSwitcher-root button[aria-label="Previous month"]'
    ).should("be.disabled");
    cy.get(
      '.MuiPickersArrowSwitcher-root button[aria-label="Next month"]'
    ).should("not.be.disabled");
    cy.getBySelector("CancelSchedulePublishButton").should("exist").click();
  });

  it("Fills in default values for a new item", () => {
    cy.waitOn("/v1/content/models**", () => {
      cy.visit(`/content/${Cypress.env("modelZUID")}/new`);
    });

    cy.get('[data-cy="field:text"] input').should(
      "have.value",
      FIELDS.find((field) => field.name === "text").settings.defaultValue
    );
    cy.get('[data-cy="field:textarea"] textarea:eq(0)').should(
      "have.value",
      FIELDS.find((field) => field.name === "textarea").settings.defaultValue
    );
    cy.get('[data-cy="field:markdown"] textarea').should(
      "have.value",
      FIELDS.find((field) => field.name === "markdown").settings.defaultValue
    );
  });

  it("Creates a new item", () => {
    cy.waitOn("/v1/content/models**", () => {
      cy.visit(`/content/${Cypress.env("modelZUID")}/new`);
    });

    cy.get('[data-cy="field:text"] input').clear();
    cy.get('[data-cy="field:text"] input').should("have.value", "");
    cy.get('[data-cy="field:text"] input').type(TEST_DATA?.new);
    cy.getBySelector("ManualMetaFlow").click();
    cy.getBySelector("metaDescription")
      .find("textarea")
      .first()
      .wait(500)
      .type(TEST_DATA?.new);
    cy.getBySelector("CreateItemSaveButton").click();

    cy.get("[data-cy=toast]")
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

    cy.get('[data-cy="field:text"] input').clear();
    cy.get('[data-cy="field:text"] input').should("have.value", "");
    cy.get('[data-cy="field:text"] input').type(TEST_DATA?.ai);

    // Generate AI content for markdown
    cy.get(`[data-cy="field:markdown"]`).find("[data-cy='AIOpen']").click();
    cy.getBySelector("AITopicField").type("biking");
    cy.getBySelector("AIAudienceField").type("young adults");
    cy.getBySelector("AIGenerate").click();

    cy.get("[data-cy='AIApprove']", aiDataGenerationTimeout).click();

    // Generate AI content for wysiwyg_basic
    cy.get(`[data-cy="field:wysiwyg_basic"]`)
      .find("[data-cy='AIOpen']")
      .click();
    cy.getBySelector("AITopicField").type("biking");
    cy.getBySelector("AIAudienceField").type("young adults");
    cy.getBySelector("AIGenerate").click();

    cy.get("[data-cy='AIApprove']", aiDataGenerationTimeout)
      .should("exist")
      .click();

    // Select AI-assisted metadata generation flow
    cy.getBySelector("ManualMetaFlow").click();

    // Generate AI content for meta title
    cy.getBySelector("metaTitle").find("input").clear();
    cy.getBySelector("metaTitle").find("[data-cy='AIOpen']").click();
    cy.get("[data-cy='AIGenerate']").click();

    cy.get("[data-cy='AISuggestion1']", aiDataGenerationTimeout).click();

    cy.get("[data-cy='AIApprove']", aiDataGenerationTimeout).click();

    // Generate AI content for meta description
    cy.getBySelector("metaDescription")
      .find("textarea[name='metaDescription']")
      .clear();
    cy.getBySelector("metaDescription").find("[data-cy='AIOpen']").click();
    cy.getBySelector("AIGenerate").click();

    cy.get("[data-cy='AISuggestion1']", aiDataGenerationTimeout).click();

    cy.get("[data-cy='AIApprove']", aiDataGenerationTimeout).click();

    cy.getBySelector("CreateItemSaveButton").click();

    cy.contains("Created Item", aiDataGenerationTimeout).should("exist");
  });
});

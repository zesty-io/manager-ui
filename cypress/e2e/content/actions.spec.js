import moment from "moment";
import { FIELDS } from "../../support/dbSetup";
const options = { timeout: 30_000 };
const forced = { force: true };
const SUFFIX = "---TEST";

const TEST_DATA = {
  newItem: `new_item${SUFFIX}`,
};
const FIELDS_DATA = {
  ...FIELDS,
  text: {
    ...FIELDS.text,
    required: true,
    settings: {
      defaultValue: "Sample text",
      maxCharLimit: 30,
      minCharLimit: 10,
    },
  },
  textarea: {
    ...FIELDS.textarea,
    required: true,
    settings: {
      defaultValue: "test_email@zesty.io",
      regexMatchErrorMessage: "Must be an email (e.g. hello@zesty.io)",
      regexMatchPattern:
        "[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?",
    },
  },
  markdown: {
    ...FIELDS.markdown,
    required: true,
    settings: {
      defaultValue: "markdown",
    },
  },
  wysiwyg_basic: {
    ...FIELDS.wysiwyg_basic,
    required: false,
    settings: {
      defaultValue: "What is Zesty.io?",
    },
  },
};

const itemData = {
  text: "Sample text",
  textarea: "test_email@zesty.io",
  markdown: "markdown",
};

describe(
  "Actions in content editor",
  {
    retries: 1,
    defaultCommandTimeout: 30_000,
  },
  function () {
    before(function () {
      const fieldsPayload = Object.values(FIELDS_DATA);
      cy.setFieldProperties(fieldsPayload);
      cy.setContentItemData(itemData);
      const fieldsMap = Cypress.env("FIELDS")?.reduce((acc, field) => {
        acc[field?.name] = field?.ZUID;
        return acc;
      }, {});
      const delFields = fieldsMap?.["fontawesome"];
      cy.deleteFields(Cypress.env("modelZUID"), [delFields]);
    });
    beforeEach(function () {
      cy.handleRetry(true);
    });

    const timestamp = Date.now();

    context("Editing Content Items", function () {
      before(function () {
        cy.visit(
          `/content/${Cypress.env("modelZUID")}/${Cypress.env("itemZUID")}`
        );
      });
      it("Must not save when missing required Field", function () {
        cy.get(`[data-cy="field:markdown"]`, options)
          .should("exist")
          .scrollIntoView();

        cy.get(`[data-cy="field:markdown"] textarea`, options)
          .should("exist")
          .clear(forced)
          .should("have.value", "")
          .wait(500);

        cy.get("#SaveItemButton", options).should("exist").trigger("click");

        cy.get('[data-cy="toast"]', options).contains(
          "Missing Data in Required Fields",
          {
            matchCase: false,
          }
        );

        cy.get(`[data-cy="field:markdown"] textarea`, options)
          .should("exist")
          .clear(forced)
          .should("have.value", "")
          .type(itemData?.markdown);
      });

      it("Must not save when exceeding or lacking characters", function () {
        cy.get(`[data-cy="field:text"]`).should("exist").scrollIntoView();

        cy.get(`[data-cy="field:text"] input`, options)
          .should("exist")
          .clear(forced)
          .should("have.value", "")
          .type("aa")
          .wait(500);

        cy.get("#SaveItemButton", options).should("exist").trigger("click");
        cy.getBySelector("FieldErrorsList").should("exist");
        cy.getBySelector("FieldErrorsList")
          .find("ol")
          .find("li")
          .first()
          .contains("Requires 8 more characters.");

        cy.get(`[data-cy="field:text"] input`, options)
          .should("exist")
          .clear(forced)
          .should("have.value", "")
          .type("Lorem ipsum dolor sit amet, consect")
          .wait(500);

        cy.get("#SaveItemButton", options).should("exist").trigger("click");
        cy.getBySelector("FieldErrorsList").should("exist");
        cy.getBySelector("FieldErrorsList")
          .find("ol")
          .find("li")
          .first()
          .contains("Exceeding by 5 characters.");

        cy.get(`[data-cy="field:text"] input`, options)
          .should("exist")
          .clear(forced)
          .should("have.value", "")
          .type("Lorem ipsum")
          .wait(500);

        cy.get("#SaveItemButton", options).should("exist").trigger("click");
        cy.get("[data-cy=toast]", options).contains(
          `Item Saved: ${Cypress.env("MODEL")?.label}`,
          { matchCase: false }
        );
        cy.get(`[data-cy="field:text"] input`, options)
          .clear(forced)
          .should("have.value", "")
          .type(itemData?.text);
      });

      it("Must not save when regex is not matched", function () {
        cy.get(`[data-cy="field:textarea"]`, options)
          .should("exist")
          .scrollIntoView();
        cy.get(`[data-cy="field:textarea"] textarea:eq(0)`, options)
          .should("be.visible")
          .clear(forced)
          .should("have.value", "")
          .type("aa")
          .wait(500);

        cy.get("#SaveItemButton", options).should("exist").trigger("click");
        cy.getBySelector("FieldErrorsList").should("exist");
        cy.getBySelector("FieldErrorsList")
          .find("ol")
          .find("li")
          .first()
          .contains("Must be an email (e.g. hello@zesty.io)");
        cy.get(`[data-cy="field:textarea"] textarea:eq(0)`, options)
          .should("exist")
          .clear(forced)
          .should("have.value", "")
          .type(itemData.textarea)
          .wait(500);

        cy.get("#SaveItemButton", options).should("exist").trigger("click");
        cy.get("[data-cy=toast]", options).contains(
          `Item Saved: ${Cypress.env("MODEL")?.label}`,
          {
            matchCase: false,
          }
        );
      });

      it("Save when missing required deactivated field", function () {
        // Test deactivated field is not in DOM
        cy.get(`[data-cy="field:fontawesome"]`, options).should("not.exist");

        // Make an edit to enable save button
        cy.get(`[data-cy="field:text"] input`, options)
          .should("exist")
          .clear(forced)
          .should("have.value", "")
          .type(TEST_DATA?.newItem)
          .wait(500);

        cy.get("#SaveItemButton").should("exist").trigger("click");

        cy.get("[data-cy=toast]", options).contains("Item Saved", {
          matchCase: false,
        });
      });

      it("Saves Page item metadata", function () {
        cy.visit(
          `/content/${Cypress.env("modelZUID")}/${Cypress.env("itemZUID")}/meta`
        );

        cy.get("textarea", options)
          .first()
          .should("exist")
          .type(
            "{selectall}{backspace}This is an item meta description",
            options
          );
        cy.get("textarea", options)
          .first()
          .should("have.value", "This is an item meta description");
        cy.get("#SaveItemButton", options).should("exist").trigger("click");
        cy.get("[data-cy=toast]", options).contains("Item Saved", {
          matchCase: false,
        });
      });
    });

    /**
     *  NOTE: this depends upon `toggle` field on the schema being marked as being required and deactivated. Because it's deactivated it doesn't render in the content editor and the expectation is the content item should save. there fore there is nothing to do and confirm that this item saves successfully. Adding this notes because nothing really happens inside this test but it's important this test remains.
     * */
    context("Publishing and Scheduling", function () {
      before(function () {
        cy.unpublishItem(Cypress.env("modelZUID"), Cypress.env("itemZUID"));
        cy.visit(
          `/content/${Cypress.env("modelZUID")}/${Cypress.env("itemZUID")}`
        );
      });

      beforeEach(function () {
        cy.handleRetry(true, function () {
          const isNotPublished = !![
            "Unpublishes an item",
            "Unschedules a Publish for an item",
          ].includes(Cypress.currentTest.title);

          if (isNotPublished) {
            cy.publishItem(Cypress.env("modelZUID"), Cypress.env("itemZUID"));
          } else {
            cy.unpublishItem(Cypress.env("modelZUID"), Cypress.env("itemZUID"));
          }
        });
      });

      it("Publishes an item", function () {
        cy.get(`[data-cy="PublishButton"]`, options)
          .should("be.enabled")
          .click();
        cy.get(
          `[data-cy="ConfirmPublishModal"] [data-cy="ConfirmPublishButton"]`,
          options
        )
          .should("be.enabled")
          .click();

        cy.get(`[data-cy="ContentPublishedIndicator"]`, options).should(
          "exist"
        );
      });

      it("Unpublishes an item", function () {
        cy.get(`[data-cy="PublishMenuButton"]`, options)
          .should("be.enabled")
          .click();
        cy.get(`[data-cy="UnpublishContentButton"]`, options)
          .should("exist")
          .trigger("click", forced);
        cy.get(`[data-cy="ConfirmUnpublishButton"]`, options)
          .should("exist")
          .should("be.enabled")
          .click();

        cy.get(`[data-cy="PublishButton"]`, options).should("exist");
      });

      it("Schedules a Publish for an item", function () {
        cy.get(`[data-cy="PublishMenuButton"]`, options)
          .should("be.enabled")
          .click();

        cy.get(`[data-cy="PublishScheduleButton"]`, options)
          .should("exist")
          .wait(500)
          .trigger("click", forced);

        cy.get(
          `[data-cy="SchedulePublishModal"] [data-cy="SchedulePublishButton"]`,
          options
        )
          .should("exist")
          .should("be.enabled")
          .click();

        cy.get(`[data-cy="ContentScheduledIndicator"]`, options).should(
          "exist"
        );
      });

      it("Unschedules a Publish for an item", function () {
        cy.get(`[data-cy="PublishMenuButton"]`, options)
          .should("exist")
          .should("be.enabled")
          .wait(500)
          .click();

        cy.get(`[data-cy="PublishScheduleButton"]`, options)
          .should("exist")
          .wait(500)
          .trigger("click", forced);

        cy.get(
          `[data-cy="SchedulePublishModal"] [data-cy="UnschedulePublishButton"]`,
          options
        )
          .should("exist")
          .should("be.enabled")
          .wait(500)
          .click();

        cy.get(`[data-cy="ContentScheduledIndicator"]`, options).should(
          "not.exist"
        );
      });

      it("Only allows future dates to be scheduled for publish", function () {
        cy.get(`[data-cy="PublishMenuButton"]`, options)
          .should("exist")
          .should("be.enabled")
          .click();
        cy.get(`[data-cy="PublishScheduleButton"]`, options)
          .should("exist")
          .trigger("click", options);
        cy.get(`[data-cy="PublishScheduleModal"]`, options).should("exist");

        cy.get(
          `[data-cy="PublishScheduleModal"] [data-cy="datePickerInputField"]`,
          options
        )
          .should("exist")
          .click();

        cy.get(
          '.MuiPickersArrowSwitcher-root button[aria-label="Previous month"]'
        ).should("be.disabled");
        cy.get(
          '.MuiPickersArrowSwitcher-root button[aria-label="Next month"]'
        ).should("not.be.disabled");
        cy.getBySelector("CancelSchedulePublishButton").click();
      });
    });

    context("Creating New Item", function () {
      const payload = [
        {
          ...FIELDS_DATA.text,
          required: false,
          settings: {
            ...FIELDS_DATA.text.settings,
            maxCharLimit: null,
            minCharLimit: null,
          },
        },
      ];

      before(function () {
        cy.updateFields(Cypress.env("modelZUID"), payload);
        cy.visit(`/content/${Cypress.env("modelZUID")}/new`);
      });

      beforeEach(function () {
        cy.handleRetry(true, function () {
          cy.updateFields(Cypress.env("modelZUID"), payload);
        });
      });

      it("Fills in default values for a new item", function () {
        cy.get(`[data-cy="field:text"] input`, options).should(
          "have.value",
          FIELDS_DATA?.text.settings.defaultValue
        );
        cy.get(`[data-cy="field:textarea"] textarea:eq(0)`, options).contains(
          FIELDS_DATA?.textarea.settings.defaultValue
        );
        cy.get(`[data-cy="field:markdown"] textarea`, options).contains(
          FIELDS_DATA?.markdown.settings.defaultValue
        );
        cy.get(`[data-cy="field:wysiwyg_basic"]`, options).should("exist");

        cy.iframe("#wysiwyg_basic_ifr", options)
          .should("exist")
          .should("be.visible")
          .contains(FIELDS_DATA?.wysiwyg_basic.settings.defaultValue);
      });

      it("Creates a new item", function () {
        cy.get(`[data-cy="field:text"] input`, options)
          .wait(500)
          .type(TEST_DATA?.newItem, options);
        cy.getBySelector("ManualMetaFlow").click();
        cy.getBySelector("metaDescription")
          .find("textarea")
          .first()
          .wait(500)
          .type(TEST_DATA?.newItem);
        cy.getBySelector("CreateItemSaveButton", options)
          .trigger("mouseout")
          .click(forced);

        cy.contains("Created Item", options).should("exist");
      });

      it("Saved item becomes publishable", function () {
        cy.get("#PublishButton", options).should("exist");
      });

      it("Displays a new item in the list", function () {
        cy.visit(`/content/${Cypress.env("modelZUID")}`);
        cy.contains(TEST_DATA?.newItem, { timeout: 50_000 }).should("exist");
      });

      it("Deletes an item", function () {
        cy.contains(TEST_DATA?.newItem, options).click();
        cy.getBySelector("ContentItemMoreButton", options).click();
        cy.getBySelector("DeleteContentItem").click();
        cy.getBySelector("DeleteContentItemConfirmButton").click();

        cy.contains(TEST_DATA?.newItem).should("not.exist");
      });

      // TODO: Workflow request doesn't work
      it.skip("Makes a workflow request", function () {
        cy.get("#MainNavigation", options).contains("Homepage").click();
        cy.get("#WorkflowRequestButton").click();
        cy.contains("Grant Test").click();
        cy.get("#WorkflowRequestSendButton").click();
        // these waits are due to a delay
        // dealing with these specific endpoints
        // the local environment is slow
        cy.contains("Successfully sent workflow request", options).should(
          "exist"
        );
      });

      // it("Refreshes the CDN cache", function() {
      //   cy.get("#RefreshCache").click();
      //   // these waits are due to a delay
      //   // dealing with these specific endpoints
      //   // in any test environment we expect this to fail and display a message
      //   cy.contains("There was an issue trying to purge the CDN cache", {
      //     timeout: 5000,
      //   }).should("exist");
      //   // cy.contains("The item has been purged from the CDN cache", { timeout: 5000 }).should("exist");
      // });

      it("Creates a new content item using AI-generated data", function () {
        cy.visit(`/content/${Cypress.env("modelZUID")}/new`);

        // Generate AI content for single line text
        cy.get(`[data-cy="field:text"] [data-cy='AIOpen']`, {
          timeout: 50_000,
        }).click();
        cy.getBySelector("AITopicField").type("biking");
        cy.getBySelector("AIAudienceField").type("young adults");
        cy.getBySelector("AIGenerate").click();

        cy.get("[data-cy='AIApprove']", { timeout: 50_000 }).click();

        // Generate AI content for wysiwyg
        cy.get(
          `[data-cy="field:textarea"] [data-cy='AIOpen']`,
          options
        ).click();
        cy.getBySelector("AITopicField").type("biking");
        cy.getBySelector("AIAudienceField").type("young adults");
        cy.get("[data-cy='AIGenerate']", options).click();

        cy.get("[data-cy='AIApprove']", { timeout: 50_000 }).click();

        // Select AI-assisted metadata generation flow
        cy.getBySelector("ManualMetaFlow").click();

        // Generate AI content for meta title
        cy.getBySelector("metaTitle").find("input").clear();
        cy.getBySelector("metaTitle").find("[data-cy='AIOpen']").click();
        cy.get("[data-cy='AIGenerate']", options).click();

        cy.get("[data-cy='AISuggestion1']", options).click();

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
  }
);

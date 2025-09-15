import moment from "moment";
import "cypress-iframe";
import { API_ENDPOINTS } from "../../support/api";
import { FIELDS, MODEL, ITEMS } from "../../support/dbSetup";

const options = { timeout: 40_000 };
const forced = { force: true };

const TIMESTAMP = Date.now();

const EXAMPLE_TEXT = "example_text";

describe(
  "Content Specs",
  {
    retries: 1,
    defaultCommandTimeout: 30_000,
  },
  function () {
    before(function () {
      cy.resetContentModel();
      cy.wrap(Cypress.env("ITEM")).as("contentItem");
      getMediaFiles().then((filesRes) => {
        cy.wrap(filesRes).as("mediaFiles");
      });
    });

    context("editing content", function () {
      before(() => {
        cy.visit(
          `/content/${Cypress.env("modelZUID")}/${Cypress.env("itemZUID")}`
        );
      });
      it("Enable DUO mode", function () {
        cy.getBySelector("DuoModeToggle", options)
          .should("exist")
          .trigger("click", forced);
      });

      it("Text Field", function () {
        cy.get(`[data-cy="field:text"] input`, options)
          .should("be.visible")
          .clear()
          .type(`${EXAMPLE_TEXT}`)
          .should("have.value", `${EXAMPLE_TEXT}`);
      });

      it("WYSIWYG Basic Field", function () {
        cy.get(`[data-cy="field:wysiwyg_basic"]`, options).should("exist");

        cy.iframe("#wysiwyg_basic_ifr")
          .should("exist")
          .should("be.visible")
          .focus()
          .type(`{selectall}{backspace}${EXAMPLE_TEXT}`)
          .contains(`${EXAMPLE_TEXT}`);
      });

      it("Image Field", function () {
        cy.get(
          `[data-cy="field:images"] [data-cy="selectFromMediaButton"]`,
          options
        )
          .should("be.enabled")
          .click(forced);

        for (let index = 0; index < 3; index++) {
          cy.get(
            `.mediaSelectionContainer > div .ThumbnailContainer:eq(${index}):has([data-cy="${this?.mediaFiles?.[index]?.id}"])`,
            options
          ).click();
        }

        cy.get(`[data-cy="mediaSelectionDoneButton"]`, options).click();

        cy.get(
          `[data-cy="mediaItem-container"] [data-cy="mediaItem"]`,
          options
        ).should("have.length", 3);
      });

      it("Textarea Field", function () {
        /**
        MUI *intentionally* renders 2 textareas to the DOM; one hidden and
        one visible. The visible one is the one we are interested in.
        https://github.com/mui/material-ui/pull/15436
      */
        cy.get(
          `[data-cy="field:textarea"] textarea:not([readonly]):not([hidden])`,
          options
        )
          .focus()
          .clear()
          .type(`${EXAMPLE_TEXT}`)
          .should("have.value", `${EXAMPLE_TEXT}`);
      });

      it("WYSIWYG Advanced Field", function () {
        cy.get(`[data-cy="field:wysiwyg_advanced"]`, options).should("exist");

        cy.iframe("#wysiwyg_advanced_ifr")
          .click(forced)
          .type(`{selectall}{backspace}${EXAMPLE_TEXT}`)
          .contains(`${EXAMPLE_TEXT}`);
      });

      it("Article Writer Field", function () {
        cy.get(`[data-cy="field:article_writer"] .ProseMirror`, options)
          .clear()
          .type(`${EXAMPLE_TEXT}`)
          .contains(`${EXAMPLE_TEXT}`);
      });

      it("Markdown Field", function () {
        cy.get(`[data-cy="field:markdown"] textarea`)
          .clear()
          .type(EXAMPLE_TEXT)
          .should("have.value", EXAMPLE_TEXT);
      });

      it("Dropdown Field", function () {
        cy.get(`[data-cy="field:dropdown"] .MuiAutocomplete-root input`)
          .should("be.enabled")
          .click();

        cy.get(".MuiAutocomplete-option").first().click();
        cy.get(`[data-cy="field:dropdown"] .MuiAutocomplete-root input`).should(
          "have.value",
          "Custom Option One"
        );

        cy.get(
          `[data-cy="field:dropdown"] .MuiAutocomplete-root input`
        ).click();
        cy.get(".MuiAutocomplete-option").last().click();
        cy.get(`[data-cy="field:dropdown"] .MuiAutocomplete-root input`).should(
          "have.value",
          "Custom Option Two"
        );
      });

      it("Url Field", function () {
        cy.get(`[data-cy="field:link"] input`)
          .should("be.enabled")
          .clear()
          .type(`http://www.zesty.pw/${EXAMPLE_TEXT}`)
          .should("have.value", `http://www.zesty.pw/${EXAMPLE_TEXT}`);
      });

      it("Internal Link Field", function () {
        const itemLabel = String(this?.contentItem?.web?.metaTitle || "");
        const selectedZUID = this?.contentItem?.meta?.ZUID;

        cy.get(`[data-cy="field:internal_link"] .Select`, options).click();
        cy.get(`ul.selections input`, options).type(itemLabel);

        cy.get(`li[data-value="${selectedZUID}"]`).click();

        cy.get(`[data-cy="field:internal_link"] .Select`, options).contains(
          itemLabel,
          {
            matchCase: false,
          }
        );
      });

      it("Yes/No Field", function () {
        cy.get(`[data-cy="field:yes_no"] [data-cy="yes_no:yes"]`).click({
          force: true,
        });
        cy.get(`[data-cy="field:yes_no"] [data-cy="yes_no:yes"]`).should(
          "have.class",
          "Mui-selected"
        );
        cy.get(`[data-cy="field:yes_no"] [data-cy="yes_no:no"]`).click();
        cy.get(`[data-cy="field:yes_no"] [data-cy="yes_no:no"]`).should(
          "have.class",
          "Mui-selected"
        );
      });

      it("Yes/No Field: Does not allow user to deselect value", function () {
        cy.get(`[data-cy="field:yes_no"] [data-cy="yes_no:no"]`).click();
        cy.get(`[data-cy="field:yes_no"] [data-cy="yes_no:no"]`).should(
          "have.class",
          "Mui-selected"
        );

        cy.get(`[data-cy="field:yes_no"] [data-cy="yes_no:yes"]`).should(
          "not.have.class",
          "Mui-selected"
        );
        cy.get(`[data-cy="field:yes_no"] [data-cy="yes_no:no"]`).should(
          "have.class",
          "Mui-selected"
        );
      });

      it("Fontawesome Field", function () {
        cy.get(`[data-cy="field:fontawesome"] input`)
          .focus()
          .clear()
          .type(`fa fa-link`)
          .should("have.value", `fa fa-link`);
      });

      it("Number Field", function () {
        cy.get(`[data-cy="field:number"] input[type=text]`)
          .focus()
          /*
          input type='number 'cannot be empty so rather than whitespace, it'd have a value of 0
          to solve for this {selectall} is used to overwrite value as opposed to clear()
        */
          .type("{selectall}")
          .type("999")
          .should("have.value", "999");
      });

      it("Currency Field", function () {
        cy.get(`[data-cy="field:currency"] input`)
          .focus()
          .type("{selectall}")
          .type("100.00")
          .should("have.value", "100.00");
      });

      it("Color Field", function () {
        cy.get(`[data-cy="field:color"] input[type="color"]`).should("exist");
      });

      it("UUID Field", function () {
        // This is a unique value generated on item creation and should never change
        cy.get(`[data-cy="field:uuid"] input[readonly]`)
          .should("exist")
          .invoke("val")
          .should("not.be.empty");
      });
      it.skip("File Field", function () {
        cy.get("#12-178fe8-nf6mfn").should("exist");
      });

      it("Sort Field", function () {
        cy.get(`[data-cy="field:sort"] input[type='text']`)
          .clear()
          .type("{rightArrow}12");
        cy.get(`[data-cy="field:sort"] button`).eq(1).click();
        cy.get(`[data-cy="field:sort"] input[type='text']`).should(
          "have.value",
          "11"
        );
        cy.get(`[data-cy="field:sort"] button`).last().click();
        cy.get(`[data-cy="field:sort"] input[type='text']`).should(
          "have.value",
          "12"
        );
      });

      it("One to many Field", function () {
        cy.get(
          `[data-cy="field:one_to_many"] [data-cy="add-relational-item-button"]`,
          options
        )
          .should("be.enabled")
          .click();

        for (let index = 0; index < 4; index++) {
          cy.get(
            `[data-cy="selection:container"] [data-cy="selection:row"]:eq(${index}) input`,
            options
          ).check({
            force: true,
          });
        }

        cy.get('[data-cy="selected-count"]')
          .contains("4 selected", { matchCase: false })
          .should("exist");

        cy.get('[data-cy="done-selecting-item-button"]', options).click();
        cy.get(
          `[data-cy="field:one_to_many"] [data-cy="selection:container"]`,
          options
        )
          .children()
          .should("have.length", 4);
      });

      it("One to one Field", function () {
        cy.get(
          `[data-cy="field:one_to_one"] [data-cy="add-relational-item-button"]`,
          options
        )
          .should("be.enabled")
          .click();

        cy.get(
          `[data-cy="selection:container"] [data-cy="selection:row"]:eq(0) input`,
          options
        ).check({
          force: true,
        });

        cy.get('[data-cy="selected-count"]')
          .contains("1 selected", { matchCase: false })
          .should("exist");
        cy.get('[data-cy="done-selecting-item-button"]', options).click();
        cy.get(
          `[data-cy="field:one_to_one"] [data-cy="selection:container"]`,
          options
        )
          .children()
          .should("have.length", 1);
      });

      it("Saves Content updates", function () {
        cy.get("#SaveItemButton").click();
        cy.get("[data-cy=toast]").contains("Item Saved").should("exist");
      });
    });

    context("Media field", function () {
      before(function () {
        const data = {
          ...this.contentItem,
          data: {
            ...this.contentItem?.data,
            images: this?.mediaFiles?.map((media) => media.id).join(","),
          },
        };
        cy.setContentItemData(data);
        cy.visit(
          `/content/${Cypress.env("modelZUID")}/${Cypress.env("itemZUID")}`
        );
      });

      beforeEach(function () {
        cy.handleRetry(true, function () {
          const data = {
            ...this.contentItem,
            data: {
              ...this.contentItem?.data,
              images: this?.mediaFiles?.map((media) => media.id).join(","),
            },
          };
          cy.updateItem(
            Cypress.env("modelZUID"),
            Cypress.env("itemZUID"),
            data
          );
        });
      });

      it("renders an image with a url from a template", function () {
        cy.get(
          `[data-cy="field:images"] [data-cy="file-preview"]:eq(0) img`,
          options
        )
          .should("have.attr", "src")
          .and("contain", this?.mediaFiles?.[0]?.url);
      });

      it("opens the bynder modal", function () {
        cy.get(
          `[data-cy="field:images"] [data-cy="selectFromMediaButton"]`,
          options
        )
          .should("be.enabled")
          .click();
        cy.get('[data-cy="closeMediaDialogBtn"]', options).wait(500).click();

        cy.get(`[data-cy="field:images"] [data-cy="addFromBynderBtn"]`, options)
          .should("be.enabled")
          .trigger("click");

        cy.get('[data-test-id="CompactViewContainer"] [data-testid="root"]')
          .shadow()
          .as("shadow");

        cy.get("@shadow")
          .find('.card-list div [data-testid="asset-card"] button:eq(0)')
          .click();

        cy.get("@shadow").find('[data-testid="add-button"]').click();

        cy.get(
          `[data-cy="mediaItem-container"] [data-cy="mediaItem"]`,
          options
        ).should("have.length", 4);
      });

      it("renders bynder asset previews", function () {
        cy.get(
          '[data-cy="field:images"] [data-cy="mediaItem-container"] [data-cy="mediaItem"]'
        )
          .last()
          .find('[data-cy="bynderAssetIndicator"]')
          .should("exist");
      });
    });

    context("Date Field", function () {
      before(function () {
        cy.visit(
          `/content/${Cypress.env("modelZUID")}/${Cypress.env("itemZUID")}`
        );
      });
      beforeEach(function () {
        cy.handleRetry(true);
      });

      it("should be able to clear date entries", function () {
        cy.get(`[data-cy="field:date"]`, options)
          .find("[data-cy='dateFieldClearButton']")
          .click();

        cy.get(`[data-cy="field:date"]`)
          .find("[data-cy='datePickerInputField']")
          .find("input")
          .should("have.value", "");
      });

      it("should be able to auto-fill empty date fields on click", function () {
        cy.get(`[data-cy="field:date"]`)
          .find('[data-cy="datePickerInputField"]')
          .click();

        cy.get(`[data-cy="field:date"] input`).should(
          "have.value",
          moment(TIMESTAMP).format("MMM DD, YYYY")
        );
      });
    });

    context("Date & Time Field", function () {
      before(function () {
        cy.visit(
          `/content/${Cypress.env("modelZUID")}/${Cypress.env("itemZUID")}`
        );
      });

      beforeEach(function () {
        cy.handleRetry(true);
      });

      it("should be able to clear date and time entries", function () {
        cy.get(`[data-cy="field:datetime"]`, options)
          .find("[data-cy='dateFieldClearButton']")
          .click();
        cy.get(`[data-cy="field:datetime"]`)
          .find("[data-cy='datePickerInputField']")
          .find("input")
          .should("have.value", "");
        cy.get(`[data-cy="field:datetime"]`)
          .find("[data-cy='dateTimeInputField']")
          .find("input")
          .should("have.value", "");
      });

      it("should be able to auto-fill the date and time when field is empty", function () {
        cy.get(`[data-cy="field:datetime"]`)
          .find("[data-cy='dateTimeInputField']")
          .click();

        cy.get(`[data-cy="field:datetime"]`)
          .find("[data-cy='datePickerInputField']")
          .find("input")
          .should("have.value", moment(TIMESTAMP).format("MMM DD, YYYY"));

        cy.get(`[data-cy="field:datetime"]`)
          .find("[data-cy='dateTimeInputField']")
          .find("input")
          .should("have.value", "12:00 am");
      });

      it("should allow a user to select a time from the dropdown", function () {
        cy.get(`[data-cy="field:datetime"]`)
          .find("[data-cy='dateTimeInputField']")
          .click();
        cy.get(".MuiAutocomplete-listbox>.MuiAutocomplete-option")
          .eq(1)
          .click();

        cy.get(`[data-cy="field:datetime"]`)
          .find("[data-cy='dateTimeInputField']")
          .find("input")
          .should("have.value", "12:15 am");
      });

      it("should allow a user to manually type in a time", function () {
        cy.get(`[data-cy="field:datetime"]`)
          .find("[data-cy='dateTimeInputField']")
          .find("input")
          .type("{selectAll}{del}11:00 pm")
          .blur();

        cy.get(`[data-cy="field:datetime"]`)
          .find("[data-cy='dateTimeInputField']")
          .find("input")
          .should("have.value", "11:00 pm");
      });

      it("should reset to last saved valid time when user types in an invalid time", function () {
        cy.get(`[data-cy="field:datetime"]`)
          .find("[data-cy='dateTimeInputField']")
          .find("input")
          .type("{selectAll}{del}asdasdasdasdas")
          .blur();

        cy.get(`[data-cy="field:datetime"]`)
          .find("[data-cy='dateTimeInputField']")
          .find("input")
          .should("have.value", "12:00 pm");
      });
    });

    context("Block Selector Field", function () {
      before(function () {
        cy.visit(
          `/content/${Cypress.env("modelZUID")}/${Cypress.env("itemZUID")}`
        );
      });

      it("Sets a block variant", function () {
        cy.getBySelector("BlockSelectorModelField", options)
          .find("input")
          .click();
        cy.get(".MuiAutocomplete-popper .MuiAutocomplete-option")
          .contains("Test Block Do Not Delete")
          .click();

        cy.getBySelector("BlockSelectorVariantField", options).click();
        cy.getBySelector("Variant_0").click();
        cy.getBySelector("BlockFieldVariantPreview").should("exist");
      });
    });

    context("One to one field", function () {
      before(function () {
        resetFields(Cypress.env("modelZUID"), this?.contentItem);
        cy.visit(
          `/content/${Cypress.env("modelZUID")}/${Cypress.env("itemZUID")}`
        );
      });

      beforeEach(function () {
        cy.handleRetry(true, () =>
          resetFields(Cypress.env("modelZUID"), this?.contentItem)
        );
      });

      it("can only select/add one item", function () {
        cy.get(`[data-cy="field:one_to_one"]`, options).scrollIntoView();

        cy.get(
          `[data-cy="field:one_to_one"] [data-cy="add-relational-item-button"]`,
          options
        ).click();

        cy.get(".MuiDataGrid-row:eq(0) input", options).check(forced);
        cy.get(".MuiDataGrid-row:eq(1) input", options).check(forced);

        cy.get(".MuiDataGrid-row input:checked", options).should(
          "have.length",
          1
        );
        cy.get('[data-cy="done-selecting-item-button"]', options).click(forced);
      });

      it("can publish an item", function () {
        cy.get(
          `[data-cy="field:one_to_one"] [data-cy='active-relational-item-more-button']`
        ).click();
        cy.getBySelector("active-relational-item-publish-now-button").click();
        cy.getBySelector("ConfirmPublishModal").should("exist");
        cy.getBySelector("CancelPublishButton").click();
      });

      it("can schedule publish an item", function () {
        cy.get(
          `[data-cy="field:one_to_one"] [data-cy='active-relational-item-more-button']`
        ).click();
        cy.getBySelector(
          "active-relational-item-schedule-publish-button"
        ).click();
        cy.getBySelector("SchedulePublishModal").should("exist");
        cy.getBySelector("CancelSchedulePublishButton").click();
      });

      it("can remove the selected item", function () {
        cy.get(
          `[data-cy="field:one_to_one"] [data-cy='active-relational-item-more-button']`
        ).click();
        cy.getBySelector("active-relational-item-remove-item-button").click();
        cy.get(
          `[data-cy="field:one_to_one"] [data-cy="active-relational-item"]`
        ).should("not.exist");
      });
    });

    context("One to many field", function () {
      before(function () {
        resetFields(Cypress.env("modelZUID"), this?.contentItem);
        cy.visit(
          `/content/${Cypress.env("modelZUID")}/${Cypress.env("itemZUID")}`
        );
      });

      beforeEach(function () {
        cy.handleRetry(true, () => {
          resetFields(Cypress.env("modelZUID"), this?.contentItem);
        });
      });

      it("can add multiple items", function () {
        cy.get(`[data-cy="field:one_to_many"]`, options).scrollIntoView();
        cy.get(
          `[data-cy="field:one_to_many"] [data-cy="add-relational-item-button"]`,
          options
        )
          .should("be.enabled")
          .click();

        cy.get(
          `[data-cy="selection:container"] [data-cy="selection:row"]:eq(0) input`,
          options
        ).check({
          force: true,
        });

        cy.get(".MuiDataGrid-row:eq(0) input", options).check();
        cy.get(".MuiDataGrid-row:eq(1) input", options).check();
        cy.get(".MuiDataGrid-row:eq(2) input", options).check();
        cy.get('[data-cy="selected-count"]').contains("3 selected");
        cy.get('[data-cy="done-selecting-item-button"]').click(forced);

        cy.get(
          `[data-cy="field:one_to_many"] [data-cy='active-relational-item']`
        ).should("have.length", 3);
      });

      it("can remove the selected item", function () {
        cy.get(`[data-cy="field:one_to_many"]`, options).scrollIntoView();
        cy.get(
          `[data-cy="field:one_to_many"] [data-cy='add-relational-item-button']:eq(0)`,
          options
        )
          .should("be.enabled")
          .click(forced);

        cy.get(".MuiDataGrid-row:eq(0) input", options).check();
        cy.get(".MuiDataGrid-row:eq(1) input", options).check();
        cy.get(".MuiDataGrid-row:eq(2) input", options).check();

        cy.get('[data-cy="done-selecting-item-button"]').click(forced);

        cy.get(
          `[data-cy="field:one_to_many"] [data-cy='active-relational-item-more-button']:eq(0)`
        )
          .should("be.enabled")
          .click(forced);

        cy.getBySelector("active-relational-item-remove-item-button").click(
          forced
        );
        cy.get(
          `[data-cy="field:one_to_many"] [data-cy='active-relational-item']`
        ).should("have.length", 2);
      });

      it("can create & add new item", function () {
        cy.get(`[data-cy="field:one_to_many"]`, options).scrollIntoView();
        cy.get(
          `[data-cy="field:one_to_many"] [data-cy='create-new-relational-item-button']:eq(0)`
        )
          .should("be.enabled")
          .click(forced);

        cy.get(`[data-cy="field:text"] input`, options).type(
          `Test Item ${EXAMPLE_TEXT}`,
          forced
        );

        cy.get(`[data-cy="field:wysiwyg_basic"]`)
          .find("textarea")
          .first()
          .type(`Test Item ${EXAMPLE_TEXT}`, forced);
        cy.get(`[data-cy="CreateItemSaveButton"]`).click(forced);

        cy.get(
          `[data-cy="field:one_to_many"] [data-cy="active-relational-item"]`,
          options
        ).should("have.length", 2);
      });

      it("preserves selected items while filtering", function () {
        cy.get(
          `[data-cy="field:one_to_many"] [data-cy='add-relational-item-button']:eq(0)`,
          options
        )
          .should("be.enabled")
          .click(forced);

        cy.get(`[data-cy='relational-fields-search-input']`, options)
          .clear()
          .type("someveryrandomtextthatshouldnotmatchanything");
        cy.contains("2 selected").should("exist");
      });
    });
  }
);

function getMediaFiles() {
  return cy
    .apiRequest({
      url: `${API_ENDPOINTS.mediaManager}/bin/1-6c9618c-r26pt/files`,
    })
    .then((filesRes) => {
      const files = filesRes?.data;

      const mediaFiles = Array(3)
        .fill(0)
        .map((_, index) => files?.[index]);
      return mediaFiles;
    });
}

function resetFields(modelZUID, item) {
  const payLoad = Object.keys(FIELDS)?.reduce((acc, fieldKey) => {
    acc[fieldKey] = null;
    return acc;
  }, {});
  const data = {
    ...item,
    data: payLoad,
  };

  cy.updateItem(modelZUID, item?.meta?.ZUID, data);
}

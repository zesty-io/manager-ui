import moment from "moment";
import "cypress-iframe";
import { API_ENDPOINTS } from "../../support/api";

const options = { timeout: 40_000 };
const forced = { force: true };

const TIMESTAMP = Date.now();

const MODEL = {
  label: "All Field Types___CYPRESS",
  name: "all_field_types___cypress",
  type: "templateset",
};

const FIELDS = {
  text: {
    datatype: "text",
    name: "text",
    label: "text",
    sort: 1,
  },
  wysiwyg_basic: {
    datatype: "wysiwyg_basic",
    name: "wysiwyg_basic",
    label: "wysiwyg basic",
    sort: 2,
  },
  images: {
    datatype: "images",
    name: "images",
    label: "images",
    sort: 3,
    settings: {
      limit: "5",
    },
  },
  textarea: {
    datatype: "textarea",
    name: "textarea",
    label: "textarea",
    sort: 4,
  },
  date: {
    datatype: "date",
    name: "date",
    label: "date",
    sort: 5,
  },
  wysiwyg_advanced: {
    datatype: "wysiwyg_advanced",
    name: "wysiwyg_advanced",
    label: "wysiwyg advanced",
    sort: 6,
  },
  article_writer: {
    datatype: "article_writer",
    name: "article_writer",
    label: "article writer",
    sort: 7,
  },
  dropdown: {
    datatype: "dropdown",
    name: "dropdown",
    label: "dropdown",
    sort: 8,
    settings: {
      options: {
        custom_option_one: "Custom Option One",
        custom_option_two: "Custom Option Two",
      },
    },
  },
  link: {
    datatype: "link",
    name: "link",
    label: "link",
    sort: 9,
  },
  internal_link: {
    datatype: "internal_link",
    name: "internal_link",
    label: "internal link",
    sort: 10,
  },
  datetime: {
    datatype: "datetime",
    name: "datetime",
    label: "datetime",
    sort: 11,
  },
  yes_no: {
    datatype: "yes_no",
    name: "yes_no",
    label: "yes/no",
    sort: 12,
    settings: {
      options: {
        0: "No",
        1: "Yes",
      },
    },
  },
  yes_no_custom: {
    datatype: "yes_no",
    name: "yes_no_custom",
    label: "yes/no custom",
    sort: 13,
    settings: {
      options: {
        0: "Custom One",
        1: "Custom Two",
      },
    },
  },
  fontawesome: {
    datatype: "fontawesome",
    name: "fontawesome",
    label: "fontawesome",
    sort: 14,
  },
  number: {
    datatype: "number",
    name: "number",
    label: "number",
    sort: 15,
  },
  currency: {
    datatype: "currency",
    name: "currency",
    label: "currency",
    sort: 16,
  },
  color: {
    datatype: "color",
    name: "color",
    label: "color",
    sort: 17,
  },
  uuid: {
    datatype: "uuid",
    name: "uuid",
    label: "uuid",
    sort: 18,
  },
  files: {
    datatype: "files",
    name: "files",
    label: "files",
    sort: 19,
  },
  sort: {
    datatype: "sort",
    name: "sort",
    label: "sort",
    sort: 20,
  },
  markdown: {
    datatype: "markdown",
    name: "markdown",
    label: "markdown",
    sort: 21,
  },
  one_to_one: {
    datatype: "one_to_one",
    name: "one_to_one",
    label: "one to one",
    sort: 22,
  },
  one_to_many: {
    datatype: "one_to_many",
    name: "one_to_many",
    label: "one to many",
    sort: 23,
  },
  block_selector: {
    datatype: "block_selector",
    name: "block_selector",
    label: "block selector",
    sort: 24,
  },
};

const ITEMS = Array(5)
  .fill(0)
  .map((_, index) => ({
    web: {
      metaLinkText: `Test Item ${index}___CYPRESS`,
      metaTitle: `Test Item ${index}___CYPRESS`,
      pathPart: `test-item-${TIMESTAMP}-${index}___CYPRESS`,
    },
    data: {
      text: `Test Item ${index}___CYPRESS`,
    },
  }));

const EXAMPLE_TEXT = "example_text";

describe(
  "Content Specs",
  {
    retries: 1,
    defaultCommandTimeout: 30_000,
  },
  function () {
    before(function () {
      cy.getCookie(Cypress.env("COOKIE_NAME")).then((cookie) => {
        Cypress.env("token", cookie?.value);
      });
      deleteTestData();
      getMediaFiles().then((filesRes) => {
        cy.wrap(filesRes).as("mediaFiles");
      });

      createModel()
        .then(function (model) {
          Cypress.env("modelZUID", model.ZUID);
          cy.wrap(model).as("model");

          createFields(model.ZUID).then((fields) => {
            cy.wrap(fields).as("fields");
          });

          return cy.wrap(model?.ZUID);
        })
        .then((ZUID) => {
          createContentItems(ZUID).then((items) => {
            const item = items?.[0];
            const itemZUID = item?.meta?.ZUID;
            Cypress.env("itemZUID", itemZUID);
            cy.wrap(item).as("item");
            cy.wrap(itemZUID).as("itemZUID");
          });
        });
    });

    after(function () {
      deleteTestData();
    });

    context("editing content", function () {
      before(() => {
        cy.visit(
          `/content/${Cypress.env("modelZUID")}/${Cypress.env("itemZUID")}`
        );
      });
      it.only("Text Field", function () {
        cy.getBySelector("DuoModeToggle", options).click(forced);
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
        const itemLabel = String(this?.item?.web?.metaTitle || "");
        const selectedZUID = this.item.meta.ZUID;

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

      it("Yes/No Field: Custom Options", function () {
        cy.get(`[data-cy="field:yes_no_custom"] [data-cy="yes_no:yes"]`).click(
          forced
        );
        cy.get(`[data-cy="field:yes_no_custom"] [data-cy="yes_no:yes"]`).should(
          "have.class",
          "Mui-selected"
        );
        cy.get(`[data-cy="field:yes_no_custom"] [data-cy="yes_no:no"]`).click(
          forced
        );
        cy.get(`[data-cy="field:yes_no_custom"] [data-cy="yes_no:no"]`).should(
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
          ...this.item,
          data: {
            ...this.item?.data,
            images: this?.mediaFiles?.map((media) => media.id).join(","),
          },
        };
        cy.updateItem(Cypress.env("modelZUID"), Cypress.env("itemZUID"), data);
        cy.visit(
          `/content/${Cypress.env("modelZUID")}/${Cypress.env("itemZUID")}`
        );
      });

      beforeEach(function () {
        handleRetryWithRefresh(() => {
          const data = {
            ...this.item,
            data: {
              ...this.item?.data,
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
        cy.get(`[data-cy="field:images"] [data-cy="selectFromMediaButton"]`)
          .should("be.enabled")
          .click();
        cy.get('[data-cy="closeMediaDialogBtn"]').click();

        cy.get(`[data-cy="field:images"]`, options)
          .find('[data-cy="addFromBynderBtn"]')
          .should("be.enabled")
          .click();

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
        handleRetryWithRefresh();
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
        handleRetryWithRefresh();
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
        resetFields(Cypress.env("modelZUID"), this?.item);
        cy.visit(
          `/content/${Cypress.env("modelZUID")}/${Cypress.env("itemZUID")}`
        );
      });

      beforeEach(function () {
        handleRetryWithRefresh(() =>
          resetFields(Cypress.env("modelZUID"), this?.item)
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
        resetFields(Cypress.env("modelZUID"), this?.item);
        cy.visit(
          `/content/${Cypress.env("modelZUID")}/${Cypress.env("itemZUID")}`
        );
      });

      beforeEach(function () {
        handleRetryWithRefresh(() =>
          resetFields(Cypress.env("modelZUID"), this?.item)
        );
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
        // cy.getBySelector("CreateItemSaveButton").click(forced);

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

function handleRetryWithRefresh(action = null) {
  const isRetry = Cypress.currentRetry > 0;
  cy.location().then((loc) => {
    if (isRetry) {
      !!action && action();
      const location = Cypress.env("failedPath");
      cy.visit(location);
    } else {
      Cypress.env("failedPath", loc.pathname);
    }
  });
}

function deleteTestData() {
  cy.apiRequest({
    url: `${API_ENDPOINTS.devInstance}/content/models`,
  }).then((res) => {
    const ZUIDsForDelete = res?.data?.filter(
      (model) => model.name === MODEL.name
    );
    if (!!ZUIDsForDelete?.length) {
      cy.apiRequest({
        url: `${API_ENDPOINTS.devInstance}/content/models/${ZUIDsForDelete[0].ZUID}`,
        method: "DELETE",
      });
    }
  });
}

function createModel() {
  return cy
    .createModel({
      ...MODEL,
      description: "",
      listed: true,
    })
    .then((modelRes) => {
      return modelRes?.data;
    });
}

function createFields(modelZUID) {
  return cy
    .createField(modelZUID, {
      ...FIELDS.text,
      description: "",
      required: false,
      settings: {
        list: true,
        defaultValue: null,
      },
    })
    .then((textRes) => {
      const textFieldZUID = textRes?.data?.ZUID;

      const { text, ...otherFields } = FIELDS;

      const fieldPromises = Object.values(otherFields).map((field) => {
        return fetch(
          `${API_ENDPOINTS.devInstance}/content/models/${modelZUID}/fields`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${Cypress.env("token")}`,
            },
            body: JSON.stringify({
              ...field,
              description: "",
              required: false,
              settings: {
                ...field?.settings,
                list: true,
                defaultValue: null,
              },
              ...(["one_to_one", "one_to_many"].includes(field?.datatype)
                ? {
                    relatedModelZUID: modelZUID,
                    relatedFieldZUID: textFieldZUID,
                  }
                : {}),
            }),
          }
        ).then(async (res) => {
          const jsonRes = await res.json();
          Cypress.env(field?.name, jsonRes?.data?.ZUID);
          return { name: field?.name, ZUID: jsonRes?.data?.ZUID };
        });
      });
      return Promise.all(fieldPromises).then((fields) => {
        return [
          ...fields,
          {
            name: "text",
            ZUID: textFieldZUID,
          },
        ];
      });
    });
}

function createContentItems(modelZUID) {
  const payloadData = ITEMS?.map((item) => {
    const fieldsData = Object.keys(FIELDS)?.reduce((acc, fieldKey) => {
      acc[fieldKey] = null;
      return acc;
    }, {});

    return {
      ...item,

      data: {
        ...fieldsData,
        ...item?.data,
      },
    };
  });

  return cy.createItems(modelZUID, payloadData).then(() => {
    // return itemsRes?.data;
    return cy.getItems(modelZUID).then((itemsRes) => itemsRes?.data);
  });
}

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

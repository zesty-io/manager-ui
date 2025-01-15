import instanceZUID from "../../../src/utility/instanceZUID";
import CONFIG from "../../../src/shell/app.config";

const SELECTORS = {
  ADD_FIELD_BTN: "AddFieldBtn",
  ADD_FIELD_BTN_END_OF_LIST: "EndOfListAddFieldBtn",
  ADD_FIELD_BTN_IN_BETWEEN: "InBetweenFieldAddFieldBtn",
  ADD_FIELD_MODAL: "AddFieldModal",
  ADD_FIELD_MODAL_CLOSE: "AddFieldCloseBtn",
  SAVE_FIELD_BUTTON: "FieldFormAddFieldBtn",
  ADD_ANOTHER_FIELD_BTN: "FieldFormAddAnotherFieldBtn",
  BACK_TO_FIELD_SELECTION_BTN: "BackToFieldSelectionBtn",
  FIELD_SELECTION: "FieldSelection",
  FIELD_SELECTION_FILTER: "FieldSelectionFilter",
  FIELD_SELECTION_EMPTY: "FieldSelectionEmpty",
  FIELD_SELECT_TEXT: "FieldItem_text",
  FIELD_SELECT_DROPDOWN: "FieldItem_dropdown",
  FIELD_SELECT_NUMBER: "FieldItem_number",
  FIELD_SELECT_INTERNAL_LINK: "FieldItem_internal_link",
  FIELD_SELECT_MEDIA: "FieldItem_images",
  FIELD_SELECT_BOOLEAN: "FieldItem_yes_no",
  FIELD_SELECT_ONE_TO_ONE: "FieldItem_one_to_one",
  FIELD_SELECT_CURRENCY: "FieldItem_currency",
  FIELD_SELECT_BLOCK_SELECTOR: "FieldItem_block_selector",
  MEDIA_CHECKBOX_LIMIT: "MediaCheckbox_limit",
  MEDIA_CHECKBOX_LOCK: "MediaCheckbox_group_id",
  DROPDOWN_ADD_OPTION: "DropdownAddOption",
  DROPDOWN_DELETE_OPTION: "DeleteOption",
  AUTOCOMPLETE_MODEL_ZUID: "Autocomplete_relatedModelZUID",
  AUTOCOMPLETE_FIELED_ZUID: "Autocomplete_relatedFieldZUID",
  AUTOCOMPLETE_FIELD_CURRENCY: "Autocomplete_currency",
  INPUT_LABEL: "FieldFormInput_label",
  INPUT_NAME: "FieldFormInput_name",
  INPUT_OPTION_LABEL: "OptionLabel",
  ERROR_MESSAGE_OPTION_VALUE: "OptionValueErrorMsg",
  ERROR_MESSAGE_LABEL: "ErrorMsg_label",
  ERROR_MESSAGE_NAME: "ErrorMsg_name",
  DETAILS_TAB: "DetailsTab",
  DETAILS_TAB_BTN: "DetailsTabBtn",
  LEARN_TAB: "LearnTab",
  LEARN_TAB_BTN: "LearnTabBtn",
  RULES_TAB: "RulesTab",
  RULES_TAB_BTN: "RulesTabBtn",
  MEDIA_RULES_TAB: "MediaRulesTab",
  FIELDS_LIST_FILTER: "FieldListFilter",
  FIELDS_LIST_NO_RESULTS: "NoResults",
  FIELD_MENU_BTN: "OpenFieldDropdown",
  FIELD_DROPDOWN_EDIT: "DropdownEditField",
  FIELD_DROPDOWN_DEACTIVATE_REACTIVATE: "DeactivateReactivateFieldDropdown",
  ADD_FIELD_MODAL_DEACTIVATE_REACTIVATE: "DeactivateReactivateFieldUpdateModal",
  SHOW_SYSTEM_FIELDS_BTN: "ShowSystemFieldsBtn",
  SYSTEM_FIELDS: "SystemFields",
  DEFAULT_VALUE_CHECKBOX: "DefaultValueCheckbox",
  DEFAULT_VALUE_INPUT: "DefaultValueInput",
  CHARACTER_LIMIT_CHECKBOX: "CharacterLimitCheckbox",
  MIN_CHARACTER_LIMIT_INPUT: "MinCharacterLimitInput",
  MAX_CHARACTER_LIMIT_INPUT: "MaxCharacterLimitInput",
  MIN_CHARACTER_ERROR_MSG: "MinCharacterErrorMsg",
  MAX_CHARACTER_ERROR_MSG: "MaxCharacterErrorMsg",
};

const ENDPOINT = `${
  CONFIG[process.env.NODE_ENV]?.API_INSTANCE_PROTOCOL
}${instanceZUID}${CONFIG[process.env.NODE_ENV]?.API_INSTANCE}`;

const TIMEOUT = { timeout: 60_000 };

const TEST_DATA = {
  schema: {
    description: "Cypress Test - Fields Description",
    label: "Cypress Test - Fields",
    type: "templateset",
    name: "cypress_test___fields",
    listed: true,
  },
  testGroupFields: {
    description: "Cypress Field Test - Group with visible fields in list",
    label: "Cypress Field Test - Group with visible fields in list",
    listed: true,
    name: "cypress_field_test___group_with_visible_fields_in_list",
    parentZUID: "7-b939a4-457q19",
    type: "pageset",
  },
};

const FIELD_DATA = [
  {
    contentModelZUID: "",
    datatype: "wysiwyg_basic",
    description: "",
    label: "wysiwyg basic",
    name: "wysiwyg_basic",
    required: false,
    settings: { list: true, defaultValue: null },
    defaultValue: null,
    list: true,
    sort: 0,
  },
  {
    contentModelZUID: "",
    datatype: "text",
    description: "",
    label: "title",
    name: "title",
    required: false,
    settings: { list: true, defaultValue: null },
    defaultValue: null,
    list: true,
    sort: 1,
  },
  {
    contentModelZUID: "",
    datatype: "one_to_one",
    description: "",
    label: "test related field filtering",
    name: "test_related_field_filtering",
    relatedFieldZUID: "12-ead9f091fe-74n0c5",
    relatedModelZUID: "6-ce3ba0-lps847",
    required: false,
    settings: { list: true, defaultValue: null },
    sort: 2,
  },
  {
    contentModelZUID: "",
    datatype: "dropdown",
    description: "",
    label: "dropdown1",
    name: "dropdown1",
    required: false,
    settings: { list: true, defaultValue: null, options: { "": "" } },
    sort: 3,
  },
];

/**
 * Schema Fields E2E tests
 */
describe("Schema: Fields", () => {
  const suffix = "field";

  before(() => {
    cy.apiRequest({ url: `${ENDPOINT}/content/models` }).then((resData) => {
      const schemaModels = resData?.data?.filter((item) =>
        [TEST_DATA?.schema?.label, TEST_DATA?.testGroupFields?.label]?.includes(
          item?.label
        )
      );
      if (!!schemaModels?.length) {
        cy.deleteContentModels([
          TEST_DATA?.schema?.label,
          TEST_DATA?.testGroupFields?.label,
        ]);
      }
      cy.createContentModel(TEST_DATA?.schema);

      cy.createContentModel(TEST_DATA?.testGroupFields).then((res) => {
        const modelZUID = res?.data?.ZUID;
        const fieldList = FIELD_DATA?.map((field) => {
          return {
            ...field,
            contentModelZUID: modelZUID,
          };
        });

        fieldList.forEach((field) => {
          cy.apiRequest({
            method: "POST",
            url: `${ENDPOINT}/content/models/${modelZUID}/fields`,
            body: field,
          });
        });
      });
    });
  });

  after(() => {
    cy.deleteContentModels([
      TEST_DATA?.schema?.label,
      TEST_DATA?.testGroupFields?.label,
    ]);
  });

  // beforeEach(() => {
  //   openSchemaModel(TEST_DATA?.schema?.label);
  // });

  it("Opens Add Field Modal via button click", () => {
    openSchemaModel(TEST_DATA?.schema?.label);
    // Open the modal
    cy.getBySelector(SELECTORS.ADD_FIELD_BTN).click(TIMEOUT);
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("exist");

    // Close the modal
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL_CLOSE).click();
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("not.exist");
  });

  it("Creates a Single Line Text field", () => {
    const fieldLabel = `Text ${suffix}`;
    const fieldName = `text_${suffix}`;

    // Open the add field modal
    cy.getBySelector(SELECTORS.ADD_FIELD_BTN).click(TIMEOUT);
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("exist");

    // Select Text field
    cy.getBySelector(SELECTORS.FIELD_SELECT_TEXT).click();

    // Fill up fields
    cy.getBySelector(SELECTORS.INPUT_LABEL).clear().type(fieldLabel);
    cy.get("input[name='label']").should("have.value", fieldLabel);
    cy.get("input[name='name']").should("have.value", fieldName);

    // Navigate to rules tab and add default value
    cy.getBySelector(SELECTORS.RULES_TAB_BTN).click();
    // click on the default value checkbox
    cy.getBySelector(SELECTORS.DEFAULT_VALUE_CHECKBOX).click();
    // enter a default value
    cy.getBySelector(SELECTORS.DEFAULT_VALUE_INPUT).type("default value");
    // verify that the default value is set
    cy.getBySelector(SELECTORS.DEFAULT_VALUE_INPUT)
      .find("input")
      .should("have.value", "default value");

    // Set min/max character limits
    cy.getBySelector(SELECTORS.CHARACTER_LIMIT_CHECKBOX).click();
    cy.getBySelector(SELECTORS.MAX_CHARACTER_LIMIT_INPUT).clear().type("10000");
    cy.getBySelector(SELECTORS.MAX_CHARACTER_ERROR_MSG).should("exist");
    cy.getBySelector(SELECTORS.MAX_CHARACTER_LIMIT_INPUT).clear().type("20");
    cy.getBySelector(SELECTORS.MAX_CHARACTER_ERROR_MSG).should("not.exist");
    cy.getBySelector(SELECTORS.MIN_CHARACTER_LIMIT_INPUT).clear().type("10000");
    cy.getBySelector(SELECTORS.MIN_CHARACTER_ERROR_MSG).should("exist");
    cy.getBySelector(SELECTORS.MIN_CHARACTER_LIMIT_INPUT).clear().type("5");
    cy.getBySelector(SELECTORS.MIN_CHARACTER_ERROR_MSG).should("not.exist");

    // Click done
    cy.getBySelector(SELECTORS.SAVE_FIELD_BUTTON).click();
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("not.exist");

    // Check if field exists
    cy.getBySelector(`Field_${fieldName}`).should("exist");
  });

  it("Creates a Dropdown field", () => {
    const fieldLabel = `Dropdown ${suffix}`;
    const fieldName = `dropdown_${suffix}`;

    // Open the add field modal
    cy.getBySelector(SELECTORS.ADD_FIELD_BTN).click(TIMEOUT);
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("exist");

    // Select Dropdown field
    cy.getBySelector(SELECTORS.FIELD_SELECT_DROPDOWN).click(TIMEOUT);

    // Input field label and duplicate dropdown options
    cy.getBySelector(SELECTORS.INPUT_LABEL).clear().type(fieldLabel);
    cy.getBySelector(`${SELECTORS.INPUT_OPTION_LABEL}_0`).type("test");
    cy.getBySelector(SELECTORS.DROPDOWN_ADD_OPTION).click();
    cy.getBySelector(`${SELECTORS.INPUT_OPTION_LABEL}_1`).type("test");

    // Verify that duplicate dropdown values causes an error
    cy.getBySelector(SELECTORS.SAVE_FIELD_BUTTON).click();
    cy.getBySelector(`${SELECTORS.ERROR_MESSAGE_OPTION_VALUE}_1`).should(
      "exist"
    );

    // Delete duplicate option
    cy.getBySelector(`${SELECTORS.DROPDOWN_DELETE_OPTION}_1`).click();

    // Navigate to rules tab and add default value
    cy.getBySelector(SELECTORS.RULES_TAB_BTN).click();
    // click on the default value checkbox
    cy.getBySelector(SELECTORS.DEFAULT_VALUE_CHECKBOX).click();
    // Open select menu
    cy.getBySelector(SELECTORS.DEFAULT_VALUE_INPUT).click();
    // Select the option
    cy.get("[role=listbox] [role=option]").last().click();
    // verify that the default value is set
    cy.getBySelector(SELECTORS.DEFAULT_VALUE_INPUT)
      .find("input")
      .should("have.value", "test");

    // Click done
    cy.getBySelector(SELECTORS.SAVE_FIELD_BUTTON).click();
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("not.exist");

    // Check if field exists
    cy.getBySelector(`Field_${fieldName}`).should("exist");
  });

  it("Creates a Media field", () => {
    const fieldLabel = `Media ${suffix}`;
    const fieldName = `media_${suffix}`;

    // Open the add field modal
    cy.getBySelector(SELECTORS.ADD_FIELD_BTN).click(TIMEOUT);
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("exist");

    // Select Media field
    cy.getBySelector(SELECTORS.FIELD_SELECT_MEDIA).click(TIMEOUT);

    // Input field label
    cy.getBySelector(SELECTORS.INPUT_LABEL).clear().type(fieldLabel);

    // Navigate to rules tab and enable media limit and folder lock
    cy.getBySelector(SELECTORS.RULES_TAB_BTN).click();
    cy.getBySelector(SELECTORS.MEDIA_RULES_TAB).click();
    cy.getBySelector(SELECTORS.MEDIA_CHECKBOX_LIMIT).click();
    cy.getBySelector(SELECTORS.MEDIA_CHECKBOX_LOCK).click();

    // Click done
    cy.getBySelector(SELECTORS.SAVE_FIELD_BUTTON).click();
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("not.exist");

    // Check if field exists
    cy.getBySelector(`Field_${fieldName}`).should("exist");
  });

  it("Creates a Boolean field", () => {
    const fieldLabel = `Boolean ${suffix}`;
    const fieldName = `boolean_${suffix}`;

    // Open the add field modal
    cy.getBySelector(SELECTORS.ADD_FIELD_BTN).click(TIMEOUT);
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("exist");

    // Select Boolean field
    cy.getBySelector(SELECTORS.FIELD_SELECT_BOOLEAN).click(TIMEOUT);

    // Input field label and option labels
    cy.getBySelector(SELECTORS.INPUT_LABEL).clear().type(fieldLabel);
    cy.getBySelector(`${SELECTORS.INPUT_OPTION_LABEL}_0`).type("Test option 1");
    cy.getBySelector(`${SELECTORS.INPUT_OPTION_LABEL}_1`).type("Test option 2");

    // Verify that delete option button does not exist
    cy.getBySelector(`${SELECTORS.DROPDOWN_DELETE_OPTION}_0`).should(
      "not.exist"
    );

    // Navigate to rules tab and add default value
    cy.getBySelector(SELECTORS.RULES_TAB_BTN).click();
    // click on the default value checkbox
    cy.getBySelector(SELECTORS.DEFAULT_VALUE_CHECKBOX).click();
    // enter a default value
    cy.getBySelector(SELECTORS.DEFAULT_VALUE_INPUT)
      .find("button")
      .first()
      .click();
    // verify that the default value is set by aria-pressed attribute
    cy.getBySelector(SELECTORS.DEFAULT_VALUE_INPUT)
      .find("button")
      .first()
      .should("have.attr", "aria-pressed", "true");

    // Click done
    cy.getBySelector(SELECTORS.SAVE_FIELD_BUTTON).click();
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("not.exist");

    // Check if field exists
    cy.getBySelector(`Field_${fieldName}`).should("exist");
  });

  it("Creates a One-to-one relationship field", () => {
    const fieldLabel = `One to One ${suffix}`;
    const fieldName = `one_to_one_${suffix}`;

    // Open the add field modal
    cy.getBySelector(SELECTORS.ADD_FIELD_BTN).click(TIMEOUT);
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("exist");

    // Select one-to-one relationship field
    cy.getBySelector(SELECTORS.FIELD_SELECT_ONE_TO_ONE).click();

    // Fill up fields
    cy.getBySelector(SELECTORS.INPUT_LABEL).clear().type(fieldLabel);

    // Select a related model
    cy.getBySelector(SELECTORS.AUTOCOMPLETE_MODEL_ZUID).type(
      TEST_DATA?.testGroupFields?.label
    );
    cy.get("[role=listbox] [role=option]").first().click();

    // Select a related field
    cy.getBySelector(SELECTORS.AUTOCOMPLETE_FIELED_ZUID).click(TIMEOUT);
    cy.get("[role=listbox] [role=option]").first().click(TIMEOUT);

    // Navigate to rules tab and add default value
    cy.getBySelector(SELECTORS.RULES_TAB_BTN).click();
    // click on the default value checkbox
    cy.getBySelector(SELECTORS.DEFAULT_VALUE_CHECKBOX).click();
    // enter a default value
    cy.getBySelector(SELECTORS.DEFAULT_VALUE_INPUT).click();
    // Select the option
    cy.get("[role=listbox] [role=option]").first().click(TIMEOUT);
    // verify that the default value is set
    cy.getBySelector(SELECTORS.DEFAULT_VALUE_INPUT)
      .find("input")
      .should("have.value", "- None -");
    cy.getBySelector(SELECTORS.DEFAULT_VALUE_CHECKBOX).click();

    // Click done
    cy.getBySelector(SELECTORS.SAVE_FIELD_BUTTON).click();
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("not.exist");

    // Check if field exists
    cy.getBySelector(`Field_${fieldName}`).should("exist");
  });

  it("Creates a currency field", () => {
    const fieldLabel = `Currency ${suffix}`;
    const fieldName = `currency_${suffix}`;

    // Open the add field modal
    cy.getBySelector(SELECTORS.ADD_FIELD_BTN).click(TIMEOUT);
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("exist");

    // Select one-to-one relationship field
    cy.getBySelector(SELECTORS.FIELD_SELECT_CURRENCY).click(TIMEOUT);

    // Select default currency
    cy.getBySelector(SELECTORS.AUTOCOMPLETE_FIELD_CURRENCY).type("philippine");
    cy.get("[role=listbox] [role=option]").first().click(TIMEOUT);

    // Fill up fields
    cy.getBySelector(SELECTORS.INPUT_LABEL).clear().type(fieldLabel);

    // Navigate to rules tab and add default value
    cy.getBySelector(SELECTORS.RULES_TAB_BTN).click();
    // click on the default value checkbox
    cy.getBySelector(SELECTORS.DEFAULT_VALUE_CHECKBOX).click();
    // enter a default value
    cy.getBySelector(SELECTORS.DEFAULT_VALUE_INPUT).type("1000.50");
    // Verify default currency
    cy.getBySelector(SELECTORS.DEFAULT_VALUE_INPUT).contains("PHP");
    // Click done
    cy.getBySelector(SELECTORS.SAVE_FIELD_BUTTON).click();
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("not.exist");

    // Check if field exists
    cy.getBySelector(`Field_${fieldName}`).should("exist");
  });

  it.skip("Creates a Block field", () => {
    // cy.intercept("**/fields?showDeleted=true").as("getFields");

    const fieldLabel = `Block Selector ${suffix}`;
    const fieldName = `block_selector_${suffix}`;

    // Open the add field modal
    cy.getBySelector(SELECTORS.ADD_FIELD_BTN).click(TIMEOUT);
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("exist");

    // Select one-to-one relationship field
    cy.getBySelector(SELECTORS.FIELD_SELECT_BLOCK_SELECTOR).click(TIMEOUT);

    // Fill up fields
    cy.getBySelector(SELECTORS.INPUT_LABEL).type(fieldLabel);
    cy.get("input[name='label']").should("exist").and("have.value", fieldLabel);
    cy.get("input[name='name']").should("exist").and("have.value", fieldName);

    // Click done
    cy.getBySelector(SELECTORS.SAVE_FIELD_BUTTON).click();
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("not.exist");

    // cy.wait("@getFields");

    // Check if field exists
    cy.getBySelector(`Field_${fieldName}`).should("exist");
  });

  it("Creates a field via add another field button", () => {
    const values = {
      number: {
        label: `Number ${suffix}`,
        name: `number_${suffix}`,
      },
      internal_link: {
        label: `Internal Link ${suffix}`,
        name: `internal_link_${suffix}`,
      },
    };

    // Open the add field modal
    cy.getBySelector(SELECTORS.ADD_FIELD_BTN).click(TIMEOUT);
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("exist");

    // Select number field
    cy.getBySelector(SELECTORS.FIELD_SELECT_NUMBER).click();

    // Fill up fields
    cy.getBySelector(SELECTORS.INPUT_LABEL).type(values.number.label);

    // Click add another field button
    cy.getBySelector(SELECTORS.ADD_ANOTHER_FIELD_BTN).click();

    // Select internal link field
    cy.getBySelector(SELECTORS.FIELD_SELECTION).should("exist");
    cy.getBySelector(SELECTORS.FIELD_SELECT_INTERNAL_LINK).click();

    // Fill up fields
    cy.getBySelector(SELECTORS.INPUT_LABEL).type(values.internal_link.label);

    // Click done
    cy.getBySelector(SELECTORS.SAVE_FIELD_BUTTON).click();
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("not.exist");

    // Verify that fields were created
    cy.getBySelector(`Field_${values.number.name}`);
    cy.getBySelector(`Field_${values.internal_link.name}`);
  });

  it("Shows error messages during field creation", () => {
    // Open the add field modal
    cy.getBySelector(SELECTORS.ADD_FIELD_BTN).click(TIMEOUT);
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("exist");

    // Select Text field
    cy.getBySelector(SELECTORS.FIELD_SELECT_TEXT).click();

    // Click done
    cy.getBySelector(SELECTORS.SAVE_FIELD_BUTTON).click();

    // Verify that error messages are shown
    cy.getBySelector(SELECTORS.ERROR_MESSAGE_LABEL).should("exist");
    cy.getBySelector(SELECTORS.ERROR_MESSAGE_NAME).should("exist");

    // Close the modal
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL_CLOSE).click();
  });

  it("Opens Add Field Modal via end of list button", () => {
    // Click end of list button
    cy.getBySelector(SELECTORS.ADD_FIELD_BTN_END_OF_LIST).click(TIMEOUT);

    // Verify modal
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("exist");

    // Close the modal
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL_CLOSE).click();
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("not.exist");
  });

  it("Opens Add Field Modal via in between field button", () => {
    // Click in-between field button
    cy.getBySelector(SELECTORS.ADD_FIELD_BTN_IN_BETWEEN).first().click(TIMEOUT);

    // Verify modal
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("exist");

    // Close the modal
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL_CLOSE).click();
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("not.exist");
  });

  it("Switches tabs in Add Field Modal", () => {
    // Open the modal
    cy.getBySelector(SELECTORS.ADD_FIELD_BTN).click(TIMEOUT);
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("exist");

    // Select single text field
    cy.getBySelector(SELECTORS.FIELD_SELECT_TEXT).click();

    // Verify that details tab is loaded
    cy.getBySelector(SELECTORS.DETAILS_TAB).should("exist");

    // Click Learn tab
    cy.getBySelector(SELECTORS.LEARN_TAB_BTN).click();
    cy.getBySelector(SELECTORS.LEARN_TAB).should("exist");

    // Click Rules tab
    cy.getBySelector(SELECTORS.RULES_TAB_BTN).click();

    // Close the modal
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL_CLOSE).click();
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("not.exist");
  });

  it("Can navigate back to fields selection view", () => {
    // Open the modal
    cy.getBySelector(SELECTORS.ADD_FIELD_BTN).click(TIMEOUT);
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("exist");

    // Select single text field
    cy.getBySelector(SELECTORS.FIELD_SELECT_TEXT).click();

    // Click the back button
    cy.getBySelector(SELECTORS.BACK_TO_FIELD_SELECTION_BTN).click();

    // Verify that field selection screen is loaded
    cy.getBySelector(SELECTORS.FIELD_SELECTION).should("exist");

    // Close the modal
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL_CLOSE).click();
  });

  it("Can filter fields in field selection view", () => {
    // Open the modal
    cy.getBySelector(SELECTORS.ADD_FIELD_BTN).click(TIMEOUT);
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("exist");

    // Verify that field selection screen is loaded
    cy.getBySelector(SELECTORS.FIELD_SELECTION).should("exist");

    // Filter results
    cy.getBySelector(SELECTORS.FIELD_SELECTION_FILTER).as("fieldFilter");
    cy.get("@fieldFilter").type("dropdown");

    // Verify
    cy.getBySelector(SELECTORS.FIELD_SELECT_DROPDOWN).should("exist");

    // Enter random string
    cy.get("@fieldFilter").type("asdasdasdasd");

    // Show no results
    cy.getBySelector(SELECTORS.FIELD_SELECTION_EMPTY).should("exist");

    // Close the modal
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL_CLOSE).click();
  });

  it("Can filter fields in fields list", () => {
    const fieldLabel = `Field to filter ${suffix}`;
    const fieldName = `field_to_filter_${suffix}`;

    // Open the add field modal
    cy.getBySelector(SELECTORS.ADD_FIELD_BTN).click(TIMEOUT);
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("exist");

    // Select a field
    cy.getBySelector(SELECTORS.FIELD_SELECT_NUMBER).click();

    // Fill up fields
    cy.getBySelector(SELECTORS.INPUT_LABEL).clear().type(fieldLabel);
    cy.get("input[name='label']", TIMEOUT).should("have.value", fieldLabel);
    cy.get("input[name='name']", TIMEOUT).should("have.value", fieldName);

    // Click done
    cy.getBySelector(SELECTORS.SAVE_FIELD_BUTTON).click();
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("not.exist");

    cy.getBySelector(SELECTORS.FIELDS_LIST_FILTER).as("fieldListFilter");

    // Filter fields
    cy.get("@fieldListFilter").type("field to filter");

    // Check if field exists
    cy.getBySelector(`Field_${fieldName}`).should("exist");

    // Enter a random filter keyword
    cy.get("@fieldListFilter").type("askljfkljfklsdjf");

    // Field should not exist
    cy.getBySelector(`Field_${fieldName}`).should("not.exist");
    cy.getBySelector(SELECTORS.FIELDS_LIST_NO_RESULTS).should("exist");

    // Clear filter keyword
    cy.get("@fieldListFilter").type("{selectall} {backspace}");
  });

  it("Can update a field", () => {
    const origFieldLabel = `Update me ${suffix}`;
    const updatedFieldLabel = `Rename field ${suffix}`;
    const fieldName = `update_me_${suffix}`;

    // Open the add field modal
    cy.getBySelector(SELECTORS.ADD_FIELD_BTN).click(TIMEOUT);
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("exist");

    // Select Text field
    cy.getBySelector(SELECTORS.FIELD_SELECT_TEXT).click();

    // Fill up fields
    cy.getBySelector(SELECTORS.INPUT_LABEL).type(origFieldLabel);

    // Click done
    cy.getBySelector(SELECTORS.SAVE_FIELD_BUTTON).click();
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("not.exist");

    // Check if field exists
    cy.getBySelector(`Field_${fieldName}`).should("exist");

    // Open update modal
    cy.getBySelector(`${SELECTORS.FIELD_MENU_BTN}_${fieldName}`).click();
    cy.getBySelector(`${SELECTORS.FIELD_DROPDOWN_EDIT}_${fieldName}`).click();
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("exist");

    // Update field label
    cy.getBySelector(SELECTORS.INPUT_LABEL).clear();
    cy.getBySelector(SELECTORS.INPUT_LABEL).type(updatedFieldLabel);

    // Save changes
    cy.getBySelector(SELECTORS.SAVE_FIELD_BUTTON).click();
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("not.exist");

    // Verify field name
    cy.getBySelector(`FieldLabel_${fieldName}`).should(
      "contain",
      updatedFieldLabel
    );
  });

  it("Can deactivate & reactivate a field via dropdown menu", () => {
    const fieldLabel = `Deactivate me ${suffix}`;
    const fieldName = `deactivate_me_${suffix}`;

    // Open the add field modal
    cy.getBySelector(SELECTORS.ADD_FIELD_BTN).click(TIMEOUT);
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("exist");

    // Select Text field
    cy.getBySelector(SELECTORS.FIELD_SELECT_TEXT).click();

    // Fill up fields
    cy.getBySelector(SELECTORS.INPUT_LABEL).clear().type(fieldLabel);

    // Click done
    cy.getBySelector(SELECTORS.SAVE_FIELD_BUTTON).click();
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("not.exist");

    // Check if field exists
    cy.getBySelector(`Field_${fieldName}`).should("exist");

    // Deactivate the field
    cy.getBySelector(`${SELECTORS.FIELD_MENU_BTN}_${fieldName}`).click();
    cy.getBySelector(
      `${SELECTORS.FIELD_DROPDOWN_DEACTIVATE_REACTIVATE}_${fieldName}`
    ).click();

    // Verify field is deactivated
    cy.get(`[data-cy-status=Field_${fieldName}_inactive]`, TIMEOUT).should(
      "exist"
    );

    // Reactivate the field
    cy.getBySelector(`${SELECTORS.FIELD_MENU_BTN}_${fieldName}`).click(TIMEOUT);
    cy.getBySelector(
      `${SELECTORS.FIELD_DROPDOWN_DEACTIVATE_REACTIVATE}_${fieldName}`
    ).click(TIMEOUT);

    // Verify field is deactivated
    cy.get(`[data-cy-status=Field_${fieldName}_active]`, TIMEOUT).should(
      "exist"
    );
  });

  it("Can deactivate a field via edit modal", () => {
    const fieldLabel = `Deactivate me via modal ${suffix}`;
    const fieldName = `deactivate_me_via_modal_${suffix}`;

    // Open the add field modal
    cy.getBySelector(SELECTORS.ADD_FIELD_BTN).click(TIMEOUT);
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("exist");

    // Select Text field
    cy.getBySelector(SELECTORS.FIELD_SELECT_TEXT).click();

    // Fill up fields
    cy.getBySelector(SELECTORS.INPUT_LABEL).clear().type(fieldLabel);

    // Click done
    cy.getBySelector(SELECTORS.SAVE_FIELD_BUTTON).click();
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("not.exist");

    // Check if field exists
    cy.getBySelector(`Field_${fieldName}`).should("exist");

    // Open update modal
    cy.getBySelector(`${SELECTORS.FIELD_MENU_BTN}_${fieldName}`).click(TIMEOUT);
    cy.getBySelector(`${SELECTORS.FIELD_DROPDOWN_EDIT}_${fieldName}`).click(
      TIMEOUT
    );
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("exist");

    // Deactivate the field
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL_DEACTIVATE_REACTIVATE).click(
      TIMEOUT
    );
    cy.getBySelector(SELECTORS.SAVE_FIELD_BUTTON).click();

    // Verify field is deactivated
    cy.get(`[data-cy-status=Field_${fieldName}_inactive]`, TIMEOUT).should(
      "exist"
    );
  });

  it("Shows and hides system fields", () => {
    // Show system fields
    cy.getBySelector(SELECTORS.SHOW_SYSTEM_FIELDS_BTN).click(TIMEOUT);
    cy.getBySelector(SELECTORS.SYSTEM_FIELDS).should("exist");

    // Hide system fields
    cy.getBySelector(SELECTORS.SHOW_SYSTEM_FIELDS_BTN).click();
    cy.getBySelector(SELECTORS.SYSTEM_FIELDS).should("not.exist");
  });
});

function openSchemaModel(label) {
  cy.visit("/schema");
  cy.get('[data-cy="schema-nav-templateset"] li', TIMEOUT)
    .contains(TEST_DATA?.schema?.label)
    .scrollIntoView()
    .click(TIMEOUT);
}

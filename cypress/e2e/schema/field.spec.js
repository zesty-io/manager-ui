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
  MEDIA_CHECKBOX_LIMIT: "MediaCheckbox_limit",
  MEDIA_CHECKBOX_LOCK: "MediaCheckbox_group_id",
  DROPDOWN_ADD_OPTION: "DropdownAddOption",
  DROPDOWN_DELETE_OPTION: "DeleteOption",
  AUTOCOMPLETE_MODEL_ZUID: "Autocomplete_relatedModelZUID",
  AUTOCOMPLETE_FIELED_ZUID: "Autocomplete_relatedFieldZUID",
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

/**
 * Schema Fields E2E tests
 */
describe("Schema: Fields", () => {
  const timestamp = Date.now();

  before(() => {
    cy.waitOn(
      "/v1/content/models/6-ce80dbfe90-ptjpm6/fields?showDeleted=true",
      () => {
        cy.waitOn("/bin/1-6c9618c-r26pt/groups", () => {
          cy.waitOn("/v1/content/models", () => {
            cy.visit("/schema/6-ce80dbfe90-ptjpm6/fields");
          });
        });
      }
    );
  });

  it("Opens Add Field Modal via button click", () => {
    // Open the modal
    cy.getBySelector(SELECTORS.ADD_FIELD_BTN).should("exist").click();
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("exist");

    // Close the modal
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL_CLOSE).should("exist").click();
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("not.exist");
  });

  it("Creates a Single Line Text field", () => {
    cy.intercept("**/fields?showDeleted=true").as("getFields");

    const fieldLabel = `Text ${timestamp}`;
    const fieldName = `text_${timestamp}`;

    // Open the add field modal
    cy.getBySelector(SELECTORS.ADD_FIELD_BTN).should("exist").click();
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("exist");

    // Select Text field
    cy.getBySelector(SELECTORS.FIELD_SELECT_TEXT).should("exist").click();

    // Fill up fields
    cy.getBySelector(SELECTORS.INPUT_LABEL).should("exist").type(fieldLabel);
    cy.get("input[name='label']")
      .should("exist")
      .should("have.value", fieldLabel);
    cy.get("input[name='name']")
      .should("exist")
      .should("have.value", fieldName);

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
    cy.getBySelector(SELECTORS.SAVE_FIELD_BUTTON).should("exist").click();
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("not.exist");

    cy.wait("@getFields");

    // Check if field exists
    cy.getBySelector(`Field_${fieldName}`).should("exist");
  });

  it("Creates a Dropdown field", () => {
    cy.intercept("**/fields?showDeleted=true").as("getFields");

    const fieldLabel = `Dropdown ${timestamp}`;
    const fieldName = `dropdown_${timestamp}`;

    // Open the add field modal
    cy.getBySelector(SELECTORS.ADD_FIELD_BTN).should("exist").click();
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("exist");

    // Select Dropdown field
    cy.getBySelector(SELECTORS.FIELD_SELECT_DROPDOWN).should("exist").click();

    // Input field label and duplicate dropdown options
    cy.getBySelector(SELECTORS.INPUT_LABEL).should("exist").type(fieldLabel);
    cy.getBySelector(`${SELECTORS.INPUT_OPTION_LABEL}_0`)
      .should("exist")
      .type("test");
    cy.getBySelector(SELECTORS.DROPDOWN_ADD_OPTION).should("exist").click();
    cy.getBySelector(`${SELECTORS.INPUT_OPTION_LABEL}_1`)
      .should("exist")
      .type("test");

    // Verify that duplicate dropdown values causes an error
    cy.getBySelector(SELECTORS.SAVE_FIELD_BUTTON).should("exist").click();
    cy.getBySelector(`${SELECTORS.ERROR_MESSAGE_OPTION_VALUE}_1`).should(
      "exist"
    );

    // Delete duplicate option
    cy.getBySelector(`${SELECTORS.DROPDOWN_DELETE_OPTION}_1`)
      .should("exist")
      .click();

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
    cy.getBySelector(SELECTORS.SAVE_FIELD_BUTTON).should("exist").click();
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("not.exist");

    cy.wait("@getFields");

    // Check if field exists
    cy.getBySelector(`Field_${fieldName}`).should("exist");
  });

  it("Creates a Media field", () => {
    cy.intercept("**/fields?showDeleted=true").as("getFields");

    const fieldLabel = `Media ${timestamp}`;
    const fieldName = `media_${timestamp}`;

    // Open the add field modal
    cy.getBySelector(SELECTORS.ADD_FIELD_BTN).should("exist").click();
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("exist");

    // Select Media field
    cy.getBySelector(SELECTORS.FIELD_SELECT_MEDIA).should("exist").click();

    // Input field label
    cy.getBySelector(SELECTORS.INPUT_LABEL).should("exist").type(fieldLabel);

    // Navigate to rules tab and enable media limit and folder lock
    cy.getBySelector(SELECTORS.RULES_TAB_BTN).should("exist").click();
    cy.getBySelector(SELECTORS.MEDIA_RULES_TAB).should("exist").click();
    cy.getBySelector(SELECTORS.MEDIA_CHECKBOX_LIMIT).should("exist").click();
    cy.getBySelector(SELECTORS.MEDIA_CHECKBOX_LOCK).should("exist").click();

    // Click done
    cy.getBySelector(SELECTORS.SAVE_FIELD_BUTTON).should("exist").click();
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("not.exist");

    cy.wait("@getFields");

    // Check if field exists
    cy.getBySelector(`Field_${fieldName}`).should("exist");
  });

  it("Creates a Boolean field", () => {
    cy.intercept("**/fields?showDeleted=true").as("getFields");

    const fieldLabel = `Boolean ${timestamp}`;
    const fieldName = `boolean_${timestamp}`;

    // Open the add field modal
    cy.getBySelector(SELECTORS.ADD_FIELD_BTN).should("exist").click();
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("exist");

    // Select Boolean field
    cy.getBySelector(SELECTORS.FIELD_SELECT_BOOLEAN).should("exist").click();

    // Input field label and option labels
    cy.getBySelector(SELECTORS.INPUT_LABEL).should("exist").type(fieldLabel);
    cy.getBySelector(`${SELECTORS.INPUT_OPTION_LABEL}_0`)
      .should("exist")
      .type("Test option 1");
    cy.getBySelector(`${SELECTORS.INPUT_OPTION_LABEL}_1`)
      .should("exist")
      .type("Test option 2");

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
    cy.getBySelector(SELECTORS.SAVE_FIELD_BUTTON).should("exist").click();
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("not.exist");

    cy.wait("@getFields");

    // Check if field exists
    cy.getBySelector(`Field_${fieldName}`).should("exist");
  });

  it("Creates a One-to-one relationship field", () => {
    cy.intercept("**/fields?showDeleted=true").as("getFields");

    const fieldLabel = `One to One ${timestamp}`;
    const fieldName = `one_to_one_${timestamp}`;

    // Open the add field modal
    cy.getBySelector(SELECTORS.ADD_FIELD_BTN).should("exist").click();
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("exist");

    // Select one-to-one relationship field
    cy.getBySelector(SELECTORS.FIELD_SELECT_ONE_TO_ONE).should("exist").click();

    // Fill up fields
    cy.getBySelector(SELECTORS.INPUT_LABEL).should("exist").type(fieldLabel);

    // Select a related model
    cy.getBySelector(SELECTORS.AUTOCOMPLETE_MODEL_ZUID)
      .should("exist")
      .type("cypress");
    cy.get("[role=listbox] [role=option]").first().click();

    cy.wait("@getFields");

    // Select a related field
    cy.getBySelector(SELECTORS.AUTOCOMPLETE_FIELED_ZUID)
      .should("exist")
      .click();
    cy.get("[role=listbox] [role=option]").first().click();

    // Navigate to rules tab and add default value
    cy.getBySelector(SELECTORS.RULES_TAB_BTN).click();
    // click on the default value checkbox
    cy.getBySelector(SELECTORS.DEFAULT_VALUE_CHECKBOX).click();
    // enter a default value
    cy.getBySelector(SELECTORS.DEFAULT_VALUE_INPUT).click();
    // Select the option
    cy.get("[role=listbox] [role=option]").first().click();
    // verify that the default value is set
    cy.getBySelector(SELECTORS.DEFAULT_VALUE_INPUT)
      .find("input")
      .should("have.value", "- None -");
    cy.getBySelector(SELECTORS.DEFAULT_VALUE_CHECKBOX).click();

    // Click done
    cy.getBySelector(SELECTORS.SAVE_FIELD_BUTTON).should("exist").click();
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("not.exist");

    cy.wait("@getFields");

    // Check if field exists
    cy.getBySelector(`Field_${fieldName}`).should("exist");
  });

  it("Creates a field via add another field button", () => {
    cy.intercept("**/fields?showDeleted=true").as("getFields");

    const values = {
      number: {
        label: `Number ${timestamp}`,
        name: `number_${timestamp}`,
      },
      internal_link: {
        label: `Internal Link ${timestamp}`,
        name: `internal_link_${timestamp}`,
      },
    };

    // Open the add field modal
    cy.getBySelector(SELECTORS.ADD_FIELD_BTN).should("exist").click();
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("exist");

    // Select number field
    cy.getBySelector(SELECTORS.FIELD_SELECT_NUMBER).should("exist").click();

    // Fill up fields
    cy.getBySelector(SELECTORS.INPUT_LABEL)
      .should("exist")
      .type(values.number.label);

    // Click add another field button
    cy.getBySelector(SELECTORS.ADD_ANOTHER_FIELD_BTN).should("exist").click();

    // Select internal link field
    cy.getBySelector(SELECTORS.FIELD_SELECTION).should("exist");
    cy.getBySelector(SELECTORS.FIELD_SELECT_INTERNAL_LINK)
      .should("exist")
      .click();

    // Fill up fields
    cy.getBySelector(SELECTORS.INPUT_LABEL)
      .should("exist")
      .type(values.internal_link.label);

    // Click done
    cy.getBySelector(SELECTORS.SAVE_FIELD_BUTTON).should("exist").click();
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("not.exist");

    cy.wait("@getFields");

    // Verify that fields were created
    cy.getBySelector(`Field_${values.number.name}`);
    cy.getBySelector(`Field_${values.internal_link.name}`);
  });

  it("Shows error messages during field creation", () => {
    // Open the add field modal
    cy.getBySelector(SELECTORS.ADD_FIELD_BTN).should("exist").click();
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("exist");

    // Select Text field
    cy.getBySelector(SELECTORS.FIELD_SELECT_TEXT).should("exist").click();

    // Click done
    cy.getBySelector(SELECTORS.SAVE_FIELD_BUTTON).should("exist").click();

    // Verify that error messages are shown
    cy.getBySelector(SELECTORS.ERROR_MESSAGE_LABEL).should("exist");
    cy.getBySelector(SELECTORS.ERROR_MESSAGE_NAME).should("exist");

    // Close the modal
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL_CLOSE).should("exist").click();
  });

  it("Opens Add Field Modal via end of list button", () => {
    // Click end of list button
    cy.getBySelector(SELECTORS.ADD_FIELD_BTN_END_OF_LIST)
      .should("exist")
      .click();

    // Verify modal
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("exist");

    // Close the modal
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL_CLOSE).should("exist").click();
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("not.exist");
  });

  it("Opens Add Field Modal via in between field button", () => {
    // Click in-between field button
    cy.getBySelector(SELECTORS.ADD_FIELD_BTN_IN_BETWEEN)
      .first()
      .should("exist")
      .click();

    // Verify modal
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("exist");

    // Close the modal
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL_CLOSE).should("exist").click();
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("not.exist");
  });

  it("Switches tabs in Add Field Modal", () => {
    // Open the modal
    cy.getBySelector(SELECTORS.ADD_FIELD_BTN).should("exist").click();
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("exist");

    // Select single text field
    cy.getBySelector(SELECTORS.FIELD_SELECT_TEXT).should("exist").click();

    // Verify that details tab is loaded
    cy.getBySelector(SELECTORS.DETAILS_TAB).should("exist");

    // Click Learn tab
    cy.getBySelector(SELECTORS.LEARN_TAB_BTN).should("exist").click();
    cy.getBySelector(SELECTORS.LEARN_TAB).should("exist");

    // Click Rules tab
    cy.getBySelector(SELECTORS.RULES_TAB_BTN).should("exist").click();

    // Close the modal
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL_CLOSE).should("exist").click();
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("not.exist");
  });

  it("Can navigate back to fields selection view", () => {
    // Open the modal
    cy.getBySelector(SELECTORS.ADD_FIELD_BTN).should("exist").click();
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("exist");

    // Select single text field
    cy.getBySelector(SELECTORS.FIELD_SELECT_TEXT).should("exist").click();

    // Click the back button
    cy.getBySelector(SELECTORS.BACK_TO_FIELD_SELECTION_BTN)
      .should("exist")
      .click();

    // Verify that field selection screen is loaded
    cy.getBySelector(SELECTORS.FIELD_SELECTION).should("exist");

    // Close the modal
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL_CLOSE).should("exist").click();
  });

  it("Can filter fields in field selection view", () => {
    // Open the modal
    cy.getBySelector(SELECTORS.ADD_FIELD_BTN).should("exist").click();
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("exist");

    // Verify that field selection screen is loaded
    cy.getBySelector(SELECTORS.FIELD_SELECTION).should("exist");

    // Filter results
    cy.getBySelector(SELECTORS.FIELD_SELECTION_FILTER).as("fieldFilter");
    cy.get("@fieldFilter").should("exist").type("dropdown");

    // Verify
    cy.getBySelector(SELECTORS.FIELD_SELECT_DROPDOWN).should("exist");

    // Enter random string
    cy.get("@fieldFilter").should("exist").type("asdasdasdasd");

    // Show no results
    cy.getBySelector(SELECTORS.FIELD_SELECTION_EMPTY).should("exist");

    // Close the modal
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL_CLOSE).should("exist").click();
  });

  it("Can filter fields in fields list", () => {
    cy.intercept("**/fields?showDeleted=true").as("getFields");

    const fieldLabel = `Field to filter ${timestamp}`;
    const fieldName = `field_to_filter_${timestamp}`;

    // Open the add field modal
    cy.getBySelector(SELECTORS.ADD_FIELD_BTN).should("exist").click();
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("exist");

    // Select a field
    cy.getBySelector(SELECTORS.FIELD_SELECT_NUMBER).should("exist").click();

    // Fill up fields
    cy.getBySelector(SELECTORS.INPUT_LABEL).should("exist").type(fieldLabel);
    cy.get("input[name='label']")
      .should("exist")
      .should("have.value", fieldLabel);
    cy.get("input[name='name']")
      .should("exist")
      .should("have.value", fieldName);

    // Click done
    cy.getBySelector(SELECTORS.SAVE_FIELD_BUTTON).should("exist").click();
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("not.exist");

    cy.wait("@getFields");

    cy.getBySelector(SELECTORS.FIELDS_LIST_FILTER).as("fieldListFilter");

    // Filter fields
    cy.get("@fieldListFilter").should("exist").type("field to filter");

    // Check if field exists
    cy.getBySelector(`Field_${fieldName}`).should("exist");

    // Enter a random filter keyword
    cy.get("@fieldListFilter").should("exist").type("askljfkljfklsdjf");

    // Field should not exist
    cy.getBySelector(`Field_${fieldName}`).should("not.exist");
    cy.getBySelector(SELECTORS.FIELDS_LIST_NO_RESULTS).should("exist");

    // Clear filter keyword
    cy.get("@fieldListFilter").should("exist").type("{selectall} {backspace}");
  });

  it("Can update a field", () => {
    cy.intercept("**/fields?showDeleted=true").as("getFields");
    cy.intercept("/v1/content/models/**").as("updateField");

    const origFieldLabel = `Update me ${timestamp}`;
    const updatedFieldLabel = `Rename field ${timestamp}`;
    const fieldName = `update_me_${timestamp}`;

    // Open the add field modal
    cy.getBySelector(SELECTORS.ADD_FIELD_BTN).should("exist").click();
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("exist");

    // Select Text field
    cy.getBySelector(SELECTORS.FIELD_SELECT_TEXT).should("exist").click();

    // Fill up fields
    cy.getBySelector(SELECTORS.INPUT_LABEL)
      .should("exist")
      .type(origFieldLabel);

    // Click done
    cy.getBySelector(SELECTORS.SAVE_FIELD_BUTTON).should("exist").click();
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("not.exist");

    cy.wait("@getFields");

    // Check if field exists
    cy.getBySelector(`Field_${fieldName}`).should("exist");

    // Open update modal
    cy.getBySelector(`${SELECTORS.FIELD_MENU_BTN}_${fieldName}`)
      .should("exist")
      .click();
    cy.getBySelector(`${SELECTORS.FIELD_DROPDOWN_EDIT}_${fieldName}`)
      .should("exist")
      .click();
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("exist");

    // Update field label
    cy.getBySelector(SELECTORS.INPUT_LABEL).should("exist").clear();
    cy.getBySelector(SELECTORS.INPUT_LABEL)
      .should("exist")
      .type(updatedFieldLabel);

    // Save changes
    cy.getBySelector(SELECTORS.SAVE_FIELD_BUTTON).should("exist").click();
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("not.exist");

    cy.wait("@updateField");
    cy.wait("@getFields");

    // Verify field name
    cy.getBySelector(`FieldLabel_${fieldName}`)
      .should("exist")
      .should("contain", updatedFieldLabel);
  });

  it("Can deactivate & reactivate a field via dropdown menu", () => {
    cy.intercept("**/fields?showDeleted=true").as("getFields");
    cy.intercept("/v1/content/models/**").as("updateField");

    const fieldLabel = `Deactivate me ${timestamp}`;
    const fieldName = `deactivate_me_${timestamp}`;

    // Open the add field modal
    cy.getBySelector(SELECTORS.ADD_FIELD_BTN).should("exist").click();
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("exist");

    // Select Text field
    cy.getBySelector(SELECTORS.FIELD_SELECT_TEXT).should("exist").click();

    // Fill up fields
    cy.getBySelector(SELECTORS.INPUT_LABEL).should("exist").type(fieldLabel);

    // Click done
    cy.getBySelector(SELECTORS.SAVE_FIELD_BUTTON).should("exist").click();
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("not.exist");

    cy.wait("@getFields");

    // Check if field exists
    cy.getBySelector(`Field_${fieldName}`).should("exist");

    // Deactivate the field
    cy.getBySelector(`${SELECTORS.FIELD_MENU_BTN}_${fieldName}`)
      .should("exist")
      .click();
    cy.getBySelector(
      `${SELECTORS.FIELD_DROPDOWN_DEACTIVATE_REACTIVATE}_${fieldName}`
    )
      .should("exist")
      .click();

    cy.wait("@updateField");
    cy.wait("@getFields");

    // Verify field is deactivated
    cy.get(`[data-cy-status=Field_${fieldName}_inactive]`).should("exist");

    // Reactivate the field
    cy.getBySelector(`${SELECTORS.FIELD_MENU_BTN}_${fieldName}`)
      .should("exist")
      .click({ force: true });
    cy.getBySelector(
      `${SELECTORS.FIELD_DROPDOWN_DEACTIVATE_REACTIVATE}_${fieldName}`
    )
      .should("exist")
      .click({ force: true });

    cy.wait("@updateField");
    cy.wait("@getFields");

    // Verify field is deactivated
    cy.get(`[data-cy-status=Field_${fieldName}_active]`).should("exist");
  });

  it("Can deactivate a field via edit modal", () => {
    cy.intercept("**/fields?showDeleted=true").as("getFields");
    cy.intercept("/v1/content/models/**").as("updateField");

    const fieldLabel = `Deactivate me via modal ${timestamp}`;
    const fieldName = `deactivate_me_via_modal_${timestamp}`;

    // Open the add field modal
    cy.getBySelector(SELECTORS.ADD_FIELD_BTN).should("exist").click();
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("exist");

    // Select Text field
    cy.getBySelector(SELECTORS.FIELD_SELECT_TEXT).should("exist").click();

    // Fill up fields
    cy.getBySelector(SELECTORS.INPUT_LABEL).should("exist").type(fieldLabel);

    // Click done
    cy.getBySelector(SELECTORS.SAVE_FIELD_BUTTON).should("exist").click();
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("not.exist");

    cy.wait("@getFields");

    // Check if field exists
    cy.getBySelector(`Field_${fieldName}`).should("exist");

    // Open update modal
    cy.getBySelector(`${SELECTORS.FIELD_MENU_BTN}_${fieldName}`)
      .should("exist")
      .click();
    cy.getBySelector(`${SELECTORS.FIELD_DROPDOWN_EDIT}_${fieldName}`)
      .should("exist")
      .click();
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("exist");

    // Deactivate the field
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL_DEACTIVATE_REACTIVATE)
      .should("exist")
      .click();
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL_CLOSE).should("exist").click();

    cy.wait("@updateField");
    cy.wait("@getFields");

    // Verify field is deactivated
    cy.get(`[data-cy-status=Field_${fieldName}_inactive]`).should("exist");
  });

  it("Shows and hides system fields", () => {
    // Show system fields
    cy.getBySelector(SELECTORS.SHOW_SYSTEM_FIELDS_BTN).should("exist").click();
    cy.getBySelector(SELECTORS.SYSTEM_FIELDS).should("exist");

    // Hide system fields
    cy.getBySelector(SELECTORS.SHOW_SYSTEM_FIELDS_BTN).should("exist").click();
    cy.getBySelector(SELECTORS.SYSTEM_FIELDS).should("not.exist");
  });
});

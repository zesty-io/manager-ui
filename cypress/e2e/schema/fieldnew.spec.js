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
  DROPDOWN_ADD_OPTION: "DropdownAddOption",
  DROPDOWN_DELETE_OPTION: "DeleteOption",
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
};
/**
 * -[x] Open Add Field Modal via button
 * -[x] Open Add Field Modal via end of list button
 * -[x] Open Add Field Modal via in between field
 * -[x] Switch tabs in Add Field Modal
 * -[] Create fields
 *    -[x] Single Text
 *    -[x] Dropdown
 *    -[] Media
 *    -[] Boolean
 *    -[] One to One
 * -[x] Show error messages
 * -[x] Navigate to fields selection
 * -[x] Filter fields in field selection
 * -[x] Add another field
 * -[] Update a field
 * -[] Deactivate a field
 * -[] Reactivate a field via dropdown menu
 * -[] Reactivate a field via Edit field modal
 * -[] Show hide system fields
 */
describe("Schema: Fields", () => {
  const timestamp = Date.now();

  before(() => {
    cy.waitOn(
      "/v1/content/models/6-ce80dbfe90-ptjpm6/fields?showDeleted=true",
      () => {
        cy.waitOn("/bin/1-6c9618c-r26pt/groups", () => {
          cy.visit("/schema/6-ce80dbfe90-ptjpm6/fields");
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

  // TODO: Renable before merging, skipping to avoid spam
  it.skip("Creates a Single Line Text field", () => {
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

    // Click done
    cy.getBySelector(SELECTORS.SAVE_FIELD_BUTTON).should("exist").click();
    cy.getBySelector(SELECTORS.ADD_FIELD_MODAL).should("not.exist");

    cy.wait("@getFields");

    // Check if field exists
    cy.getBySelector(`Field_${fieldName}`).should("exist");
  });

  // TODO: Renable before merging, skipping to avoid spam
  it.skip("Creates a field via add another field button", () => {
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
    cy.getBySelector(SELECTORS.RULES_TAB).should("exist");

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
});

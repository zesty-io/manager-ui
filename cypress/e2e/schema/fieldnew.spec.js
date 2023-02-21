const SELECTORS = {
  ADD_FIELD_BTN: "AddFieldBtn",
  ADD_FIELD_BTN_END_OF_LIST: "EndOfListAddFieldBtn",
  ADD_FIELD_BTN_IN_BETWEEN: "InBetweenFieldAddFieldBtn",
  ADD_FIELD_MODAL: "AddFieldModal",
  ADD_FIELD_MODAL_CLOSE: "AddFieldCloseBtn",
  SAVE_FIELD_BUTTON: "FieldFormAddFieldBtn",
  FIELD_SELECT_TEXT: "FieldItem_text",
  INPUT_LABEL: "FieldFormInput_label",
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
 * -[] Switch tabs in Add Field Modal
 * -[] Create fields
 * -[] Show error messages
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
});

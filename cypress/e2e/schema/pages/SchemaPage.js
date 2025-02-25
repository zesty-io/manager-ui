const TIMEOUT = {
  timeout: 15_000,
};

class SchemaPage {
  visit() {
    cy.visit("/schema");
  }

  get modelHeaderMenuButton() {
    return cy.getBySelector("model-header-menu");
  }

  get modelMenuDeleteButton() {
    return cy.getBySelector("delete-model-menu-button");
  }

  get deleteModelConfirmationInput() {
    return cy.getBySelector("delete-model-confirmation-input");
  }

  get deleteModelConfirmationButton() {
    return cy.getBySelector("delete-model-confirmation-button");
  }

  get addFieldButton() {
    return cy.getBySelector("AddFieldBtn");
  }

  get rulesTabButton() {
    return cy.getBySelector("RulesTabBtn");
  }

  deleteModel(name) {
    cy.contains(name).click(TIMEOUT);
    this.modelHeaderMenuButton.click(TIMEOUT);
    this.modelMenuDeleteButton.click();
    this.deleteModelConfirmationInput.type(name);
    this.deleteModelConfirmationButton.click();
  }

  addSingleLineTextFieldWithDefaultValue(modelName, fieldName, defaultValue) {
    cy.contains(modelName).click(TIMEOUT);
    this.addFieldButton.click(TIMEOUT);
    cy.contains("Single Line Text").click();
    cy.getBySelector("FieldFormInput_label").type(fieldName);
    this.rulesTabButton.click();
    cy.getBySelector("DefaultValueCheckbox").click();
    cy.getBySelector("DefaultValueInput").type(defaultValue);
    cy.getBySelector("FieldFormAddFieldBtn").click();
  }
}

export default new SchemaPage();

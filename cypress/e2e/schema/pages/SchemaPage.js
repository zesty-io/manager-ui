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

  deleteModel(name) {
    cy.contains(name).click();
    this.modelHeaderMenuButton.click();
    this.modelMenuDeleteButton.click();
    this.deleteModelConfirmationInput.type(name);
    this.deleteModelConfirmationButton.click();
  }
}

export default new SchemaPage();

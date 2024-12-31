class BlockPage {
  get createVariantButton() {
    return cy.getBySelector("create-variant-button");
  }

  createVariant(name) {
    this.createVariantButton.click();
    cy.getBySelector("variant-name-input").type(name);
    cy.getBySelector("create-variant-confirm-button").click();
  }
}

export default new BlockPage();

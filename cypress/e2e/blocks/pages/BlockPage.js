class BlockPage {
  get createVariantButton() {
    return cy.getBySelector("create-variant-button");
  }

  createVariant(name) {
    this.createVariantButton.click();
    cy.getBySelector("metaTitle-input").type(name);
    cy.getBySelector("CreateItemSaveButton").click();
  }
}

export default new BlockPage();

const TIMEOUT = {
  timeout: 15000,
};

class AllBlocksPage {
  visit() {
    cy.visit("/blocks");
  }

  get createBlockButton() {
    return cy.getBySelector("create-block-button");
  }

  get onboardingDialog() {
    return cy.getBySelector("onboarding-dialog");
  }

  get onboardingNextButton() {
    return cy.getBySelector("onboarding-next-button");
  }

  get createModelDialog() {
    return cy.getBySelector("create-model-dialog");
  }

  get searchBlocksInput() {
    return cy.getBySelector("search-blocks-input");
  }

  clickOnboardingNextButton() {
    this.onboardingNextButton.click(TIMEOUT);
  }

  createBlock(name) {
    this.createBlockButton.click(TIMEOUT);
    cy.getBySelector("create-model-display-name-input").type(name);
    cy.getBySelector("create-model-submit-button").click(TIMEOUT);
  }
}

export default new AllBlocksPage();

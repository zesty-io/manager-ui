import AllBlocksPage from "../pages/AllBlocksPage";
import BlockPage from "../pages/BlockPage";
import SchemaPage from "../../schema/pages/SchemaPage";

const CypressTestBlock = "Cypress Test Block";
const CypressTestVariant = "Cypress Test Variant";

const TIMEOUT = { timeout: 30_000 };

describe("All Blocks Tests", () => {
  before(() => {
    cy.deleteContentModels(["Cypress Test Block", "Cypress Test Variant"]);
  });

  after(() => {
    cy.deleteContentModels(["Cypress Test Block", "Cypress Test Variant"]);
  });

  it("should show and traverse onboarding flow", () => {
    AllBlocksPage.visit();
    cy.get('[data-cy="onboarding-dialog"]', TIMEOUT).should("be.visible");
    const totalSteps = 4;
    for (let i = 0; i < totalSteps; i++) {
      AllBlocksPage.clickOnboardingNextButton();
    }
    AllBlocksPage.onboardingDialog.should("not.exist");
  });

  it("creates new block with default values", () => {
    AllBlocksPage.createBlock(CypressTestBlock);
    cy.contains(CypressTestBlock, TIMEOUT).should("exist");
    SchemaPage.visit();
    SchemaPage.addSingleLineTextFieldWithDefaultValue(
      CypressTestBlock,
      "Foo",
      "Default Foo"
    );
    AllBlocksPage.visit();
  });

  it("searches for a block", () => {
    AllBlocksPage.searchBlocksInput.type(CypressTestBlock);
    cy.contains(CypressTestBlock).should("exist");
  });

  it("shows no results when no blocks are found", () => {
    AllBlocksPage.searchBlocksInput.find("input").clear();
    AllBlocksPage.searchBlocksInput.type("Non Existent Block");
    cy.contains(
      "Your search “Non Existent Block” could not find any results"
    ).should("exist");
  });

  it("navigates to block detail page", () => {
    cy.contains(CypressTestBlock).click({ timeout: 30_000 });
    cy.contains("Start Creating Variants Now", { timeout: 30_000 }).should(
      "exist"
    );
  });

  it("creates a variant with default values", () => {
    AllBlocksPage.visit();
    cy.contains(CypressTestBlock).click(TIMEOUT);
    BlockPage.createVariant(CypressTestVariant);
    cy.contains(
      new RegExp(`${CypressTestBlock}:\\s*${CypressTestVariant}`),
      TIMEOUT
    ).should("exist");
    cy.get('input[name="foo"]', { timeout: 30_000 }).should(
      "have.value",
      "Default Foo"
    );
  });
});

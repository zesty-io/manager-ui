import AllBlocksPage from "../pages/AllBlocksPage";
import BlockPage from "../pages/BlockPage";
import SchemaPage from "../../schema/pages/SchemaPage";

const CypressTestBlock = "Cypress Test Block";
const CypressTestVariant = "Cypress Test Variant";

describe("All Blocks Tests", () => {
  before(() => {
    AllBlocksPage.visit();
  });

  after(() => {
    SchemaPage.visit();
    SchemaPage.deleteModel(CypressTestBlock);
  });

  it("should show and traverse onboarding flow", () => {
    AllBlocksPage.onboardingDialog.should("be.visible");
    const totalSteps = 4;
    for (let i = 0; i < totalSteps; i++) {
      AllBlocksPage.clickOnboardingNextButton();
    }
    AllBlocksPage.onboardingDialog.should("not.exist");
  });

  it("creates new block with default values", () => {
    AllBlocksPage.createBlock(CypressTestBlock);
    cy.contains(CypressTestBlock).should("exist");
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
    cy.contains(CypressTestBlock).click();
    cy.contains("Start Creating Variants Now").should("exist");
  });

  it("creates a variant with default values", () => {
    cy.contains(CypressTestBlock).click();
    BlockPage.createVariant(CypressTestVariant);
    cy.contains(
      new RegExp(`${CypressTestBlock}:\\s*${CypressTestVariant}`)
    ).should("exist");
    cy.get('input[name="foo"]').should("have.value", "Default Foo");
  });
});

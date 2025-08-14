import AllBlocksPage from "../pages/AllBlocksPage";
import BlockPage from "../pages/BlockPage";
import SchemaPage from "../../schema/pages/SchemaPage";
import { API_ENDPOINTS } from "../../../support/api";

const CypressTestBlock = "Cypress Test Block";
const CypressTestVariant = "Cypress Test Variant";

const TIMEOUT = {
  timeout: 15_000,
};

describe("All Blocks Tests", () => {
  before(() => {
    deleteTestDataModels();
    AllBlocksPage.visit();
  });

  after(() => {
    // SchemaPage.visit();
    // SchemaPage.deleteModel(CypressTestBlock);
    deleteTestDataModels();
  });

  it("should show and traverse onboarding flow", () => {
    AllBlocksPage.onboardingDialog.should("be.visible");
    const totalSteps = 3;
    for (let i = 0; i < totalSteps; i++) {
      AllBlocksPage.clickOnboardingNextButton();
    }
    AllBlocksPage.onboardingDialog.should("not.exist");
  });

  // Skiped since starter blocks are introduced.
  it.skip("creates new block with default values", () => {
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

  it("creates new block with default values", () => {
    AllBlocksPage.visit();
    cy.get('[data-cy="create_new_content_item"]').click();
    cy.get('[data-cy="starter-block-card"]:eq(1)').click();
    cy.get('[data-cy="select-block-type-next-button"]').click();
    cy.get('[data-cy="starter-block-form-label"] input')
      .clear()
      .type(CypressTestBlock);
    cy.intercept("POST", "/v1/content/models").as("createModel");
    cy.get('[data-cy="starter-block-form-submit"]').click();
    cy.wait("@createModel");
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
    AllBlocksPage.visit();
    cy.contains(CypressTestBlock, TIMEOUT).click();
    cy.contains("Start Creating Variants Now", TIMEOUT).should("exist");
  });

  it("creates a variant with default values", () => {
    AllBlocksPage.visit();
    cy.contains(CypressTestBlock).click(TIMEOUT);
    BlockPage.createVariant(CypressTestVariant);
    cy.contains(new RegExp(`${CypressTestBlock}:\\s*${CypressTestVariant}`), {
      timeout: 15_000,
    }).should("exist");
  });

  it("keeps user in the blocks app when deleting a variant", () => {
    AllBlocksPage.visit();
    cy.contains(CypressTestBlock).click(TIMEOUT);
    BlockPage.deleteVariant();
    cy.wait(5000);
    cy.location("pathname").should("eq", "/blocks");
  });
});

function deleteTestDataModels() {
  cy.apiRequest({
    url: `${API_ENDPOINTS.devInstance}/content/models`,
  }).then((response) => {
    response?.data
      ?.filter((resData) =>
        [CypressTestBlock, CypressTestVariant].includes(resData?.label)
      )
      .forEach((forDelete) => {
        cy.apiRequest({
          url: `${API_ENDPOINTS.devInstance}/content/models/${forDelete.ZUID}`,
          method: "DELETE",
        });
      });
  });
}

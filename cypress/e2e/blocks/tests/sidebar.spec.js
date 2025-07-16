import AllBlocksPage from "../pages/AllBlocksPage";

describe("Blocks sidebar", () => {
  before(() => {
    AllBlocksPage.visit();
    const totalSteps = 3;
    for (let i = 0; i < totalSteps; i++) {
      AllBlocksPage.clickOnboardingNextButton();
    }
  });

  it("can navigate blocks in the sidebar", () => {
    cy.contains("Test Block Do Not Delete").click();
    cy.location("pathname").should(
      "eq",
      "/blocks/6-d8b088cc9c-gwk3w7/7-ee94b5e98d-ss015b"
    );
  });

  it("should be able to show the more options menu", () => {
    cy.get(".MuiTreeItem-content.Mui-selected")
      .find("[data-cy='tree-item-hide']")
      .click({ force: true });
    cy.getBySelector("schema-more-menu").should("exist");
  });
});

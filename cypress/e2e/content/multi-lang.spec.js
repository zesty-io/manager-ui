describe("multi-lang", () => {
  before(() => {
    cy.task("seed:content", {
      fixturePath: "content/default.json",
      overrides: {
        model: {
          label: "content/multi-lang.spec",
        },
      },
    }).then(({ model, items }) => {
      Cypress.env("modelZUID", model?.ZUID);
      Cypress.env("itemZUID", items[0]?.meta?.ZUID);
    });
  });
  it("Check if multi lang exist", () => {
    cy.visit(`/content/${Cypress.env("modelZUID")}/${Cypress.env("itemZUID")}`);

    cy.get('[data-cy="language-selector"]', { timeout: 45000 })
      .should("be.visible")
      .click();

    cy.contains("ES (ES)");
  });
});

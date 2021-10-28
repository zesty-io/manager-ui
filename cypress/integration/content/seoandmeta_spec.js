describe("Content SEO & Meta", () => {
  before(() => {
    cy.login();
  });

  it("Check if multi lang exist", () => {
    cy.visit("/content/6-a4d6e6f087-1jmlbx/7-b8da98dea8-1nwkc9/meta");
    // Waiting 15 secs for app to fully render dom
    cy.get("[data-cy=meta]", { timeout: 15000 }).click();
    cy.get("header").find(".Select").first().click();
    cy.get('[data-value="es"]').click();
    cy.get("[data-cy=meta]").click();
    cy.get("[data-cy=itemParent]").contains("/es").should("exist");
  });
});

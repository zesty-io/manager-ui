describe("Content SEO & Meta", () => {
  before(() => {
    cy.login();
  });

  it("Check if multi lang exist", () => {
    cy.visit("/content/6-a4d6e6f087-1jmlbx/7-b8da98dea8-1nwkc9");
    // Waiting 15 secs for app to fully render dom
    cy.get("[data-cy=meta]", { timeout: 15000 });
  });
});

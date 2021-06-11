describe("SEO", () => {
  before(() => {
    // cy.login();
    cy.visit("/seo");
  });

  it("Create redirect", () => {
    cy.get(".save").click();
  });

  it("Remove element", () => {
    cy.get(".deleteButton")
      .first()
      .click();
  });
});

describe("Schema: Models", () => {
  before(() => {
    cy.waitOn("/v1/content/models", () => {
      cy.visit("/schema");
    });
  });
});

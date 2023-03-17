describe.skip("Schema", () => {
  const timestamp = Date.now();
  const SCHEMA_NAME = `Test Schema: ${timestamp}`;

  before(() => {
    cy.waitOn("/v1/env/nav", () => {
      cy.visit("/schema");
    });
  });

  it.skip("Create Model, Add Field, and Delete Model", () => {
    cy.get('input[name="label"]').type(SCHEMA_NAME);

    cy.get("[data-cy=SubApp] .Select").first().click({ force: true });

    cy.get('li[data-value="pageset"]').click({ force: true });

    cy.get('button[type="save"]')
      .last()
      .contains("Create Model")
      .click({ force: true });

    cy.contains("— Select a Field Type —").click({ force: true });
    cy.get('li[data-value="text"]').click({ force: true });

    cy.get('input[name="label"]').type("my label", { force: true });
    cy.get('button[type="save"]').contains("Add Field").click();

    cy.contains("Delete Model").click({ force: true });
    cy.get('button[type="warn"]').contains("Delete Model").click();
    cy.get("#deleteConfirmButton").click();
  });
});

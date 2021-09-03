describe("Schema", () => {
  before(() => {
    cy.login();
    cy.visit("/schema");
    cy.get(".SchemaNav").should("exist");
  });

  const timestamp = Date.now();
  const SCHEMA_NAME = `Test Schema: ${timestamp}`;

  it("Create Model, Add Field, and Delete Model", () => {
    cy.get('input[name="label"]').type(SCHEMA_NAME);

    cy.get('button[type="save"]').contains("Create Model").click();

    cy.get(".FieldAdd").should("exist");

    cy.get("[data-cy=SubApp] .Select").first().click({ force: true });

    cy.get('li[data-value="text"]').click({ force: true });

    cy.get('input[name="label"]').type("my label", { force: true });

    cy.get('button[type="save"]').contains("Add Field").click();

    cy.contains("Delete Model").click({ force: true });
    cy.get('button[type="warn"]').contains("Delete Model").click();
    cy.get("#deleteConfirmButton").click();
  });
});

describe("Schema", () => {
  before(() => {
    cy.login();
    cy.visit("/schema");
    cy.get(".SchemaNav").should("exist");
  });

  const timestamp = Date.now();
  const SCHEMA_NAME = `Test Schema: ${timestamp}`;

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

    cy.get('input[name="label"]').should("have.value", "my label");

    cy.get('input[name="name"]').should("have.value", "my_label");

    cy.get('button[kind="save"]').contains("Save").click({ force: true });

    cy.contains("Delete Model").click({ force: true });
    cy.get('button[type="warn"]').contains("Delete Model").click();
    cy.get("#deleteConfirmButton").click();
  });
});

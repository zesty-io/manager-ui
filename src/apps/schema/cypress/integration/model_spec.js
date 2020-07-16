describe("Schema", () => {
  before(() => {
    cy.login();
    cy.gotoSchema();
  });

  const timestamp = Date.now();
  const SCHEMA_NAME = `Test Schema: ${timestamp}`;

  it("Create", () => {
    cy.get('input[name="label"]').type(SCHEMA_NAME);

    cy.get('button[kind="save"]')
      .contains("Create New Model")
      .click();

    cy.get(".FieldAdd", { timeout: 10000 }).should("exist");
  });
  it.skip("Edit", () => {
    // TODO Edit schema meta data

    // Load test created schema
    cy.contains("nav#templatesets article li span", SCHEMA_NAME).click();
  });
  it.skip("Delete", () => {
    // TODO Delete model
  });
});

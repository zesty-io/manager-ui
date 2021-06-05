describe("Schema", () => {
  before(() => {
    cy.login();
    cy.visit("/schema");
    cy.get(".SchemaNav", { timeout: 10000 }).should("exist");
  });

  const timestamp = Date.now();
  const SCHEMA_NAME = `Test Schema: ${timestamp}`;

  it("Create", () => {
    cy.get('input[name="label"]').type(SCHEMA_NAME);

    cy.get('button[kind="save"]')
      .contains("Create Model")
      .click();

    cy.get(".FieldAdd", { timeout: 10000 }).should("exist");
  });
  it("Edit", () => {
    cy.visit("/schema/6-82e1f584f5-cb1zd9");
    // cy.contains("nav#templatesets article li span", SCHEMA_NAME).click();
    cy.get(".selections").click({ force: true });
    cy.get('li[data-value="text"]').click({ force: true });

    cy.get('input[name="label"]').type("my label", { force: true });

    cy.get('button[kind="save"]').should("not.be.disabled");
    cy.get('button[ kind="save"]').click();
  });
  it("Delete", () => {
    cy.visit("/schema/6-82e1f584f5-cb1zd9");
    cy.contains("Delete Model").click({ force: true });
    cy.get('button[kind="warn"]')
      .contains("Delete Model")
      .click();
    cy.get("#deleteConfirmButton").click();
  });
});

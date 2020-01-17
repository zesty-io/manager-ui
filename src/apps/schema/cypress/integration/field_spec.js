describe("Fields", () => {
  before(() => {
    cy.login();
    cy.gotoSchema();
    cy.visit("/schema/6-852490-2mhz4v");
  });

  const timestamp = Date.now();

  it("Create:text", () => {
    const fieldLabel = `Text Field: ${timestamp}`;
    const fieldName = `text_field_${timestamp}`;

    cy.get(".FieldAdd .selections .options li[data-value='text']").click({
      force: true
    });

    cy.get('.FieldAdd input[name="label"]').type(fieldLabel);
    cy.get('.FieldAdd input[name="name"]').type(fieldName);
    cy.get('.FieldAdd footer button[kind="save"]').click();

    // Find the newly created field
    cy.contains(".Fields article header h1", fieldLabel, {
      timeout: 10000
    }).should("exist");
  });

  it("Edit", () => {
    // Open the collapsed field
    cy.get(".Fields article header")
      .last()
      .click();

    cy.get('.Fields article input[name="label"]')
      .last()
      .invoke("val")
      .then(value => {
        cy.get('.Fields article input[name="label"]')
          .last()
          .should("have.value", value);

        const newFieldLabel = `Text Field: ${timestamp}`;
        cy.get('.Fields article input[name="label"]')
          .last()
          .clear()
          .type(newFieldLabel);

        cy.get('.Fields article footer button[kind="save"]')
          .last()
          .click();

        cy.wait(5000);

        cy.get('.Fields article input[name="label"]')
          .last()
          .should("have.value", newFieldLabel);
      });
  });

  it("Deactivate", () => {
    cy.get(".Fields article footer button.deactivate")
      .last()
      .click({
        timeout: 10000
      });
  });

  it("Create:textarea", () => {
    const fieldLabel = `TextArea Field: ${timestamp}`;
    const fieldName = `textarea_field_${timestamp}`;

    cy.get(".FieldAdd .selections .options li[data-value='textarea']").click({
      force: true
    });

    cy.get('.FieldAdd input[name="label"]').type(fieldLabel);
    cy.get('.FieldAdd input[name="name"]').type(fieldName);
    cy.get('.FieldAdd footer button[kind="save"]').click();

    // Find the newly created field
    cy.contains(".Fields article header h1", fieldLabel, {
      timeout: 10000
    }).should("exist");
  });

  it("Create:wysiwyg", () => {
    const fieldLabel = `wysiwyg field: ${timestamp}`;
    const fieldName = `wysiwyg_field_${timestamp}`;

    cy.get(".FieldAdd .selections .options li[data-value='wysiwyg']").click({
      force: true
    });

    cy.get('.FieldAdd input[name="label"]').type(fieldLabel);
    cy.get('.FieldAdd input[name="name"]').type(fieldName);
    cy.get('.FieldAdd footer button[kind="save"]').click();

    // Find the newly created field
    cy.contains(".Fields article header h1", fieldLabel, {
      timeout: 10000
    }).should("exist");
  });
});

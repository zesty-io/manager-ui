describe("Fields", () => {
  const timestamp = Date.now();

  before(() => {
    cy.waitOn(
      "/v1/content/models/6-852490-2mhz4v/fields?showDeleted=true",
      () => {
        cy.visit("/schema/6-852490-2mhz4v");
      }
    );
  });

  it("Create:text", () => {
    const fieldLabel = `Text Field: ${timestamp}`;
    const fieldName = `text_field_${timestamp}`;

    cy.get(".FieldAdd .MuiSelect-select").click();

    cy.get("[role=presentation] li[data-value='text']").click();

    // NOTE: the name should be autoset by the label
    cy.get('.FieldAdd input[name="label"]').type(fieldLabel);

    cy.waitOn("/v1/content/models/6-852490-2mhz4v/fields", () => {
      cy.get("[data-cy=addField]").click();
    });

    cy.get(".Fields .Dropzone .Draggable:last-child input[name=label]").should(
      "have.value",
      fieldLabel
    );
    cy.get(".Fields .Dropzone .Draggable:last-child input[name=name]").should(
      "have.value",
      fieldName
    );
  });

  it("Edit", () => {
    // Open the collapsed field
    cy.get(".Fields .Draggable").last().click();

    cy.get('.Fields article input[name="label"]')
      .last()
      .invoke("val")
      .then((value) => {
        cy.get('.Fields article input[name="label"]')
          .last()
          .should("have.value", value);

        const newFieldLabel = `Text Field: ${timestamp}`;
        cy.get('.Fields article input[name="label"]')
          .last()
          .clear()
          .type(newFieldLabel);

        cy.get("[data-cy=fieldSave]").last().should("not.be.disabled").click();

        cy.get('.Fields article input[name="label"]')
          .last()
          .should("have.value", newFieldLabel);
      });
  });

  it("Deactivate", () => {
    cy.get("[data-cy=deactivated]").eq(0).click();
  });

  it("Create:textarea", () => {
    const fieldLabel = `TextArea Field: ${timestamp}`;
    const fieldName = `textarea_field_${timestamp}`;

    cy.get(".FieldAdd .MuiSelect-select").click();
    cy.get("[role=presentation] li[data-value='textarea']").click();

    cy.get('.FieldAdd input[name="label"]').type(fieldLabel);
    cy.get('.FieldAdd input[name="name"]').type(fieldName);
    cy.get("[data-cy=addField]").last().click();

    // Find the newly created field
    cy.contains(".Fields article header h1", fieldLabel, {
      timeout: 10000,
    }).should("exist");
  });

  it("Create:wysiwyg", () => {
    const fieldLabel = `wysiwyg field: ${timestamp}`;
    const fieldName = `wysiwyg_field_${timestamp}`;

    cy.get(".FieldAdd .MuiSelect-select").click();
    cy.get("[role=presentation] li[data-value='wysiwyg_basic']").click();

    cy.get('.FieldAdd input[name="label"]').type(fieldLabel);
    cy.get('.FieldAdd input[name="name"]').type(fieldName);
    cy.get("[data-cy=addField]").click();

    // Find the newly created field
    cy.contains(".Fields article header h1", fieldLabel, {
      timeout: 10000,
    }).should("exist");
  });
});

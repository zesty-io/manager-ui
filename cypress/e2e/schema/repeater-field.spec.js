describe("Schema: Repeater Field", () => {
  const timestamp = Date.now();
  const fieldLabel = `Repeater Field ${timestamp}`;
  const fieldName = `repeater_field_${timestamp}`;

  before(() => {
    cy.waitOn(
      "/v1/content/models/6-ce80dbfe90-ptjpm6/fields?showDeleted=true",
      () => {
        cy.waitOn("/bin/1-6c9618c-r26pt/groups", () => {
          cy.waitOn("/v1/content/models", () => {
            cy.visit("/schema/6-ce80dbfe90-ptjpm6/fields");

            cy.getBySelector("create_new_content_item").click();

            cy.contains("Multi Page Model").click();
            cy.contains("Next").click();
            cy.contains("Display Name")
              .next()
              .type(`Cypress Repeater Field Test ${timestamp}`);
            cy.get(".MuiDialog-container").within(() => {
              cy.contains("Create Model").click();
            });
            cy.intercept("POST", "/models");
            cy.intercept("GET", "/models");
          });
        });
      }
    );
  });

  it("Creates a new repeater field", () => {
    cy.intercept("**/fields?showDeleted=true").as("getFields");

    cy.contains(`Cypress Repeater Field Test ${timestamp}`).should("exist");

    // Open the add field modal
    cy.getBySelector("AddFieldBtn").should("exist").click({ force: true });
    cy.getBySelector("AddFieldModal").should("exist");

    // Select repeater field
    cy.getBySelector("FieldItem_repeater").should("exist").click();

    // Fill up fields
    cy.getBySelector("FieldFormInput_label").should("exist").type(fieldLabel);
    cy.get("input[name='label']")
      .should("exist")
      .should("have.value", fieldLabel);
    cy.get("input[name='name']")
      .should("exist")
      .should("have.value", fieldName);

    // Click done
    cy.getBySelector("FieldFormAddFieldBtn").should("exist").click();
    cy.getBySelector("AddFieldModal").should("not.exist");

    cy.wait("@getFields");

    // Check if field exists
    cy.getBySelector(`Field_${fieldName}`).should("exist");
  });

  it("Adds a single line text sub field", () => {
    const SubFieldLabel = "Single Line Text";
    const SubFieldName = "single_line_text";

    cy.getBySelector(`Field_${fieldName}`).click();
    cy.getBySelector("AddRepeaterSubFieldBtn").click();
    cy.getBySelector("FieldItem_text").click();

    // Add field details
    cy.getBySelector("FieldFormInput_label").type(SubFieldLabel);
    cy.get("input[name='label']")
      .should("exist")
      .should("have.value", SubFieldLabel);
    cy.get("input[name='name']")
      .should("exist")
      .should("have.value", SubFieldName);

    // Add field rules
    cy.getBySelector("RulesTabBtn").click();
    cy.getBySelector("DefaultValueCheckbox").click();
    // enter a default value
    cy.getBySelector("DefaultValueInput").type("default value");
    // verify that the default value is set
    cy.getBySelector("DefaultValueInput")
      .find("input")
      .should("have.value", "default value");

    // Set min/max character limits
    cy.getBySelector("CharacterLimitCheckbox").click();
    cy.getBySelector("MaxCharacterLimitInput").clear().type("{end}10000");
    cy.getBySelector("MaxCharacterErrorMsg").should("exist");
    cy.getBySelector("MaxCharacterLimitInput").clear().type("{end}20");
    cy.getBySelector("MaxCharacterErrorMsg").should("not.exist");
    cy.getBySelector("MinCharacterLimitInput").clear().type("{end}10000");
    cy.getBySelector("MinCharacterErrorMsg").should("exist");
    cy.getBySelector("MinCharacterLimitInput").clear().type("{end}5");
    cy.getBySelector("MinCharacterErrorMsg").should("not.exist");

    cy.getBySelector("SubFieldFormAddFieldBtn").click();
    cy.getBySelector(`SubField_${SubFieldName}`).should("exist");
  });

  it("Adds a media sub field", () => {
    const SubFieldLabel = `Media`;
    const SubFieldName = `media`;

    // Open the add field modal
    cy.getBySelector("AddRepeaterSubFieldBtn").click();

    // Select Media field
    cy.getBySelector("FieldItem_images").click();

    // Input field label
    cy.getBySelector("FieldFormInput_label").type(SubFieldLabel);

    // Navigate to rules tab and enable media limit and folder lock
    cy.getBySelector("RulesTabBtn").click();
    cy.getBySelector("MediaRulesTab").click();
    cy.getBySelector("MediaCheckbox_limit").click();
    cy.getBySelector("MediaCheckbox_group_id").click();

    // Click done
    cy.getBySelector("SubFieldFormAddFieldBtn").click();

    // Check if field exists
    cy.getBySelector(`SubField_${SubFieldName}`).should("exist");
  });

  // it.skip("Updates the created repeater field", () => {
  //   cy.intercept("**/fields?showDeleted=true").as("getFields");
  //   cy.intercept("/v1/content/models/**").as("updateField");

  //   // Open the repeater field
  //   cy.getBySelector(`Field_${fieldName}`).click();

  //   //
  // });
});

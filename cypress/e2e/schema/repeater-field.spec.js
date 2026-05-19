import SchemaPage from "./pages/SchemaPage";

describe("Schema: Repeater Field", () => {
  const timestamp = Date.now();
  const modelName = `Cypress Repeater Field Test ${timestamp}`;
  const fieldLabel = `Repeater Field ${timestamp}`;
  const fieldName = `repeater_field_${timestamp}`;

  const getOrder = () =>
    cy
      .get('[data-cy^="SubField_"]')
      .then(($els) => [...$els].map((el) => el.getAttribute("data-cy")));

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
            cy.contains("Display Name").next().type(modelName);
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

    cy.contains(modelName).should("exist");

    // Open the add field modal
    cy.getBySelector("AddFieldBtn").should("not.be.disabled").click();
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

  it("Adds a multi line text sub field", () => {
    const SubFieldLabel = "Multi Line Text";
    const SubFieldName = "multi_line_text";

    cy.getBySelector("AddRepeaterSubFieldBtn").click();
    cy.getBySelector("FieldItem_textarea").click();

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
      .find("textarea")
      .should("have.value", "default value");

    // Set min/max character limits
    cy.getBySelector("CharacterLimitCheckbox").click();
    cy.getBySelector("MaxCharacterLimitInput").clear().type("{end}17000");
    cy.getBySelector("MaxCharacterErrorMsg").should("exist");
    cy.getBySelector("MaxCharacterLimitInput").clear().type("{end}20");
    cy.getBySelector("MaxCharacterErrorMsg").should("not.exist");
    cy.getBySelector("MinCharacterLimitInput").clear().type("{end}17000");
    cy.getBySelector("MinCharacterErrorMsg").should("exist");
    cy.getBySelector("MinCharacterLimitInput").clear().type("{end}5");
    cy.getBySelector("MinCharacterErrorMsg").should("not.exist");

    cy.getBySelector("SubFieldFormAddFieldBtn").click();
    cy.getBySelector(`SubField_${SubFieldName}`).should("exist");
  });

  it("Adds a wysiwyg sub field", () => {
    const SubFieldLabel = "WYSIWYG";
    const SubFieldName = "wysiwyg";

    cy.getBySelector("AddRepeaterSubFieldBtn").click();
    cy.getBySelector("FieldItem_wysiwyg_basic").click();

    // Add field details
    cy.getBySelector("FieldFormInput_label").type(SubFieldLabel);
    cy.get("input[name='label']")
      .should("exist")
      .should("have.value", SubFieldLabel);
    cy.get("input[name='name']")
      .should("exist")
      .should("have.value", SubFieldName);

    cy.getBySelector("SubFieldFormAddFieldBtn").click();
    cy.getBySelector(`SubField_${SubFieldName}`).should("exist");
  });

  it("Adds a markdown sub field", () => {
    const SubFieldLabel = "Markdown";
    const SubFieldName = "markdown";

    cy.getBySelector("AddRepeaterSubFieldBtn").click();
    cy.getBySelector("FieldItem_markdown").click();

    // Add field details
    cy.getBySelector("FieldFormInput_label").type(SubFieldLabel);
    cy.get("input[name='label']")
      .should("exist")
      .should("have.value", SubFieldLabel);
    cy.get("input[name='name']")
      .should("exist")
      .should("have.value", SubFieldName);

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

  it("Adds an external url sub field", () => {
    const SubFieldLabel = `External url`;
    const SubFieldName = `external_url`;
    const defaultValue = "https://google.com";

    // Open the add field modal
    cy.getBySelector("AddRepeaterSubFieldBtn").click();

    // Select Media field
    cy.getBySelector("FieldItem_link").click();

    // Input field label
    cy.getBySelector("FieldFormInput_label").type(SubFieldLabel);

    cy.getBySelector("RulesTabBtn").click();
    cy.getBySelector("DefaultValueCheckbox").click();
    cy.getBySelector("DefaultValueInput").type(defaultValue);
    cy.getBySelector("DefaultValueInput")
      .find("input")
      .should("have.value", defaultValue);

    // Click done
    cy.getBySelector("SubFieldFormAddFieldBtn").click();

    // Check if field exists
    cy.getBySelector(`SubField_${SubFieldName}`).should("exist");
  });

  it("Adds a currency sub field", () => {
    const fieldLabel = `Currency`;
    const fieldName = `currency`;

    cy.getBySelector("AddRepeaterSubFieldBtn").click();

    cy.getBySelector("FieldItem_currency").click();

    cy.getBySelector("Autocomplete_currency").type("phil");
    cy.get("[role=listbox] [role=option]").first().click();

    cy.getBySelector("FieldFormInput_label").type(fieldLabel);

    cy.getBySelector("RulesTabBtn").click();
    cy.getBySelector("DefaultValueCheckbox").click();
    cy.getBySelector("DefaultValueInput").type("1000.50");
    cy.getBySelector("DefaultValueInput").contains("PHP");
    cy.getBySelector("InputRangeCheckbox").click();
    cy.getBySelector("MinValueInput").type("10");
    cy.getBySelector("MaxValueInput").type("100");
    cy.getBySelector("SubFieldFormAddFieldBtn").click();

    cy.getBySelector(`SubField_${fieldName}`).should("exist");
  });

  it("Adds a number sub field", () => {
    const fieldLabel = `Number`;
    const fieldName = `number`;

    cy.getBySelector("AddRepeaterSubFieldBtn").click();
    cy.getBySelector("FieldItem_number").click();

    cy.getBySelector("FieldFormInput_label").type(fieldLabel);

    cy.getBySelector("RulesTabBtn").click();
    cy.getBySelector("DefaultValueCheckbox").click();
    cy.getBySelector("DefaultValueInput").type("1000.50");
    cy.getBySelector("InputRangeCheckbox").click();
    cy.getBySelector("MinValueInput").type("10");
    cy.getBySelector("MaxValueInput").type("100");
    cy.getBySelector("SubFieldFormAddFieldBtn").click();

    cy.getBySelector(`SubField_${fieldName}`).should("exist");
  });

  it("Adds a boolean sub field", () => {
    const fieldLabel = `Boolean`;
    const fieldName = `boolean`;

    cy.getBySelector("AddRepeaterSubFieldBtn").click();

    cy.getBySelector("FieldItem_yes_no").click();

    cy.getBySelector("FieldFormInput_label").type(fieldLabel);
    cy.getBySelector("OptionLabel_0").type("Test option 1");
    cy.getBySelector("OptionLabel_1").type("Test option 2");

    cy.getBySelector("DeleteOption_0").should("not.exist");

    cy.getBySelector("RulesTabBtn").click();
    cy.getBySelector("DefaultValueCheckbox").click();
    cy.getBySelector("DefaultValueInput").find("button").first().click();
    cy.getBySelector("DefaultValueInput")
      .find("button")
      .first()
      .should("have.attr", "aria-pressed", "true");

    cy.getBySelector("SubFieldFormAddFieldBtn").click();
    cy.getBySelector(`SubField_${fieldName}`).should("exist");
  });

  it("Adds a dropdown sub field", () => {
    const SubFieldLabel = `Dropdown`;
    const SubFieldName = `dropdown`;

    cy.getBySelector("AddRepeaterSubFieldBtn").click();

    cy.getBySelector("FieldItem_dropdown").click();

    cy.getBySelector("FieldFormInput_label").type(SubFieldLabel);
    cy.getBySelector("OptionLabel_0").type("Option 1");
    cy.getBySelector("DropdownAddOption").click();
    cy.getBySelector("OptionLabel_1").type("Option 2");
    cy.getBySelector("DeleteOption_1").click();

    cy.getBySelector("RulesTabBtn").click();
    cy.getBySelector("DefaultValueCheckbox").click();
    cy.getBySelector("DefaultValueInput").click();
    cy.get("li[data-value='Option 1']").click();
    cy.getBySelector("DefaultValueInput")
      .find("#mui-component-select-defaultValue")
      .contains("Option 1");

    cy.getBySelector("SubFieldFormAddFieldBtn").click();

    cy.getBySelector(`SubField_${SubFieldName}`).should("exist");
  });

  it("Adds a color sub field", () => {
    const SubFieldLabel = `Color`;
    const SubFieldName = `color`;

    cy.getBySelector("AddRepeaterSubFieldBtn").click();
    cy.getBySelector("FieldItem_color").click();

    cy.getBySelector("FieldFormInput_label").type(SubFieldLabel);

    cy.getBySelector("RulesTabBtn").click();
    cy.getBySelector("DefaultValueCheckbox").click();
    cy.getBySelector("SubFieldFormAddFieldBtn").click();
    cy.contains("Required Field. Please enter a value.").should("exist");
    cy.getBySelector("DefaultValueCheckbox").click();
    cy.getBySelector("SubFieldFormAddFieldBtn").click();

    cy.getBySelector(`SubField_${SubFieldName}`).should("exist");
  });

  it("Adds a sort order sub field", () => {
    const SubFieldLabel = `Sort`;
    const SubFieldName = `sort`;

    cy.getBySelector("AddRepeaterSubFieldBtn").click();
    cy.getBySelector("FieldItem_sort").click();

    cy.getBySelector("FieldFormInput_label").type(SubFieldLabel);

    cy.getBySelector("RulesTabBtn").click();
    cy.getBySelector("DefaultValueCheckbox").click();
    cy.getBySelector("DefaultValueInput").type("12");
    cy.getBySelector("SubFieldFormAddFieldBtn").click();

    cy.getBySelector(`SubField_${SubFieldName}`).should("exist");
  });

  it("Adds an uuid sub field", () => {
    const SubFieldLabel = `UUID`;
    const SubFieldName = `uuid`;

    cy.getBySelector("AddRepeaterSubFieldBtn").click();
    cy.getBySelector("FieldItem_uuid").click();

    cy.getBySelector("FieldFormInput_label").type(SubFieldLabel);
    cy.getBySelector("SubFieldFormAddFieldBtn").click();
    cy.getBySelector(`SubField_${SubFieldName}`).should("exist");
  });

  it("Should save the added sub fields in the repeater field", () => {
    cy.getBySelector("FieldFormAddFieldBtn").click();
    cy.getBySelector(`Field_${fieldName}`).click();
    cy.getBySelector("SubFieldList")
      .find('[data-cy^="SubField_"]')
      .should("have.length", 13);
  });

  it("Should be able to add another field", () => {
    cy.getBySelector("AddRepeaterSubFieldBtn").click();
    cy.getBySelector("FieldItem_uuid").click();

    cy.getBySelector("FieldFormInput_label").type("UUID 2");
    cy.getBySelector("SubFieldFormAddAnotherFieldBtn").click();
    cy.getBySelector("SubFieldSelection").should("exist");
  });

  it("should not allow duplicate field labels", () => {
    cy.reload();
    cy.getBySelector("RepeaterFieldsTabBtn").click();
    cy.getBySelector("AddRepeaterSubFieldBtn").click();
    cy.getBySelector("FieldItem_uuid").click();
    cy.getBySelector("FieldFormInput_label").type("uuid");
    cy.getBySelector("SubFieldFormAddFieldBtn").click();
    cy.contains(
      "A field with this API/Parsley Reference already exists"
    ).should("exist");
    cy.getBySelector("FieldFormInput_label").clear().type("Unique Label");
    cy.getBySelector("SubFieldFormAddFieldBtn").click();
    cy.getBySelector("SubField_unique_label").should("exist");
  });

  it("Updates a sub field", () => {
    const newLabel = "Updated SubField Label";

    cy.getBySelector("SubField_unique_label").click();
    cy.getBySelector("FieldFormInput_label").clear().type(newLabel);
    cy.getBySelector("SubFieldFormAddFieldBtn").click();
    cy.contains(newLabel).should("exist");
  });

  it("Removes a sub field", () => {
    cy.getBySelector("SubField_unique_label").should("exist");
    cy.getBySelector("OpenFieldDropdown_unique_label").click();
    cy.getBySelector("DeactivateReactivateFieldDropdown_unique_label").click();
    cy.getBySelector("SubField_unique_label").should("not.exist");
  });

  it("sorts subfields with HTML5 drag/drop", () => {
    const dataTransfer = new DataTransfer();

    getOrder().then((before) => {
      expect(before.length).to.be.greaterThan(1);
      const sourceId = before[0];
      const targetId = before[1];

      cy.getBySelector("SubFieldList")
        .find('[data-cy^="SubField_"] .drag-handle')
        .eq(0)
        .trigger("dragstart", { dataTransfer });

      cy.getBySelector("SubFieldList")
        .find('[data-cy^="SubField_"] .drag-handle')
        .eq(1)
        .trigger("dragover", { dataTransfer })
        .trigger("drop", { dataTransfer });

      cy.getBySelector("SubFieldList")
        .find('[data-cy^="SubField_"]')
        .then(($rows) => [...$rows].map((el) => el.getAttribute("data-cy")))
        .should((after) => {
          expect(after[0]).to.eq(targetId);
          expect(after[1]).to.eq(sourceId);
        });
    });
  });

  after(() => {
    cy.location("pathname").then((pathname) => {
      const parts = pathname.split("/").filter((x) => x);
      const modelZUID = parts[1];
      cy.deleteModel(modelZUID);
    });
  });
});

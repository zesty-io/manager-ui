const options = { timeout: 20_000 };
const forceClick = { force: true };
const formatDate = (ts) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(ts));
describe("Content Specs", () => {
  const TIMESTAMP = Date.now();

  before(() => {
    // Seed content
    cy.task("seed:content", "fixtures/content.json").then(
      ({ model, items }) => {
        //Set modelZUID as Cypress env variable for global test access
        Cypress.env("modelZUID", model?.ZUID);
        //Set itemZUID as Cypress env variable for global test access
        Cypress.env("itemZUID", items[0]?.meta?.ZUID);
      }
    );
  });

  describe("editing content", () => {
    before(() => {
      cy.waitOn("/v1/content/models*", () => {
        cy.visit(
          `/content/${Cypress.env("modelZUID")}/${Cypress.env("itemZUID")}`
        );
      });
      cy.getBySelector("DuoModeToggle").click(forceClick);
    });

    it("Text Field", () => {
      cy.get(`[data-cy="field:text"] input`, options)
        .should("be.visible")
        .clear()
        .type(`${TIMESTAMP}`)
        .should("have.value", `${TIMESTAMP}`);
    });

    it("WYSIWYG Basic Field", () => {
      cy.get('[data-cy="field:wysiwyg_basic"]').should("exist");
      cy.iframe("#wysiwyg_basic_ifr")
        .should("be.visible")
        .click()
        .type(`{selectall}{backspace}${TIMESTAMP}`)
        .contains(`${TIMESTAMP}`);
    });

    // TODO: implement add image functionality, select and verify image ZUID is in field
    it.skip("Image Field", () => {
      cy.get('[data-cy="field:images"]').should("exist");
    });

    it("Textarea Field", () => {
      /**
        MUI *intentionally* renders 2 textareas to the DOM; one hidden and
        one visible. The visible one is the one we are interested in.
        https://github.com/mui/material-ui/pull/15436
      */
      cy.get(
        '[data-cy="field:textarea"] textarea:not([readonly]):not([hidden])'
      )
        .click()
        .clear()
        .type(`${TIMESTAMP}`)
        .should("have.value", `${TIMESTAMP}`);
    });

    it("WYSIWYG Advanced Field", () => {
      cy.get('[data-cy="field:wysiwyg_advanced"]').should("exist");

      cy.iframe("#wysiwyg_advanced_ifr")
        .should("be.visible")
        .click()
        .type(`{selectall}{backspace}${TIMESTAMP}`)
        .contains(`${TIMESTAMP}`);
    });

    it("Article Writer Field", () => {
      cy.get('[data-cy="field:article_writer"] .ProseMirror')
        .clear()
        .type(`${TIMESTAMP}`)
        .contains(`${TIMESTAMP}`);
    });

    it("Markdown Field", () => {
      cy.get("[data-cy='field:markdown'] textarea")
        .clear()
        .type(TIMESTAMP)
        .should("have.value", TIMESTAMP);
    });

    it("Dropdown Field", () => {
      cy.get("[data-cy='field:dropdown']")
        .find(".MuiAutocomplete-root input")
        .click();

      cy.get(".MuiAutocomplete-option").first().click();
      cy.get("[data-cy='field:dropdown']")
        .find(".MuiAutocomplete-root input")
        .should("have.value", "Custom Option One");

      cy.get("[data-cy='field:dropdown']")
        .find(".MuiAutocomplete-root input")
        .click();
      cy.get(".MuiAutocomplete-option").last().click();
      cy.get("[data-cy='field:dropdown']")
        .find(".MuiAutocomplete-root input")
        .should("have.value", "Custom Option Two");
    });

    it("Url Field", () => {
      cy.get("[data-cy='field:link'] input")
        .clear()
        .type(`http://www.zesty.pw/${TIMESTAMP}`)
        .should("have.value", `http://www.zesty.pw/${TIMESTAMP}`);
    });

    /**
     * FIXME: currently skipping test as it is inconsistent on whether the API request
     * results in options being shown in the dropdown. This field is going to be swapped
     * for a MUI alternative so waiting on that update before reactivating test.
     */
    it.skip("Internal Link Field", () => {
      cy.waitOn(
        {
          pathname: "/v1/search/items",
          query: {
            q: "homepage",
            order: "created",
            dir: "DESC",
            limit: "100",
          },
        },
        () => {
          // filter select list and wait on api data
          cy.get("#12-10741c-s5jkwg .Select")
            .click()
            .find("input")
            .type("homepage");
        }
      );

      // select option
      cy.get("#12-10741c-s5jkwg .Select .options li:first-child").click();

      cy.contains("#12-10741c-s5jkwg .Select strong", "Homepage");
    });

    // TODO: Need to confirm toggling of value
    it("Yes/No Field", () => {
      // Click the "Yes" button to select it
      cy.get("[data-cy='field:yes_no'] button")
        .contains("Yes")
        .click({ force: true });

      // Check if the "Yes" button has the ".Mui-selected" class
      cy.get("[data-cy='field:yes_no'] button")
        .contains("Yes")
        .should("have.class", "Mui-selected");

      // Click the "No" button to select it
      cy.get("[data-cy='field:yes_no'] button").contains("No").click();

      // Check if the "No" button has the ".Mui-selected" class
      cy.get("[data-cy='field:yes_no'] button")
        .contains("No")
        .should("have.class", "Mui-selected");
    });

    it("Yes/No Field: Does not allow user to deselect value", () => {
      // Click the "No" button to deselect it
      cy.get("[data-cy='field:yes_no'] button").contains("No").click();

      // Check again if neither "Yes" nor "No" buttons have the ".Mui-selected" class
      cy.get("[data-cy='field:yes_no'] button")
        .contains("Yes")
        .should("not.have.class", "Mui-selected");
      cy.get("[data-cy='field:yes_no'] button")
        .contains("No")
        .should("have.class", "Mui-selected");
    });

    // TODO: Need to confirm toggling of value
    it("Yes/No Field: Custom Options", () => {
      cy.get("[data-cy='field:yes_no_with_custom_values'] button")
        .contains("Custom One")
        .click();
    });

    it("Fontawesome Field", () => {
      cy.get("[data-cy='field:fontawesome'] input")
        .focus()
        .clear()
        .type(`fa fa-link`)
        .should("have.value", `fa fa-link`);
    });

    it("Number Field", () => {
      // NOTE: the timestamp is too large for the 'small int' column in the DB
      // limit is 4294967295
      cy.get("[data-cy='field:number'] input[type=text]")
        .focus()
        /*
          input type='number 'cannot be empty so rather than whitespace, it'd have a value of 0
          to solve for this {selectall} is used to overwrite value as opposed to clear()
        */
        .type("{selectall}")
        .type("999")
        .should("have.value", "999");
    });

    it("Currency Field", () => {
      cy.get("[data-cy='field:currency'] input")
        .focus()
        .type("{selectall}")
        .type("100.00")
        .should("have.value", "100.00");
    });

    it("Color Field", () => {
      cy.get("[data-cy='field:color'] input[type='color']").should("exist");
      //.type("#59CD2F", {force:true})
      // .then($input => {
      //   $input.value = "#59CD2F";
      //   return $input;
      // })
      //.should("have.value", "#59CD2F");
    });

    it("UUID Field", () => {
      cy.get("[data-cy='field:uuid'] input[readonly]")
        // This is a unique value generated on item creation and should never change
        .invoke("val")
        .should("not.be.empty");
    });

    // TODO: implement file selection; select file and confirm it's ZUID set
    it.skip("File Field", () => {
      cy.get("[data-cy='field:files']").should("exist");
    });

    it("Sort Field", () => {
      cy.get("[data-cy='field:sort'] input[type='text']")
        .clear()
        .type("{rightArrow}12");

      cy.get("[data-cy='field:sort'] button").eq(1).click();

      cy.get("[data-cy='field:sort'] input[type='text']").should(
        "have.value",
        "11"
      );

      cy.get("[data-cy='field:sort'] button").last().click();

      cy.get("[data-cy='field:sort'] input[type='text']").should(
        "have.value",
        "12"
      );
    });

    // Skipping relationship tests due to current fetching flow limitation
    it.skip("One to many Field", () => {
      // Adds new relationship
      cy.waitOn("/v1/content/models/6-e3d0e0-965qp6/items*", () => {
        cy.get(
          "[data-cy='field:one_to_many'] .MuiAutocomplete-popupIndicator"
        ).click();
      });

      cy.get("[role=listbox] [data-option-index=1]").click({ force: true });

      // Removes new relationship
      cy.get(
        "[data-cy='field:one_to_many'] .MuiAutocomplete-popupIndicator"
      ).click();
      cy.get("[role=listbox] [data-option-index=1]").click({ force: true });
    });

    it.skip("One to one Field", () => {
      // allow relationships to load
      cy.intercept(
        "/v1/content/models/6-675028-84dq4s/items?lang=en-US&limit=100&page=1"
      ).as("loadRelatedItems");
      cy.get("[data-cy='field:one_to_one'] input").clear();
      cy.wait("@loadRelatedItems");

      cy.get("[role=presentation] [data-option-index=1]").click();

      cy.get("[data-cy='field:one_to_one'] input").should(
        "have.value",
        "zesty.pw"
      );
    });

    it("Saves Content updates", () => {
      cy.waitOn("/v1/content/models/*/items/*", () => {
        cy.get("#SaveItemButton").should("be.enabled").click();
      });

      cy.get("[data-cy=toast]").contains("Item Saved").should("exist");
    });
  });

  describe("Media field", () => {
    before(() => {
      cy.waitOn("/v1/content/models*", () => {
        cy.visit(
          `/content/${Cypress.env("modelZUID")}/${Cypress.env("itemZUID")}`
        );
      });
    });

    it("renders an image with a url from a template", function () {
      cy.get('[data-cy="field:images"]').scrollIntoView();
      cy.get('[data-cy="field:images"]')
        .find('[data-cy="file-preview"]')
        .eq(0)
        .find("img")
        .should("have.attr", "src")
        .and(
          "contain",
          "https://8xbq19z1.media.zestyio.com/San-Diego-At-Night.png"
        );
    });

    it("opens the bynder modal", () => {
      cy.get(
        `[data-cy="field:images"] [data-cy="selectFromMediaButton"]`,
        options
      )
        .should("be.enabled")
        .click();
      cy.get('[data-cy="closeMediaDialogBtn"]', options).click();
      cy.get('[data-cy="field:images"]')
        .find('[data-cy="addFromBynderBtn"]')
        .click();

      cy.get('[data-test-id="CompactViewContainer"] [data-testid="root"]')
        .shadow()
        .as("shadow");
      cy.get("@shadow")
        .find('.card-list div [data-testid="asset-card"] button:eq(0)')
        .click();
      cy.get("@shadow").find('[data-testid="add-button"]').click();

      cy.get('[data-test-id="CompactViewContainer"]').should("not.exist");
    });

    it("renders bynder asset previews", () => {
      cy.get('[data-cy="field:images"]')
        .find('[data-cy="mediaItem"]')
        .last()
        .find('[data-cy="bynderAssetIndicator"]')
        .should("exist");
    });
  });

  describe("Date Field", () => {
    before(() => {
      cy.waitOn("/v1/content/models*", () => {
        cy.visit(
          `/content/${Cypress.env("modelZUID")}/${Cypress.env("itemZUID")}`
        );
      });
    });

    it("should be able to clear date entries", () => {
      cy.get("[data-cy='field:date']")
        .find("[data-cy='dateFieldClearButton']")
        .click();
      cy.get("[data-cy='field:date']")
        .find("[data-cy='datePickerInputField']")
        .find("input")
        .should("have.value", "");
    });

    it("should be able to auto-fill empty date fields on click", () => {
      cy.get("[data-cy='field:date']")
        .find('[data-cy="datePickerInputField"]')
        .click();

      cy.get("[data-cy='field:date'] input").should(
        "have.value",
        formatDate(TIMESTAMP)
      );
    });
  });

  describe("Date & Time Field", () => {
    before(() => {
      cy.waitOn("/v1/content/models*", () => {
        cy.visit(
          `/content/${Cypress.env("modelZUID")}/${Cypress.env("itemZUID")}`
        );
      });
    });

    it("should be able to clear date and time entries", () => {
      cy.get("[data-cy='field:datetime']")
        .find("[data-cy='dateFieldClearButton']")
        .click();
      cy.get("[data-cy='field:datetime']")
        .find("[data-cy='datePickerInputField']")
        .find("input")
        .should("have.value", "");
      cy.get("[data-cy='field:datetime']")
        .find("[data-cy='dateTimeInputField']")
        .find("input")
        .should("have.value", "");
    });

    it("should be able to auto-fill the date and time when field is empty", () => {
      cy.get("[data-cy='field:datetime']")
        .find("[data-cy='dateTimeInputField']")
        .click();
      cy.get("[data-cy='field:datetime']")
        .find("[data-cy='datePickerInputField']")
        .find("input")
        .should("have.value", formatDate(TIMESTAMP));
      cy.get("[data-cy='field:datetime']")
        .find("[data-cy='dateTimeInputField']")
        .find("input")
        .should("have.value", "12:00 AM");
    });

    it("should allow a user to select a time from the dropdown", () => {
      cy.get("[data-cy='field:datetime']")
        .find("[data-cy='dateTimeInputField']")
        .click();
      cy.get(".MuiAutocomplete-listbox>.MuiAutocomplete-option").eq(1).click();
      cy.get("[data-cy='field:datetime']")
        .find("[data-cy='dateTimeInputField']")
        .find("input")
        .should("have.value", "12:15 AM");
    });

    it("should allow a user to manually type in a time", () => {
      cy.get("[data-cy='field:datetime']")
        .find("[data-cy='dateTimeInputField']")
        .find("input")
        .type("{selectAll}{del}11:00 pm")
        .blur();
      cy.get("[data-cy='field:datetime']")
        .find("[data-cy='dateTimeInputField']")
        .find("input")
        .should("have.value", "11:00 pm");
    });

    it("should reset to last saved valid time when user types in an invalid time", () => {
      cy.get("[data-cy='field:datetime']")
        .find("[data-cy='dateTimeInputField']")
        .find("input")
        .type("{selectAll}{del}asdasdasdasdas")
        .blur();
      cy.get("[data-cy='field:datetime']")
        .find("[data-cy='dateTimeInputField']")
        .find("input")
        .should("have.value", "11:00 PM");
    });
  });

  describe("Block Selector Field", () => {
    before(() => {
      cy.waitOn("/v1/content/models*", () => {
        cy.visit(
          `/content/${Cypress.env("modelZUID")}/${Cypress.env("itemZUID")}`
        );
      });
    });

    it("Sets a block variant", function () {
      cy.getBySelector("BlockSelectorModelField", { timeout: 10000 })
        .find("input")
        .click();
      cy.get(".MuiAutocomplete-popper .MuiAutocomplete-option")
        .contains("Starter Block", { matchCase: false })
        .click();

      cy.getBySelector("BlockSelectorVariantField", { timeout: 10000 }).click();
      cy.getBySelector("Variant_0").click();
      cy.getBySelector("BlockFieldVariantPreview").should("exist");
    });
  });

  context("One to one field", () => {
    before(() => {
      cy.waitOn("/v1/content/models*", () => {
        cy.visit(
          `/content/${Cypress.env("modelZUID")}/${Cypress.env("itemZUID")}`
        );
      });

      cy.getBySelector("DuoModeToggle", { timeout: 40_000 }).click(forceClick);
    });

    it("can only select/add one item", () => {
      cy.get('[data-cy="add-relational-item-button"]', options)
        .contains("Add Existing One to One", { matchCase: false })
        .click();

      cy.get(".MuiDataGrid-row:eq(0) input", options).click(forceClick);
      cy.get(".MuiDataGrid-row:eq(1) input", options).click(forceClick);

      cy.get(".MuiDataGrid-row input:checked", options).should(
        "have.length",
        1
      );
      cy.get('[data-cy="done-selecting-item-button"]', options).click(
        forceClick
      );
    });

    it("can publish an item", () => {
      cy.get(
        "[data-cy='field:one_to_one'] [data-cy='active-relational-item-more-button']"
      )
        .scrollIntoView()
        .should("be.enabled")
        .click(forceClick);
      cy.getBySelector("active-relational-item-publish-now-button").click();
      cy.getBySelector("ConfirmPublishModal").should("exist");
      cy.getBySelector("CancelPublishButton").click();
    });

    it("can schedule publish an item", () => {
      cy.get(
        "[data-cy='field:one_to_one'] [data-cy='active-relational-item-more-button']"
      )
        .scrollIntoView()
        .should("be.enabled")
        .click(forceClick);
      cy.getBySelector(
        "active-relational-item-schedule-publish-button"
      ).click();
      cy.getBySelector("SchedulePublishModal").should("exist");
      cy.getBySelector("CancelSchedulePublishButton").click();
    });

    it("can remove the selected item", () => {
      cy.get(
        "[data-cy='field:one_to_one'] [data-cy='active-relational-item-more-button']"
      )
        .scrollIntoView()
        .should("be.enabled")
        .click(forceClick);
      cy.getBySelector("active-relational-item-remove-item-button").click();
      cy.get(
        "[data-cy='field:one_to_one'] [data-cy='active-relational-item']"
      ).should("not.exist");
    });
  });

  context("One to many field", () => {
    before(() => {
      cy.waitOn("/v1/content/models*", () => {
        cy.visit(
          `/content/${Cypress.env("modelZUID")}/${Cypress.env("itemZUID")}`
        );
      });

      cy.getBySelector("DuoModeToggle", { timeout: 40000 }).click(forceClick);
    });

    it("can add multiple items", () => {
      cy.get(
        "[data-cy='field:one_to_many'] [data-cy='add-relational-item-button']"
      )
        .should("be.enabled")
        .click();

      // cy.wait("@fetchItems");

      [...Array(3)].forEach((_, i) => {
        cy.get(".MuiDataGrid-row").eq(i).find("input").click();
      });
      cy.getBySelector("selected-count").contains("3 selected");
      cy.getBySelector("done-selecting-item-button").click();
      cy.get(
        "[data-cy='field:one_to_many'] [data-cy='active-relational-item']"
      ).should("have.length", 3);
    });

    it("can remove the selected item", () => {
      cy.get(
        "[data-cy='field:one_to_many'] [data-cy='active-relational-item-more-button']"
      )
        .first()
        .click(forceClick);
      cy.getBySelector("active-relational-item-remove-item-button").click(
        forceClick
      );
      cy.get(
        "[data-cy='field:one_to_many'] [data-cy='active-relational-item']"
      ).should("have.length", 2);
    });

    it("can create & add new item", () => {
      cy.get("[data-cy='field:one_to_many']").scrollIntoView();
      cy.get(
        "[data-cy='field:one_to_many'] [data-cy='create-new-relational-item-button']"
      )
        .should("be.enabled")
        .click();

      cy.get(
        "#createNewItemDialog [data-cy='field:node-sdk_updateItem_1733876716599']"
      )
        .find("input")
        .type(`Test Item ${TIMESTAMP}`);
      cy.get("#createNewItemDialog [data-cy='field:description']")
        .find("textarea")
        .first()
        .type(`Test Item ${TIMESTAMP}`);
      cy.getBySelector("CreateItemSaveButton").click();

      cy.get(
        "[data-cy='field:one_to_many'] [data-cy='active-relational-item']"
      ).should("have.length", 3);
    });

    it("preserves selected items while filtering", () => {
      cy.get(
        "[data-cy='field:one_to_many'] [data-cy='add-relational-item-button']"
      )
        .should("be.enabled")
        .click();

      cy.getBySelector("relational-fields-search-input")
        .find("input")
        .type("someveryrandomtextthatshouldnotmatchanything");
      cy.contains("3 selected").should("exist");
    });
  });

  context("Repeater Field", () => {
    before(() => {
      cy.intercept("GET", "**/v1/content/models").as("getModels");
      cy.intercept("GET", "**/v1/content/models/*/fields**").as("getFields");
      cy.intercept("GET", "**/v1/content/items/publishings**").as(
        "getPublishings"
      );

      cy.visit(
        `/content/${Cypress.env("modelZUID")}/${Cypress.env("itemZUID")}`
      );
      cy.wait(["@getModels", "@getPublishings", "@getFields"]);

      cy.getBySelector("DuoModeToggle").should("exist").click(forceClick);
    });

    it("is should not be able to add an item if required fields are missing", () => {
      cy.getBySelector("AddRepeaterRowItemBtn")
        .scrollIntoView()
        .click(forceClick);
      cy.getBySelector("SaveRepeaterRowItemBtn")
        .scrollIntoView()
        .should("be.enabled")
        .click();
      cy.contains("Required Field. Please enter a value.").should("exist");
    });

    it("should autofill default values", () => {
      cy.getBySelector("subfield:multiline_text")
        .find("textarea")
        .should("have.value", "default value");
    });

    it("should be able to add a new row item", () => {
      cy.getBySelector("subfield:single_line_text")
        .find("input")
        .clear()
        .type("single line text value");
      cy.iframe("#wysiwyg_ifr").click().type("wysiwyg text value");
      cy.getBySelector("subfield:markdown")
        .find("textarea")
        .clear()
        .type("markdown value");

      // Add media image from bynder
      cy.getBySelector("subfield:media")
        .find('[data-cy="addFromBynderBtn"]')
        .click();
      cy.get('[data-test-id="CompactViewContainer"] [data-testid="root"]')
        .shadow()
        .as("shadow");
      cy.get("@shadow")
        .find('.card-list div [data-testid="asset-card"] button:eq(0)')
        .click();
      cy.get("@shadow").find('[data-testid="add-button"]').click();

      cy.getBySelector("subfield:url")
        .find("input")
        .clear()
        .type("https://zesty.io");
      cy.getBySelector("subfield:number").find("input").clear().type("999");
      cy.getBySelector("subfield:currency")
        .find("input")
        .clear()
        .type("100.00");
      cy.getBySelector("subfield:boolean")
        .contains("Yes")
        .click({ force: true });

      // Set dropdown value
      cy.getBySelector("subfield:dropdown")
        .find(".MuiAutocomplete-root input")
        .click();
      cy.get(".MuiAutocomplete-option").first().click();

      cy.getBySelector("subfield:sort").find("input").clear().type("99");

      cy.getBySelector("subfield:date")
        .find('[data-cy="datePickerInputField"] input')
        .clear({ force: true })
        .type("Jan 15 2025{enter}")
        .should("have.value", "Jan 15, 2025");
      cy.getBySelector("subfield:datetime")
        .find('[data-cy="datePickerInputField"] input')
        .clear({ force: true })
        .type("Jan 15 2025{enter}")
        .should("have.value", "Jan 15, 2025");

      cy.getBySelector("SaveRepeaterRowItemBtn").scrollIntoView().click();
      cy.getBySelector("field:repeater")
        .find(".MuiDataGrid-row")
        .should("have.length", 1);
    });

    it("should populate date pickers with saved values when editing an existing row", () => {
      // Add a row with date values so this test is self-contained
      cy.getBySelector("AddRepeaterRowItemBtn")
        .scrollIntoView()
        .should("exist")
        .click();
      cy.getBySelector("subfield:date")
        .find('[data-cy="datePickerInputField"] input')
        .clear({ force: true })
        .type("Jan 15 2025{enter}")
        .should("have.value", "Jan 15, 2025");
      cy.getBySelector("subfield:datetime")
        .find('[data-cy="datePickerInputField"] input')
        .clear({ force: true })
        .type("Jan 15 2025{enter}")
        .should("have.value", "Jan 15, 2025");
      cy.getBySelector("SaveRepeaterRowItemBtn")
        .scrollIntoView()
        .should("exist")
        .click();

      // Reopen the row just saved to verify date values round-trip correctly
      cy.getBySelector("field:repeater")
        .find(".MuiDataGrid-row")
        .last()
        .click({ force: true });

      cy.getBySelector("subfield:date")
        .find('[data-cy="datePickerInputField"] input')
        .should("have.value", "Jan 15, 2025");

      cy.getBySelector("subfield:datetime")
        .find('[data-cy="datePickerInputField"] input')
        .should("have.value", "Jan 15, 2025");

      // Delete the row to keep downstream tests isolated (they expect exactly 1 row from the "add" test)
      cy.getBySelector("RemoveRepeaterRowItemBtn").click();
    });

    it("should be able to update a row item", () => {
      const oldValue = "update my value";
      const updatedValue = "I am now updated";

      // Add a new row item
      cy.getBySelector("AddRepeaterRowItemBtn")
        .scrollIntoView()
        .click(forceClick);
      cy.getBySelector("subfield:single_line_text")
        .find("input")
        .clear()
        .type(oldValue);
      cy.getBySelector("subfield:url")
        .find("input")
        .clear()
        .type("https://zesty.io");
      cy.getBySelector("SaveRepeaterRowItemBtn").scrollIntoView().click();

      // Verify old value
      cy.getBySelector("field:repeater")
        .find(".MuiDataGrid-row")
        .last()
        .find("[data-field='single_line_text']")
        .should("contain.text", oldValue);

      // Update the value
      cy.getBySelector("field:repeater")
        .find(".MuiDataGrid-row")
        .last()
        .click({ force: true });
      cy.getBySelector("subfield:single_line_text")
        .find("input")
        .clear()
        .type(updatedValue);
      cy.wait(500);
      cy.getBySelector("SaveRepeaterRowItemBtn").scrollIntoView().click();

      // Verify updated value
      cy.getBySelector("field:repeater")
        .find(".MuiDataGrid-row")
        .eq(1)
        .find("[data-field='single_line_text']")
        .should("contain.text", updatedValue);
    });

    it("should persist repeater rows after saving and reload", () => {
      cy.get("#SaveItemButton").should("be.enabled").click();
      cy.get("[data-cy=toast]").contains("Item Saved").should("exist");

      cy.reload();
      cy.getBySelector("DuoModeToggle", { timeout: 40000 }).click(forceClick);

      cy.getBySelector("field:repeater")
        .find(".MuiDataGrid-row")
        .should("have.length", 2);

      cy.getBySelector("field:repeater")
        .find(".MuiDataGrid-row")
        .eq(0)
        .find("[data-field='single_line_text']")
        .should("contain.text", "single line text value");

      cy.getBySelector("field:repeater")
        .find(".MuiDataGrid-row")
        .eq(1)
        .find("[data-field='single_line_text']")
        .should("contain.text", "I am now updated");
    });

    it("should be able to delete the last row", () => {
      cy.getBySelector("field:repeater")
        .find(".MuiDataGrid-row")
        .should("have.length", 2);

      cy.getBySelector("field:repeater")
        .find(".MuiDataGrid-row")
        .eq(1)
        .find("[data-field='single_line_text']")
        .should("contain.text", "I am now updated");

      cy.getBySelector("field:repeater")
        .find(".MuiDataGrid-row")
        .eq(1)
        .click({ force: true });

      cy.getBySelector("RemoveRepeaterRowItemBtn").click();

      cy.getBySelector("field:repeater")
        .find(".MuiDataGrid-row")
        .should("have.length", 1);

      cy.getBySelector("field:repeater")
        .find(".MuiDataGrid-row")
        .eq(0)
        .find("[data-field='single_line_text']")
        .should("contain.text", "single line text value");

      cy.getBySelector("field:repeater")
        .find("[data-field='single_line_text']")
        .should("not.contain.text", "I am now updated");
    });

    it("should bulk remove checked rows", () => {
      cy.getBySelector("AddRepeaterRowItemBtn")
        .scrollIntoView()
        .click(forceClick);
      cy.getBySelector("subfield:single_line_text")
        .find("input")
        .clear()
        .type("bulk remove row");
      cy.getBySelector("subfield:url")
        .find("input")
        .clear()
        .type("https://zesty.io");
      cy.getBySelector("SaveRepeaterRowItemBtn").scrollIntoView().click();

      cy.getBySelector("field:repeater")
        .find(".MuiDataGrid-row")
        .should("have.length", 2);

      cy.getBySelector("field:repeater")
        .find(".MuiDataGrid-row")
        .eq(1)
        .find("[data-field='single_line_text']")
        .should("contain.text", "bulk remove row");

      cy.getBySelector("field:repeater")
        .find(".MuiDataGrid-row")
        .eq(1)
        .find('input[type="checkbox"]')
        .check({ force: true });

      cy.getBySelector("BulkRemoveRepeaterFieldRowsBtn").click({ force: true });

      cy.getBySelector("field:repeater")
        .find(".MuiDataGrid-row")
        .should("have.length", 1);

      cy.getBySelector("field:repeater")
        .find(".MuiDataGrid-row")
        .eq(0)
        .find("[data-field='single_line_text']")
        .should("contain.text", "single line text value");

      cy.getBySelector("field:repeater")
        .find("[data-field='single_line_text']")
        .should("not.contain.text", "bulk remove row");
    });
  });
});

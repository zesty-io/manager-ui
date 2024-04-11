import moment from "moment";

describe("Content Specs", () => {
  const TIMESTAMP = Date.now();

  describe("editing content", () => {
    before(() => {
      cy.waitOn("/v1/content/models*", () => {
        cy.visit("/content/6-556370-8sh47g/7-b939a4-457q19");
      });
      cy.getBySelector("DuoModeToggle").click();
    });

    it("Text Field", () => {
      cy.get("#12-13d590-9v2nr2 input")
        .clear()
        .type(`${TIMESTAMP}`)
        .should("have.value", `${TIMESTAMP}`);
    });

    it("WYSIWYG Basic Field", () => {
      cy.get("#12-6d41d0-n10vtc").should("exist");
      cy.iframe("#wysiwyg_basic_ifr")
        .should("be.visible")
        .click()
        .type(`{selectall}{backspace}${TIMESTAMP}`)
        .contains(`${TIMESTAMP}`);
    });

    // TODO: implement add image functionality, select and verify image ZUID is in field
    it.skip("Image Field", () => {
      cy.get("#12-1c94d4-pg8dvx").should("exist");
    });

    it("Textarea Field", () => {
      /**
        MUI *intentionally* renders 2 textareas to the DOM; one hidden and
        one visible. The visible one is the one we are interested in.
        https://github.com/mui/material-ui/pull/15436
      */
      cy.get("#12-b5d7b4-n81s15 textarea:not([readonly]):not([hidden])")
        .click()
        .clear()
        .type(`${TIMESTAMP}`)
        .should("have.value", `${TIMESTAMP}`);
    });

    it("Date Field", () => {
      cy.get("#12-63ab04-0nkwcc")
        .find("[data-cy='dateFieldClearButton']")
        .click();

      cy.get("#12-63ab04-0nkwcc")
        .find('[data-cy="datePickerInputField"]')
        .click();

      cy.get("#12-63ab04-0nkwcc input").should(
        "have.value",
        moment(TIMESTAMP).format("MMM DD, YYYY")
      );

      cy.get("#12-63ab04-0nkwcc")
        .find('[data-cy="datePickerInputField"]')
        .click();
    });

    it("WYSIWYG Advanced Field", () => {
      cy.get("#12-be261c-4q7s81").should("exist");

      cy.iframe("#wysiwyg_advanced_ifr")
        .should("be.visible")
        .click()
        .type(`{selectall}{backspace}${TIMESTAMP}`)
        .contains(`${TIMESTAMP}`);
    });

    it("Article Writer Field", () => {
      cy.get("#12-fc9e18-wh9l82 .ProseMirror")
        .clear()
        .type(`${TIMESTAMP}`)
        .contains(`${TIMESTAMP}`);
    });

    it("Markdown Field", () => {
      cy.get("#12-796b3c-8n93rc textarea")
        .clear()
        .type(TIMESTAMP)
        .should("have.value", TIMESTAMP);
    });

    it("Dropdown Field", () => {
      cy.get("#12-f3152c-kjz88l").find(".MuiSelect-select").click();

      cy.get("[role=presentation]")
        .find('[data-value="custom_option_one"]')
        .click();

      cy.contains("#12-f3152c-kjz88l .MuiSelect-select", "Custom Option One");

      cy.get("#12-f3152c-kjz88l").find(".MuiSelect-select").click();
      cy.get("[role=presentation]")
        .find('[data-value="custom_option_two"]')
        .click();

      cy.contains("#12-f3152c-kjz88l .MuiSelect-select", "Custom Option Two");
    });

    it("Url Field", () => {
      cy.get("#12-8ed554-nxmbw8 input")
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
      cy.get("#12-575f7c-trw1w3 button").contains("Yes").click({ force: true });

      // Check if the "Yes" button has the ".Mui-selected" class
      cy.get("#12-575f7c-trw1w3 button")
        .contains("Yes")
        .should("have.class", "Mui-selected");

      // Click the "No" button to select it
      cy.get("#12-575f7c-trw1w3 button").contains("No").click();

      // Check if the "No" button has the ".Mui-selected" class
      cy.get("#12-575f7c-trw1w3 button")
        .contains("No")
        .should("have.class", "Mui-selected");
    });

    it("Yes/No Field: Does not allow user to deselect value", () => {
      // Click the "No" button to deselect it
      cy.get("#12-575f7c-trw1w3 button").contains("No").click();

      // Check again if neither "Yes" nor "No" buttons have the ".Mui-selected" class
      cy.get("#12-575f7c-trw1w3 button")
        .contains("Yes")
        .should("not.have.class", "Mui-selected");
      cy.get("#12-575f7c-trw1w3 button")
        .contains("No")
        .should("have.class", "Mui-selected");
    });

    // TODO: Need to confirm toggling of value
    it("Yes/No Field: Custom Options", () => {
      cy.get("#12-8178cc-z37vq1 button").contains("Custom One").click();
    });

    it("Fontawesome Field", () => {
      cy.get("#12-57a878-5nqndp input")
        .focus()
        .clear()
        .type(`fa fa-link`)
        .should("have.value", `fa fa-link`);
    });

    it("Number Field", () => {
      // NOTE: the timestamp is too large for the 'small int' column in the DB
      // limit is 4294967295
      cy.get("#12-9b96ec-tll2gn input[type=text]")
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
      cy.get("#12-b35c68-jd1s8s input[type=number]")
        .focus()
        .clear()
        .type("100.00")
        .should("have.value", "100.00");
    });

    it("Color Field", () => {
      cy.get('#12-eb8684-zwq6hk input[type="color"]').should("exist");
      //.type("#59CD2F", {force:true})
      // .then($input => {
      //   $input.value = "#59CD2F";
      //   return $input;
      // })
      //.should("have.value", "#59CD2F");
    });

    it("UUID Field", () => {
      cy.get("#12-f72938-8n8vqs input[readonly]")
        // This is a unique value generated on item creation and should never change
        .should("have.value", "731a0b2f-e3f9-44bf-b142-59488c0834e9");
    });

    // TODO: implement file selection; select file and confirm it's ZUID set
    it.skip("File Field", () => {
      cy.get("#12-178fe8-nf6mfn").should("exist");
    });

    it("Sort Field", () => {
      cy.get("#12-4e1914-kcqznz input[type='text']")
        .clear()
        .type("{rightArrow}12");

      cy.get("#12-4e1914-kcqznz button").first().click();

      cy.get("#12-4e1914-kcqznz input[type='text']").should("have.value", "11");

      cy.get("#12-4e1914-kcqznz button").last().click();

      cy.get("#12-4e1914-kcqznz input[type='text']").should("have.value", "12");
    });

    // Skipping relationship tests due to current fetching flow limitation
    it.skip("One to many Field", () => {
      // cy.get("#12-269a28-1bkm34 input").clear();

      // Adds new relationship
      cy.waitOn("/v1/content/models/6-e3d0e0-965qp6/items*", () => {
        cy.get("#12-269a28-1bkm34 .MuiAutocomplete-popupIndicator").click();
      });

      cy.get("[role=listbox] [data-option-index=1]").click({ force: true });

      // Removes new relationship
      cy.get("#12-269a28-1bkm34 .MuiAutocomplete-popupIndicator").click();
      cy.get("[role=listbox] [data-option-index=1]").click({ force: true });
    });

    it.skip("One to one Field", () => {
      // allow relationships to load
      cy.intercept(
        "/v1/content/models/6-675028-84dq4s/items?lang=en-US&limit=100&page=1"
      ).as("loadRelatedItems");
      cy.get("#12-edee00-6zb866 input").clear();
      cy.wait("@loadRelatedItems");

      cy.get("[role=presentation] [data-option-index=1]").click();

      cy.get("#12-edee00-6zb866 input").should("have.value", "zesty.pw");
    });

    it("Saves Content updates", () => {
      // cy.intercept('POST','').as('saveItem')
      cy.get("#SaveItemButton").click();
      // cy.wait('@saveItem')

      cy.get("[data-cy=toast]").contains("Saved a new ").should("exist");
    });
  });

  describe("Media field", () => {
    before(() => {
      cy.waitOn("/v1/content/models*", () => {
        cy.visit("/content/6-556370-8sh47g/7-b939a4-457q19");
      });
    });

    it("renders an image with a url from a template", () => {
      cy.get("#12-1c94d4-pg8dvx")
        .find('[data-cy="file-preview"]')
        .eq(3)
        .find("img")
        .should(
          "have.attr",
          "src",
          "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/SNice.svg/1200px-SNice.svg.png?width=80&optimize=high"
        );
    });

    it("opens the bynder modal", () => {
      cy.get("#12-1c94d4-pg8dvx").find('[data-cy="addFromBynderBtn"]').click();
      cy.get('[data-test-id="CompactViewContainer"]')
        .eq(2)
        .find('[data-testid="root"]')
        .should("exist");

      // Close modal
      cy.get('[data-test-id="CompactViewContainer"]')
        .eq(2)
        .find('[data-testid="root"]')
        .shadow()
        .find('button[title="Close"]')
        .click();
      cy.get('[data-test-id="CompactViewContainer"]')
        .eq(2)
        .find('[data-testid="root"]')
        .should("not.exist");
    });

    it("renders bynder asset previews", () => {
      cy.get("#12-1c94d4-pg8dvx")
        .find('[data-cy="mediaItem"]')
        .last()
        .find('[data-cy="bynderAssetIndicator"]')
        .should("exist");
    });
  });

  describe("Date & Time Field", () => {
    before(() => {
      cy.waitOn("/v1/content/models*", () => {
        cy.visit("/content/6-556370-8sh47g/7-b939a4-457q19");
      });
    });

    it("should be able to clear date and time entries", () => {
      // cy.get("#12-f3db44-c8kt0q button").click();
      cy.get("#12-f3db44-c8kt0q")
        .find("[data-cy='datePickerInputField']")
        .find("input")
        .should("have.value", "Mar 21, 2019");
      cy.get("#12-f3db44-c8kt0q")
        .find("[data-cy='dateTimeInputField']")
        .find("input")
        .should("have.value", "2:30 pm");
      cy.get("#12-f3db44-c8kt0q")
        .find("[data-cy='dateFieldClearButton']")
        .click();
      cy.get("#12-f3db44-c8kt0q")
        .find("[data-cy='datePickerInputField']")
        .find("input")
        .should("have.value", "");
      cy.get("#12-f3db44-c8kt0q")
        .find("[data-cy='dateTimeInputField']")
        .find("input")
        .should("have.value", "");
    });

    it("should be able to auto-fill the date and time when field is empty", () => {
      cy.get("#12-f3db44-c8kt0q")
        .find("[data-cy='dateTimeInputField']")
        .click();
      cy.get("#12-f3db44-c8kt0q")
        .find("[data-cy='datePickerInputField']")
        .find("input")
        .should("have.value", moment(TIMESTAMP).format("MMM DD, YYYY"));
      cy.get("#12-f3db44-c8kt0q")
        .find("[data-cy='dateTimeInputField']")
        .find("input")
        .should("have.value", "12:00 am");
    });

    it("should allow a user to select a time from the dropdown", () => {
      cy.get("#12-f3db44-c8kt0q")
        .find("[data-cy='dateTimeInputField']")
        .click();
      cy.get(".MuiAutocomplete-listbox>.MuiAutocomplete-option").eq(1).click();
      cy.get("#12-f3db44-c8kt0q")
        .find("[data-cy='dateTimeInputField']")
        .find("input")
        .should("have.value", "12:15 am");
    });

    it("should allow a user to manually type in a time", () => {
      cy.get("#12-f3db44-c8kt0q")
        .find("[data-cy='dateTimeInputField']")
        .find("input")
        .type("{selectAll}{del}11:00 pm")
        .blur();
      cy.get("#12-f3db44-c8kt0q")
        .find("[data-cy='dateTimeInputField']")
        .find("input")
        .should("have.value", "11:00 pm");
    });

    it("should reset to last saved valid time when user types in an invalid time", () => {
      cy.get("#12-f3db44-c8kt0q")
        .find("[data-cy='dateTimeInputField']")
        .find("input")
        .type("{selectAll}{del}asdasdasdasdas")
        .blur();
      cy.get("#12-f3db44-c8kt0q")
        .find("[data-cy='dateTimeInputField']")
        .find("input")
        .should("have.value", "11:00 pm");
    });
  });
});

describe("Content Specs", () => {
  const TIMESTAMP = Date.now();

  describe("content drawer", () => {
    before(() => {
      cy.waitOn("/v1/content/models*", () => {
        cy.visit("/content/6-556370-8sh47g/7-b939a4-457q19");
      });
    });

    it("Check Actions Collapsed functionality", () => {
      cy.get("[data-cy=ActionsContent]").then((content) => {
        if (content.is(":visible")) {
          cy.get("[data-cy=ActionsContent]", { timeout: 5000 }).should(
            "be.visible"
          );
        } else {
          cy.get("[data-cy=ActionsContent]").should("not.be.visible");
        }
      });
    });

    it("Check Actions Collapse persist when clicking on other Applications", () => {
      cy.get("[data-cy=ActionsContent]").then((content) => {
        if (content.is(":visible")) {
          cy.get("[data-cy=ActionsContent]").should("be.visible");

          cy.visit("/code");
          cy.waitOn("/v1/content/models*", () => {
            cy.visit("/content/6-556370-8sh47g/7-b939a4-457q19");
          });
          cy.get("[data-cy=ActionsContent]").should("be.visible");
        } else {
          cy.visit("/code");
          cy.waitOn("/v1/content/models*", () => {
            cy.visit("/content/6-556370-8sh47g/7-b939a4-457q19");
          });
          cy.get("[data-cy=ActionsContent]").should("not.be.visible");
        }
      });
    });

    it("Check Duo Mode Collapsed functionality", () => {
      cy.get("main header button span").then((el) => {
        // el[1] === ON(desktop icon)
        const classList = Array.from(el[1].classList);
        if (classList.includes("Selected--3_F85")) {
          console.log("Selected");
          cy.get("[data-cy=DuoModeContainer] iframe").should("be.visible");
        } else {
          console.log("Not Selected");
        }
      });
    });
  });

  describe("editing content", () => {
    before(() => {
      cy.waitOn("/v1/content/models*", () => {
        cy.visit("/content/6-556370-8sh47g/7-b939a4-457q19");
      });
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
      cy.get("#12-63ab04-0nkwcc input").click();

      cy.get(
        '.flatpickr-calendar:not(.hasTime) [aria-label="March 5, 2019"]'
      ).click();

      cy.get("#12-63ab04-0nkwcc input").should("have.value", "2019-03-05");
    });

    it("Date & Time Field", () => {
      cy.get("#12-f3db44-c8kt0q input.form-control").click();

      cy.get(
        '.flatpickr-calendar.hasTime [aria-label="March 5, 2019"]'
      ).click();

      cy.get(".flatpickr-confirm").click();

      // TODO get aria-label and capture in variable
      // cy.get("#12-f3db44-c8kt0q .flatpickr-input.form-control.input").click();

      // TODO compare aria-label value with input value
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
      cy.get("#12-f3152c-kjz88l .Select")
        .click()
        .find('[data-value="custom_option_one"]')
        .click();

      cy.contains("#12-f3152c-kjz88l .Select", "Custom Option One");

      cy.get("#12-f3152c-kjz88l .Select")
        .click()
        .find('[data-value="custom_option_two"]')
        .click();

      cy.contains("#12-f3152c-kjz88l .Select", "Custom Option Two");
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
      cy.get("#12-575f7c-trw1w3 button").contains("Yes").click();
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
      cy.get("#12-9b96ec-tll2gn input[type=number]")
        .focus()
        .clear()
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
      cy.get("#12-4e1914-kcqznz input[type='number']")
        .clear()
        .type("{rightArrow}12");

      cy.get("#12-4e1914-kcqznz button").first().click();

      cy.get("#12-4e1914-kcqznz input[type='number']").should(
        "have.value",
        "11"
      );

      cy.get("#12-4e1914-kcqznz button").last().click();

      cy.get("#12-4e1914-kcqznz input[type='number']").should(
        "have.value",
        "12"
      );
    });

    it("One to many Field", () => {
      // cy.get("#12-269a28-1bkm34 input").clear();

      // Adds new relationship
      cy.get("#12-269a28-1bkm34 .MuiAutocomplete-popupIndicator").click();
      cy.get("[role=listbox] [data-option-index=1]").click({ force: true });

      // Removes new relationship
      cy.get("#12-269a28-1bkm34 .MuiAutocomplete-popupIndicator").click();
      cy.get("[role=listbox] [data-option-index=1]").click({ force: true });
    });

    it("One to one Field", () => {
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
});

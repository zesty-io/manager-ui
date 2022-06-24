describe("Content Specs", () => {
  describe("Content Specs", () => {
    before(() => {
      cy.login();
      cy.visit("/content/6-556370-8sh47g/7-b939a4-457q19");
    });

    const TIMESTAMP = Date.now();

    //Force true: When multiple cypress test are running simultaneously, content lock modal will render blocking click events.

    describe("editing All Field Types content", () => {
      it("Text Field", () => {
        cy.get("#12-13d590-9v2nr2")
          .should("exist")
          .find("input")
          .click({ force: true })
          .clear()
          .type(`${TIMESTAMP}`)
          .should("have.value", `${TIMESTAMP}`);
      });

      it("WYSIWYG Basic Field", () => {
        cy.get("#12-6d41d0-n10vtc").should("exist");
        cy.iframe("#wysiwyg_basic_ifr")
          .should("be.visible")
          .click({ force: true })
          .type(`{selectall}{backspace}${TIMESTAMP}`)
          .contains(`${TIMESTAMP}`);
      });

      // TODO: implement add image functionality, select and verify image ZUID is in field
      it.skip("Image Field", () => {
        cy.get("#12-1c94d4-pg8dvx").should("exist");
      });

      it("Textarea Field", () => {
        cy.get("#12-b5d7b4-n81s15")
          .should("exist")
          /*
            MUI *intentionally* renders 2 textareas to the DOM; one hidden and
            one visible. The visible one is the one we are interested in.

            https://github.com/mui/material-ui/pull/15436

          */
          .find("textarea:not([readonly]):not([hidden])")
          .click({ force: true })
          .clear()
          .type(`${TIMESTAMP}`)
          .should("have.value", `${TIMESTAMP}`);
      });

      it("Date Field", () => {
        cy.get("#12-63ab04-0nkwcc")
          .should("exist")
          .find("input")
          .click({ force: true });

        cy.get(
          '.flatpickr-calendar:not(.hasTime) [aria-label="March 5, 2019"]'
        ).click({ force: true });

        cy.get("#12-63ab04-0nkwcc")
          .find("input")
          .should("have.value", "2019-03-05");
      });

      it("Date & Time Field", () => {
        cy.get("#12-f3db44-c8kt0q")
          .should("exist")
          .find("input.form-control")
          .click({ force: true });

        cy.get(
          '.flatpickr-calendar.hasTime [aria-label="March 5, 2019"]'
        ).click({ force: true });

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
        cy.get("#12-fc9e18-wh9l82")
          .should("exist")
          .find(".ProseMirror")
          .click({ force: true })
          .clear()
          .type(`${TIMESTAMP}`)
          .contains(`${TIMESTAMP}`);
      });

      it("Markdown Field", () => {
        cy.get("#12-796b3c-8n93rc")
          .should("exist")
          .find("textarea")
          .click({ force: true })
          .clear()
          .type(`${TIMESTAMP}`)
          .should("have.value", `${TIMESTAMP}`);

        cy.get("#12-796b3c-8n93rc")
          .find("textarea")
          .should("contain", TIMESTAMP);
      });

      it("Dropdown Field", () => {
        cy.get("#12-f3152c-kjz88l")
          .should("exist")
          .find(".Select")
          .click({ force: true })
          .find('[data-value="custom_option_one"]')
          .click({ force: true });

        cy.contains("#12-f3152c-kjz88l .Select", "Custom Option One");

        cy.get("#12-f3152c-kjz88l")
          .find(".Select")
          .click({ force: true })
          .find('[data-value="custom_option_two"]')
          .click({ force: true });

        cy.contains("#12-f3152c-kjz88l .Select", "Custom Option Two");
      });

      it("Url Field", () => {
        cy.get("#12-8ed554-nxmbw8")
          .should("exist")
          .find("input")
          .focus()
          .clear()
          .type(`http://www.zesty.pw/${TIMESTAMP}`);
        cy.get("#12-8ed554-nxmbw8")
          .find("input")
          .should((input) => {
            expect(input).to.have.value(`http://www.zesty.pw/${TIMESTAMP}`);
          });
      });

      it("Internal Link Field", () => {
        cy.get("#12-10741c-s5jkwg")
          .should("exist")
          .find(".Select")
          .click({ force: true })
          .find('[data-value="7-bedfc8c9c4-fspprt"]')
          .click({ force: true });

        cy.contains("#12-10741c-s5jkwg .Select", "/asdf/");

        // cy.get("#SaveItemButton").click({ force: true });
        // cy.contains("Saved a new ", { timeout: 3000 }).should("exist");
        // // checks selected data was save
        // cy.contains("#12-10741c-s5jkwg .Select", "All Field Types");

        // // revert the data
        // cy.get("#12-10741c-s5jkwg")
        //   .find(".Select")
        //   .click()
        //   .find('[data-value="0"]')
        //   .click();

        // cy.contains("#12-10741c-s5jkwg .Select", "— None —");
        // cy.get("#SaveItemButton").click({ force: true });
      });

      // TODO: Need to confirm toggling of value
      it("Yes/No Field", () => {
        cy.get("#12-575f7c-trw1w3")
          .find("button")
          .contains("Yes")
          .click({ force: true });
      });

      // TODO: Need to confirm toggling of value
      it("Yes/No Field: Custom Options", () => {
        cy.get("#12-8178cc-z37vq1")
          .find("button")
          .contains("Custom One")
          .click({ force: true });
      });

      it("Fontawesome Field", () => {
        cy.get("#12-57a878-5nqndp")
          .should("exist")
          .find("input")
          .focus()
          .clear()
          .type(`fa fa-link`)
          .should("have.value", `fa fa-link`);
      });

      it("Number Field", () => {
        // NOTE: the timestamp is too large for the 'small int' column in the DB
        // limit is 4294967295
        cy.get("#12-9b96ec-tll2gn")
          .should("exist")
          .find('input[type="number"]')
          .focus()
          .clear()
          .type("999")
          .should("have.value", "999");
      });

      it("Currency Field", () => {
        cy.get("#12-b35c68-jd1s8s")
          .should("exist")
          .find('input[type="number"]')
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
        cy.get("#12-f72938-8n8vqs")
          .should("exist")
          .find("input[readonly]")
          // This is a unique value generated on item creation and should never change
          .should("have.value", "731a0b2f-e3f9-44bf-b142-59488c0834e9");
      });

      // TODO: implement file selection; select file and confirm it's ZUID set
      it.skip("File Field", () => {
        cy.get("#12-178fe8-nf6mfn").should("exist");
      });

      it("Sort Field", () => {
        cy.get("#12-4e1914-kcqznz")
          .should("exist")
          .find("input[type='number']")
          .clear({ force: true })
          .type("{rightArrow}12");

        cy.get("#12-4e1914-kcqznz")
          .find("button")
          .first()
          .click({ force: true });

        cy.get("#12-4e1914-kcqznz")
          .find("input[type='number']")
          .should("have.value", "13");

        cy.get("#12-4e1914-kcqznz")
          .find("button")
          .last()
          .click({ force: true });

        cy.get("#12-4e1914-kcqznz")
          .find("input[type='number']")
          .should("have.value", "12");
      });

      it("One to many Field", () => {
        // Adds new relationship
        cy.get("#12-269a28-1bkm34")
          .find(".MuiAutocomplete-popupIndicator")
          .click({ force: true });
        cy.get("[role=presentation]")
          .find("[data-option-index=1]")
          .click({ force: true });
        // Removes new relationship
        cy.get("#12-269a28-1bkm34")
          .find(".MuiAutocomplete-popupIndicator")
          .click({ force: true });
        cy.get("[role=presentation]")
          .find("[data-option-index=1]")
          .click({ force: true });
      });

      it("One to one Field", () => {
        cy.get("#12-edee00-6zb866")
          .find(".MuiAutocomplete-popupIndicator")
          .click({ force: true });
        //allow relationships to load
        cy.get("[role=presentation]")
          .find("[data-option-index=1]")
          .click({ force: true });
        // cy.get("#SaveItemButton").click({ force: true });
        // cy.contains("Saved a new ", { timeout: 5000 }).should("exist");
        cy.get("#12-edee00-6zb866")
          .find("input")
          .should("have.value", "zesty.pw");
      });
      it("Saves Content updates", () => {
        cy.get("#SaveItemButton").click({ force: true });
        cy.contains("Saved a new ", { timeout: 3000 }).should("exist");
      });
    });
    // color, UUID?, files

    // IMAGES ARE GOING TO BE HARD TO NAVIGATE, YAY!
    // it('Edits the Images Field', () => {
    //   cy.get('#12-9ecc0c-cc20j7')
    //     .find('button')
    //     .click();
    //   // cy.get('#SaveItemButton').click();
    //   // cy.contains('Saved a new ', { timeout: 5000 }).should('exist');
    // });

    // For each field type ensure that it edits and persists changes with a save

    // it('Saves item data', () => {
    //   cy.get('#SaveItemButton').click();
    //   cy.contains('Saved a new ', { timeout: 5000 }).should('exist');
    // });

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
          cy.visit("/content/6-556370-8sh47g/7-b939a4-457q19");
          cy.get("[data-cy=ActionsContent]").should("be.visible");
        } else {
          cy.visit("/code");
          cy.visit("/content/6-556370-8sh47g/7-b939a4-457q19");
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
});

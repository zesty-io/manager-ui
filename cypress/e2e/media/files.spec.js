describe("Media Files", () => {
  before(() => {
    cy.waitOn("*groups*", () => {
      cy.visit("/media");
    });
  });

  it("Renames filename", () => {
    cy.get("[aria-label='Open settings menu']").click();
    cy.contains("Rename").click();

    // type inside "New File Name" textfield
    cy.get(".MuiDialog-container").within(() => {
      cy.contains("New File Name").next().clear().type("CYPRESS TEST NEW FILE");
      cy.contains("Update").click();
    });

    // call update endpoint
    cy.intercept("PATCH", "/file/3-eafe696-c0j4kn");

    // check if the textfield has the updated value
    cy.get(".MuiTypography-body1")
      .contains("CYPRESS TEST NEW FILE")
      .should("exist");
  });

  it("Updates title", () => {
    cy.get(".MuiDialog-container").within(() => {
      cy.get("[aria-label='Title TextField']")
        .clear()
        .type("CYPRESS TEST NEW TITLE");

      // trigger save button
      cy.get(".MuiBox-root").then(($body) => {
        if ($body.find("[aria-label='Save Title Button']").length) {
          cy.get("[aria-label='Save Title Button']").click();
        }
      });

      cy.intercept("PATCH", "/file/3-eafe696-c0j4kn");

      cy.get("[aria-label='Title TextField']").within(() => {
        cy.get(".MuiInputBase-input").should(
          "have.value",
          "CYPRESS TEST NEW TITLE"
        );
      });
    });
  });

  it("Deletes file", () => {
    // click trash and delete modal button
    cy.get("[aria-label='Trash Button']").click();
    cy.get("[aria-label='Delete Button']").click();

    // call delete endpoint
    cy.intercept("DELETE", "/file/3-eafe696-c0j4kn").as("deleteRequest");
    // cy.wait("@deleteRequest");
  });

  it("Shows 404 Page", () => {
    cy.visit("/media?fileId=3-eafe696-c0j4kn12");
    cy.get(".NotFoundState").within(() => {
      cy.get(".MuiTypography-h4").contains("File Not Found").should("exist");
    });
  });
});

describe("Media Files", () => {
  before(() => {
    cy.visit("/media");
  });

  it("Displays files", () => {
    cy.visit("/media?fileId=3-eafe696-c0j4kn");
    cy.intercept("GET", "/file/3-eafe696-c0j4kn").as("request");
    cy.wait("@request");
  });

  it("Renames filename", () => {
    cy.get("[aria-label='Open settings menu']").click();

    cy.contains("Rename").click();

    cy.get(".MuiDialog-container").within(() => {
      cy.contains("New File Name").next().clear().type("CYPRESS TEST NEW FILE");
      cy.contains("Update").click();
    });

    cy.intercept("PATCH", "/file/3-eafe696-c0j4kn");
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
    cy.get("[aria-label='Trash Button']").click();

    cy.get("[aria-label='Delete Button']").click();

    cy.intercept("DELETE", "/file/3-eafe696-c0j4kn").as("deleteRequest");
    cy.wait("@deleteRequest");
  });
});

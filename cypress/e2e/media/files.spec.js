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

  it("Drag and drop files on sidebar", () => {
    // visit all media first
    cy.visit("/media");
    cy.wait(3000);

    // drag the thumbnail
    cy.get(".3-eb3816c-56fxrg")
      .should("be.visible")
      .trigger("dragstart")
      .trigger("dragleave");

    // drop it to the folder
    cy.get(".MuiTreeView-root").within(() => {
      cy.get(".2-b599f72-aeswx")
        .should("be.visible")
        .trigger("dragenter")
        .trigger("dragover")
        .trigger("drop")
        .trigger("dragend");
    });

    // check the folder if the thumbnail is there
    cy.get(".2-b599f72-aeswx").click();
    cy.get(".MuiBox-root").within(() => {
      cy.get(".3-eb2502b-q0lknt").should("exist");
    });
  });
});

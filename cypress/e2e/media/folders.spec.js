describe("Media Folders", () => {
  before(() => {
    cy.waitOn("*groups*", () => {
      cy.visit("/media");
    });
  });
  it("Creates folder ", () => {
    cy.get("[aria-label='Create New Folder']").click();

    cy.get(".MuiDialog-container").within(() => {
      cy.contains("Folder Name").next().type("CYPRESS TEST NEW FOLDER");
      cy.contains("Create").click();
    });

    cy.intercept("POST", "/groups");

    cy.get(".MuiTreeView-root")
      .contains("CYPRESS TEST NEW FOLDER")
      .should("exist");
  });
  it("Hides and shows folder", () => {
    cy.get(".MuiTreeView-root").contains("CYPRESS TEST NEW FOLDER").click();

    cy.get("[aria-label='Open folder menu']").click();

    cy.contains("Hide").click();

    // Non hidden tree
    cy.get(".MuiTreeView-root")
      .first()
      .contains("CYPRESS TEST NEW FOLDER")
      .should("not.exist");

    // Hidden Tree
    cy.get(".MuiTreeView-root")
      .next()
      .contains("CYPRESS TEST NEW FOLDER")
      .should("exist");

    cy.get("[aria-label='Open folder menu']").click();

    cy.contains("Show").click();

    // Non hidden tree
    cy.get(".MuiTreeView-root")
      .first()
      .contains("CYPRESS TEST NEW FOLDER")
      .should("exist");
  });
  it("Renames folder", () => {
    cy.get(".MuiTreeView-root").contains("CYPRESS TEST NEW FOLDER").click();

    cy.get("[aria-label='Open folder menu']").click();

    cy.contains("Rename").click();

    cy.get(".MuiDialog-container").within(() => {
      cy.contains("New Folder Name")
        .next()
        .clear()
        .type("CYPRESS TEST NEW FOLDER EDITED");
      cy.contains("Update").click();
    });

    cy.intercept("PUT", "/groups");

    cy.get(".MuiTreeView-root")
      .contains("CYPRESS TEST NEW FOLDER EDITED")
      .should("exist");
  });
  it("Deletes folder", () => {
    cy.get(".MuiTreeView-root")
      .contains("CYPRESS TEST NEW FOLDER EDITED")
      .click();

    cy.get("[aria-label='Open folder menu']").click();

    cy.contains("Delete").click();

    cy.get(".MuiButton-containedError").click();

    cy.intercept("DELETE", "/groups");

    cy.get(".MuiTreeView-root")
      .contains("CYPRESS TEST NEW FOLDER EDITED")
      .should("not.exist");
  });
});

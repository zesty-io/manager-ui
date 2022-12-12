describe("Content media selection modal", () => {
  before(() => {
    cy.waitOn("*groups*", () => {
      cy.waitOn("*models*", () => {
        cy.visit("/content/6-556370-8sh47g/new");
      });
    });
    // TODO better method to wait for content page to load
    cy.contains("Creating New Item").should("exist");
    cy.contains("Creating New Item").should("not.exist");
    cy.contains("placeholder for").should("not.exist");
  });

  it("Can select media items", () => {
    //cy.wait(500);
    cy.waitOn("/bin/1-6c9618c-r26pt/files", () => {
      // TODO improve selectors
      cy.get(".FieldTypeImageContent--EDuUS button")
        .last()
        .click({ force: true });
    });
    // Test that modal popped up
    cy.get("h4").contains("Insert from Media");
    cy.get("[data-testid='media-thumbnail-content']")
      .first()
      .parent()
      .get("input[type=checkbox]")
      .first()
      .click({ force: true });
    cy.contains("Done");
  });

  // Dependent on state of previous test
  it("limits selected media", () => {
    cy.get("[data-testid='media-thumbnail-content']")
      .eq(0)
      //.first()
      .parent()
      .find("input[type=checkbox]")
      .first()
      .should("be.checked");

    // Assert that we CANNOT check too many media items;
    // in this case, only 1 is allowed
    cy.get("[data-testid='media-thumbnail-content']")
      .eq(1)
      //.first()
      .parent()
      .find("input[type=checkbox]")
      .first()
      .click({ force: true })
      .should("be.not.checked");
    cy.contains("Done");
  });

  it("allows selection in wysiwyg", () => {
    cy.reload();
    cy.get('button[title="Select media from your uploaded assets"]')
      .first()
      .click();
    cy.get("h4").contains("Insert from Media");
  });

  it("locks nav to locked media group", () => {
    cy.waitOn({ method: "GET", pathname: "*groups*" }, () => {
      cy.visit("/content/6-852490-2mhz4v/new");
    });
    cy.contains("2x Images");
    cy.get("figure button").last().click({ force: true });
    cy.get("h4").contains("Insert from Media");
    cy.get(".MuiTreeView-root li").should("have.length", 1);
  });

  // Dependent on state of previous test
  it("does not show All Media in locked group", () => {
    cy.contains("All Media").should("not.exist");
  });

  // Dependent on state of previous test
  it("only searches the locked group", () => {
    cy.get("[data-testid='media-thumbnail-content']").should("have.length", 4);
    cy.get("input[type='text'][placeholder='Search Media']").type(
      "zesty{enter}"
    );
    cy.get("[data-testid='media-thumbnail-content']").should("have.length", 3);
  });
});

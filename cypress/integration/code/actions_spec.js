describe("Code Editor", () => {
  before(() => {
    cy.login();
    cy.visit("/code");
  });

  // it("Create File", () => {
  //   cy.contains("Create File").click();
  //   cy.get(".Select").eq(1).click();
  //   cy.get(".Select li").eq(1).click();
  //   cy.get('input[type="text"]').type("mySnippet");
  //   cy.get('button[type="save"]').eq(0).click();
  // });

  // it("Navigate to file", () => {
  //   cy.get("#Navigation > article").eq(0).click();
  // });
  // it("Publish file", () => {
  //   cy.get(".fa-cloud-upload-alt").eq(0).click();
  //   cy.contains("Published", { timeout: 5000 }).should("exist");
  // });

  it("Sort resources", () => {
    cy.contains("Order").eq(0).click();
    cy.get('[data-index="0"]').trigger("mousedown", {
      which: 1,
      force: true,
    });
    cy.get('[data-index="1"]')
      .trigger("mousemove", { which: 1, force: true })
      .trigger("mouseup", { force: true });

    cy.get("footer").last().get("[data-cy=saveOrder]").click({ force: true });
    cy.wait(1000);
    cy.contains("File sort order has been saved", { timeout: 5000 }).should(
      "exist"
    );
  });

  it("Compare files", () => {
    cy.visit("/code/file/views/11-eb8dec-6nsjbf/diff/local,29");
    // FIXME: The UI is not reflecting the correct state of the URL, showing incorrect diff versions.
    cy.wait(1000);

    cy.get(".react-monaco-editor-container .editor.modified").should("exist");
    cy.get(".react-monaco-editor-container .editor.modified").should("exist");
  });
});

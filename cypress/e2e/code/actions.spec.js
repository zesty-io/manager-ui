describe("Code Editor", () => {
  it.skip("Sort resources", () => {
    // TODO reorder is not triggering rebalancing list. un-skip to see failure.
    // reorder list
    cy.contains("Order").eq(0).click();
    cy.get('[data-index="0"]').trigger("mousedown", {
      which: 1,
      force: true,
    });
    cy.get('[data-index="1"]')
      .trigger("mousemove", { which: 1, force: true })
      .trigger("mouseup");

    // update api
    cy.intercept({
      method: "PUT",
      pathname: "/v1/web/scripts",
      query: { action: "updateSort" },
    }).as("updateSort");
    cy.get("footer").last().get("[data-cy=saveOrder]").click();
    cy.wait("@updateSort");

    // success message
    cy.get("[data-cy=toast]").contains("File sort order has been saved");
  });

  it("Compare files", () => {
    cy.waitOn("/v1/web/views/11-eb8dec-6nsjbf/versions/", () => {
      cy.visit("/code/file/views/11-eb8dec-6nsjbf/diff/local,29");
    });

    // FIXME: The UI is not reflecting the correct state of the URL, showing incorrect diff versions.
    cy.get(".react-monaco-editor-container .editor.modified").should("exist");
    cy.get(".react-monaco-editor-container .editor.modified").should("exist");
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
});

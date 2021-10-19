describe("Code Editor", () => {
  before(() => {
    cy.login();
    cy.visit("/code");
  });

  it.skip("Create File", () => {
    cy.contains("Create File").click();
    cy.get(".Select").eq(1).click();
    cy.get(".Select li").eq(1).click();
    cy.get('input[type="text"]').type("mySnippet");
    cy.get('button[type="save"]').eq(1).click();
  });

  it("Navigate to file", () => {
    cy.get("#Navigation > article").eq(1).click();
  });
  it("Publish file", () => {
    cy.get('button[kind="secondary"] .fa-cloud-upload-alt').click();
    cy.contains("Published", { timeout: 5000 }).should("exist");
  });

  it("Sort resources", () => {
    cy.contains("Order").first().click();

    cy.get('[data-index="0"]').trigger("mousedown", {
      which: 1,
      force: true,
    });
    cy.get('[data-index="1"]')
      .trigger("mousemove", { which: 1, force: true })
      .trigger("mouseup", { force: true });

    cy.get('button[type="save"]').contains("Save Order").click({ force: true });

    cy.contains("File sort order has been saved", { timeout: 5000 }).should(
      "exist"
    );
  });

  it("Compare files", () => {
    cy.get('a[title="Diff Versions"]').click();
    cy.get(".original").should("exist");
    cy.get(".modified").should("exist");
  });
});

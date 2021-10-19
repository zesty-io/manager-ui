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
    cy.get('button[type="save"]').eq(0).click();
  });

  it("Navigate to file", () => {
    cy.get("#Navigation > article").eq(0).click();
  });
  it("Publish file", () => {
    cy.get(".fa-cloud-upload-alt").eq(0).click();
    cy.contains("Published", { timeout: 5000 }).should("exist");
  });

  it("Sort resources", () => {
    cy.contains("Order").eq(0).click();
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

  // race conditions sometimes fails
  it("Compare files", () => {
    cy.contains("test.less").click({ force: true });
    cy.get('svg[data-icon="history"]').click();
    cy.get(".original").should("exist");
    cy.get(".modified").should("exist");
  });
});

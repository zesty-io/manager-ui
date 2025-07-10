describe("Code Editor Sidebar", () => {
  before(() => {
    cy.visit("/code");
  });

  it("can navigate blocks in the sidebar", () => {
    cy.contains("all_field_types").click();
    cy.location("pathname").should("eq", "/code/file/views/11-98e7d0-148d5r");
  });
});

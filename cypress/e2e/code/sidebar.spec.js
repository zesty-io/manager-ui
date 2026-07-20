describe("Code Editor Sidebar", () => {
  before(() => {
    cy.waitOn("/v1/web/views*", () => {
      cy.visit("/code");
    });
  });

  it("can navigate code files in the sidebar", () => {
    cy.getBySelector("appSidebarSearch").find("input").type("all_field_types");
    cy.get(".MuiTreeItem-root").first().click();
    cy.location("pathname").should("eq", "/code/file/views/11-98e7d0-148d5r");
  });
});

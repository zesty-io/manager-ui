describe("Media sidebar", () => {
  before(() => {
    cy.visit("/media");
  });

  it("can navigate media folders in the sidebar", () => {
    cy.contains("favicon").click();
    cy.location("pathname").should("eq", "/media/folder/2-adda23d-bc5a4");
  });

  it("should be able to show the more options menu", () => {
    cy.get(".MuiTreeItem-content.Mui-selected")
      .find("[data-cy='tree-item-hide']")
      .click({ force: true });
    cy.getBySelector("media-folder-menu").should("exist");
  });
});

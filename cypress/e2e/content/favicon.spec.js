//Assume new favicon image has been loaded ye
//
describe("Favicon upload image", () => {
  before(() => {
    cy.visit("/settings/head");
  });

  it("update favicon image", () => {
    cy.get("[data-cy=Favicon]").click();
    // Allows image to load before clicking
    cy.wait(1000);
    cy.get("figure button").click();

    cy.waitOn("**/bin/**", () => {
      cy.get("figure button").click();
    });
    cy.waitOn("**/group/**", () => {
      cy.get(".MuiTreeView-root").first().contains("favicon").click();
    });
    cy.get("[data-cy=3-adda244-g1a3j]").click();
    cy.contains("Done").click();
    cy.get("[data-cy=faviconSave]").click();
  });
});

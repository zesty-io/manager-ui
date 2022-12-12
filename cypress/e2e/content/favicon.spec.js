//Assume new favicon image has been loaded ye
describe("Favicon upload image", () => {
  before(() => {
    cy.visit("/settings/head");
  });

  it("update favicon image", () => {
    cy.get("[data-cy=Favicon]").click();
    cy.get("figure").then((figure) => {
      if (figure.find("img").length > 0) {
        cy.get("figure img").siblings("button").click();
      }
    });
    cy.wait(1000);
    //figure remove button
    cy.get("figure button").click();
    //figure add button
    cy.waitOn("**/files", () => {
      cy.get("figure button").click({ force: true });
    });
    cy.waitOn("**/group/**", () => {
      cy.get(".MuiTreeView-root").first().contains("favicon").click();
    });
    cy.get("[data-cy=3-adda244-g1a3j]").click();
    cy.contains("Done").click();
    cy.get("[data-cy=faviconSave]").click();
  });
});

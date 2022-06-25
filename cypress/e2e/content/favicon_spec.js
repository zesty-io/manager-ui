//Assume new favicon image has been loaded ye
describe("Favicon upload image", () => {
  before(() => {
    cy.login();
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
    cy.wait(1000);
    //figure add button
    cy.get("figure button").click({ force: true });
    cy.get("figure img").eq(1).click({ force: true });
    cy.get("[data-cy=loadSelected]").click();
    cy.get("[data-cy=faviconSave]").click({ force: true });
  });
});

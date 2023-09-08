describe("multi-lang", () => {
  it("Check if multi lang exist", () => {
    cy.waitOn(
      "/v1/content/models/6-a4d6e6f087-1jmlbx/items/7-b8da98dea8-1nwkc9",
      () => {
        cy.visit("/content/6-a4d6e6f087-1jmlbx/7-b8da98dea8-1nwkc9");
      }
    );

    cy.getBySelector("language-selector").click();

    cy.contains("ES (ES)");
  });
});

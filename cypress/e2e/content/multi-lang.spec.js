describe("multi-lang", () => {
  it("Check if multi lang exist", () => {
    cy.waitOn(
      "/v1/content/models/6-a4d6e6f087-1jmlbx/items/7-b8da98dea8-1nwkc9",
      () => {
        cy.visit("/content/6-a4d6e6f087-1jmlbx/7-b8da98dea8-1nwkc9");
      }
    );

    cy.get(".LanguageSelector").click();
    cy.get('[data-value="es"]').click();

    // cy.get("[data-cy=ContentLanguage] span").contains("es");
    cy.get(".LanguageSelector").contains("es");
  });
});

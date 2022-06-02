describe("Content SEO & Meta", () => {
  before(() => {
    cy.login();
  });

  it("Check if multi lang exist", () => {
    cy.visit("/content/6-a4d6e6f087-1jmlbx/7-b8da98dea8-1nwkc9/meta");
    // Waiting 15 secs for app to fully render dom
    cy.location("pathname", { timeout: 15000 }).should(
      "eq",
      "/content/6-a4d6e6f087-1jmlbx/7-b8da98dea8-1nwkc9/meta"
    );
    // //Force true: When multiple cypress test are running simultaneously, content lock modal will render blocking click events.
    cy.get("[data-cy=meta]").click({ force: true });
    cy.get("header").find(".Select").first().click();
    cy.get('[data-value="es"]').click({ force: true });
    cy.get("[data-cy=meta]").click({ force: true });

    // cy.get("[data-cy=itemParent]").contains("/es").should("exist");
    cy.get("[data-cy=itemParent]").find(".Select").click();

    cy.get(".Select li").then((list) => {
      expect(list.text()).contains("/es");
    });
  });
});

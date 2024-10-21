describe("Content item list table", () => {
  it("Resolves internal link zuids", () => {
    cy.waitOn("/search/items*", () => {
      cy.waitOn("/v1/content/models*", () => {
        cy.visit("/content/6-a1a600-k0b6f0");
      });
    });

    cy.getBySelector("SingleRelationshipCell", { timeout: 10000 })
      .first()
      .contains(
        "5 Tricks to Teach Your Pitbull: Fun & Easy Tips for You & Your Dog!"
      );
  });
});

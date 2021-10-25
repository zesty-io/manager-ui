describe("Release > create", () => {
  before(() => {
    cy.login();
    cy.visit("/release/27-d0d8f7a0f8-1pp779");
  });

  it("add member", () => {
    cy.get("[data-cy=ReleaseHeader] [data-cy=ContentSearch] input").type(
      "homepage"
    );
    cy.get(
      "[data-cy=ReleaseHeader] [data-cy=ContentSearch] ul li:nth-child(2) p span"
    )
      .contains("Homepage")
      .click();

    // cy.contains(`Created Release: ${title}`).should("exist");
  });

  it("update member", () => {});

  it("delete member", () => {});
});

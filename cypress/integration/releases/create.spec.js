describe("Release > create", () => {
  before(() => {
    cy.login();
    cy.visit("/release/create");
  });

  it("create release", () => {
    const timestamp = Date.now();
    const title = `Title - ${timestamp}`;
    const desc = `Description - ${timestamp}`;

    cy.get("[data-cy=release-name]").type(title);
    cy.get("[data-cy=release-desc]").type(desc);

    cy.get("[data-cy=release-createBtn]").click();
    cy.contains(`Created Release: ${title}`).should("exist");
  });

  // it("change release")
});

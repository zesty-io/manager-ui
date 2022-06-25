/**
 * This test relys on the release being empty.
 */
describe("Release > members > CRUD", () => {
  before(() => {
    cy.login();
    cy.intercept("/release/27-d0d8f7a0f8-1pp779").as("getRelease");
    cy.visit("/release/27-d0d8f7a0f8-1pp779");
    cy.wait("@getRelease");
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

    cy.get("[data-cy=PlanTable] tbody tr:last-child")
      .contains(`Homepage`)
      .should("exist");
  });

  it("update member", () => {
    // set member to version 1
    cy.get(
      "[data-cy=PlanTable] tbody tr:last-child [data-cy=release-member-version] .Select"
    ).click();
    cy.get(
      "[data-cy=PlanTable] tbody tr:last-child [data-cy=release-member-version] .Select .options li:last-child"
    ).click({
      force: true,
    });
    cy.get(
      "[data-cy=PlanTable] tbody tr:last-child [data-cy=release-member-version] .Select span"
    ).contains("Version 1");
  });

  it("delete member", () => {
    cy.get(
      "[data-cy=PlanTable] tbody tr:last-child [data-cy=release-member-delete] button"
    ).click();
    cy.get("[data-cy=PlanTable] tbody tr").should("have.length", 0);
  });
});

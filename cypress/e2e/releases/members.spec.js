/**
 * This test relies on the release being empty.
 */
describe("Release > members > CRUD", () => {
  before(() => {
    cy.waitOn("/v1/releases/27-d0d8f7a0f8-1pp779/members", () => {
      cy.visit("/release/27-d0d8f7a0f8-1pp779");
    });
  });

  it("add member", () => {
    cy.waitOn(
      {
        pathname: "/v1/search/items",
        query: {
          q: "homepage",
        },
      },
      () => {
        cy.get("[data-cy=ReleaseHeader] [data-cy=ContentSearch] input").type(
          "homepage"
        );
      }
    );

    cy.waitOn(
      {
        method: "POST",
        pathname: "/v1/releases/27-d0d8f7a0f8-1pp779/members",
      },
      () => {
        // FIXME: the search debounces the API request so we add some latency
        // and wait for the UI to update
        cy.wait(2000);

        cy.get(
          "[data-cy=ReleaseHeader] [data-cy=ContentSearch] ul li:last-child"
        ).click();
      }
    );

    cy.get("#root").type("{esc}");

    cy.get('"#root').trigger("keypress", {
      eventConstructor: "KeyboardEvent",
      keyCode: 27,
    });

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

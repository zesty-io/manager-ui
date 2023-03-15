import moment from "moment";

const now = moment().format("YYYY-MM-DD");

describe("Schema: Activity Log Tab", () => {
  it("Sets default date url params", () => {
    cy.visit("/schema/6-ce80dbfe90-ptjpm6/activity-log");

    cy.location("search").should("equal", `?from=2023-02-15&to=${now}`);
  });

  it("Displays filters as url params", () => {
    cy.waitOn("/v1/env/audits*", () => {
      cy.visit(
        `/schema/6-ce80dbfe90-ptjpm6/activity-log?from=2023-02-15&to=${now}`
      );
    });

    // Set action type filter
    cy.getBySelector("action_default").should("exist").click();
    cy.getBySelector("filter_value_1").should("exist").click();

    // Set people filter
    cy.getBySelector("user_default").should("exist").click();
    cy.getBySelector("filter_value_5-faeda8978e-j5xb6l")
      .should("exist")
      .click();

    cy.location("search").should(
      "equal",
      `?from=2023-02-15&to=${now}&action=1&actionByUserZUID=5-faeda8978e-j5xb6l`
    );
  });

  it("Shows the no logs found message", () => {
    cy.visit(
      "/schema/6-ce80dbfe90-ptjpm6/activity-log?from=2099-02-15&to=2099-03-15"
    );

    cy.contains("No Logs Found");
  });
});

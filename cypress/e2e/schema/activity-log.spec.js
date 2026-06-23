import { formatInTimeZone } from "date-fns-tz";

const now = formatInTimeZone(new Date(), "UTC", "yyyy-MM-dd");

const MODEL_ID = "6-a1a600-k0b6f0";
const FILTER_USER = "5-faeda8978e-j5xb6l";

// The filter dropdowns are built from audits whose affectedZUID === MODEL_ID. The
// real data for this fixed model/user churns away over time, leaving the filters
// empty. Mock the audits so the action + user filters are deterministic, and
// return empty for the future-date range the "no logs" test uses.
const MOCK_AUDITS = [
  {
    ZUID: "15-mockaudit01-aaaaaa",
    affectedZUID: MODEL_ID,
    entityZUID: MODEL_ID,
    actionByUserZUID: FILTER_USER,
    action: 1,
    meta: { uri: `/v1/content/models/${MODEL_ID}`, message: "Created model" },
    happenedAt: "2024-01-01T00:00:00Z",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    firstName: "Filter",
    lastName: "TestUser",
    email: "filter-test@zesty.io",
  },
];

describe("Schema: Activity Log Tab", () => {
  beforeEach(() => {
    cy.intercept("GET", "**/v1/env/audits*", (req) => {
      // The "no logs" test queries a future (2099) range — return empty for it.
      const empty = req.url.includes("2099");
      req.reply({
        statusCode: 200,
        body: {
          _meta: { totalResults: empty ? 0 : MOCK_AUDITS.length },
          data: empty ? [] : MOCK_AUDITS,
        },
      });
    }).as("getAudits");
  });

  it("Sets default date url params", () => {
    cy.visit(`/schema/${MODEL_ID}/activity-log`);

    cy.location("search").should("equal", `?from=2018-08-10&to=${now}`);
  });

  it("Displays filters as url params", () => {
    // Set action type filter
    cy.getBySelector("action_default").should("exist").click();
    cy.getBySelector("filter_value_1").should("exist").click();

    // Set people filter
    cy.getBySelector("user_default").should("exist").click();
    cy.getBySelector(`filter_value_${FILTER_USER}`).should("exist").click();

    cy.location("search").should(
      "equal",
      `?from=2018-08-10&to=${now}&action=1&actionByUserZUID=${FILTER_USER}`
    );
  });

  it("Shows the no logs found message", () => {
    cy.visit(`/schema/${MODEL_ID}/activity-log?from=2099-02-15&to=2099-03-15`);
    cy.wait("@getAudits");

    cy.contains("No Logs Found");
  });
});

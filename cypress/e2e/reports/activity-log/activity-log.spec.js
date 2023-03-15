import moment from "moment";
describe("Reports > Activity Log > Home", () => {
  describe("Tabs", () => {
    it("Highlights tabs depending on URL", () => {
      cy.visit("/reports/activity-log/resources");
      cy.get(".MuiTabs-root")
        .contains("RESOURCES")
        .should("have.attr", "aria-selected", "true");

      cy.visit("/reports/activity-log/users");
      cy.get(".MuiTabs-root")
        .contains("USERS")
        .should("have.attr", "aria-selected", "true");

      cy.visit("/reports/activity-log/timeline");
      cy.get(".MuiTabs-root")
        .contains("TIMELINE")
        .should("have.attr", "aria-selected", "true");

      cy.visit("/reports/activity-log/insights");
      cy.get(".MuiTabs-root")
        .contains("INSIGHTS")
        .should("have.attr", "aria-selected", "true");
    });

    it("Navigates on tab click", () => {
      cy.visit("/reports/activity-log/resources");

      cy.get(".MuiTabs-root").contains("USERS").click();
      cy.location("pathname").should("eq", "/reports/activity-log/users");

      cy.visit("/reports/activity-log/timeline");
      cy.get(".MuiTabs-root").contains("TIMELINE").click();
      cy.location("pathname").should("eq", "/reports/activity-log/timeline");

      cy.visit("/reports/activity-log/insights");
      cy.get(".MuiTabs-root").contains("INSIGHTS").click();
      cy.location("pathname").should("eq", "/reports/activity-log/insights");

      cy.visit("/reports/activity-log/resources");
      cy.get(".MuiTabs-root").contains("RESOURCES").click();
      cy.location("pathname").should("eq", "/reports/activity-log/resources");
    });
  });

  describe("Filters", () => {
    it("Sets default date url parameters if none are set", () => {
      cy.visit("/reports/activity-log/resources");
      cy.location("search").should(
        "eq",
        `?from=${moment()
          .add(-3, "months")
          .format("YYYY-MM-DD")}&to=${moment().format("YYYY-MM-DD")}`
      );
    });

    it("Does not set default date url parameters if they are set", () => {
      cy.visit("/reports/activity-log/resources?from=2020-07-14&to=2020-07-16");
      cy.location("search").should(
        "not.eq",
        `?from=${moment()
          .add(-3, "months")
          .format("YYYY-MM-DD")}&to=${moment().format("YYYY-MM-DD")}`
      );
    });

    it("Displays all url parameters on filters", () => {
      cy.waitOn("/v1/env/audits*", () => {
        cy.visit(
          "/reports/activity-log/resources?from=2022-07-14&to=2022-07-29&resourceType=content&actionByUserZUID=5-84d1e6d4ae-s3m974&sortBy=happenedAt"
        );
      });
      cy.getBySelector("filters").within(() => {
        cy.getBySelector("sortBy_selected")
          .should("exist")
          .contains("Oldest First");
        cy.getBySelector("resourceType_selected")
          .should("exist")
          .contains("Content");
        cy.getBySelector("user_selected")
          .should("exist")
          .contains("Andres Galindo");
      });
    });

    it("Adds and modifies url parameters via filters", () => {
      cy.waitOn("/v1/env/audits*", () => {
        cy.visit(
          "/reports/activity-log/resources?from=2022-07-14&to=2022-07-16"
        );
      });
      // Set daterange filter
      const from = moment()
        .hours(0)
        .minute(0)
        .second(0)
        .millisecond(0)
        .format("x");
      const to = moment()
        .add(1, "day")
        .hours(0)
        .minute(0)
        .second(0)
        .millisecond(0)
        .format("x");

      // Set daterange filter
      cy.getBySelector("dateRange_default").should("exist").click();
      cy.getBySelector("dateRange_picker").should("exist");
      cy.get(`[data-timestamp=${from}]`).should("exist").click();
      cy.get(`[data-timestamp=${to}]`).should("exist").click();

      // Set sort by filter
      cy.getBySelector("sortBy_default").should("exist").click();
      cy.getBySelector("filter_value_happenedAt").should("exist").click();

      // Set resource type filter
      cy.getBySelector("resourceType_default").should("exist").click();
      cy.getBySelector("filter_value_content").should("exist").click();

      const expectedFromDate = moment().format("YYYY-MM-DD");
      const expectedToDate = moment().add(1, "day").format("YYYY-MM-DD");

      cy.location("search").should(
        "eq",
        `?from=${expectedFromDate}&to=${expectedToDate}&sortBy=happenedAt&resourceType=content`
      );
    });
  });

  describe("Resources View", () => {
    before(() => {
      cy.waitOn("/v1/env/audits*", () => {
        cy.visit(
          "/reports/activity-log/resources?from=2022-07-14&to=2022-07-16"
        );
      });
    });
    it("Navigates to Resource Detail on Resource Item click", () => {
      cy.get(".MuiListItem-root").last().click();
      cy.location("pathname").should(
        "eq",
        "/reports/activity-log/resources/7-f28fd4d4a9-qtjb66"
      );
    });
  });

  describe("Skeletons", () => {
    it("Displays All Skeletons while initial API is called", () => {
      cy.intercept("/v1/env/audits*", (req) => {
        req.continue(async (res) => {
          // Throttles API to test Skeleton loaders
          await new Promise((resolve) => setTimeout(resolve, 4000));
          return res;
        });
      }).as("request");
      cy.visit("/reports/activity-log/resources?from=2022-07-14&to=2022-07-16");
      cy.get(".MuiSkeleton-root").should("have.length", 50);
      cy.wait("@request");
      cy.get(".MuiSkeleton-root").should("have.length", 0);
    });

    it.skip("Displays partial Skeletons when changing dates and refetching API", () => {
      cy.waitOn("/v1/env/audits*", () => {
        cy.visit(
          "/reports/activity-log/resources?from=2022-07-14&to=2022-07-16"
        );
      });

      cy.get(".MuiSkeleton-root").should("have.length", 0);

      cy.intercept("/v1/env/audits*", (req) => {
        req.continue(async (res) => {
          // Throttles API to test Skeleton loaders
          await new Promise((resolve) => setTimeout(resolve, 4000));
          return res;
        });
      }).as("request");

      cy.get('[data-cy="filters"]').contains("From").next().click();
      cy.get(
        '.MuiDateRangePickerDay-root button[aria-label="Jul 18, 2022"]'
      ).click();
      cy.root().click();
      cy.get('[data-cy="filters"]').contains("To").next().click();
      cy.get(
        '.MuiDateRangePickerDay-root button[aria-label="Jul 30, 2022"]'
      ).click();
      cy.root().click();
      cy.get(".MuiSkeleton-root").should("have.length", 16);
      cy.wait("@request");
      cy.get(".MuiSkeleton-root").should("have.length", 0);
    });
  });

  describe("Empty State", () => {
    it("Displays Resources Tab empty state", () => {
      cy.visit("/reports/activity-log/resources?from=2099-01-01&to=2099-01-02");
      cy.contains("No Resources Found");
    });
    it("Displays Users Tab empty state", () => {
      cy.visit("/reports/activity-log/users?from=2099-01-01&to=2099-01-02");
      cy.contains("No Users Found");
    });
    it("Displays Timeline Tab empty state", () => {
      cy.visit("/reports/activity-log/timeline?from=2099-01-01&to=2099-01-02");
      cy.contains("No Logs Found");
    });
    it("Displays Insights Tab empty state", () => {
      cy.visit("/reports/activity-log/insights?from=2099-01-01&to=2099-01-02");
      cy.contains("No Insights Found");
    });

    it("Resets filters", () => {
      cy.visit("/reports/activity-log/resources?from=2099-01-01&to=2099-01-02");
      cy.contains("RESET FILTERS").click();
      cy.location("search").should(
        "eq",
        `?from=${moment()
          .add(-3, "months")
          .format("YYYY-MM-DD")}&to=${moment().format("YYYY-MM-DD")}`
      );
    });
  });

  describe("API Error State", () => {
    it("Displays Error state", () => {
      cy.intercept("GET", "/v1/env/audits*", {
        statusCode: 500,
      }).as("request");
      cy.visit("/reports/activity-log/resources?from=2099-01-01&to=2099-01-02");

      cy.wait("@request");
      cy.contains("Whoops!");
    });
    it("Retries API call", () => {
      cy.intercept("GET", "/v1/env/audits*", {
        statusCode: 500,
      }).as("request");
      cy.visit("/reports/activity-log/resources?from=2099-01-01&to=2099-01-02");

      cy.wait("@request");
      cy.contains("RETRY").click();
      cy.wait("@request");
    });
  });

  it("Fetches initial data from Audit API with url parameters", () => {
    cy.intercept("GET", "/v1/env/audits*").as("request");
    cy.visit("/reports/activity-log/resources?from=2020-01-01&to=2020-01-02");
    cy.wait("@request")
      .its("request.url")
      .should("include", "start_date")
      .and("include", "end_date");
  });
});

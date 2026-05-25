import { format, addMonths, addDays, startOfDay } from "date-fns";

describe("Reports > Activity Log > Home", () => {
  describe("Tabs", () => {
    it("Highlights tabs depending on URL", () => {
      cy.visit("/reports/activity-log/resources");
      cy.getBySelector("activityLogTabResources").should(
        "have.attr",
        "aria-selected",
        "true"
      );

      cy.visit("/reports/activity-log/users");
      cy.getBySelector("activityLogTabUsers").should(
        "have.attr",
        "aria-selected",
        "true"
      );

      cy.visit("/reports/activity-log/timeline");
      cy.getBySelector("activityLogTabTimeline").should(
        "have.attr",
        "aria-selected",
        "true"
      );

      cy.visit("/reports/activity-log/insights");
      cy.getBySelector("activityLogTabInsights").should(
        "have.attr",
        "aria-selected",
        "true"
      );
    });

    it("Navigates on tab click", () => {
      cy.visit("/reports/activity-log/resources");

      cy.get(".MuiTabs-root").contains("Users").click();
      cy.location("pathname").should("eq", "/reports/activity-log/users");

      cy.visit("/reports/activity-log/timeline");
      cy.get(".MuiTabs-root").contains("Timeline").click();
      cy.location("pathname").should("eq", "/reports/activity-log/timeline");

      cy.visit("/reports/activity-log/insights");
      cy.get(".MuiTabs-root").contains("Insights").click();
      cy.location("pathname").should("eq", "/reports/activity-log/insights");

      cy.visit("/reports/activity-log/resources");
      cy.get(".MuiTabs-root").contains("Resources").click();
      cy.location("pathname").should("eq", "/reports/activity-log/resources");
    });
  });

  describe("Filters", () => {
    it("Sets default date url parameters if none are set", () => {
      cy.visit("/reports/activity-log/resources");
      const today = new Date();
      const threeMonthsAgo = addMonths(today, -3);
      cy.location("search").should(
        "eq",
        `?from=${format(threeMonthsAgo, "yyyy-MM-dd")}&to=${format(
          today,
          "yyyy-MM-dd"
        )}`
      );
    });

    it("Does not set default date url parameters if they are set", () => {
      cy.visit("/reports/activity-log/resources?from=2020-07-14&to=2020-07-16");
      const today = new Date();
      const threeMonthsAgo = addMonths(today, -3);
      cy.location("search").should(
        "not.eq",
        `?from=${format(threeMonthsAgo, "yyyy-MM-dd")}&to=${format(
          today,
          "yyyy-MM-dd"
        )}`
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

      /**
       * Note: Date needs to be hard-coded here to make sure that when the datepicker opens,
       * the cypress test runner can easily pick the date from the datepicker modal
       * instead of having to determine how many times to click the next month arrow everytime
       * to get to the current date.
       */
      const from = startOfDay(new Date("2022-07-14")).getTime();
      const to = startOfDay(addDays(new Date("2022-07-14"), 1)).getTime();

      // Set daterange filter
      cy.getBySelector("dateRange_selected").should("exist").click();
      cy.getBySelector("dateRange_picker").should("exist");
      cy.get(`[data-timestamp=${from}]`).should("exist").click();
      cy.get(`[data-timestamp=${to}]`).should("exist").click();

      // Set sort by filter
      cy.getBySelector("sortBy_default").should("exist").click();
      cy.getBySelector("filter_value_happenedAt").should("exist").click();

      // Set resource type filter
      cy.getBySelector("resourceType_default").should("exist").click();
      cy.getBySelector("filter_value_content").should("exist").click();

      const expectedFromDate = format(new Date("2022-07-14"), "yyyy-MM-dd");
      const expectedToDate = format(
        addDays(new Date("2022-07-14"), 1),
        "yyyy-MM-dd"
      );

      cy.location("search").should(
        "eq",
        `?from=${expectedFromDate}&to=${expectedToDate}&sortBy=happenedAt&resourceType=content`
      );
    });

    it("Filters block items", () => {
      cy.waitOn("/v1/env/audits*", () => {
        cy.visit("/reports/activity-log/resources");
      });

      cy.getBySelector("resourceType_default").should("exist").click();
      cy.getBySelector("filter_value_block").should("exist").click();
      cy.getBySelector("resource_list_item").should("exist");
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
      cy.getBySelector("resource_list_item")
        .should("have.attr", "data-is-loading", "false")
        .click();

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
      cy.getBySelector("resourceItemSkeleton").should("have.length", 10);
      cy.wait("@request");
      cy.getBySelector("resourceItemSkeleton").should("have.length", 0);
    });

    it("Displays partial Skeletons when changing dates and refetching API", () => {
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

      /**
       * Note: Date needs to be hard-coded here to make sure that when the datepicker opens,
       * the cypress test runner can easily pick the date from the datepicker modal
       * instead of having to determine how many times to click the next month arrow everytime
       * to get to the current date.
       */
      const from = startOfDay(new Date("2022-07-14")).getTime();
      const to = startOfDay(addDays(new Date("2022-07-14"), 1)).getTime();

      // Set daterange filter
      cy.getBySelector("dateRange_selected").should("exist").click();
      cy.getBySelector("dateRange_picker").should("exist");
      cy.get(`[data-timestamp=${from}]`).should("exist").click();
      cy.get(`[data-timestamp=${to}]`).should("exist").click();

      cy.root().click();
      cy.getBySelector("resourceItemSkeleton").should("have.length", 10);
      cy.wait("@request");
      cy.getBySelector("resourceItemSkeleton").should("have.length", 0);
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

      const today = new Date();
      const threeMonthsAgo = addMonths(today, -3);
      cy.location("search").should(
        "eq",
        `?from=${format(threeMonthsAgo, "yyyy-MM-dd")}&to=${format(
          today,
          "yyyy-MM-dd"
        )}`
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

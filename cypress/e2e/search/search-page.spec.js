describe("Global Search: Search Page", () => {
  it("Displays search results", () => {
    cy.waitOn(
      "https://8-f48cf3a682-7fthvk.api.dev.zesty.io/v1/search/items*",
      () => {
        cy.visit("/search?q=cypress");
      }
    );

    cy.getBySelector("ContentList").should("exist");
  });

  it("Shows the no results screen", () => {
    cy.waitOn(
      "https://8-f48cf3a682-7fthvk.api.dev.zesty.io/v1/search/items*",
      () => {
        cy.visit("/search?q=somerandomstringthatdoesnotexist");
      }
    );

    cy.getBySelector("NoSearchResults").should("exist");
  });

  it("Sets filters as url search parameters", () => {
    cy.waitOn(
      "https://8-f48cf3a682-7fthvk.api.dev.zesty.io/v1/search/items*",
      () => {
        cy.visit(
          "/search?q=somerandomstringthatdoesnotexist&user=5-b497838d8d-p2j5tm&datePreset=today"
        );
      }
    );

    cy.getBySelector("user_selected")
      .should("exist")
      .contains("Lunar Jay Cuenca");
    cy.getBySelector("date_selected").should("exist").contains("Today");
  });

  it("Sets URL search parameters are applied to the filter components", () => {
    cy.waitOn(
      "https://8-f48cf3a682-7fthvk.api.dev.zesty.io/v1/search/items*",
      () => {
        cy.visit("/search?q=somerandomstringthatdoesnotexist");
      }
    );

    // Set sort
    cy.getBySelector("sortBy_default").should("exist").click();
    cy.getBySelector("SortByFilterMenu")
      .find("li:nth-child(2)")
      .should("exist")
      .click();

    // Set user filter
    cy.getBySelector("user_default").should("exist").click();
    cy.getBySelector("UserFilterMenu")
      .find("li:nth-child(2)")
      .should("exist")
      .click();

    // Set date filter
    cy.getBySelector("date_default").should("exist").click();
    cy.getBySelector("DateFilterMenu")
      .find("li:first-child")
      .should("exist")
      .click();

    cy.location("search").should(
      "equal",
      `?q=somerandomstringthatdoesnotexist&sort=created&user=5-84d1e6d4ae-s3m974&datePreset=today`
    );
  });

  it("Shows the no results matching the filters applied screen", () => {
    cy.waitOn(
      "https://8-f48cf3a682-7fthvk.api.dev.zesty.io/v1/search/items*",
      () => {
        cy.visit(
          "/search?q=somerandomstringthatdoesnotexist&sort=created&user=5-84d1e6d4ae-s3m974&datePreset=today"
        );
      }
    );

    cy.getBySelector("NoSearchResults").should("exist");
  });
});

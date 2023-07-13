const SEARCH_TERM = `cypress ${Date.now()}`;

describe("Global Search: Search Bar", () => {
  it("Saves user input search keywords", () => {
    cy.waitOn(
      "https://8-f48cf3a682-7fthvk.api.dev.zesty.io/v1/search/items*",
      () => {
        cy.visit("/search?q=cypress");
      }
    );

    // Search for the keyword
    cy.getBySelector("global-search-textfield")
      .find("input")
      .should("exist")
      .type(SEARCH_TERM)
      .type("{enter}");

    // Open the dropdown
    cy.get("button.MuiAutocomplete-clearIndicator").should("exist").click();
    cy.getBySelector("global-search-textfield")
      .find("input")
      .should("exist")
      .click();

    // Verify if keyword was saved
    cy.getBySelector("global-search-recent-keyword")
      .should("exist")
      .should("contain", SEARCH_TERM);
  });

  it("Removes saved search keywords", () => {
    cy.waitOn(
      "https://8-f48cf3a682-7fthvk.api.dev.zesty.io/v1/search/items*",
      () => {
        cy.visit("/search?q=cypress");
      }
    );

    // Search for the keyword
    cy.getBySelector("global-search-textfield")
      .find("input")
      .should("exist")
      .type(SEARCH_TERM)
      .type("{enter}");

    // Open the dropdown
    cy.get("button.MuiAutocomplete-clearIndicator").should("exist").click();
    cy.getBySelector("global-search-textfield")
      .find("input")
      .should("exist")
      .click();

    // Verify if keyword was saved
    cy.getBySelector("global-search-recent-keyword")
      .should("exist")
      .should("contain", SEARCH_TERM);

    // Remove keyword from saved keywords, trigger mouseover is needed because remove button only shows up on list item hover
    cy.getBySelector("global-search-recent-keyword")
      .should("exist")
      .trigger("mouseover");
    cy.getBySelector("RemoveRecentSearchKeyword").should("exist").click();

    // Verify if keyword was removed
    cy.getBySelector("global-search-recent-keyword").should("not.exist");
  });

  it("Is able to navigate to search page when clicking a recent keyword", () => {
    cy.waitOn(
      "https://8-f48cf3a682-7fthvk.api.dev.zesty.io/v1/search/items*",
      () => {
        cy.visit("/search?q=cypress");
      }
    );

    // Add keyword to recent saved keywords
    cy.getBySelector("global-search-textfield")
      .find("input")
      .should("exist")
      .type(SEARCH_TERM)
      .type("{enter}");
    cy.get("button.MuiAutocomplete-clearIndicator").should("exist").click();
    cy.getBySelector("global-search-textfield")
      .find("input")
      .should("exist")
      .click();

    // Click on the recently saved keyword
    cy.getBySelector("global-search-recent-keyword").should("exist").click();

    // Verify that user is navigated to search page with correct search param
    cy.location("pathname").should("equal", "/search");
    cy.location("search").should(
      "equal",
      `?q=${SEARCH_TERM.replaceAll(/\s/g, "+")}`
    );
  });

  it("shows the search accelerators when search bar is opened", () => {
    cy.waitOn(
      "https://8-f48cf3a682-7fthvk.api.dev.zesty.io/v1/search/items*",
      () => {
        cy.visit("/");
      }
    );

    // Activate the global search bar
    cy.getBySelector("global-search-textfield")
      .find("input")
      .should("exist")
      .click();

    // Verify that search accelerators are present
    cy.getBySelector("global-search-accelerators").should("exist");
  });
});

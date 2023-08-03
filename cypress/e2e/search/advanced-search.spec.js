describe("Global Search: Advanced Search", () => {
  it("Opens the advanced search modal", () => {
    cy.waitOn(
      "https://8-f48cf3a682-7fthvk.api.dev.zesty.io/v1/search/items*",
      () => {
        cy.visit("/search?q=somerandomstringthatdoesnotexist");
      }
    );

    // Open via filter button
    cy.getBySelector("GlobalSearchFilterButton").click();
    cy.getBySelector("AdvanceSearchModal").should("exist");
    cy.get("body").type("{esc}");

    // Open via advanced search button
    cy.getBySelector("global-search-textfield").find("input").type("cypress");
    cy.getBySelector("AdvancedSearchButton").click();
    cy.getBySelector("AdvanceSearchModal").should("exist");
    cy.get("body").type("{esc}");
  });

  it("Passes text input from the global search input to the advanced search modal", () => {
    cy.waitOn(
      "https://8-f48cf3a682-7fthvk.api.dev.zesty.io/v1/search/items*",
      () => {
        cy.visit("/search?q=somerandomstringthatdoesnotexist");
      }
    );

    cy.getBySelector("global-search-textfield").find("input").type("cypress");
    cy.getBySelector("GlobalSearchFilterButton").click();
    cy.getBySelector("AdvanceSearchModal").should("exist");
    cy.getBySelector("AdvanceSearchKeyword")
      .find("input")
      .should("exist")
      .should("have.value", "cypress");
  });

  it("Is able to clear all user input when clicking the clear all button", () => {
    cy.waitOn(
      "https://8-f48cf3a682-7fthvk.api.dev.zesty.io/v1/search/items*",
      () => {
        cy.visit("/search?q=somerandomstringthatdoesnotexist");
      }
    );

    // Type in keyword
    cy.getBySelector("GlobalSearchFilterButton").click();
    cy.getBySelector("AdvanceSearchModal").should("exist");
    cy.getBySelector("AdvanceSearchKeyword").find("input").type("cypress");

    // Select a user
    cy.getBySelector("AdvanceSearchUser").click();
    cy.get("[data-option-index='0']").click();

    // Select a date
    cy.getBySelector("AdvanceSearchDate").click();
    cy.get("[data-value='today']").click();

    // Validate that values exist on the fields
    cy.getBySelector("AdvanceSearchKeyword")
      .find("input")
      .should("exist")
      .should("not.have.value", "");
    cy.getBySelector("AdvanceSearchUser")
      .find("input")
      .should("exist")
      .should("not.have.value", "");
    cy.getBySelector("AdvanceSearchDate").should("exist").contains("Today");

    cy.getBySelector("AdvanceSearchClearButton").click();

    // Validate that values do not exist on the fields
    cy.getBySelector("AdvanceSearchKeyword")
      .find("input")
      .should("exist")
      .should("have.value", "");
    cy.getBySelector("AdvanceSearchUser")
      .find("input")
      .should("exist")
      .should("have.value", "");
    cy.getBySelector("AdvanceSearchDate").contains("Any Time");
  });

  it("Takes the user to the search page with all user input set in the URL parameters accordingly", () => {
    cy.waitOn("/launchpad", () => {
      cy.visit("/launchpad");
    });

    // Type in keyword
    cy.getBySelector("GlobalSearchFilterButton").click();
    cy.getBySelector("AdvanceSearchModal").should("exist");
    cy.getBySelector("AdvanceSearchKeyword").find("input").type("cypress");

    // Select a date
    cy.getBySelector("AdvanceSearchDate").click();
    cy.get("[data-value='today']").click();

    // Validate that values exist on the fields
    cy.getBySelector("AdvanceSearchKeyword")
      .find("input")
      .should("exist")
      .should("not.have.value", "");
    cy.getBySelector("AdvanceSearchDate").contains("Today");

    cy.getBySelector("AdvanceSearchSubmitButton").click();

    cy.location("pathname").should("equal", "/search");
    cy.location("search").should("equal", "?q=cypress&datePreset=today");
  });
});

describe("Tabs actions", () => {
  /*
    USE CASES
    Pin a tab
    Unpin a tab
    Pin any URL (including root pages like /content)
      Pin a top level app (e.g. /content)
      Sub-apps like metrics & analytics
      Activity Log sub-item
      Activity Log search parameter
      Custom apps
    Saves to & restores from indexDB
    Make sure deletion triggers tab unpin & proper redirect in:
      WidgetDeleteItem.js
      LinkEdit.js
      MediaDeleteGroupModal.js
    Pinning more tabs than will fit creates a dropdown menu
    Dropdown input filters tabs that match text
    Clear all button clears tabs in dropdown, DOES NOT clear any other tabs
    Clear all button disappears when search is active
    Pins show human-readable text when possible
    Pins show proper app icon
  */

  it("Pins tabs", () => {
    cy.waitOn("/v1/web/views/11-e55790-f19nwx", () => {
      cy.visit("/code/file/views/11-e55790-f19nwx");
    });
    // Active tab should always be visible
    cy.get('[data-cy="ActiveTab"]');
    // Click the pin button on the active tab
    cy.get('[data-testid="PushPinOutlinedIcon"]').should("exist");
    cy.get('[data-testid="PushPinOutlinedIcon"]').click();
    // Active tab should show pinned state
    cy.get('[data-testid="PushPinIcon"]');
    cy.get('[data-cy="ActiveTab"]').find('[data-testid="PushPinIcon"]');
  });

  it("Unpins tabs", () => {
    // Pin the tab
    // cy.waitOn("/v1/web/views/11-e55790-f19nwx", () => {
    //   cy.visit("/code/file/views/11-e55790-f19nwx");
    // });
    // cy.get('[data-testid="PushPinOutlinedIcon"]').parent().click();
    // Unpin the tab
    cy.get('[data-cy="ActiveTab"]')
      .find('[data-testid="PushPinIcon"]')
      .parent()
      .click();
    // Ensure it is unpinned
    cy.get('[data-cy="ActiveTab"]')
      .find('[data-testid="PushPinIcon"]')
      .should("not.exist");
    cy.get('[data-cy="ActiveTab"]')
      .find('[data-testid="PushPinOutlinedIcon"]')
      .should("exist");
  });

  it("Stays pinned while navigating to different pages", () => {
    // Navigate to first page
    cy.waitOn("/v1/web/views/11-e55790-f19nwx", () => {
      cy.visit("/code/file/views/11-e55790-f19nwx");
    });
    // Pin the tab
    cy.get('[data-testid="PushPinOutlinedIcon"]').parent().click();
    // Ensure that it is pinned
    cy.get('[data-cy="ActiveTab"]')
      .find('[data-testid="PushPinIcon"]')
      .should("exist");
    cy.get('[data-cy="ActiveTab"]')
      .find('[data-testid="PushPinOutlinedIcon"]')
      .should("not.exist");
    // Navigate to second page
    cy.visit("/content");
    // Ensure active tab is unpinnned
    cy.get('[data-cy="ActiveTab"]')
      .find('[data-testid="PushPinIcon"]')
      .should("not.exist");
    cy.get('[data-cy="ActiveTab"]')
      .find('[data-testid="PushPinOutlinedIcon"]')
      .should("exist");
    // Ensure the original tab is still pinned
    cy.get('[data-testid="PushPinIcon"]').should("exist");
  });

  // Broken test needs to be revisited on new tabs design
  it("creates a dropdown when many tabs are pinned", () => {
    cy.viewport(1024, 720);
    /*
      Should create dropdown after ~3 tabs, but we'll pin 5 just to make sure:
      incase any CSS updates cause a change in behavior
    */

    // Pin tab #1 and ensure it is pinned
    cy.waitOn("/v1/web/views/11-e55790-f19nwx", () => {
      cy.visit("/code/file/views/11-e55790-f19nwx");
    });
    cy.get('[data-cy="ActiveTab"]')
      .find('[data-testid="PushPinIcon"]')
      .should("exist");
    cy.get('[data-cy="ActiveTab"]')
      .find('[data-testid="PushPinOutlinedIcon"]')
      .should("not.exist");

    // Small delay to allow the pinned tabs to be loaded properly
    cy.wait(500);

    // Pin tab #2 and ensure it is pinned
    cy.waitOn("/code/file/views/11-bc386c-gj560c", () => {
      cy.visit("/code/file/views/11-bc386c-gj560c");
    });
    cy.get('[data-testid="PushPinOutlinedIcon"]')
      .should("exist")
      .parent()
      .trigger("mouseover")
      .click();
    cy.get('[data-cy="ActiveTab"]')
      .find('[data-testid="PushPinIcon"]')
      .should("exist");

    cy.wait(500);

    // Pin tab #3 and ensure it is pinned
    cy.waitOn("/code/file/views/11-d10260-6t3jg6", () => {
      cy.visit("/code/file/views/11-d10260-6t3jg6");
    });
    cy.get('[data-testid="PushPinOutlinedIcon"]')
      .should("exist")
      .parent()
      .trigger("mouseover")
      .click();
    cy.get('[data-cy="ActiveTab"]')
      .find('[data-testid="PushPinIcon"]')
      .should("exist");

    cy.wait(500);

    // Pin tab #4 and ensure it is pinned
    cy.waitOn("/code/file/views/11-77b344-rflphh", () => {
      cy.visit("/code/file/views/11-77b344-rflphh");
    });
    cy.get('[data-testid="PushPinOutlinedIcon"]')
      .should("exist")
      .parent()
      .trigger("mouseover")
      .click();
    cy.get('[data-cy="ActiveTab"]')
      .find('[data-testid="PushPinIcon"]')
      .should("exist");

    cy.wait(500);

    // Pin tab #5 and ensure it is pinned
    cy.waitOn("/code/file/views/11-6bb028-b65lkz", () => {
      cy.visit("/code/file/views/11-6bb028-b65lkz");
    });
    cy.get('[data-testid="PushPinOutlinedIcon"]')
      .should("exist")
      .parent()
      .trigger("mouseover")
      .click();
    cy.get('[data-cy="ActiveTab"]')
      .find('[data-testid="PushPinIcon"]')
      .should("exist");

    // Ensure dropdown menu exists
    cy.get('[data-cy="TabsDropdownButton"').should("exist");
    cy.get('[data-cy="TabsDropdownButton"').click();
    cy.get('[data-cy="TabsDropdownMenu"').should("exist");

    // Search pins
    cy.get('[data-cy="TabsDropdownMenu"')
      .find("input[type=text]")
      .type("custom");

    // Force click outside the dropdown menu to close it
    cy.get('[data-cy="ActiveTab"').click({ force: true });

    // Resize the viewport and assert that the dropdown is gone
    cy.viewport(3440, 720);
    cy.get('[data-cy="TabsDropdownButton"').should("not.exist");
  });

  it("should put an active tab to the left when screen is resized to prevent putting it to the dropdown menu", () => {
    // Wait for all the tabs to be rendered properly
    cy.wait(500);

    cy.waitOn("/code/file/views/11-e55790-f19nwx", () => {
      cy.visit("/code/file/views/11-e55790-f19nwx");
    });
    cy.viewport(1024, 720);

    // Ensure that the tab was moved
    cy.get('[data-cy="ActiveTab"]').should("have.text", "customtype/bevs.csv");
  });

  it("should put a selected tab from the dropdown menu as the first tab item", () => {
    cy.viewport(1024, 720);

    // Open dropdown menu
    cy.get('[data-cy="TabsDropdownButton"').should("exist").click();

    // Search for a pinned tab
    cy.get('[data-cy="TabsDropdownMenu"').find("input[type=text]").type("card");

    // Click the pinned tab
    cy.get('[data-cy="TabsDropdownMenu"').find("a").should("exist").click();

    // Ensure that the tab was moved
    cy.get('[data-cy="ActiveTab"]').should("have.text", "customtype/card.vcf");
  });
});

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
    cy.getBySelector("UnpinnedTab").should("exist");
    // Click the pin button on the active tab
    cy.get('[data-testid="PushPinOutlinedIcon"]').should("exist");
    cy.get('[data-testid="PushPinOutlinedIcon"]').click();
    // Active tab should show pinned state
    cy.get('[data-testid="PushPinIcon"]');
    cy.getBySelector("PinnedTab-0").find('[data-testid="PushPinIcon"]');
  });

  it("Unpins tabs", () => {
    // Unpin the tab
    cy.getBySelector("PinnedTab-0")
      .find('[data-testid="PushPinIcon"]')
      .parent()
      .click();
    // Ensure it is unpinned
    cy.getBySelector("UnpinnedTab")
      .find('[data-testid="PushPinIcon"]')
      .should("not.exist");
    cy.getBySelector("UnpinnedTab")
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
    cy.getBySelector("PinnedTab-0")
      .find('[data-testid="PushPinIcon"]')
      .should("exist");
    cy.getBySelector("PinnedTab-0")
      .find('[data-testid="PushPinOutlinedIcon"]')
      .should("not.exist");
    // Navigate to second page
    cy.visit("/content");
    // Ensure active tab is unpinnned
    cy.getBySelector("UnpinnedTab")
      .find('[data-testid="PushPinIcon"]')
      .should("not.exist");
    cy.getBySelector("UnpinnedTab")
      .find('[data-testid="PushPinOutlinedIcon"]')
      .should("exist");
    // Ensure the original tab is still pinned
    cy.get('[data-testid="PushPinIcon"]').should("exist");
  });

  it("creates a dropdown when many tabs are pinned", () => {
    cy.viewport(1280, 720);
    /*
      Should create dropdown after 5 tabs
    */

    // Pin tab #1 and ensure it is pinned
    cy.waitOn("/v1/web/views/11-e55790-f19nwx", () => {
      cy.visit("/code/file/views/11-e55790-f19nwx");
    });
    cy.getBySelector("PinnedTab-0")
      .find('[data-testid="PushPinIcon"]')
      .should("exist");
    cy.getBySelector("PinnedTab-0")
      .find('[data-testid="PushPinOutlinedIcon"]')
      .should("not.exist");

    // Pin tab #2 and ensure it is pinned
    cy.waitOn("/launchpad", () => {
      cy.visit("/launchpad");
    });
    cy.getBySelector("UnpinnedTab").should("exist");
    // Verify that the 1st pinned tab still exists
    cy.getBySelector("PinnedTab-0").should("exist");
    cy.get('[data-testid="PushPinOutlinedIcon"]')
      .should("exist")
      .parent()
      .trigger("mouseover")
      .click();
    cy.getBySelector("PinnedTab-1")
      .find('[data-testid="PushPinIcon"]')
      .should("exist");

    cy.wait(100); // Makes sure that the pinned tabs have been properly saved to indexdb before navigating to a new url

    // Pin tab #3 and ensure it is pinned
    cy.waitOn("/redirects", () => {
      cy.visit("/redirects");
    });
    cy.getBySelector("UnpinnedTab").should("exist");
    // Verify that the other tabs still exist
    cy.getBySelector("PinnedTab-0").should("exist");
    cy.getBySelector("PinnedTab-1").should("exist");
    cy.get('[data-testid="PushPinOutlinedIcon"]')
      .should("exist")
      .parent()
      .trigger("mouseover")
      .click();
    cy.getBySelector("PinnedTab-2")
      .find('[data-testid="PushPinIcon"]')
      .should("exist");

    cy.wait(100); // Makes sure that the pinned tabs have been properly saved to indexdb before navigating to a new url

    // Pin tab #4 and ensure it is pinned
    cy.waitOn("/leads", () => {
      cy.visit("/leads");
    });
    cy.getBySelector("UnpinnedTab").should("exist");
    // Verify that the other tabs still exist
    cy.getBySelector("PinnedTab-0").should("exist");
    cy.getBySelector("PinnedTab-1").should("exist");
    cy.get('[data-testid="PushPinOutlinedIcon"]')
      .should("exist")
      .parent()
      .trigger("mouseover")
      .click();
    cy.getBySelector("PinnedTab-2")
      .find('[data-testid="PushPinIcon"]')
      .should("exist");

    cy.wait(100); // Makes sure that the pinned tabs have been properly saved to indexdb before navigating to a new url

    // Pin tab #5 and ensure it is pinned
    cy.waitOn("/media", () => {
      cy.visit("/media");
    });
    cy.getBySelector("UnpinnedTab").should("exist");
    // Verify that the other tabs still exist, we only have 4 pinned tabs at this point since the other 1 will go to the dropdown menu
    cy.getBySelector("PinnedTab-0").should("exist");
    cy.getBySelector("PinnedTab-1").should("exist");
    cy.get('[data-testid="PushPinOutlinedIcon"]')
      .should("exist")
      .parent()
      .trigger("mouseover")
      .click();
    cy.getBySelector("PinnedTab-2")
      .find('[data-testid="PushPinIcon"]')
      .should("exist");

    cy.wait(100); // Makes sure that the pinned tabs have been properly saved to indexdb before navigating to a new url

    // Ensure dropdown menu exists
    cy.getBySelector("TabsDropdownButton").should("exist");
    cy.getBySelector("TabsDropdownButton").click();
    cy.getBySelector("TabsDropdownMenu").should("exist");

    // Search pins
    cy.getBySelector("TabsDropdownMenu")
      .find("input[type=text]")
      .type("custom");

    // Force click outside the dropdown menu to close it
    cy.getBySelector("PinnedTab-0").click({ force: true });

    // Resize the viewport and assert that the dropdown is gone
    cy.viewport(3440, 720);
    cy.getBySelector("TabsDropdownButton").should("not.exist");
  });

  it("should put a selected tab from the dropdown menu as the first tab item", () => {
    // Verify that all pinned topbar tabs are loaded
    cy.getBySelector("PinnedTab-0").should("exist");
    cy.getBySelector("PinnedTab-1").should("exist");
    cy.getBySelector("PinnedTab-2").should("exist");
    cy.getBySelector("PinnedTab-3").should("exist");

    cy.viewport(1280, 720);
    cy.reload();

    // Open dropdown menu
    cy.getBySelector("TabsDropdownButton").should("exist").click();

    // Search for a pinned tab
    cy.getBySelector("TabsDropdownMenu")
      .find("input[type=text]")
      .type("bevs.csv");

    // Click the pinned tab
    cy.getBySelector("TabsDropdownMenu").find("a").should("exist").click();

    // Ensure that the tab was moved
    cy.getBySelector("PinnedTab-0").should("have.text", "customtype/bevs.csv");
  });

  it("should put an active tab to the left when screen is resized to prevent putting it to the dropdown menu", () => {
    // Verify that all pinned tabs are loaded
    cy.getBySelector("PinnedTab-0").should("exist");
    cy.getBySelector("PinnedTab-1").should("exist");
    cy.getBySelector("PinnedTab-2").should("exist");
    cy.getBySelector("PinnedTab-3").should("exist");

    cy.waitOn("/launchpad", () => {
      cy.visit("/launchpad");
    });

    // Verify that the current active tab is the visited url
    cy.get("[data-active=true]").should("exist");
    cy.get("[data-active=true]").should("have.text", "Launchpad");

    cy.viewport(1280, 720);

    cy.getBySelector("TabsDropdownButton").should("exist");

    // Ensure that the tab was moved to the first pinned location
    cy.getBySelector("PinnedTab-0").should("have.text", "Launchpad");
  });
});

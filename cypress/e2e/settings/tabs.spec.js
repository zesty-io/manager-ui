describe("Settings Actions", () => {
  before(() => {
    cy.visit("/");
  });

  /*
    USE CASES
    Pin a tab
    Unpin a tab
    Pin any URL (including root pages like /content)
      Pin a top level app (e.g. /content)
      Activity log sub-item
      activity log search parameter
    Pin custom apps
    Properly pins "sub-apps" like metrics & analytics
    Saves to & restores from indexDB
    Make sure deletion triggers tab unpin & proper redirect in:
      WidgetDeleteItem.js
      LinkEdit.js
      MediaDeleteGroupModal.js
    FIX Pinning more tabs than will fit creates a dropdown menu
    Dropdown input filters tabs that match text
    Clear all button clears tabs in dropdown, DOES NOT clear any other tabs
    Clear all button disappears when search is active
    Pins show human-readable text when possible
    Pins show proper app icon
  */

  it("Pins tabs", () => {
    cy.visit("/code/file/views/11-e55790-f19nwx");
    cy.get('[data-testid="PushPinOutlinedIcon"]').click();
    cy.get("tab");
  });
  it.skip("Does nothing", () => {});
});

const BYNDER_SCRIPT_GLOB = "https://ucv.bynder.com/**";

describe("Bynder script lazy loading", () => {
  it("does not request the Bynder script on page load", () => {
    cy.intercept("GET", BYNDER_SCRIPT_GLOB, { forceNetworkError: true }).as(
      "bynderScript"
    );
    cy.visit("/settings/instance/bynder");
    cy.contains("Bynder").should("exist");
    cy.document().then((doc) => {
      expect(
        doc.querySelectorAll('script[src*="ucv.bynder.com"]')
      ).to.have.length(0);
    });
    cy.get("@bynderScript.all").should("have.length", 0);
  });

  it("shows an error notification and injects one script per attempt when loading fails", () => {
    cy.intercept("GET", BYNDER_SCRIPT_GLOB, { forceNetworkError: true }).as(
      "bynderScript"
    );
    // Force the disconnected state so the Connect button always renders
    cy.intercept("GET", "**/env/settings", { data: [] });
    cy.visit("/settings/instance/bynder", {
      onBeforeLoad: (win) => {
        win.localStorage.removeItem("cvrt");
        win.localStorage.removeItem("cvad");
      },
    });

    // Double click before the load settles: only one script is injected
    cy.getBySelector("bynderConnectBtn").dblclick();

    cy.getBySelector("toast").should(
      "contain.text",
      "Unable to load Bynder. Please check your connection and try again."
    );
    cy.get("@bynderScript.all").should("have.length", 1);
    // Failed tag is cleaned up so a retry can inject again
    cy.document().then((doc) => {
      expect(
        doc.querySelectorAll('script[src*="ucv.bynder.com"]')
      ).to.have.length(0);
    });
  });
});

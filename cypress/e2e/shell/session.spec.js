describe("Shell: Logout and session expiry", () => {
  // Every test that ends the session (logout or forced session expiry)
  // must restore cy.session's cached cookie before the next spec runs,
  // since testIsolation: false means nothing re-authenticates automatically.
  const restoreSession = () => {
    cy.login();
    cy.visit("/content");
    cy.getBySelector("loginScreen").should("not.exist");
  };

  it("logs the user out and shows the login screen", () => {
    cy.visit("/content");

    cy.getBySelector("globalAccountAvatar").should("exist").click();
    cy.getBySelector("LogOut").should("exist").click();

    cy.getCookie(Cypress.env("COOKIE_NAME")).should("be.null");
    cy.getBySelector("loginScreen").should("be.visible");

    restoreSession();
  });

  it("shows only the login screen after logging out and revisiting a protected route", () => {
    cy.visit("/content");

    cy.getBySelector("globalAccountAvatar").should("exist").click();
    cy.getBySelector("LogOut").should("exist").click();
    cy.getBySelector("loginScreen").should("be.visible");

    cy.visit("/content");

    cy.getBySelector("loginScreen").should("be.visible");
    cy.getBySelector("loginEmail").should("be.visible");
    cy.getBySelector("loginPassword").should("be.visible");
    cy.getBySelector("loginSubmit").should("be.visible");

    restoreSession();
  });

  it("ends the session and redirects to the login screen after a 401 while authenticated", () => {
    // Stubbing GET ${SERVICE_AUTH}/verify does not reproduce this flow: its
    // own success handler flips auth.valid to false before the session
    // middleware's check runs, so endSession() never fires and no toast
    // appears. fetchInstance()'s per-ZUID request (**/v1/instances/<ZUID>)
    // returns the response untouched and its reducer never touches auth,
    // so auth.valid is still true when the session middleware inspects it.
    cy.intercept("GET", "**/v1/instances/*", {
      statusCode: 401,
      body: {},
    }).as("instance401");

    cy.visit("/content");
    cy.wait("@instance401");

    cy.getBySelector("toast").should("be.visible");
    cy.getBySelector("loginScreen", { timeout: 7000 }).should("be.visible");

    restoreSession();
  });

  // AC4 ("logout failure leaves the user signed in, no login screen") is not
  // covered here — see the blocked report for this task: logout()'s .catch
  // (src/shell/store/auth.js:235-241) always dispatches FETCH_AUTH_ERROR with
  // payload.auth: false on any /logout failure, and the reducer
  // (src/shell/store/auth.js:34-39) applies that straight to auth.valid, so
  // the login screen appears regardless of the server response.
});

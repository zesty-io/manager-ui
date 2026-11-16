import { v4 as uuidv4 } from "uuid";

const VERIFY_URL = `${Cypress.env("API_AUTH")}/verify`;
const COOKIE_NAME = Cypress.env("COOKIE_NAME");

// Spies on the /verify request sent with the given session token. The request
// still reaches the auth service, which rejects a made-up token.
const interceptVerify = (token) =>
  cy.intercept({
    method: "GET",
    url: VERIFY_URL,
    headers: { authorization: `Bearer ${token}` },
  });

// Waits until the auth state is the one that opens the Login screen.
const expectSignedOut = () =>
  cy
    .window()
    .its("zestyStore")
    .invoke("getState")
    .its("auth")
    .should((auth) => {
      expect(auth.checking).to.equal(false);
      expect(auth.valid).to.equal(false);
    });

// Replays the message the auth service's SSO window posts back, from the
// origin Login passes to SSOButtonGroup.
const postSSOMessage = (data) =>
  cy.window().then((win) => {
    win.dispatchEvent(
      new win.MessageEvent("message", {
        origin: win.CONFIG.SERVICE_AUTH,
        data: { source: "zesty", ...data },
      })
    );
  });

// Lets React render the previous message before the next one is posted, so
// the two are not batched into a single render.
const waitForRender = () =>
  cy.window().then(
    (win) =>
      new Cypress.Promise((resolve) => {
        win.requestAnimationFrame(() => {
          win.requestAnimationFrame(() => resolve());
        });
      })
  );

describe("Shell: Login with SSO", () => {
  beforeEach(() => {
    // Start without a session so the boot verify fails and Login opens.
    // clearAllCookies misses the host-only session cookie cy.login sets
    // until a page has loaded, so clear that one by name.
    cy.clearAllCookies();
    cy.clearCookie(COOKIE_NAME, {
      domain: new URL(Cypress.config("baseUrl")).hostname,
    });
    cy.getAllCookies().should((cookies) => {
      expect(cookies.map((cookie) => cookie.name)).not.to.include(COOKIE_NAME);
    });
    cy.visit("/");
    expectSignedOut();
  });

  after(() => {
    cy.clearAllCookies();
  });

  it("Signs in with SSO again after the session ends", () => {
    const firstToken = `sso-${uuidv4()}`;
    const secondToken = `sso-${uuidv4()}`;
    interceptVerify(firstToken).as("verifyFirstToken");
    interceptVerify(secondToken).as("verifySecondToken");

    postSSOMessage({ status: "200", token: firstToken });
    cy.wait("@verifyFirstToken");

    // The auth service rejects the token, which ends the session again
    expectSignedOut();

    postSSOMessage({ status: "200", token: secondToken });
    cy.wait("@verifySecondToken");
  });

  it("Ignores an SSO success that carries no token", () => {
    const token = `sso-${uuidv4()}`;
    const signedInTokens = [];
    interceptVerify(token).as("verifyToken");

    // Record the token behind every signed-in auth state from here on
    cy.window()
      .its("zestyStore")
      .then((store) => {
        store.subscribe(() => {
          const { auth } = store.getState();
          if (auth.valid) {
            signedInTokens.push(auth.token);
          }
        });
      });

    postSSOMessage({ status: "200" });
    waitForRender();
    postSSOMessage({ status: "200", token });
    cy.wait("@verifyToken");

    // Only the message that carried a token signed the user in
    cy.wrap(signedInTokens).should((tokens) => {
      expect(Cypress._.uniq(tokens)).to.deep.equal([token]);
    });
  });
});

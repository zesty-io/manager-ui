Cypress.Commands.add("login", () => {
  const formBody = new FormData();

  formBody.append("email", Cypress.env("email"));
  formBody.append("password", Cypress.env("password"));

  return cy
    .request({
      url: `${Cypress.env("API_AUTH")}/login`,
      method: "POST",
      credentials: "include",
      body: formBody,
    })
    .then(async (res) => {
      const response = await new Response(res.body).json();
      // We need the cookie value returned reset so it is unsecure and
      // accessible by javascript
      cy.setCookie(Cypress.env("COOKIE_NAME"), response.meta.token);
    });
});

Cypress.Commands.add("blockLock", () => {
  cy.intercept("/door/knock*", (req) => {
    req.reply({});
  });
});

Cypress.Commands.add("waitOn", (path, cb) => {
  cy.intercept(path).as("waitingOn");
  cb();
  cy.wait("@waitingOn", {
    timeout: 30000,
  });

  // Ensures that any announcement popups are closed prior to running tests
  const announcementModal = cy.get("body").find("[data-cy=AnnouncementPopup]");

  if (announcementModal) {
    cy.getBySelector("IgnoreAnnouncementButton").click();
  }
});

Cypress.Commands.add("assertClipboardValue", (value) => {
  cy.window().then((win) => {
    win.navigator?.clipboard?.readText().then((text) => {
      expect(text).to.eq(value);
    });
  });
});

Cypress.Commands.add("getBySelector", (selector, ...args) => {
  return cy.get(`[data-cy=${selector}]`, ...args);
});

Cypress.Commands.add("login", (eml, pass) => {
  const formBody = new FormData();

  formBody.append("email", eml || Cypress.env("validEmail"));
  formBody.append("password", pass || Cypress.env("validPassword"));

  fetch(`${Cypress.env("API_AUTH")}/login`, {
    method: "POST",
    credentials: "include",
    body: formBody
  })
    .then(res => res.json())
    .then(json => {
      // We need the cookie value returned reset so it is unsecure and
      // accessible by javascript
      cy.setCookie(Cypress.env("COOKIE_NAME"), json.meta.token);
    });
});

Cypress.Commands.add("goHome", () => {
  cy.visit("/");
  cy.get("#MainNavigation", { timeout: 10000 }).should("exist");
});

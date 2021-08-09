Cypress.Commands.add("login", () => {
  const formBody = new FormData();
  formBody.append("email", Cypress.env("EMAIL"));
  formBody.append("password", Cypress.env("PASSWORD"));

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

Cypress.Commands.add("goHome", () => {
  cy.visit("/");
  cy.get("#MainNavigation", { timeout: 10000 }).should("exist");
});

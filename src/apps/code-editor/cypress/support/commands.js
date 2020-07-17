Cypress.Commands.add("login", (eml, pass) => {
  const formBody = new FormData();

  formBody.append("email", eml || Cypress.env("validEmail"));
  formBody.append("password", pass || Cypress.env("validPassword"));

  return fetch(`${Cypress.env("API_AUTH")}/login`, {
    method: "POST",
    credentials: "include",
    body: formBody
  })
    .then(res => res.json())
    .then(json => json.data.data);
});

Cypress.Commands.add("gotoSchema", () => {
  cy.visit("/#!/schema");
  cy.get(".SchemaNav", { timeout: 10000 }).should("exist");
});

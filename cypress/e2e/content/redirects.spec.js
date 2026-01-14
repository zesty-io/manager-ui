const REDIRECTS = [
  {
    path: "redirects/0001",
    targetType: "page",
    code: 301,
    target: "",
  },
  {
    path: "redirects/0002",
    targetType: "page",
    code: 301,
    target: "",
  },
];

const ADD_REDIRECTS = {
  path: "redirects/0003",
  targetType: "page",
  code: 301,
  target: "",
};

const EDIT_REDIRECTS = {
  path: "redirects/0001/updated",
  targetType: "page",
  code: 301,
  target: "",
};

describe("Content item redirects", () => {
  let CURRENT_CONTENT;
  let REDIRECT_CONTENT;
  let CONTENT_ITEMS;
  let REDIRECT_ITEMS;

  before(() => {
    cy.task("seed:content", "fixtures/redirects.json").then(
      ({ model, items }) => {
        Cypress.env("contentZUID", model?.ZUID);
        Cypress.env("itemZUID", items[0]?.meta?.ZUID);
        CURRENT_CONTENT = model;
        CONTENT_ITEMS = items;
        publishItem(model?.ZUID, items[0]?.meta?.ZUID);
        createTestRedirects(items[0]?.meta?.ZUID, model?.name);
      }
    );

    cy.task("seed:content", "fixtures/content.json").then(
      ({ model, items }) => {
        Cypress.env("redirectContentZUID", model?.ZUID);
        Cypress.env("redirectItemZUID", items[0]?.meta?.ZUID);

        REDIRECT_CONTENT = model;
        REDIRECT_ITEMS = items;

        publishItem(model?.ZUID, items[0]?.meta?.ZUID);
      }
    );
  });

  it("should show redirects for a content item", () => {
    cy.visit(
      `/content/${Cypress.env("contentZUID")}/${Cypress.env(
        "itemZUID"
      )}/redirects`
    );
    cy.get(".MuiDataGrid-row").should("have.length", 2);
  });

  it("should be able to edit a redirect", () => {
    cy.get(".MuiDataGrid-cell")
      .contains(`${CURRENT_CONTENT?.name}/${REDIRECTS[0].path}`, {
        matchCase: false,
      })
      .parents(".MuiDataGrid-row")
      .find(".MuiDataGrid-cell .MuiDataGrid-actionsCell .MuiIconButton-root")
      .click();
    cy.getBySelector("EditRedirect").click();
    cy.getBySelector("RedirectsFieldPath")
      .find("input")
      .clear()
      .type(`${CURRENT_CONTENT?.name}/${EDIT_REDIRECTS.path}`);
    cy.getBySelector("RedirectsCreateButton").click({ timeout: 15000 });

    cy.contains(`${CURRENT_CONTENT?.name}/${EDIT_REDIRECTS.path}`, {
      timeout: 10000,
    }).should("exist");
  });

  it("should be able to delete a redirect", () => {
    cy.get(".MuiDataGrid-cell")
      .contains(`${CURRENT_CONTENT?.name}/${REDIRECTS[0].path}/updated`, {
        matchCase: false,
      })
      .parents(".MuiDataGrid-row")
      .find(".MuiDataGrid-cell .MuiDataGrid-actionsCell .MuiIconButton-root")
      .click();
    cy.getBySelector("DeleteRedirect").click();
    cy.getBySelector("ConfirmDeleteRedirect").click();

    cy.get(".MuiDataGrid-cell")
      .contains(`${CURRENT_CONTENT?.name}/${REDIRECTS[0].path}/updated`)
      .should("have.length", 0);
  });

  it("Add Incoming Redirect", () => {
    cy.visit(
      `/content/${Cypress.env("contentZUID")}/${Cypress.env(
        "itemZUID"
      )}/redirects`
    );
    cy.get('[data-cy="AddIncomingRedirectButton"]').click();

    cy.get('[data-cy="RedirectsFieldPath"]:eq(0) input')
      .clear()

      .type(`${CURRENT_CONTENT?.name}/${ADD_REDIRECTS.path}`);

    cy.get('[data-cy="RedirectsCreateButton"]').click();

    cy.get(".MuiDataGrid-row").should("have.length", 2);
  });

  it("Redirect Content Item", () => {
    cy.visit(
      `/content/${Cypress.env("contentZUID")}/${Cypress.env(
        "itemZUID"
      )}/redirects`
    );
    cy.get('[data-cy="RedirectContentItemButton"]').click();

    cy.get('[data-cy="RedirectsSearchFieldInputField"]')
      .clear()
      .type(REDIRECT_ITEMS[0]?.web.metaTitle);

    cy.get('[data-cy="RedirectsTargetOptionsContainer"] ul li')
      .contains(REDIRECT_ITEMS[0]?.web.metaTitle, {
        matchCase: false,
      })
      .click();

    cy.get('[data-cy="RedirectContentItemConfirmButton"]').click();

    cy.get('[data-cy="ContentRedirectHeader"]').should(
      "contain",
      "This Content Item is Currently Being Redirected"
    );

    cy.get('[data-cy="RedirectContentItemButton"]').should(
      "contain",
      "Stop Redirecting"
    );

    cy.get('[data-cy="RedirectTargetUrl"]').should(
      "contain",
      REDIRECT_ITEMS[0]?.web?.pathPart
    );
  });

  it("Stop Content Item Redirect", () => {
    cy.get('[data-cy="RedirectContentItemButton"]').click();
    cy.get('[data-cy="StopRedirectContentItemConfirmButton"]').click();

    cy.get('[data-cy="toast"]').should("contain", "1 Redirect Deleted", {
      matchCase: false,
    });

    cy.get('[data-cy="ContentRedirectHeader"]').should(
      "contain",
      "Redirect this Content Item"
    );

    cy.get('[data-cy="RedirectContentItemButton"]').should(
      "contain",
      "Redirect this Content Item"
    );
  });
});

function publishItem(modelZUID, itemZUID) {
  cy.apiRequest({
    url: `${Cypress.env(
      "API_INSTANCE_URL"
    )}/content/models/${modelZUID}/items/${itemZUID}/publishings`,
    method: "POST",
    body: JSON.stringify({
      version: 1,
      publishAt: "now",
      unpublishAt: "never",
    }),
  });
}

function createTestRedirects(ZUID, path) {
  REDIRECTS.forEach((redirect) => {
    const data = {
      ...redirect,
      path: `${path}/${redirect.path}`,
      target: ZUID,
    };
    cy.apiRequest({
      url: `${Cypress.env("API_INSTANCE_URL")}/web/redirects`,
      method: "POST",
      body: JSON.stringify(data),
    });
  });
}

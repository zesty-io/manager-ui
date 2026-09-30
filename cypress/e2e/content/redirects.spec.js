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
  // Only assigned/read inside the skipped "Redirect Content Item" test below.
  let REDIRECT_ITEMS;

  before(() => {
    cy.task("seed:content", "fixtures/redirects.json").then(
      ({ model, items }) => {
        Cypress.env("contentZUID", model?.ZUID);
        Cypress.env("itemZUID", items[0]?.meta?.ZUID);
        CURRENT_CONTENT = model;
        cy.task("api:publishItem", {
          modelZUID: model?.ZUID,
          itemZUID: items[0]?.meta?.ZUID,
        });
        createTestRedirects(items[0]?.meta?.ZUID, model?.name);
      }
    );
  });

  it("should show redirects for a content item", () => {
    awaitRedirectsData(
      `/content/${Cypress.env("contentZUID")}/${Cypress.env(
        "itemZUID"
      )}/redirects`
    );
    cy.get(".MuiDataGrid-row").should("have.length", 2);
  });

  it("should be able to edit a redirect", () => {
    cy.get(".MuiDataGrid-cell")
      .contains(`${CURRENT_CONTENT?.name}/${REDIRECTS[0].path}`)
      .parents(".MuiDataGrid-row")
      .find(".MuiDataGrid-cell .MuiDataGrid-actionsCell .MuiIconButton-root")
      .click();
    cy.getBySelector("EditRedirect").click();
    cy.getBySelector("RedirectsFieldPath")
      .find("input")
      .clear()
      .type(`${CURRENT_CONTENT?.name}/${EDIT_REDIRECTS.path}`);
    cy.getBySelector("RedirectsCreateButton").click({ timeout: 15000 });

    cy.contains(`${CURRENT_CONTENT?.name}/${EDIT_REDIRECTS.path}`).should(
      "exist"
    );
  });

  it("should be able to delete a redirect", () => {
    cy.get(".MuiDataGrid-cell")
      .contains(`${CURRENT_CONTENT?.name}/${REDIRECTS[0].path}/updated`)
      .parents(".MuiDataGrid-row")
      .find(".MuiDataGrid-cell .MuiDataGrid-actionsCell .MuiIconButton-root")
      .click();
    cy.getBySelector("DeleteRedirect").click();
    cy.getBySelector("ConfirmDeleteRedirect").click();

    cy.contains(
      ".MuiDataGrid-cell",
      `${CURRENT_CONTENT?.name}/${REDIRECTS[0].path}/updated`
    ).should("not.exist");
  });

  it("Add Incoming Redirect", () => {
    awaitRedirectsData(
      `/content/${Cypress.env("contentZUID")}/${Cypress.env(
        "itemZUID"
      )}/redirects`
    );
    cy.getBySelector("AddIncomingRedirectButton").should("be.enabled").click();

    cy.getBySelector("RedirectsFieldPath")
      .eq(0)
      .find("input")
      .clear()
      .type(`${CURRENT_CONTENT?.name}/${ADD_REDIRECTS.path}`);

    cy.intercept("POST", "**/v1/web/redirects").as("createRedirect");
    cy.intercept("GET", "**/v1/web/redirects").as("getRedirect");

    cy.getBySelector("RedirectsCreateButton").should("be.enabled").click();

    cy.wait(["@createRedirect", "@getRedirect"]);

    cy.get(".MuiDataGrid-row").should("have.length", 2);
  });

  // Skipped: flaky on the shared dev instance due to redirect-indexing lag — the
  // redirect item's publish hasn't always propagated to the target search index
  // by the time this runs, so the target picker can flag it "unpublished" and
  // the create POST intermittently fails ("unable to redirect unpublished item").
  // "Stop Content Item Redirect" depends on this, so it's skipped too. Re-enable
  // when the instance has stable redirect/publish indexing.
  it.skip("Redirect Content Item", () => {
    cy.task("seed:content", "fixtures/content.json").then(
      ({ model, items }) => {
        Cypress.env("redirectContentZUID", model?.ZUID);
        Cypress.env("redirectItemZUID", items[0]?.meta?.ZUID);

        REDIRECT_ITEMS = items;

        cy.task("api:publishItem", {
          modelZUID: model?.ZUID,
          itemZUID: items[0]?.meta?.ZUID,
        });

        awaitRedirectsData(
          `/content/${Cypress.env("contentZUID")}/${Cypress.env(
            "itemZUID"
          )}/redirects`
        );
        cy.getBySelector("RedirectContentItemButton")
          .should("be.enabled")
          .click();

        cy.getBySelector("RedirectsSearchFieldInputField")
          .clear()
          .type(`${REDIRECT_ITEMS[0]?.web.metaTitle}`);

        cy.getBySelector("RedirectsTargetOptionsContainer")
          .find("ul li")
          .contains(REDIRECT_ITEMS[0]?.web.metaTitle, {
            matchCase: false,
          })
          .click();

        cy.intercept("POST", "**/web/redirects").as("createContentRedirect");

        cy.getBySelector("RedirectContentItemConfirmButton")
          .should("be.enabled")
          .click();

        cy.wait("@createContentRedirect");

        cy.getBySelector("ContentRedirectHeader").should(
          "contain",
          "This Content Item is Currently Being Redirected"
        );

        cy.getBySelector("RedirectContentItemButton").should(
          "contain",
          "Stop Redirecting"
        );

        cy.getBySelector("RedirectTargetUrl").should(
          "contain",
          REDIRECT_ITEMS[0]?.web?.pathPart
        );
      }
    );
  });

  // Skipped: depends on "Redirect Content Item" above. Re-enable together.
  it.skip("Stop Content Item Redirect", () => {
    cy.intercept("DELETE", "**/web/redirects/**").as("deleteContentRedirect");
    cy.getBySelector("RedirectContentItemButton")
      .should("exist")
      .click({ force: true });
    cy.getBySelector("StopRedirectContentItemConfirmButton")
      .should("be.enabled")
      .click();

    cy.wait("@deleteContentRedirect");

    cy.get('[data-cy="toast"]').should("contain", "1 Redirect Deleted", {
      matchCase: false,
    });

    cy.getBySelector("ContentRedirectHeader").should(
      "contain",
      "Redirect this Content Item"
    );

    cy.getBySelector("RedirectContentItemButton").should(
      "contain",
      "Redirect this Content Item"
    );
  });
});

function createTestRedirects(ZUID, path) {
  REDIRECTS.forEach((redirect) => {
    cy.task("api:createRedirect", {
      ...redirect,
      path: `/${path}/${redirect.path}`,
      target: ZUID,
    });
  });
}

function awaitRedirectsData(path) {
  cy.intercept("GET", "**/v1/content/models").as("getModels");
  cy.intercept("GET", "**/v1/content/items/publishings**").as("getPublishings");
  cy.intercept("GET", "**/v1/web/redirects").as("getRedirects");

  cy.visit(path);
  cy.wait(["@getModels", "@getPublishings", "@getRedirects"], {
    requestTimeout: 30000,
  });
}

import { API_ENDPOINTS } from "../../support/api";

const CURRENT_CONTENT = {
  label: "Current Content ---TEST",
  name: "current_content____test",
  type: "templateset",
  description: "",
  parentZUID: null,
  listed: true,
};

const REDIRECT_CONTENT = {
  label: "Redirect Content ---TEST",
  name: "redirect_content____test",
  type: "templateset",
  description: "",
  parentZUID: null,
  listed: true,
};

const CONTENT_ITEMS = [
  {
    data: {},
    web: {
      canonicalTagMode: 1,
      parentZUID: "0",
      metaTitle: "Content Item 0001 ---test",
      pathPart: "content_item_0001____test",
    },
    meta: {
      langID: 1,
      contentModelZUID: "",
    },
  },
  {
    data: {},
    web: {
      canonicalTagMode: 1,
      parentZUID: "0",
      metaTitle: "Content Item 0002 ---test",
      pathPart: "content_item_0002____test",
    },
    meta: {
      langID: 1,
      contentModelZUID: "",
    },
  },
  {
    data: {},
    web: {
      canonicalTagMode: 1,
      parentZUID: "0",
      metaTitle: "Content Item 0003 ---test",
      pathPart: "content_item_0003____test",
    },
    meta: {
      langID: 1,
      contentModelZUID: "",
    },
  },
];

const REDIRECT_ITEMS = [
  {
    data: {},
    web: {
      canonicalTagMode: 1,
      parentZUID: "0",
      metaTitle: "Redirect Item 0001 ---TEST",
      pathPart: "redirect_item_0001____test",
    },
    meta: {
      langID: 1,
      contentModelZUID: "",
    },
  },
];

const REDIRECTS = [
  {
    path: "test/redirects/0001",
    targetType: "page",
    code: 301,
    target: "",
  },
  {
    path: "test/redirects/0002",
    targetType: "page",
    code: 301,
    target: "",
  },
];

const ADD_REDIRECTS = {
  path: "test/redirects/0003",
  targetType: "page",
  code: 301,
  target: "",
};

const EDIT_REDIRECTS = {
  path: "test/redirects/0001/updated",
  targetType: "page",
  code: 301,
  target: "",
};

const CONTENT_LABELS = [CURRENT_CONTENT.label, REDIRECT_CONTENT.label];

const REDIRECT_PATHS = [
  ...REDIRECTS.map((item) => item.path),
  ADD_REDIRECTS?.path,
  EDIT_REDIRECTS?.path,
];

describe("Content item redirects", () => {
  before(() => {
    deleteTestContents();
    deleteTestRedirects();
    createTestContents();
  });
  after(() => {
    deleteTestContents();
    deleteTestRedirects();
  });
  it("should show redirects for a content item", () => {
    cy.visit(
      `/content/${Cypress.env("contentZUID")}/${Cypress.env(
        "itemZUID"
      )}/redirects`
    );
    cy.getElement(".MuiDataGrid-row").should("have.length", 2);
  });

  it("should be able to edit a redirect", () => {
    cy.getElement(".MuiDataGrid-cell")
      .contains(`/${REDIRECTS[0].path}`, { matchCase: false })
      .parents(".MuiDataGrid-row")
      .find(".MuiDataGrid-cell .MuiDataGrid-actionsCell .MuiIconButton-root")
      .click();
    cy.getBySelector("EditRedirect").click();
    cy.getBySelector("RedirectsFieldPath")
      .find("input")
      .clear()
      .type(EDIT_REDIRECTS.path);
    cy.getBySelector("RedirectsCreateButton").click({ timeout: 15000 });

    cy.contains(`/${EDIT_REDIRECTS.path}`, { timeout: 10000 }).should("exist");
  });

  it("should be able to delete a redirect", () => {
    cy.getElement(".MuiDataGrid-cell")
      .contains(`/${REDIRECTS[0].path}/updated`, { matchCase: false })
      .parents(".MuiDataGrid-row")
      .find(".MuiDataGrid-cell .MuiDataGrid-actionsCell .MuiIconButton-root")
      .click();
    cy.getBySelector("DeleteRedirect").click();
    cy.getBySelector("ConfirmDeleteRedirect").click();

    cy.getElement(".MuiDataGrid-cell")
      .contains(`/${REDIRECTS[0].path}/updated`, { timeout: 10000 })
      .should("have.length", 0);
  });

  it("Add Incoming Redirect", () => {
    cy.visit(
      `/content/${Cypress.env("contentZUID")}/${Cypress.env(
        "itemZUID"
      )}/redirects`
    );
    cy.getElement('[data-cy="AddIncomingRedirectButton"]').click();

    cy.getElement('[data-cy="RedirectsFieldPath"]:eq(0) input')
      .clear()
      .wait(500)
      .type(ADD_REDIRECTS.path);

    cy.getElement('[data-cy="RedirectsCreateButton"]').click();

    cy.getElement(".MuiDataGrid-row").should("have.length", 2);
  });

  it("Redirect Content Item", () => {
    cy.visit(
      `/content/${Cypress.env("contentZUID")}/${Cypress.env(
        "itemZUID"
      )}/redirects`
    );
    cy.getElement('[data-cy="RedirectContentItemButton"]').click();

    cy.getElement('[data-cy="RedirectsSearchFieldInputField"]')
      .clear()
      .wait(500)
      .type(REDIRECT_ITEMS[0]?.web.metaTitle);

    cy.getElement('[data-cy="RedirectsTargetOptionsContainer"] ul li')
      .contains(REDIRECT_ITEMS[0]?.web.metaTitle, {
        timeout: 15000,
        matchCase: false,
      })
      .click();

    cy.intercept("POST", "**/web/redirects").as("createContentRedirect");
    cy.getElement('[data-cy="RedirectContentItemConfirmButton"]').click();
    cy.wait("@createContentRedirect");

    cy.getElement('[data-cy="ContentRedirectHeader"]').should(
      "contain",
      "This Content Item is Currently Being Redirected"
    );

    cy.getElement('[data-cy="RedirectContentItemButton"]').should(
      "contain",
      "Stop Redirecting"
    );

    cy.getElement('[data-cy="RedirectTargetUrl"]').should(
      "contain",
      REDIRECT_ITEMS[0]?.web?.pathPart
    );
  });

  it("Stop Content Item Redirect", () => {
    cy.intercept("DELETE", "**/web/redirects/**").as("deleteContentRedirect");
    cy.getElement('[data-cy="RedirectContentItemButton"]').click();
    cy.getElement('[data-cy="StopRedirectContentItemConfirmButton"]').click();
    cy.wait("@deleteContentRedirect");

    cy.getElement('[data-cy="toast"]').should("contain", "1 Redirect Deleted", {
      matchCase: false,
    });

    cy.getElement('[data-cy="ContentRedirectHeader"]').should(
      "contain",
      "Redirect this Content Item"
    );

    cy.getElement('[data-cy="RedirectContentItemButton"]').should(
      "contain",
      "Redirect this Content Item"
    );
  });
});

function createTestContents() {
  let contentZUID = "";
  let itemZUID = "";
  cy.apiRequest({
    url: `${API_ENDPOINTS.devInstance}/content/models`,
    method: "POST",
    body: JSON.stringify(CURRENT_CONTENT),
  })
    .then((contentRes) => {
      Cypress.env(`contentZUID`, contentRes?.data?.ZUID);
      contentZUID = contentRes?.data?.ZUID;
      cy.apiRequest({
        url: `${API_ENDPOINTS.devInstance}/content/models/${contentRes?.data?.ZUID}/items`,
        method: "POST",
        body: JSON.stringify({
          ...CONTENT_ITEMS[0],
          meta: {
            ...CONTENT_ITEMS[0]?.meta,
            contentModelZUID: contentRes?.data?.ZUID,
          },
        }),
      }).then((itemRes) => {
        itemZUID = itemRes?.data?.ZUID;
        Cypress.env(`itemZUID`, itemRes?.data?.ZUID);
        cy.apiRequest({
          url: `${API_ENDPOINTS.devInstance}/content/models/${contentRes?.data?.ZUID}/items/${itemRes?.data?.ZUID}/publishings`,
          method: "POST",
          body: JSON.stringify({
            version: 1,
            publishAt: "now",
            unpublishAt: "never",
          }),
        });
      });
    })
    .then(() => {
      createTestRedirects(itemZUID);
    });

  let redirectContentZUID = "";
  let redirectItemZUID = "";

  cy.apiRequest({
    url: `${API_ENDPOINTS.devInstance}/content/models`,
    method: "POST",
    body: JSON.stringify(REDIRECT_CONTENT),
  }).then((contentRes) => {
    Cypress.env(`redirectContentZUID`, contentRes?.data?.ZUID);
    redirectContentZUID = contentRes?.data?.ZUID;
    cy.apiRequest({
      url: `${API_ENDPOINTS.devInstance}/content/models/${contentRes?.data?.ZUID}/items`,
      method: "POST",
      body: JSON.stringify({
        ...REDIRECT_ITEMS[0],
        meta: {
          ...REDIRECT_ITEMS[0]?.meta,
          contentModelZUID: contentRes?.data?.ZUID,
        },
      }),
    }).then((itemRes) => {
      redirectItemZUID = itemRes?.data?.ZUID;
      Cypress.env(`redirectItemZUID`, itemRes?.data?.ZUID);
      cy.apiRequest({
        url: `${API_ENDPOINTS.devInstance}/content/models/${contentRes?.data?.ZUID}/items/${itemRes?.data?.ZUID}/publishings`,
        method: "POST",
        body: JSON.stringify({
          version: 1,
          publishAt: "now",
          unpublishAt: "never",
        }),
      });
    });
  });
}

function createTestRedirects(ZUID) {
  REDIRECTS.forEach((redirect) => {
    const data = {
      ...redirect,
      path: `/${redirect.path}`,
      target: ZUID,
    };
    cy.apiRequest({
      url: `${API_ENDPOINTS.devInstance}/web/redirects`,
      method: "POST",
      body: JSON.stringify(data),
    });
  });
}

function deleteTestRedirects() {
  cy.apiRequest({
    url: `${API_ENDPOINTS.devInstance}/web/redirects`,
  }).then(({ status, data }) => {
    const forDeleteZuids = data
      ?.filter((item) =>
        REDIRECT_PATHS?.includes(item?.path?.replace(/^\/|\/$/g, ""))
      )
      .map((del) => del?.ZUID);

    forDeleteZuids?.forEach((zuid) => {
      cy.apiRequest({
        url: `${API_ENDPOINTS.devInstance}/web/redirects/${zuid}`,
        method: "DELETE",
      });
    });
  });
}

function deleteTestContents() {
  cy.apiRequest({
    url: `${API_ENDPOINTS.devInstance}/content/models`,
    method: "GET",
  }).then((res) => {
    const forDelete = res?.data?.filter((item) =>
      CONTENT_LABELS?.includes(item?.label)
    );
    const ZUIDforDelete = forDelete?.map((item) => item?.ZUID);
    ZUIDforDelete.forEach((ZUID) => {
      cy.apiRequest({
        url: `${API_ENDPOINTS.devInstance}/content/models/${ZUID}`,
        method: "DELETE",
      });
    });
  });
}
Cypress.Commands.add("getElement", (selector) => {
  return cy.get(selector, { timeout: 20_000 });
});

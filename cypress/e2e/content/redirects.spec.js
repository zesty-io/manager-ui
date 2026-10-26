import { v4 as uuidv4 } from "uuid";

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

describe("Redirect prompt on URL Path Part change", () => {
  // Dedicated fixture/model so this doesn't interfere with the shared
  // contentZUID/itemZUID used by the tests above. The item needs
  // `web.parentZUID: "0"` — the SEO/meta tab requires metaTitle, parentZUID,
  // and pathPart before it will save, and redirects.json's items have no
  // parentZUID.
  let PATH_CHANGE_CONTENT_ZUID;
  let PATH_CHANGE_ITEM_ZUID;

  before(() => {
    cy.task("seed:content", "fixtures/redirects-path-change.json").then(
      ({ model, items }) => {
        PATH_CHANGE_CONTENT_ZUID = model?.ZUID;
        PATH_CHANGE_ITEM_ZUID = items[0]?.meta?.ZUID;
        cy.task("api:publishItem", {
          modelZUID: model?.ZUID,
          itemZUID: items[0]?.meta?.ZUID,
        });
      }
    );
  });

  it("Prompts to redirect the old path (not a self-redirect) when the URL Path Part changes", () => {
    const NEW_PATH_PART = `renamed-${uuidv4()}`;
    let OLD_PATH;

    // Ground truth for the currently published path, read directly from the
    // API rather than assumed from fixture data, so this doesn't depend on
    // exactly how seed:content/formatPathPart shaped the seeded path.
    cy.apiRequest({
      url: `${Cypress.env(
        "API_INSTANCE_URL"
      )}/search/items?q=${PATH_CHANGE_ITEM_ZUID}&order=created&dir=DESC&limit=1`,
    }).then((response) => {
      OLD_PATH = response?.data?.[0]?.web?.path;
      expect(OLD_PATH, "seeded item's currently published path").to.be.a(
        "string"
      ).and.not.be.empty;
    });

    cy.intercept("GET", "**/v1/content/models").as("getModels");
    cy.intercept("GET", "**/v1/search/items**").as("getSearchItems");
    cy.visit(
      `/content/${PATH_CHANGE_CONTENT_ZUID}/${PATH_CHANGE_ITEM_ZUID}/meta`
    );
    cy.wait(["@getModels", "@getSearchItems"]);

    cy.getBySelector("pathPart")
      .find("input")
      .click()
      .clear()
      .type(NEW_PATH_PART);

    // The path-part uniqueness check is debounced (ItemRoute.tsx), and the
    // helper text (the only place the new part appears as real text content,
    // as opposed to the input's `value`) only renders once it settles as
    // unique. Wait for it instead of a fixed cy.wait(ms).
    cy.getBySelector("pathPart").should("contain.text", `/${NEW_PATH_PART}`);

    cy.intercept("PUT", "**/content/models/*/items/*").as("saveItem");
    cy.intercept("POST", "**/content/models/*/items/*/publishings").as(
      "publishItem"
    );
    cy.intercept("POST", "**/web/redirects").as("createRedirect");

    // Item is dirty from the edit above, so this button saves then publishes.
    cy.getBySelector("PublishButton").should("be.enabled").click();
    cy.wait("@saveItem");

    cy.getBySelector("ConfirmPublishModal")
      .should("exist")
      .within(() => {
        cy.getBySelector("ConfirmPublishButton").click();
      });

    cy.wait("@publishItem");

    // The create-redirect prompt opens automatically once the republish
    // completes and the item now has 2 published versions with different paths.
    cy.getBySelector("RedirectsChangeDialog", { timeout: 20000 }).should(
      "exist"
    );
    // OLD_PATH is assigned asynchronously above (cy.apiRequest().then()), so
    // it must be read lazily inside a callback here — passing it directly as
    // a `.should(chainer, value)` argument would capture its value (still
    // undefined) at test-body-evaluation time, before that .then() runs.
    cy.getBySelector("RedirectsChangeDialogOldPath").should(($el) => {
      expect($el.text()).to.equal(OLD_PATH);
    });
    cy.getBySelector("RedirectsChangeDialogNewPath").should(
      "contain",
      NEW_PATH_PART
    );

    cy.getBySelector("RedirectsChangeDialogCreateButton").click();

    cy.wait("@createRedirect").then((interception) => {
      // The bug: this used to submit the NEW path, creating a self-redirect.
      expect(interception.request.body.path).to.equal(OLD_PATH);
      expect(interception.request.body.target).to.equal(PATH_CHANGE_ITEM_ZUID);
    });

    // Known dev-instance redirect-indexing lag (see the skipped tests in the
    // describe above) can delay this row showing up — the payload assertion
    // above is deterministic and load-bearing; this is a best-effort
    // confirmation with a longer timeout.
    awaitRedirectsData(
      `/content/${PATH_CHANGE_CONTENT_ZUID}/${PATH_CHANGE_ITEM_ZUID}/redirects`
    );
    // Same lazy-read requirement as above.
    cy.getBySelector("ContentRedirectsTable", { timeout: 30000 }).should(
      ($el) => {
        expect($el.text()).to.include(OLD_PATH);
      }
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

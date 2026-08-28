import { API_ENDPOINTS } from "../../../support/api";

const options = { timeout: 15000 };
const forceClick = { force: true };

const REDIRECT_TYPE_LABELS = {
  internal: "Internal - link to a published item within your instance",
  external: "External - link to an external webpage",
  path: "Wildcard - can handle multiple redirects with a single rule",
};

const TARGET_PATH_ERRORS = {
  unpublished:
    "This item isn't published yet. Any incoming paths will lead to your 404 page until it goes live.",
  invalidUrl: "Invalid URL. Please enter a valid URL.",
};

const TEST_REDIRECTS_DATA = [
  {
    path: "aaa/---test",
    code: 301,
    targetType: "page",
    target: "7-b939a4-457q19",
  },
  {
    path: "bbb/---test",
    code: 301,
    targetType: "page",
    target: "7-b939a4-457q19",
  },
  {
    path: "ccc/---test",
    code: 301,
    targetType: "external",
    target: "7-b939a4-457q19",
  },
  {
    path: "xxx/---test",
    code: 301,
    targetType: "external",
    target: "https://www.zesty.io/about-us",
  },
  {
    path: "zzz/---test",
    code: 301,
    targetType: "path",
    target: "/test/*/*",
  },
];

const TEST_DELETE_DATA = [
  {
    path: "delete/1/---test",
    code: 301,
    targetType: "external",
    target: "https://www.zesty.io",
  },
  {
    path: "delete/2/---test",
    code: 301,
    targetType: "external",
    target: "https://www.zesty.io",
  },
  {
    path: "delete/3/---test",
    code: 301,
    targetType: "external",
    target: "https://www.zesty.io",
  },
  {
    path: "delete/4/---test",
    code: 301,
    targetType: "external",
    target: "https://www.zesty.io",
  },
  {
    path: "delete/5/---test",
    code: 301,
    targetType: "external",
    target: "https://www.zesty.io",
  },
];

describe("Redirects", () => {
  before(() => {
    deleteRedirectsTestData();
  });

  after(() => {
    deleteRedirectsTestData();
  });

  describe("Create Redirects", () => {
    it("Multiple", () => {
      cy.visit("/redirects");

      cy.getElement('[data-cy="RedirectActionCreateButton"]').click();

      cy.getElement('[data-cy="RedirectsFormDialogAddPathButton"]').click();

      cy.getElement('[data-cy="RedirectsFieldPath"]:eq(0) input').type(
        TEST_REDIRECTS_DATA[0]?.path
      );
      cy.getElement('[data-cy="RedirectsFieldPath"]:eq(1) input').type(
        TEST_REDIRECTS_DATA[1]?.path
      );

      cy.getElement('[data-cy="RedirectsSearchFieldInput"] input').click();

      cy.getElement('[data-cy="RedirectsSearchFieldInput"] input').type(
        TEST_REDIRECTS_DATA[0]?.target
      );

      cy.getElement('[data-cy="RedirectsTargetOptionsContainer"] ul li')
        .contains("/page/otherpage/all-field-types/", {
          ...options,
          matchCase: false,
        })
        .click();

      cy.intercept("/v1/web/redirects").as("getRedirects");
      cy.getElement('[data-cy="RedirectsCreateButton"]').click();
      cy.wait("@getRedirects");

      cy.getElement('[data-cy="toast"]').should(
        "contain",
        "2 Redirects Created",
        { matchCase: false }
      );
    });
    it("Selecting a target and pressing ArrowLeft does not crash (regression for #4247)", () => {
      // The support file's global `uncaught:exception` handler always
      // returns false, so an in-app crash wouldn't otherwise fail this test.
      // Capture the error explicitly instead.
      let uncaughtError = null;
      cy.on("uncaught:exception", (err) => {
        uncaughtError = err;
        return false;
      });

      cy.getElement('[data-cy="RedirectActionCreateButton"]').click();

      cy.getElement('[data-cy="RedirectsFieldPath"]:eq(0) input').type(
        "arrow-left-regression/---test"
      );

      cy.getElement('[data-cy="RedirectsSearchFieldInput"] input').click();
      cy.getElement('[data-cy="RedirectsSearchFieldInput"] input').type(
        TEST_REDIRECTS_DATA[0]?.target
      );

      cy.getElement('[data-cy="RedirectsTargetOptionsContainer"] ul li')
        .contains("/page/otherpage/all-field-types/", {
          ...options,
          matchCase: false,
        })
        .click();

      // Regression for #4247: MUI's Autocomplete intercepts ArrowLeft to
      // focus the rendered selected value (`renderValue`); if that node
      // isn't wired up with MUI's item props, this throws.
      cy.getElement('[data-cy="RedirectsSearchFieldInput"] input')
        .focus()
        .type("{leftarrow}");

      cy.getElement('[data-cy="RedirectsSearchFieldInput"] input')
        .should("exist")
        .then(() => {
          expect(uncaughtError, "no uncaught exception").to.be.null;
        });

      cy.getBySelector("RedirectsFormCancelButton").click();
    });

    it("External", () => {
      cy.getElement('[data-cy="RedirectActionCreateButton"]').click();

      cy.getElement('[data-cy="RedirectsFieldPath"]:eq(0) input').type(
        TEST_REDIRECTS_DATA[3]?.path
      );

      cy.getElement('[data-cy="RedirectsTypeSelector"]').click();
      cy.contains("External - link to an external webpage", {
        matchCase: false,
      }).click(forceClick);

      cy.getElement('[data-cy="RedirectsExternalFieldPath"] input').focus();

      cy.getElement('[data-cy="RedirectsExternalFieldPath"] input').type(
        TEST_REDIRECTS_DATA[3]?.target
      );

      cy.intercept("/v1/web/redirects").as("getRedirects");
      cy.getElement('[data-cy="RedirectsCreateButton"]').click();
      cy.wait("@getRedirects");

      cy.getElement('[data-cy="toast"]').should(
        "contain",
        "1 Redirect Created",
        { matchCase: false }
      );
    });

    it("Wildcard", () => {
      cy.getElement('[data-cy="RedirectActionCreateButton"]').click();

      cy.getElement('[data-cy="RedirectsFieldPath"]:eq(0) input').type(
        TEST_REDIRECTS_DATA[4]?.path
      );

      cy.getElement('[data-cy="RedirectsTypeSelector"]').click();
      cy.contains(
        "Wildcard - can handle multiple redirects with a single rule",
        {
          matchCase: false,
        }
      ).click(forceClick);

      cy.getElement('[data-cy="RedirectsExternalFieldPath"] input').focus();

      cy.getElement('[data-cy="RedirectsExternalFieldPath"] input').type(
        TEST_REDIRECTS_DATA[4]?.target
      );

      cy.intercept("/v1/web/redirects").as("getRedirects");
      cy.getElement('[data-cy="RedirectsCreateButton"]').click();
      cy.wait("@getRedirects");

      cy.getElement('[data-cy="toast"]').should(
        "contain",
        "1 Redirect Created",
        { matchCase: false }
      );
    });
  });

  describe("Create another Redirects Clicked", () => {
    it("Success", () => {
      cy.getElement('[data-cy="RedirectActionCreateButton"]').click();

      cy.getElement('[data-cy="RedirectsFieldPath"]:eq(0) input').type(
        TEST_REDIRECTS_DATA[2]?.path
      );
      cy.getElement('[data-cy="RedirectsSearchFieldInput"] input').type(
        TEST_REDIRECTS_DATA[0]?.target
      );

      cy.getElement('[data-cy="RedirectsTargetOptionsContainer"] ul li')
        .contains("/page/otherpage/all-field-types/", {
          ...options,
          matchCase: false,
        })
        .click();

      cy.intercept("/v1/web/redirects").as("getRedirects");
      cy.getElement('[data-cy="RedirectsCreateAddAnotherButton"]').click();
      cy.wait("@getRedirects");

      cy.getElement('[data-cy="toast"]').should(
        "contain",
        "1 Redirect Created",
        { matchCase: false }
      );

      cy.getElement('[data-cy="RedirectsFieldPath"]:eq(0) input').should(
        "be.empty"
      );
      cy.getElement('[data-cy="RedirectsSearchFieldInput"] input').should(
        "be.empty"
      );

      cy.getBySelector("RedirectsFormCancelButton").click();
    });
  });

  describe("Create Redirect Errors", () => {
    it("Error Dialog", () => {
      cy.getElement('[data-cy="RedirectActionCreateButton"]').click();
      cy.getElement('[data-cy="RedirectsFormDialogAddPathButton"]').click();
      cy.getElement('[data-cy="RedirectsFormDialogAddPathButton"]').click();

      cy.getElement('[data-cy="RedirectsFieldPath"]:eq(0) input').type(
        TEST_REDIRECTS_DATA[0]?.path
      );
      cy.getElement('[data-cy="RedirectsFieldPath"]:eq(1) input').type(
        TEST_REDIRECTS_DATA[1]?.path
      );
      cy.getElement('[data-cy="RedirectsFieldPath"]:eq(2) input').type(
        TEST_REDIRECTS_DATA[2]?.path
      );

      cy.getElement('[data-cy="RedirectsSearchFieldInput"] input').type(
        TEST_REDIRECTS_DATA[0]?.target
      );

      cy.getElement('[data-cy="RedirectsTargetOptionsContainer"] ul li')
        .contains("/page/otherpage/all-field-types/", {
          ...options,
          matchCase: false,
        })
        .click();

      cy.intercept("/v1/web/redirects").as("getRedirects");
      cy.getElement('[data-cy="RedirectsCreateButton"]').click();
      cy.wait("@getRedirects");

      cy.getElement('[data-cy="RedirectsErrorDialog"]').should("be.visible");

      cy.getElement('[data-cy="RedirectsErrorDialogHeader"]').should(
        "contain",
        "3 Redirects couldn't be created",
        { matchCase: false }
      );

      cy.getElement(
        '[data-cy="RedirectsErrorDialogListContainer"] > .RedirectsErrorListItem'
      ).should("have.length", 3);
    });

    it("Try Again", () => {
      cy.wrap(deleteRedirectsTestData()).then((res) => {
        cy.intercept("/v1/web/redirects").as("getRedirects");
        cy.getElement('[data-cy="RedirectsErrorDialogTryAgainButton"]').click();
        cy.wait("@getRedirects");

        cy.getElement('[data-cy="toast"]').should(
          "contain",
          "3 Redirects Created",
          { matchCase: false }
        );
      });
    });

    it("Invalid URL", () => {
      cy.getElement('[data-cy="RedirectActionCreateButton"]').click();
      cy.getElement('[data-cy="RedirectsTypeSelector"]').click();
      cy.contains(REDIRECT_TYPE_LABELS.external, {
        matchCase: false,
      }).click(forceClick);
      cy.getElement('[data-cy="RedirectsExternalFieldPath"] input').type(
        "invalid url test url"
      );
      cy.getElement('[data-cy="RedirectsPathFieldError"]').should(
        "contain",
        TARGET_PATH_ERRORS.invalidUrl,
        { matchCase: false }
      );

      cy.getBySelector("RedirectsFormCancelButton").click();
    });
  });

  describe("Path Field Character Validation", () => {
    it("Allowed Characters", () => {
      cy.getElement('[data-cy="RedirectActionCreateButton"]').click();

      const allowedInput = "abc-123_test.value~foo&bar=baz?qux$1:2#3*4%5";

      cy.getElement('[data-cy="RedirectsFieldPath"]:eq(0) input')
        .type(allowedInput, { parseSpecialCharSequences: false })
        .should("have.value", `/${allowedInput}`);

      cy.getBySelector("RedirectsFormCancelButton").click();
    });

    it("Invalid Characters", () => {
      cy.getElement('[data-cy="RedirectActionCreateButton"]').click();

      // Characters outside the PathField allowlist (@ ! ^ ( ) + , ;) are
      // dropped as they're typed, leaving only the allowed letters behind.
      cy.getElement('[data-cy="RedirectsFieldPath"]:eq(0) input')
        .type("ab@cd!ef^gh(ij)kl+mn,op;qr", {
          parseSpecialCharSequences: false,
        })
        .should("have.value", "/abcdefghijklmnopqr");

      cy.getBySelector("RedirectsFormCancelButton").click();
    });
  });

  describe("Update Redirect", () => {
    it("Success", () => {
      cy.getElement(".MuiDataGrid-cell")
        .contains(`/${TEST_REDIRECTS_DATA[0]?.path}`, { matchCase: false })
        .parents(".MuiDataGrid-row")
        .find(".MuiDataGrid-cell .MuiDataGrid-actionsCell .MuiIconButton-root")
        .click();

      cy.getElement(".MuiDataGrid-menu")
        .contains("Edit Redirect", { matchCase: false })
        .click();

      cy.getElement('[data-cy="RedirectsFieldPath"]:eq(0) input')
        .clear()
        .wait(500)
        .type(`${TEST_REDIRECTS_DATA[3]?.path}`);

      cy.getElement('[data-cy="RedirectsCodeSelector"]').click();

      cy.getElement(".MuiMenu-root .MuiMenuItem-root")
        .contains("302 - Temporary Redirect", { matchCase: false })
        .click();

      cy.getElement('[data-cy="RedirectsTypeSelector"]').click();

      cy.getElement(".MuiMenu-root .MuiMenuItem-root")
        .contains("External - link to an external webpage", {
          matchCase: false,
        })
        .click();

      cy.getElement('[data-cy="RedirectsExternalFieldPath"] input').type(
        TEST_REDIRECTS_DATA[3]?.target
      );

      cy.getElement('[data-cy="RedirectsCreateButton"]').should("be.enabled");
      cy.getElement('[data-cy="RedirectsCreateButton"]').click(forceClick);
      cy.getElement('[data-cy="toast"]').should(
        "contain",
        `Redirect Saved: /${TEST_REDIRECTS_DATA[3]?.path}`,
        { matchCase: false }
      );
    });
  });

  describe("Delete Redirect/s", () => {
    before(() => {
      createDeleteRedirectsTestData();
    });

    it("Actions Menu", () => {
      cy.visit("/redirects");
      // Filter to the delete-test redirects so the target row is rendered. The
      // grid virtualizes (~20 rows); with many redirects the target is otherwise
      // off-screen and .contains() can't find it.
      cy.getElement('input[placeholder="Filter Redirects"]')
        .clear()
        .type("delete/");
      cy.getElement(".MuiDataGrid-cell")
        .contains(`/${TEST_DELETE_DATA[0]?.path}`, { matchCase: false })
        .parents(".MuiDataGrid-row")
        .find(".MuiDataGrid-cell .MuiDataGrid-actionsCell .MuiIconButton-root")
        .click();

      cy.getElement(".MuiDataGrid-menu")
        .contains("Delete Redirect", { matchCase: false })
        .click();

      cy.intercept("/v1/web/redirects/*").as("deleteRedirect");
      cy.intercept("/v1/web/redirects").as("getRedirects");
      cy.getElement('[data-cy="DeleteContentItemConfirmButton"]').click();
      cy.wait(["@deleteRedirect", "@getRedirects"]);

      cy.getElement('[data-cy="toast"]').should(
        "contain",
        "1 Redirect Deleted",
        { matchCase: false }
      );
    });
    it("Single Selection", () => {
      // grid is already loaded and refreshed from the previous test
      cy.getElement(".MuiDataGrid-row").should("have.length.greaterThan", 0);
      cy.getElement('input[placeholder="Filter Redirects"]')
        .clear()
        .type("delete/");
      cy.getElement(".MuiDataGrid-cell")
        .contains(`/${TEST_DELETE_DATA[1]?.path}`, { matchCase: false })
        .parents(".MuiDataGrid-row")
        .find(".MuiDataGrid-cell:eq(0) .MuiCheckbox-root input")
        .check();
      cy.getElement('[data-cy="RedirectActionDeleteButton"]').click();
      cy.getElement('[data-cy="RedirectsDeleteDialog"]').should("exist");
      cy.getElement('[data-cy="RedirectsDeleteDialogHeader"]').should(
        "contain",
        "Delete 1 Redirect",
        { matchCase: false }
      );

      cy.intercept("DELETE", "/v1/web/redirects/*").as("deleteRedirect");
      cy.intercept("/v1/web/redirects").as("getRedirects");
      cy.getElement('[data-cy="DeleteContentItemConfirmButton"]').click();
      cy.wait(["@deleteRedirect", "@getRedirects"]);

      cy.getElement('[data-cy="toast"]').should(
        "contain",
        "1 Redirect Deleted",
        { matchCase: false }
      );
      cy.getElement(".MuiDataGrid-cell")
        .contains(`/${TEST_DELETE_DATA[1]?.path}`, { matchCase: false })
        .should("not.exist");
    });

    it("Multiple", () => {
      cy.getElement(".MuiDataGrid-row").should("have.length.greaterThan", 0);
      cy.getElement('input[placeholder="Filter Redirects"]')
        .clear()
        .type("delete/");
      cy.getElement(".MuiDataGrid-cell")
        .contains(`/${TEST_DELETE_DATA[2]?.path}`, { matchCase: false })
        .parents(".MuiDataGrid-row")
        .find(".MuiDataGrid-cell:eq(0) .MuiCheckbox-root input")
        .check();

      cy.getElement(".MuiDataGrid-cell")
        .contains(`/${TEST_DELETE_DATA[3]?.path}`, { matchCase: false })
        .parents(".MuiDataGrid-row")
        .find(".MuiDataGrid-cell:eq(0) .MuiCheckbox-root input")
        .check();

      cy.getElement(".MuiDataGrid-cell")
        .contains(`/${TEST_DELETE_DATA[4]?.path}`, { matchCase: false })
        .parents(".MuiDataGrid-row")
        .find(".MuiDataGrid-cell:eq(0) .MuiCheckbox-root input")
        .check();

      cy.getElement('[data-cy="RedirectActionDeleteButton"]').click();
      cy.getElement('[data-cy="RedirectsDeleteDialog"]').should("exist");
      cy.getElement('[data-cy="RedirectsDeleteDialogHeader"]').should(
        "contain",
        "Delete 3 Redirects",
        { matchCase: false }
      );

      cy.intercept("DELETE", "/v1/web/redirects/*").as("deleteRedirect");
      cy.intercept("/v1/web/redirects").as("getRedirects");
      cy.getElement('[data-cy="DeleteContentItemConfirmButton"]').click();
      cy.wait(["@deleteRedirect", "@getRedirects"]);

      cy.getElement('[data-cy="toast"]').should(
        "contain",
        "3 Redirects Deleted",
        { matchCase: false }
      );
    });
  });
});

function deleteRedirectsTestData() {
  cy.apiRequest({
    url: `${API_ENDPOINTS.devInstance}/web/redirects`,
  }).then(({ status, data }) => {
    const testRedirects = [...TEST_REDIRECTS_DATA, ...TEST_DELETE_DATA]?.map(
      (item) => `/${item?.path}`
    );
    const forDeleteZuids = data
      ?.filter((item) => testRedirects?.includes(item?.path))
      .map((del) => del?.ZUID);

    forDeleteZuids?.forEach((zuid) => {
      cy.apiRequest({
        url: `${API_ENDPOINTS.devInstance}/web/redirects/${zuid}`,
        method: "DELETE",
      });
    });
  });
}

function createDeleteRedirectsTestData() {
  for (let index = 0; index < TEST_DELETE_DATA?.length; index++) {
    const reqPath = TEST_DELETE_DATA[index];
    cy.apiRequest({
      url: `${API_ENDPOINTS.devInstance}/web/redirects`,
      method: "POST",
      body: {
        ...reqPath,
        path: `/${reqPath.path}`,
      },
    });
  }
}

Cypress.Commands.add("getElement", (selector) => {
  return cy.get(selector, options);
});

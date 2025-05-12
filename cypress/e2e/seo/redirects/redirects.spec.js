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
    target: "All Field Types",
  },
  {
    path: "bbb/---test",
    code: 301,
    targetType: "page",
    target: "All Field Types",
  },
  {
    path: "ccc/---test",
    code: 301,
    targetType: "external",
    target: "All Field Types",
  },
  {
    path: "xxx/---test",
    code: 301,
    targetType: "external",
    target: "https://www.zesty.io",
  },
  {
    path: "zzz/---test",
    code: 301,
    targetType: "path",
    target: "/test/*/*",
  },
];

describe("Redirects", () => {
  before(() => {
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

      cy.getElement('[data-cy="RedirectsCreateButton"]').click();
      cy.contains("2 Redirects Created", { ...options, matchCase: false });
    });
    it("External", () => {
      cy.visit("/redirects");
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

      cy.getElement('[data-cy="RedirectsCreateButton"]').click();
      cy.contains("1 Redirect Created", { ...options, matchCase: false });
    });

    it("Wildcard", () => {
      cy.visit("/redirects");
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

      cy.getElement('[data-cy="RedirectsCreateButton"]').click();
      cy.contains("1 Redirect Created", { ...options, matchCase: false });
    });
  });

  describe("Create another Redirects Clicked", () => {
    it("Success", () => {
      cy.visit("/redirects");
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

      cy.getElement('[data-cy="RedirectsCreateAddAnotherButton"]').click();
      cy.contains("1 Redirect Created", { ...options, matchCase: false });

      cy.getElement('[data-cy="RedirectsFieldPath"]:eq(0) input').should(
        "be.empty"
      );
      cy.getElement('[data-cy="RedirectsSearchFieldInput"] input').should(
        "be.empty"
      );
    });
  });

  describe("Create Redirect Errors", () => {
    it("Error Dialog", () => {
      cy.visit("/redirects");
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

      cy.getElement('[data-cy="RedirectsCreateButton"]').click();

      cy.getElement('[data-cy="RedirectsErrorDialog"]').should("be.visible");

      cy.contains("3 Redirects couldn't be created", {
        ...options,
        matchCase: false,
      });
      cy.getElement(
        '[data-cy="RedirectsErrorDialogListContainer"] > .RedirectsErrorListItem'
      ).should("have.length", 3);
    });
    it("Try Again", () => {
      cy.wrap(deleteRedirectsTestData()).then((res) => {
        cy.getElement('[data-cy="RedirectsErrorDialogTryAgainButton"]').click();
        cy.contains("3 Redirects couldn't be created", {
          ...options,
          matchCase: false,
        });
      });
    });

    it("Invalid URL", () => {
      cy.visit("/redirects");
      cy.getElement('[data-cy="RedirectActionCreateButton"]').click();
      cy.getElement('[data-cy="RedirectsTypeSelector"]').click();
      cy.contains(REDIRECT_TYPE_LABELS.external, {
        matchCase: false,
      }).click(forceClick);
      cy.getElement('[data-cy="RedirectsExternalFieldPath"] input').type(
        "invalid url"
      );
      cy.contains(TARGET_PATH_ERRORS.invalidUrl, { matchCase: false });
    });
  });

  describe("Update Redirect", () => {
    it("Success", () => {
      cy.visit("/redirects");
      cy.contains(`/${TEST_REDIRECTS_DATA[0]?.path}`, { matchCase: false })
        .parents(".MuiDataGrid-row")
        .find('[data-cy="RedirectsTableActionButton"]')
        .click();

      cy.getElement('[data-cy="RedirectsItemOptionsEdit"]').click();

      cy.getElement('[data-cy="RedirectsFieldPath"]:eq(0) input')
        .clear()
        .wait(500)
        .type(`${TEST_REDIRECTS_DATA[3]?.path}`);
      cy.getElement('[data-cy="RedirectsCodeSelector"]').click();

      cy.getElement('[data-cy="RedirectsCreateButton"]').click(forceClick);
      cy.contains(`Redirect Saved: /${TEST_REDIRECTS_DATA[3]?.path}`, {
        matchCase: false,
      });
    });
  });
});

function deleteRedirectsTestData() {
  cy.apiRequest({
    url: `${API_ENDPOINTS.devInstance}/web/redirects`,
  }).then(({ status, data }) => {
    const testRedirects = TEST_REDIRECTS_DATA?.map((item) => `/${item?.path}`);
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

Cypress.Commands.add("getElement", (selector) => {
  return cy.get(selector, options);
});

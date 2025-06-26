import { API_ENDPOINTS } from "../../support/api";

const timeout = { timeout: 15_000 };
const matchcase = { matchCase: false };
const forceclick = { forceclick: true };

const TEST_DATA = [
  {
    filename: "code-app-all-files-page-test-file------test",
    code: "",
    type: "snippet",
  },
];

const TEST_FILE_NAMES = TEST_DATA.map((item) => item.filename);

describe("All Files Page", () => {
  before(() => {
    deleteTestData();
  });

  after(() => {
    deleteTestData();
  });

  it("Renders all files page", () => {
    cy.visit("/code");
    cy.getElement('[data-cy="AllFilesHeader"]').should(
      "contain.text",
      "All Files"
    );
    cy.getElement('[data-cy="AllFilesSearchInput"]').should("exist");
    cy.getElement('[data-cy="AllFilesCreateButton"]').should("exist");
    cy.getElement('[data-cy="AllFilesDevResources"]').should("exist");
    cy.getElement('[data-cy="AllFilesTable"]').should("exist");
  });

  it("Automatically opens create file dialog if URL search param includes ?triggerCreate=true", () => {
    cy.visit("/code?triggerCreate=true");
    cy.getElement('[data-cy="CodeAppCreateFileDialog"]').should("exist");
  });

  it("Create New File", () => {
    cy.visit("/code");
    cy.getElement('[data-cy="AllFilesCreateButton"]').click();
    cy.getElement('[data-cy="CodeAppCreateFileDialog"]').should("exist");
    cy.getElement('[data-cy="CreateFileFileNameInput"] input').type(
      TEST_DATA[0].filename
    );

    cy.getElement('[data-cy="CreateFileCreateButton"]').should("be.enabled");

    cy.intercept("POST", "/v1/web/views").as("createFile");
    cy.intercept("/v1/web/views*").as("getFiles");
    cy.getElement('[data-cy="CreateFileCreateButton"]').click();

    cy.wait(["@createFile", "@getFiles"]).spread((createFile, getFiles) => {
      Cypress.env("fileZUID", createFile.response.body.data.ZUID);

      // SHOW TOAST CONFIRMATION
      cy.getElement('[data-cy="toast"]').should(
        "contain.text",
        `Created new file ${TEST_DATA[0].filename}`,
        matchcase
      );

      // SHOULD OPEN TO NEWLY CREATED FILE AUTOMATICALLY
      cy.url().should("include", `/code/file/views/${Cypress.env("fileZUID")}`);
    });
  });

  it("Newly created file is listed on top in recent files", () => {
    cy.visit("/code");
    cy.getElement(
      '[data-cy="AllFilesTable"] [data-cy="AllFilesRow"]:eq(0)'
    ).should("contain.text", TEST_DATA[0].filename, matchcase);
  });

  it("Open newly created file from recent files", () => {
    // CLICK ALL FILES IN SIDEBAR
    cy.getElement('[data-cy="codeNav"] ul li:contains("All Files")').click();
    cy.getElement(
      `[data-cy="AllFilesTable"] [data-cy="AllFilesRow"]:contains(${TEST_DATA[0].filename})`
    ).click();
    // SHOULD OPEN TO NEWLY CREATED FILE AUTOMATICALLY
    cy.url().should("include", `/code/file/views/${Cypress.env("fileZUID")}`);
  });

  describe("Search Files", () => {
    it("Accurate Search results", () => {
      cy.visit("/code");
      cy.getElement(`[data-cy="AllFilesSearchInput"] input`)
        .clear()
        .type(TEST_DATA[0].filename);

      cy.getElement(`[data-cy="AllFilesTable"] [data-cy="AllFilesRow"]`).should(
        "have.length",
        1
      );
    });

    it("No results found", () => {
      cy.visit("/code");
      cy.getElement(`[data-cy="AllFilesSearchInput"] input`)
        .clear()
        .type("xxx---xxx---xxx");

      cy.getElement('[data-cy="NoResultsContainer"]').should("be.visible");

      cy.getElement('[data-cy="NoResultsContainer"]').should(
        "contain.text",
        `Your search “xxx---xxx---xxx” could not find any results`,
        matchcase
      );
    });

    it("Click 'Seacrh Again' button", () => {
      cy.getElement(`[data-cy="NoResults"] button`)
        .contains("Search again", matchcase)
        .click();

      cy.getElement(`[data-cy="NoResults"]`).should("not.exist");

      cy.getElement(`[data-cy="AllFilesSearchInput"] input`).should("be.empty");

      cy.getElement(`[data-cy="AllFilesSearchInput"] input`).should(
        "be.focused"
      );
    });
  });
});

Cypress.Commands.add("getElement", (selector) => {
  return cy.get(selector, timeout);
});

function deleteTestData() {
  cy.apiRequest({
    url: `${API_ENDPOINTS.devInstance}/web/views`,
  }).then(({ status, data }) => {
    const forDeleteZuids = data
      ?.filter((item) => TEST_FILE_NAMES?.includes(item?.fileName))
      .map((del) => del?.ZUID);

    forDeleteZuids?.forEach((zuid) => {
      cy.apiRequest({
        url: `${API_ENDPOINTS.devInstance}/web/views/${zuid}`,
        method: "DELETE",
      });
    });
  });
}

import { API_ENDPOINTS } from "../../support/api";

const matchcase = { matchCase: false };

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
    cy.getBySelector("AllFilesHeader").should("contain.text", "All Files");
    cy.getBySelector("AllFilesSearchInput").should("exist");
    cy.getBySelector("AllFilesCreateButton").should("exist");
    cy.getBySelector("AllFilesDevResources").should("exist");
    cy.getBySelector("AllFilesTable").should("exist");
  });

  it("Automatically opens create file dialog if URL search param includes ?triggerCreate=true", () => {
    cy.visit("/code?triggerCreate=true");
    cy.getBySelector("CodeAppCreateFileDialog").should("exist");
  });

  it("Create New File", () => {
    cy.visit("/code");
    cy.getBySelector("AllFilesCreateButton").click();
    cy.getBySelector("CodeAppCreateFileDialog").should("exist");
    cy.getBySelector("CreateFileFileNameInput")
      .find("input")
      .type(TEST_DATA[0].filename);

    cy.getBySelector("CreateFileCreateButton").should("be.enabled");

    cy.intercept("POST", "/v1/web/views").as("createFile");
    cy.intercept("/v1/web/views*").as("getFiles");
    cy.getBySelector("CreateFileCreateButton").click();

    cy.wait(["@createFile", "@getFiles"]).spread((createFile) => {
      Cypress.env("fileZUID", createFile.response.body.data.ZUID);

      cy.getBySelector("toast").should(
        "contain.text",
        `Created new file ${TEST_DATA[0].filename}`,
        matchcase
      );

      cy.url().should("include", `/code/file/views/${Cypress.env("fileZUID")}`);
    });
  });

  it("Files are listed in ascending order.", () => {
    cy.visit("/code");
    cy.getBySelector("AllFilesTable")
      .find('[data-cy="AllFilesRowLastSaved"]')
      .then(($cells) => {
        const times = $cells
          .map((i, cell) => {
            const text = cell.innerText.trim();
            return parseInt(text.split(" ")[0]);
          })
          .get();
        const sortedTimes = [...times].sort((a, b) => a - b);
        expect(times).to.deep.equal(sortedTimes);
      });
  });

  it("Open newly created file from recent files", () => {
    cy.visit("/code");
    cy.getBySelector("AllFilesTable")
      .find(`[data-cy="AllFilesRow"]:contains(${TEST_DATA[0].filename})`)
      .click();
    cy.url().should("include", `/code/file/views/${Cypress.env("fileZUID")}`);
  });

  describe("Search Files", () => {
    it("Accurate Search results", () => {
      cy.visit("/code");
      cy.getBySelector("AllFilesSearchInput")
        .find("input")
        .clear()
        .type(TEST_DATA[0].filename);

      cy.getBySelector("AllFilesTable")
        .find('[data-cy="AllFilesRow"]')
        .should("have.length", 1);
    });

    it("No results found", () => {
      cy.visit("/code");
      cy.getBySelector("AllFilesSearchInput")
        .find("input")
        .clear()
        .type("xxx---xxx---xxx");

      cy.getBySelector("NoResultsContainer").should("be.visible");
      cy.getBySelector("NoResultsContainer").should(
        "contain.text",
        `Your search “xxx---xxx---xxx” could not find any results`,
        matchcase
      );
    });

    it("Click 'Search Again' button", () => {
      cy.getBySelector("NoResults")
        .find("button")
        .contains("Search again", matchcase)
        .click();

      cy.getBySelector("NoResults").should("not.exist");
      cy.getBySelector("AllFilesSearchInput").find("input").should("be.empty");
      cy.getBySelector("AllFilesSearchInput")
        .find("input")
        .should("be.focused");
    });
  });
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

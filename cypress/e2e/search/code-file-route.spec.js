// Global Search must route code files to the path matching their type
const FILES = [
  { label: "stylesheet", fixture: "stylesheet", group: "stylesheets" },
  { label: "script", fixture: "script", group: "scripts" },
  { label: "view", fixture: "sidebar", group: "views" },
];

describe("Global Search: Code file routes", () => {
  const seeded = {};

  before(() => {
    cy.blockLock();
    FILES.forEach(({ label, fixture, group }) => {
      cy.task("seed:code", `fixtures/code/${fixture}.json`).then((res) => {
        seeded[label] = res;
        waitUntilListed(group, res?.ZUID);
      });
    });
  });

  after(() => {
    const files = Object.values(seeded)
      .filter((file) => file?.ZUID)
      .map((file) => ({ zuid: file.ZUID, type: file.type }));

    if (files.length) {
      cy.task("cleanup:code", files);
    }
  });

  beforeEach(() => {
    cy.clearLocalStorage("zesty:globalSearch:recentSearches");
    cy.blockLock();
    cy.intercept("GET", "**/web/views/*").as("getView");
    cy.intercept(
      "GET",
      /\/web\/(views|scripts|stylesheets)\/[^/?]+(\?.*)?$/
    ).as("getFile");
  });

  FILES.forEach(({ label, group }) => {
    it(`Dropdown opens a ${label} at /code/file/${group}`, () => {
      cy.visit("/");
      cy.getBySelector("global-search-textfield")
        .find("input")
        .should("exist")
        .click()
        .type(seeded[label].ZUID);

      cy.get('[role="listbox"] [role="option"]', { timeout: 30000 }).should(
        "exist"
      );
      cy.get('[role="listbox"] [role="option"]')
        .filter(`:contains("${seeded[label].fileName.split("/").pop()}")`)
        .first()
        .click();

      cy.location("pathname").should(
        "equal",
        `/code/file/${group}/${seeded[label].ZUID}`
      );
      assertFileLoaded(group, seeded[label].ZUID);
    });

    it(`Search page opens a ${label} at /code/file/${group}`, () => {
      cy.visit(`/search?q=${seeded[label].ZUID}`);

      cy.get(`a[href="/code/file/${group}/${seeded[label].ZUID}"]`, {
        timeout: 30000,
      })
        .should("exist")
        .first()
        .click();

      cy.location("pathname").should(
        "equal",
        `/code/file/${group}/${seeded[label].ZUID}`
      );
      assertFileLoaded(group, seeded[label].ZUID);
    });
  });
});

const LIST_POLL_ATTEMPTS = 15;
const LIST_POLL_INTERVAL_MS = 2000;

// The list API can briefly omit a file right after it is created, so wait
// until the seeded file is listed before searching for it
function waitUntilListed(group, zuid, attempt = 1) {
  cy.apiRequest({
    url: `${Cypress.env("API_INSTANCE_URL")}/web/${group}?status=dev`,
  }).then(({ data }) => {
    if (data?.some((file) => file.ZUID === zuid)) return;

    if (attempt >= LIST_POLL_ATTEMPTS) {
      throw new Error(
        `Seeded ${group} file ${zuid} is still missing from the list API`
      );
    }

    cy.wrap(null, { log: false }).then(
      () => new Promise((resolve) => setTimeout(resolve, LIST_POLL_INTERVAL_MS))
    );
    waitUntilListed(group, zuid, attempt + 1);
  });
}

// The file must load from its own group, never /web/views, with no warning
function assertFileLoaded(group, zuid) {
  cy.wait("@getFile", { timeout: 30000 }).then(({ request, response }) => {
    expect(request.url).to.include(`/web/${group}/${zuid}`);
    expect(response.statusCode).to.equal(200);
  });

  if (group !== "views") {
    cy.get("@getView.all").should("have.length", 0);
  }

  // Toast fires after the fetch resolves, so only assert once it has settled
  cy.contains("File could not be found").should("not.exist");
}

describe("Code Editor Sidebar", { defaultCommandTimeout: 50000 }, () => {
  let SIDEBAR = null;
  let FILENAME = null;
  let SCRIPT_FILENAME = null;
  let STYLESHEET_FILENAME = null;

  before(() => {
    cy.task("seed:code", "fixtures/code/sidebar.json").then((res) => {
      SIDEBAR = res;
      FILENAME = SIDEBAR?.fileName?.split("/")?.pop()?.trim() || "";
      Cypress.env("fileZUID", res?.ZUID);
    });

    cy.task("seed:code", "fixtures/code/script.json").then((res) => {
      SCRIPT_FILENAME = res?.fileName?.split("/")?.pop()?.trim() || "";
      Cypress.env("scriptZUID", res?.ZUID);
    });

    cy.task("seed:code", "fixtures/code/stylesheet.json").then((res) => {
      STYLESHEET_FILENAME = res?.fileName?.split("/")?.pop()?.trim() || "";
      Cypress.env("stylesheetZUID", res?.ZUID);
    });

    cy.waitOn("/v1/web/views*", () => {
      cy.visit("/code");
    });
  });

  it("Displays documents/files correctly", () => {
    cy.get('[data-cy="html"] [id="html-/code/file/views/__e2e__"]').as(
      "e2eFolder"
    );

    cy.get("@e2eFolder").within(() => {
      cy.get(".MuiTreeItem-content").click({ force: true });
    });

    cy.get("@e2eFolder")
      .contains(Cypress.env("COMMIT_ID"))
      .closest('[role="treeitem"]')
      .as("commitFolder");

    cy.get("@commitFolder").within(() => {
      cy.get(".MuiTreeItem-content").click({ force: true });
    });

    expect(FILENAME).to.not.be.empty;

    cy.get("@commitFolder")
      .find(`[id="html-/code/file/views/${Cypress.env("fileZUID")}"]`)
      .scrollIntoView()
      .should("be.visible")
      .click();
  });

  it("Show icon for unpublished files/documents", () => {
    cy.getBySelector("code-app-editor-container")
      .find("textarea")
      .eq(0)
      .type("xxxx");

    cy.getBySelector("SaveCodeButton")
      .should("be.visible")
      .should("be.enabled")
      .click();

    cy.get(`[id="html-/code/file/views/${Cypress.env("fileZUID")}"]`)
      .scrollIntoView()
      .should("be.visible")
      .find('[data-cy="PublishIconButton"]')
      .should("be.visible");
  });

  it("Publish file/document when clicking the publish icon", () => {
    cy.getBySelector("code-app-editor-container")
      .find("textarea")
      .eq(0)
      .type("xxxx");

    cy.getBySelector("SaveCodeButton")
      .should("be.visible")
      .should("be.enabled")
      .click();

    cy.get(`[id="html-/code/file/views/${Cypress.env("fileZUID")}"]`)
      .scrollIntoView()
      .should("be.visible")
      .find('[data-cy="PublishIconButton"]')
      .should("be.visible")
      .should("be.enabled")
      .click();

    cy.getBySelector("toast").contains(`${FILENAME}`, {
      matchCase: false,
    });
  });

  it("Displays a seeded script under SITE.JS", () => {
    expect(SCRIPT_FILENAME).to.not.be.empty;
    findSeededFileNode("js", "scripts", Cypress.env("scriptZUID"))
      .scrollIntoView()
      .should("be.visible");
  });

  it("Displays a seeded stylesheet under SITE.CSS", () => {
    expect(STYLESHEET_FILENAME).to.not.be.empty;
    findSeededFileNode("css", "stylesheets", Cypress.env("stylesheetZUID"))
      .scrollIntoView()
      .should("be.visible");
  });
});

function findSeededFileNode(navId, group, zuid) {
  cy.get(`[data-cy="${navId}"] [id="${navId}-/code/file/${group}/__e2e__"]`).as(
    "e2eFolder"
  );

  cy.get("@e2eFolder")
    .find(".MuiTreeItem-content")
    .first()
    .click({ force: true });

  cy.get("@e2eFolder")
    .contains(Cypress.env("COMMIT_ID"))
    .closest('[role="treeitem"]')
    .as("commitFolder");

  cy.get("@commitFolder")
    .find(".MuiTreeItem-content")
    .first()
    .click({ force: true });

  return cy
    .get("@commitFolder")
    .find(`[id="${navId}-/code/file/${group}/${zuid}"]`);
}

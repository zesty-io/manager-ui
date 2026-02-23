describe("Code Editor Sidebar", { defaultCommandTimeout: 50000 }, () => {
  let SIDEBAR = null;
  let FILENAME = null;
  before(() => {
    cy.task("seed:code", "fixtures/code/sidebar.json").then((res) => {
      console.debug("res: ", res);
      SIDEBAR = res;
      FILENAME = SIDEBAR?.fileName?.split("/")?.pop()?.trim() || "";
      Cypress.env("fileZUID", res?.ZUID);
    });

    cy.visit(`/code`);
  });

  it("Displays documents/files correctly", () => {
    cy.get(
      '[data-cy="html"] [id="html\\-\\/code\\/file\\/views\\/\\_\\_e2e\\_\\_"]'
    ).as("e2eFolder");

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
      .find(`[id="html\\-\\/code\\/file\\/views\\/${Cypress.env("fileZUID")}"]`)
      .scrollIntoView()
      .should("be.visible")
      .click();
  });

  it("Show icon for unpublished files/documents", () => {
    cy.get('[data-cy="CodeEditorContainer"]')
      .find("textarea")
      .eq(0)
      .type("xxxx");

    cy.getBySelector("SaveCodeButton")
      .should("be.visible")
      .should("be.enabled")
      .click();

    cy.get(`[id="html\\-\\/code\\/file\\/views\\/${Cypress.env("fileZUID")}"]`)
      .scrollIntoView()
      .should("be.visible")
      .find('[data-cy="PublishIconButton"]')
      .should("be.visible");
  });

  it("Publish file/document when clicking the publish icon", () => {
    cy.get('[data-cy="CodeEditorContainer"]')
      .find("textarea")
      .eq(0)
      .type("xxxx");

    cy.getBySelector("SaveCodeButton")
      .should("be.visible")
      .should("be.enabled")
      .click();

    cy.get(`[id="html\\-\\/code\\/file\\/views\\/${Cypress.env("fileZUID")}"]`)
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
});

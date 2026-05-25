const options = { timeout: 15000 };
const forceClick = { force: true };
const NEW_TEST_FOLDER = "CYPRESS TEST NEW FOLDER";

describe("Media Folders", () => {
  before(() => {
    cleanTestData();
    cy.waitOn("*groups*", () => {
      cy.visit("/media");
    });
  });
  it("Creates folder ", () => {
    cy.getBySelector("createNewMediaFolder").click();

    cy.getBySelector("newFolderParentSelector")
      .click()
      .type("zesty-{downArrow}{enter}");

    cy.get(".MuiDialog-container").within(() => {
      cy.contains("Folder Name").next().type(NEW_TEST_FOLDER);
      cy.contains("Create").click();
    });

    cy.intercept("POST", "/groups");

    cy.get(".MuiTreeItem-root", options)
      .contains(NEW_TEST_FOLDER)
      .should("exist");
  });
  it("Hides and shows folder", () => {
    cy.get(".MuiTreeItem-root").contains(NEW_TEST_FOLDER).click();

    cy.get("[aria-label='Open folder menu']", options).click(forceClick);

    cy.contains("Hide", options).should("be.visible").click(forceClick);

    // Non hidden tree
    cy.get(".MuiTreeItem-root", options)
      .first()
      .contains(NEW_TEST_FOLDER, options)
      .should("not.exist");

    // Hidden Tree
    cy.getBySelector("hidden-items-accordion").click();
    cy.get(".MuiTreeItem-root").contains(NEW_TEST_FOLDER).should("exist");

    cy.get("[aria-label='Open folder menu']").click();

    cy.contains("Show", options).click();

    // Non hidden tree
    cy.get(".MuiTreeItem-root", options)
      .first()
      .contains(NEW_TEST_FOLDER)
      .should("exist");
  });
  it("Navigates folders via breadcrumbs", () => {
    cy.get(".MuiTreeItem-root")
      .contains(NEW_TEST_FOLDER, options)
      .click(forceClick);

    cy.getBySelector("breadcrumbs").find(".MuiBreadcrumbs-li").first().click();
    cy.location("pathname").should("eq", "/media/folder/1-6c9618c-r26pt");
  });
  it("Renames folder", () => {
    cy.get(".MuiTreeItem-root")
      .contains(NEW_TEST_FOLDER, options)
      .click(forceClick);

    cy.get("[aria-label='Open folder menu']", options).click();

    cy.contains("Rename", options).should("be.visible").click();

    cy.get(".MuiDialog-container").within(() => {
      cy.contains("New Folder Name", options)
        .next()
        .clear()
        .type("CYPRESS TEST NEW FOLDER EDITED");
      cy.contains("Update").click();
    });

    cy.intercept("PUT", "/groups");

    cy.get(".MuiTreeItem-root").should("be.visible");
    cy.contains("p", "CYPRESS TEST NEW FOLDER EDITED", options).should("exist");
  });
  it("Deletes folder", () => {
    cy.get(".MuiTreeItem-root")
      .contains("CYPRESS TEST NEW FOLDER EDITED")
      .click(forceClick);

    cy.get("[aria-label='Open folder menu']").click();

    cy.contains("Delete", options).should("be.visible").click(forceClick);

    cy.get(".MuiButton-containedError", options).click();

    cy.intercept("DELETE", "/groups");

    cy.get(".MuiTreeItem-root")
      .contains("CYPRESS TEST NEW FOLDER EDITED")
      .should("not.exist");
  });
});

function cleanTestData() {
  cy.apiRequest({
    url: `https://media-manager.api.dev.zesty.io/bin/1-6c9618c-r26pt/groups`,
  }).then((response) => {
    const zuids = response?.data
      ?.filter((item) => item?.name?.includes(NEW_TEST_FOLDER))
      ?.map((item) => item?.id);

    zuids.forEach((zuid) => {
      cy.apiRequest({
        url: `https://media-manager.api.dev.zesty.io/group/${zuid}`,
        method: "DELETE",
      });
    });
  });
}

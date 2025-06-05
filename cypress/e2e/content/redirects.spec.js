const NOW = new Date().getTime();

describe("Content item redirects", () => {
  before(() => {
    // Create a new redirect
    cy.waitOn("/v1/web/redirects", () => {
      cy.visit("/redirects");
    });

    cy.intercept("/v1/web/redirects").as("redirects");
    cy.getBySelector("RedirectActionCreateButton").click();
    cy.getBySelector("RedirectsFieldPath")
      .find("input")
      .type(`/test-redirect/${NOW}`);
    cy.getBySelector("RedirectsSearchFieldInputField").find("input").click();
    cy.wait(2000);
    cy.getBySelector("RedirectsSearchFieldInputField")
      .find("input")
      .type("all field types{downArrow}{enter}");
    cy.getBySelector("RedirectsCreateButton").click();
    cy.wait("@redirects");
  });

  it("should show redirects for a content item", () => {
    cy.waitOn("/v1/content/models*", () => {
      cy.visit("/content/6-556370-8sh47g/7-b939a4-457q19/redirects");
    });

    cy.contains(`/test-redirect/${NOW}`).should("exist");
  });

  it("should be able to edit a redirect", () => {
    cy.intercept("/v1/web/redirects").as("redirects");
    cy.contains(`/test-redirect/${NOW}`)
      .parent()
      .within(() => {
        cy.get(".MuiDataGrid-actionsCell button").click();
      });
    cy.getBySelector("EditRedirect").click();
    cy.getBySelector("RedirectsFieldPath").find("input").type(`/updated`);
    cy.getBySelector("RedirectsCreateButton").click();

    cy.wait("@redirects");

    cy.contains(`/test-redirect/${NOW}/updated`).should("exist");
  });

  it("should be able to delete a redirect", () => {
    cy.intercept("/v1/web/redirects").as("redirects");
    cy.get(".MuiDataGrid-actionsCell button").last().click();
    cy.getBySelector("DeleteRedirect").click();
    cy.getBySelector("ConfirmDeleteRedirect").click();

    cy.wait("@redirects").then(() => {
      cy.getBySelector("toast").should(
        "contain.text",
        `Redirect Deleted: /test-redirect/${NOW}/updated`
      );
    });
  });
});

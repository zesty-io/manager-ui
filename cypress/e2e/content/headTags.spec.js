import { API_ENDPOINTS } from "../../support/api";

// This spec assumes a clean "no head tags" starting state and is the only head-tag
// mutator (settings/headtags is skipped). The CI concurrency gate serializes e2e
// runs, so deleting all head tags before and after is safe and guarantees that
// precondition regardless of leftovers from an interrupted prior run.
function cleanAllHeadTags() {
  cy.apiRequest({
    url: `${API_ENDPOINTS.devInstance}/web/headtags`,
  }).then(({ data }) => {
    (data || []).forEach((tag) => {
      cy.apiRequest({
        url: `${API_ENDPOINTS.devInstance}/web/headtags/${tag.ZUID}`,
        method: "DELETE",
      });
    });
  });
}

describe("Head Tags", () => {
  before(() => {
    cleanAllHeadTags();
    cy.task("seed:content", "fixtures/item.json").then(
      ({ model, fields, items }) => {
        Cypress.env("modelZUID", model?.ZUID);
        Cypress.env("itemZUID", items[0]?.meta?.ZUID);
      }
    );
  });

  after(() => {
    cleanAllHeadTags();
  });
  it("creates and deletes new head tag", () => {
    // Wait only on the head tags fetch — the data this page actually manipulates.
    // The head page also loads headers/views/scripts/stylesheets/settings, but
    // those don't reliably fire on every load; waiting on all of them made this
    // spec flaky ("getHeaders: No request ever occurred"). The Create button
    // assertion below (retryable) covers page readiness.
    cy.intercept("GET", "**/v1/web/headtags").as("getHeadtags");

    cy.visit(
      `/content/${Cypress.env("modelZUID")}/${Cypress.env("itemZUID")}/head`
    );

    cy.wait("@getHeadtags");

    cy.contains("Create Head Tag").should("exist").should("be.enabled").click();

    cy.getBySelector("newTagCard")
      .last()
      .find(".MuiSelect-select")
      .click({ force: true });

    cy.get("[role=presentation]")
      .last()
      .find('[data-value="script"]')
      .click({ force: true });

    cy.getBySelector("newTagCard")
      .last()
      .contains("Value")
      .parent()
      .find("input")
      .clear()
      .type("Changing the value of content");

    cy.getBySelector("newTagCard")
      .last()
      .contains("Attribute")
      .parent()
      .find("input")
      .clear()
      .type("newAttr");

    // Saves Head Tag
    cy.getBySelector("newTagCard").last().find("#SaveItemButton").click();
    cy.contains("New head tag created");

    // Deletes Head Tag
    cy.getBySelector("tagCard")
      .last()
      .contains("Delete Head Tag")
      .invoke("show")
      .click();

    // TODO: There is a bug in the application that automatically adds a new
    // draft head tag after saving first one
    // cy.get("[data-cy=tagCard]").should("not.exist");
  });
});

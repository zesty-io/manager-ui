import { API_ENDPOINTS } from "../../support/api";

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

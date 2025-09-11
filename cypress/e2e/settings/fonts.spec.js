import { API_ENDPOINTS } from "../../support/api";

const TEST_DATA = {
  family: "ABeeZee",
  variant: "regular",
};

describe("Fonts", () => {
  before(() => {
    cleanUp();
  });

  context("Install font", () => {
    before(() => {
      cy.visit("/settings/fonts/browse");
    });
    it("No Results Error Page", () => {
      cy.getElement('[data-cy="BrowseFontSearchInput"] input').type(
        "xxxxxxxxxxx"
      );
      cy.getElement('[data-cy="NoResults"]').should("exist");
    });
    it("Reset Search Term", () => {
      cy.getElement('[data-cy="NoResults"] button').click();
      cy.getElement('[data-cy="FontListContainer"]').should("exist");
      cy.getElement('[data-cy="BrowseFontSearchInput"] input').should(
        "be.empty"
      );
    });

    it("Search Font - Found", () => {
      cy.getElement('[data-cy="BrowseFontSearchInput"]').type(TEST_DATA.family);
      cy.getElement('[data-cy="FontListContainer"]')
        .children()
        .should("have.length.above", 0);

      cy.getElement('[data-cy="FontFamilyCard"]:eq(0) h5')
        .contains(TEST_DATA.family, { matchCase: false })
        .should("exist");

      cy.contains(TEST_DATA.family, { matchCase: false }).should("exist");
    });

    it("Successfully Installed Font", () => {
      cy.getElement('[data-cy="FontFamilyCard"]:eq(0) label')
        .contains(TEST_DATA.variant, { matchCase: false })
        .click({ force: true });

      cy.get("[data-cy=FontFamilyCard]:eq(0) [data-cy=InstallFontButton]", {
        timeout: 40_000,
      }).click({ force: true });

      const snackBarText = `Font "${TEST_DATA.family} (${TEST_DATA.variant})" has been installed`;

      cy.contains(snackBarText, { matchCase: false }).should("exist");
    });
  });

  context("Un-install Font", () => {
    before(() => {
      cy.visit("/settings/fonts/installed");
    });

    it("No Results Error Page", () => {
      cy.getElement('[data-cy="InstalledFontSearchInput"] input').type(
        "xxxxxxxxxxx"
      );
      cy.getElement('[data-cy="NoResults"]').should("exist");
    });
    it("Reset Search Term", () => {
      cy.getElement('[data-cy="NoResults"] button').click({ force: true });
      cy.getElement('[data-cy="FontListContainer"]').should("exist");
      cy.getElement('[data-cy="InstalledFontSearchInput"] input').should(
        "be.empty"
      );
    });

    it("Search Installed Fonts - Found", () => {
      cy.getElement('[data-cy="InstalledFontSearchInput"]').type(
        TEST_DATA.family
      );
      cy.getElement('[data-cy="FontListContainer"]')
        .children()
        .should("have.length.above", 0);

      cy.getElement(
        '[data-cy="WebFontCard"]:eq(0) [data-cy="WebFontCardLabel"]'
      )
        .contains(TEST_DATA.family, { matchCase: false })
        .should("exist");
    });

    it("Successfully Un-installed Font", () => {
      cy.getElement(
        '[data-cy="WebFontCard"]:eq(0) [data-cy="UninstallFontButton"]'
      )
        .contains(`Remove ${TEST_DATA.variant}`, { matchCase: false })
        .click({ force: true });

      cy.getElement('[data-cy="DeleteFontDialog"]').should("exist");

      cy.getElement(
        '[data-cy="DeleteFontDialog"] [data-cy="DeleteFontDialogLabel"]'
      )
        .contains(`${TEST_DATA.family} (${TEST_DATA.variant})`, {
          matchCase: false,
        })
        .should("exist");

      cy.getElement('[data-cy="DeleteFontDialogConfirmButton"]').click({
        force: true,
      });

      const snackBarText = `Font "${TEST_DATA.family} (${TEST_DATA.variant})" has been uninstalled`;

      cy.contains(snackBarText, { matchCase: false }).should("exist");
    });
  });
});

Cypress.Commands.add("getElement", (selector) => {
  return cy.get(selector, { timeout: 40_000 });
});

function cleanUp() {
  cy.apiRequest({
    url: `${API_ENDPOINTS.devInstance}/web/headtags`,
  }).then(({ status, data }) => {
    const forDeleteZuids = data
      ?.filter(
        (item) =>
          item?.type === "link" &&
          !!item?.attributes?.href &&
          item?.attributes?.href?.includes(
            `fonts.googleapis.com/css?family=${TEST_DATA.family}`
          )
      )
      ?.map((font) => font?.ZUID);

    forDeleteZuids?.forEach((zuid) => {
      cy.apiRequest({
        url: `${API_ENDPOINTS.devInstance}/web/headtags/${zuid}`,
        method: "DELETE",
      });
    });
  });
}

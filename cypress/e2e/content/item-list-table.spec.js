import { API_ENDPOINTS } from "../../support/api";
import { FIELDS } from "../../support/dbSetup";

const timeout = { timeout: 20_000 };

const NOW = Date.now();

describe("Content item list table", function () {
  before(function () {
    getMediaFiles().then((files) => {
      const items = Cypress.env("ITEMS");
      cy.wrap(items).as("items");
      cy.wrap(files).as("mediaFiles");

      const FIELDS_DATA = {
        ...FIELDS,
        text: {
          ...FIELDS.text,
          required: true,
          settings: {
            defaultValue: "default single line text field",
            list: true,
          },
        },
        internal_link: {
          ...FIELDS.internal_link,
          sort: 2,
          required: false,
          settings: {
            defaultValue: items?.[0].meta?.ZUID,
            list: true,
            tooltip: "habibi internal link",
          },
        },
        images: {
          ...FIELDS.images,
          sort: 3,
          required: null,
          settings: {
            defaultValue: files?.[0]?.id,
            limit: 1,
            list: true,
          },
        },
      };
      const ITEM_DATA = {
        text: "default single line text field",
        images: files?.[0]?.id,
        internal_link: items?.[0].meta?.ZUID,
      };

      const fieldsPayload = Object.values(FIELDS_DATA);

      cy.setFieldProperties(fieldsPayload);
      cy.setContentItemData(ITEM_DATA);
    });
  });

  it("Resolves internal link zuids", function () {
    cy.visit(`/content/${Cypress.env("modelZUID")}`);
    cy.get(`[data-cy="SingleRelationshipCell"]:eq(0)`, timeout)
      .should("exist")
      .scrollIntoView();
    cy.get(`[data-cy="SingleRelationshipCell"]:eq(0)`, timeout).contains(
      this.items[0]?.web?.metaTitle,
      { matchCase: false }
    );
  });

  it("properly removes deleted content items from cache even after page reload", function () {
    cy.visit(`/content/${Cypress.env("modelZUID")}/new`);
    cy.get(`[data-cy="field:text"] input`, timeout)
      .clear()
      .type(`Delete me ${NOW}`);
    cy.getBySelector("ManualMetaFlow").click();
    cy.getBySelector("metaDescription")
      .find("textarea")
      .first()
      .clear()
      .type(`Delete me ${NOW}`);
    cy.getBySelector("CreateItemSaveButton").click();

    cy.contains("Created Item").should("exist");
    cy.visit(`/content/${Cypress.env("modelZUID")}`);

    cy.get(".MuiDataGrid-cellCheckbox", timeout).first().click();
    cy.getBySelector("MultiPageTableDelete").click();
    cy.getBySelector("ConfirmMultiPageTableDelete").click();

    cy.reload();
    cy.contains(`Delete me ${NOW}`, timeout).should("not.exist");
  });
});

function getMediaFiles() {
  const urlPath = `${API_ENDPOINTS.mediaManager}/bin/1-6c9618c-r26pt/files`;
  return cy
    .apiRequest({
      url: `${API_ENDPOINTS.mediaManager}/bin/1-6c9618c-r26pt/files`,
    })
    .then((filesRes) => {
      const files = filesRes?.data;

      const mediaFiles = Array(5)
        .fill(0)
        .map((_, index) => files?.[index]);
      return cy.wrap(mediaFiles);
    });
}

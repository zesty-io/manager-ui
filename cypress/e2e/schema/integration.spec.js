import genericApi from "../../fixtures/integration/generic.json";
import specialApi from "../../fixtures/integration/special.json";

import { DISPLAY_OPTIONS_CONFIG } from "../../../src/shell/components/FieldTypeIntegration/configs";

const forceClick = { force: true };

const ENDPOINTS = {
  generic: "https://8xbq19z1-dev.preview.stage.zesty.io/api/generic.json",
  shopify: "https://shopify.dev/docs/api/ajax/reference/products",
  youtube: "https://youtube.googleapis.com/youtube/v3/channels",
  mux: "https://api.mux.com/video/v1/assets",
  classy: "https://api.classy.org/v1/campaigns",
};

const genericTypes = ["simple", "text", "image", "video", "details"];
const specialTypes = ["shopify", "youtube", "mux", "classy"];

const KEY_PATHS = {
  generic: {
    itemId: "playerId",
    heading: "name",
    subHeading: "team",
    thumbnail: "playerImage",
  },
  special: {
    rootPath: "results",
    itemId: "id",
    heading: "title",
    subHeading: "color",
    thumbnail: "featuredMedia",
    detail: "price",
  },
};

const FIELD_DATA = {
  label: "integration generic field",
  name: "integration_generic_field",
  type: "integration",
  endpoint: ENDPOINTS.generic,
};

describe("Integration Field", () => {
  let MODEL = null;
  before(() => {
    cy.task("seed:content", "fixtures/integration/fields.json").then(
      ({ model }) => {
        Cypress.env("modelZUID", model?.ZUID);
        MODEL = model;
      }
    );
  });

  describe("Add Field", () => {
    context("Generic Display Types", () => {
      genericTypes.forEach((valueType) => {
        it(`${valueType}`.toUpperCase(), () => {
          connectToEndpoint(FIELD_DATA.endpoint, valueType, genericApi);
          addGenericField(valueType);
        });
        it(`Submit Generic Type Field- ${valueType})`, () => {
          cy.intercept(`**/v1/content/models/**`).as("getModelFields");

          cy.get('[data-cy="FieldFormInput_label"] input')
            .focus()
            .type("{selectAll}{del}");
          cy.get('[data-cy="FieldFormInput_label"] input').type(`${valueType}`);
          cy.get('[data-cy="FieldFormAddFieldBtn"]').click();

          cy.wait("@getModelFields").then((interception) => {
            const response = interception.response;
            expect(response?.statusMessage).to.equal("Created");
          });
        });
      });
    });

    context("Special Display Types", () => {
      specialTypes.forEach((valueType) => {
        it(`${valueType}`.toUpperCase(), () => {
          connectToEndpoint(ENDPOINTS[valueType], valueType, specialApi);
          addSpecialField(valueType);
        });
        it(`Submit Special Type Field - ${valueType})`, () => {
          cy.intercept(`**/v1/content/models/**`).as("getModelFields");

          cy.get('[data-cy="FieldFormInput_label"] input')
            .focus()
            .type("{selectAll}{del}");
          cy.get('[data-cy="FieldFormInput_label"] input').type(`${valueType}`);

          cy.get('[data-cy="FieldFormAddFieldBtn"]').click();

          cy.wait("@getModelFields").then((interception) => {
            const response = interception.response;
            expect(response?.statusMessage).to.equal("Created");
          });
        });
      });
    });
  });

  describe("Item Selection", () => {
    it("Create Content Item", () => {
      const modelZUID = Cypress.env("modelZUID");

      cy.visit(`/content/${modelZUID}/new`);
      cy.get(`[data-cy="field:title"]`).find("input").type(MODEL?.label);

      cy.get(
        `[data-cy="field:simple"] [data-cy="integrationSelectItemsButton"]`
      ).click();
      cy.get('[data-cy="integrationSelectionFormDialog"]').should("exist");
    });
    it("Search Filter with - results", () => {
      cy.get('[data-cy="integrationSelectionFormSearchBox"] input')
        .clear()

        .type(genericApi[0].name);

      cy.get(".integrationSelectionFormListContainer")
        .children()
        .should("have.length", 2);
    });
    it("Search Filter - no items found", () => {
      cy.get('[data-cy="integrationSelectionFormSearchBox"] input')
        .clear()
        .type("xxxxxx");

      cy.get('[data-cy="NoResultsContainer"]').should("exist");
    });

    it("Search Filter - reset search term by clicking Search again button", () => {
      cy.get('[data-cy="NoResultsContainer"] button').click();

      cy.get('[data-cy="integrationSelectionFormSearchBox"] input')
        .should("be.empty")
        .should("be.focused");
    });
    it("select 3 Items from the list", () => {
      cy.get(
        '.integrationSelectionFormListContainer [data-cy="integrationSelectCard"]:eq(0) input'
      ).check({ force: true });
      cy.get(
        '.integrationSelectionFormListContainer [data-cy="integrationSelectCard"]:eq(1) input'
      ).check({ force: true });
      cy.get(
        '.integrationSelectionFormListContainer [data-cy="integrationSelectCard"]:eq(2) input'
      ).check({ force: true });

      cy.get('[data-cy="selectIntegrationFormDoneButton"]').click();

      cy.get('[data-cy="integrationSelectionFormDialog"]').should("not.exist");

      cy.get('[data-cy="integrationListValueContainer"]')
        .children()
        .should("have.length", 3);
    });
    it("View Item's JSON data", () => {
      cy.get(
        '[data-cy="integrationListValueContainer"] .draggableCard:eq(0) .moreOptionButton'
      ).click();
      cy.get(
        ".MuiPopover-root.moreOptionMenu ul li.moreOptionMenuItem-view"
      ).click();
      cy.get(".monaco-editor.integrationJsonViewerEditor").should((data) => {
        const editorText = data.text().replace(/\s+/g, "");
        const apiText = JSON.stringify(genericApi[0]).replace(/\s+/g, "");
        expect(editorText).to.equal(apiText);
      });
      cy.get('[data-cy="jsonCodeViewerCloseButton"]').click();
    });

    it("Reorder Item List", () => {
      const fistItemName = genericApi[0].name;
      const secondItemName = genericApi[1].name;

      const dataTransfer = new DataTransfer();

      cy.get(
        '[data-cy="integrationListValueContainer"] .draggableCard:eq(0) .draggableCardDragHandle'
      ).trigger("dragstart", { dataTransfer });

      cy.get(
        '[data-cy="integrationListValueContainer"] .draggableCard:eq(1)'
      ).trigger("drop", { dataTransfer });

      cy.get(
        '[data-cy="integrationListValueContainer"] .draggableCard:eq(0)'
      ).contains(secondItemName, { matchCase: false });
      cy.get(
        '[data-cy="integrationListValueContainer"] .draggableCard:eq(1)'
      ).contains(fistItemName, { matchCase: false });
    });

    it("Delete List Item", () => {
      cy.get(
        '[data-cy="integrationListValueContainer"] .draggableCard:eq(0) .moreOptionButton'
      ).click();
      cy.get(
        ".MuiPopover-root.moreOptionMenu ul li.moreOptionMenuItem-remove"
      ).click();

      cy.get('[data-cy="integrationListValueContainer"]')
        .children()
        .should("have.length", 2);
    });

    it("Save Item", () => {
      cy.intercept("**/v1/content/models/*/items").as("saveItem");
      cy.get('[data-cy="CreateItemSaveButton"]').click(forceClick);

      cy.wait("@saveItem");

      cy.get('[data-cy="toast"]').contains("Created Item");
    });
  });

  describe("Search Filter with Non-string KeyPath", () => {
    it("Does not crash when a configured keyPath resolves to a number", () => {
      const modelZUID = Cypress.env("modelZUID");

      cy.visit(`/content/${modelZUID}/new`);
      cy.get('[data-cy="field:title"]').find("input").type(MODEL?.label);

      cy.get(
        `[data-cy="field:details"] [data-cy="integrationSelectItemsButton"]`
      ).click();
      cy.get('[data-cy="integrationSelectionFormDialog"]').should("exist");

      cy.get('[data-cy="integrationSelectionFormSearchBox"] input')
        .clear()
        .type(genericApi[0].name);

      cy.get('[data-cy="integrationSelectionFormDialog"]').should("exist");
      cy.get(".integrationSelectionFormListContainer")
        .children()
        .should("have.length.at.least", 1);
    });
  });

  describe("Reconfigure Display Options", () => {
    it("Persists keyPath changes when updating an integration field", () => {
      cy.intercept("**/get-url?url=*", {
        statusCode: 200,
        body: genericApi,
      }).as("reconfigureGetUrl");

      cy.visit(`/schema/${Cypress.env("modelZUID")}/fields`);

      cy.get('[data-cy="Field_text"]').click();

      cy.wait("@reconfigureGetUrl");

      cy.intercept("PUT", "**/content/models/*/fields/*").as("updateField");

      cy.get('[data-cy="integrationConfigureButton"]').click();
      cy.get('[data-cy="integrationFormDialog"]').should("exist");

      cy.get('[data-cy="integrationConfigureOptionNextButton"]').click();

      cy.get('[data-cy="integrationKeyPathSelector-subHeading"]').click();
      cy.get(`.MuiAutocomplete-listbox li:contains("position")`).click(
        forceClick
      );

      cy.get(
        '[data-cy="integrationConfigureDisplayOptionsDoneButton"]'
      ).click();

      cy.get('[data-cy="FieldFormAddFieldBtn"]').click();

      cy.wait("@updateField").then(({ request }) => {
        expect(
          request.body.settings.integrationFieldConfig.keyPaths.subHeading
        ).to.equal("position");
      });
    });
  });
});

function connectToEndpoint(endpoint, type, apiData) {
  // Mock data for special display types since we don't have endpoints for these types::
  if (specialTypes.includes(type)) {
    cy.intercept("/get-url?url=*", {
      statusCode: 200,
      body: apiData,
    });
  }

  cy.visit(`/schema/${Cypress.env("modelZUID")}/fields`);

  cy.get('[data-cy="AddFieldBtn"]').click();

  cy.get('[data-cy="FieldItem_integration"]').click();

  cy.get('[data-cy="integrationConfigureButton"]').click();
  cy.get('[data-cy="integrationFormDialog"]').should("exist");
  cy.get('[data-cy="integrationEndpointInput"] input').clear().type(endpoint);

  if (type === "simple") {
    it("Add HTTP Headers", () => {
      cy.get('[data-cy="addHeaderButton"]').click();
      cy.get('[data-cy="addHeaderButton"]').click();
      cy.get('[data-cy="addHeaderButton"]').click();

      cy.get('[data-cy="integrationHeadersContainer"]')
        .children()
        .should("have.length", 5);
    });

    it("Remove HTTP Headers", () => {
      cy.get(
        '[data-cy="integrationHeadersContainerRow-3"] [data-cy="removeHeaderButton"]'
      ).click();
      cy.get(
        '[data-cy="integrationHeadersContainerRow-2"] [data-cy="removeHeaderButton"]'
      ).click();
      cy.get(
        '[data-cy="integrationHeadersContainerRow-1"] [data-cy="removeHeaderButton"]'
      ).click();

      cy.get('[data-cy="integrationHeadersContainer"]')
        .children()
        .should("have.length", 1);
    });
  }

  cy.intercept("**/get-url?url=*").as("getUrl");

  cy.get('[data-cy="integrationConnectButton"]').click();

  cy.wait("@getUrl");

  cy.get('[data-cy="integrationConnectionStatusContainer"]').should("exist");

  cy.get('[data-cy="integrationConnectionStatusLabel"]').should(
    "contain",
    "Connection Successful"
  );
  cy.get('[data-cy="integrationConnectionStatusButton"]').click();
}

function addSpecialField(type) {
  cy.get(`[data-cy="integrationRecommendedOptionsContainer"]`)
    .contains(`${type} card`, { matchCase: false })
    .should("exist");

  //should be recommended and is active
  cy.get(
    `[data-cy="integrationRecommendedOptionsContainer"] [data-cy="integrationDisplayOption-${type}"]`
  )
    .should("exist")
    .should("have.attr", "data-selected");

  cy.get('[data-cy="integrationOptionsContainer"]')
    .children()
    .should("have.length", genericTypes?.length);

  cy.get('[data-cy="integrationOtherOptionsContainer"]')
    .children()
    .should("have.length", specialTypes?.length - 1);

  cy.get('[data-cy="integrationConfigureOptionNextButton"]').click();

  cy.get(
    `[data-cy="integrationKeyPathSelector-rootPath"] .MuiInputBase-root`
  ).click();

  cy.get(
    `.MuiAutocomplete-listbox li p:contains("${KEY_PATHS.special.rootPath}")`
  ).click(forceClick);

  cy.get('[data-cy="integrationConfigureOptionKeyPathContainer"]')
    .children()
    .should("have.length", DISPLAY_OPTIONS_CONFIG?.[type]?.length);

  DISPLAY_OPTIONS_CONFIG?.[type].forEach((item) => {
    cy.get(`[data-cy="integrationKeyPathSelector-${item.name}"]`).click();
    cy.get(
      `.MuiAutocomplete-listbox li p:contains("${
        KEY_PATHS.special?.[item.name]
      }")`
    ).click(forceClick);
  });

  cy.get('[data-cy="integrationConfigureDisplayOptionsDoneButton"]').click();
}

function addGenericField(type) {
  cy.get(`[data-cy="integrationDisplayOption-${type}"]`).click();

  cy.get('[data-cy="integrationConfigureOptionNextButton"]').click();

  cy.get('[data-cy="integrationConfigureOptionKeyPathContainer"]')
    .children()
    .should("have.length", DISPLAY_OPTIONS_CONFIG?.[type]?.length);

  DISPLAY_OPTIONS_CONFIG?.[type].forEach((item) => {
    if (item.name === "details") {
      cy.get(
        '[data-cy="integrationConfigureDisplayOptionsAddDetailButton"]'
      ).click();
      cy.get(
        '[data-cy="integrationDetailsSelectorRow-0"] .MuiInputBase-root'
      ).click();

      cy.get(`.MuiAutocomplete-listbox li:contains("position")`).click(
        forceClick
      );
      cy.get(
        '[data-cy="integrationDetailsSelectorRow-1"] .MuiInputBase-root'
      ).click();

      cy.get(`.MuiAutocomplete-listbox li:contains("jerseyNo")`).click(
        forceClick
      );
    } else {
      cy.get(`[data-cy="integrationKeyPathSelector-${item.name}"]`).click();

      cy.get(
        `.MuiAutocomplete-listbox li:contains("${
          KEY_PATHS.generic[item.name]
        }")`
      ).click(forceClick);
    }
  });

  cy.get('[data-cy="integrationConfigureDisplayOptionsDoneButton"]').click();

  cy.get('[data-cy="integrationApiUrl"] input').should(
    "have.value",
    FIELD_DATA.endpoint
  );
  cy.get('[data-cy="integrationDisplayType"] input').should("have.value", type);
}

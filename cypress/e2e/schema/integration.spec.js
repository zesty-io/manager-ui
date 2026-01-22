import { API_ENDPOINTS } from "../../support/api";
import genericApi from "../../fixtures/integration-field/generic.json";
import specialApi from "../../fixtures/integration-field/special.json";
import apiFields from "../../fixtures/integration-field/fields.json";
import { DISPLAY_OPTIONS_CONFIG } from "../../../src/shell/components/FieldTypeIntegration/configs";

const forceClick = { force: true };

const genericTypes = ["simple", "text", "image", "video", "details"];
const specialTypes = ["shopify", "youtube", "mux", "classy"];

const KEY_PATHS = {
  generic: {
    heading: "name",
    subHeading: "team",
    thumbnail: "playerImage",
  },
  special: {
    rootPath: "results",
    heading: "title",
    subHeading: "color",
    thumbnail: "featuredMedia",
    detail: "price",
  },
};

const MODEL_SCHEMA = {
  label: "__INTEGRATION-TEST",
  name: "__integration_test",
  type: "templateset",
  description: "",
  parentZUID: null,
  listed: true,
};

const GENERIC_FIELD_DATA = {
  label: "integration generic field",
  name: "integration_generic_field",
  type: "integration",
  endpoint: "https://test.api.com/api/v1/generic.json",
};

const SPECIAL_FIELD_DATA = {
  label: "integration special field",
  name: "integration_special_field",
  type: "integration",
  endpoint: "https://test.api.com/api/v1/special.json",
};

describe("Integration Field", () => {
  before(() => {
    deleteTestData();
    createTestData();
  });

  after(() => {
    deleteTestData();
  });

  describe("Add Field", () => {
    context("Generic Display Types", () => {
      genericTypes.forEach((valueType) => {
        it(`${valueType}`.toUpperCase(), () => {
          connectToEndpoint(GENERIC_FIELD_DATA.endpoint, valueType, genericApi);
          addGenericField(valueType);
        });
        it(`Submit Generic Type Field- ${valueType})`, () => {
          const modelZUID = Cypress.env("modelZUID");
          cy.intercept(`/v1/content/models/${modelZUID}/fields`).as(
            "getModelFields"
          );
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
          connectToEndpoint(
            `https://test.${valueType}.api.com/api/special`,
            valueType,
            specialApi
          );
          addSpecialField(valueType);
        });
        it(`Submit Special Type Field - ${valueType})`, () => {
          const modelZUID = Cypress.env("modelZUID");
          cy.intercept(`/v1/content/models/${modelZUID}/fields`).as(
            "getModelFields"
          );
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

      const newData = apiFields.data.map((item) => ({
        ...item,
        contentModelZUID: modelZUID,
        name:
          item.datatype === "integration" ? GENERIC_FIELD_DATA.name : item.name,
        label:
          item.datatype === "integration"
            ? GENERIC_FIELD_DATA.label
            : item.label,
        ...(item.datatype === "integration"
          ? {
              settings: {
                integrationFieldConfig: {
                  ...item.settings.integrationFieldConfig,
                  endpoint: GENERIC_FIELD_DATA.endpoint,
                },
              },
            }
          : {}),
      }));
      cy.intercept(
        "GET",
        `/v1/content/models/${modelZUID}/fields?showDeleted=*`
      );

      cy.intercept("GET", GENERIC_FIELD_DATA.endpoint);

      cy.visit(`/content/${modelZUID}/new`);
      cy.get(
        `[data-cy="field:${GENERIC_FIELD_DATA?.name}"] [data-cy="integrationSelectItemsButton"]`
      ).click();
      cy.get('[data-cy="integrationSelectionFormDialog"]').should("exist");
    });
    it("Search Filter with - results", () => {
      cy.get('[data-cy="integrationSelectionFormSearchBox"] input')
        .clear()
        .type("Memphis");

      cy.get(".integrationSelectionFormListContainer > div")
        .children()
        .should("have.length", 3);
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
        '.integrationSelectionFormListContainer > div [data-cy="integrationSelectCard"]:eq(0) input'
      ).check({ force: true });
      cy.get(
        '.integrationSelectionFormListContainer > div [data-cy="integrationSelectCard"]:eq(1) input'
      ).check({ force: true });
      cy.get(
        '.integrationSelectionFormListContainer > div [data-cy="integrationSelectCard"]:eq(2) input'
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
      cy.get('[data-cy="CreateItemSaveButton"]').click(forceClick);
      cy.get(
        ".MuiPopover-root.moreOptionMenu ul li.moreOptionMenuItem-remove"
      ).click();

      cy.get('[data-cy="integrationListValueContainer"]')
        .children()
        .should("have.length", 2);
    });
  });
});

function connectToEndpoint(endpoint, type, apiData) {
  const modelZUID = Cypress.env("modelZUID");

  cy.intercept("GET", endpoint, {
    statusCode: 200,
    body: apiData,
  });
  cy.visit(`/schema/${Cypress.env("modelZUID")}/fields`);

  cy.get('[data-cy="AddFieldBtn"]').click();

  cy.get('[data-cy="FieldItem_integration"]').click();

  cy.get('[data-cy="FieldFormInput_label"] input')
    .clear()
    .type(`${SPECIAL_FIELD_DATA.label} - ${type}`);
  cy.get('label:contains("Required field")').click();

  cy.get('[data-cy="integrationConfigureButton"]').click();
  cy.get('[data-cy="integrationFormDialog"]').should("exist");
  cy.get('[data-cy="integrationEndpointInput"] input').clear().type(endpoint);

  cy.get('[data-cy="integrationConnectButton"]').click();

  cy.get('[data-cy="integrationConnectionStatusContainer"]').should("exist");

  cy.get('[data-cy="integrationConnectionStatusLabel"]').should(
    "contain",
    "Connection Successful",
    { matchCase: false }
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
    GENERIC_FIELD_DATA.endpoint
  );
  cy.get('[data-cy="integrationDisplayType"] input').should("have.value", type);
}

function createTestData() {
  cy.apiRequest({
    url: `${API_ENDPOINTS.devInstance}/content/models`,
    method: "POST",
    body: MODEL_SCHEMA,
  }).then(({ status, data }) => {
    Cypress.env("modelZUID", data?.ZUID);
  });
}

function deleteTestData() {
  const labelsForDelete = [MODEL_SCHEMA?.label];

  cy.apiRequest({
    url: `${API_ENDPOINTS.devInstance}/content/models`,
  }).then(({ status, data }) => {
    const forDeleteData = data?.filter((item) =>
      labelsForDelete.includes(item?.label)
    );

    const forDeleteZuids = forDeleteData?.map((del) => del?.ZUID);

    forDeleteZuids?.forEach((zuid) => {
      cy.apiRequest({
        url: `${API_ENDPOINTS.devInstance}/content/models/${zuid}`,
        method: "DELETE",
      });
    });
  });
}

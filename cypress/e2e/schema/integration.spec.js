import genericApi from "../../fixtures/integration/generic.json";
import specialApi from "../../fixtures/integration/special.json";
import specialApiReshaped from "../../fixtures/integration/special-reshaped.json";
import genericApiReshaped from "../../fixtures/integration/generic-reshaped.json";

import { DISPLAY_OPTIONS_CONFIG } from "../../../src/shell/components/FieldTypeIntegration/constants";

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
    cy.task("seed:content", "fixtures/integration/maxvalue.json").then(
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

          cy.getBySelector("FieldFormInput_label")
            .find("input")
            .focus()
            .type("{selectAll}{del}");
          cy.getBySelector("FieldFormInput_label")
            .find("input")
            .type(`${valueType}`);
          cy.getBySelector("FieldFormAddFieldBtn").click();

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

          cy.getBySelector("FieldFormInput_label")
            .find("input")
            .focus()
            .type("{selectAll}{del}");
          cy.getBySelector("FieldFormInput_label")
            .find("input")
            .type(`${valueType}`);

          cy.getBySelector("FieldFormAddFieldBtn").click();

          cy.wait("@getModelFields").then((interception) => {
            const response = interception.response;
            expect(response?.statusMessage).to.equal("Created");
          });
        });
      });
    });

    context("HTTP Headers", () => {
      beforeEach(() => {
        cy.visit(`/schema/${Cypress.env("modelZUID")}/fields`);
        cy.getBySelector("AddFieldBtn").click();
        cy.getBySelector("FieldItem_integration").click();
        cy.getBySelector("integrationConfigureButton").click();
        cy.getBySelector("integrationFormDialog").should("exist");
        cy.getBySelector("integrationEndpointInput")
          .find("input")
          .clear()
          .type(ENDPOINTS.generic);
      });

      it("Add HTTP Headers", () => {
        cy.getBySelector("addHeaderButton").click();
        cy.getBySelector("addHeaderButton").click();
        cy.getBySelector("addHeaderButton").click();

        cy.getBySelector("integrationHeadersContainer")
          .children()
          .should("have.length", 4);
      });

      it("Remove HTTP Headers", () => {
        cy.getBySelector("addHeaderButton").click();
        cy.getBySelector("addHeaderButton").click();
        cy.getBySelector("addHeaderButton").click();

        cy.getBySelector("integrationHeadersContainerRow-3")
          .find('[data-cy="removeHeaderButton"]')
          .click();
        cy.getBySelector("integrationHeadersContainerRow-2")
          .find('[data-cy="removeHeaderButton"]')
          .click();
        cy.getBySelector("integrationHeadersContainerRow-1")
          .find('[data-cy="removeHeaderButton"]')
          .click();

        cy.getBySelector("integrationHeadersContainer")
          .children()
          .should("have.length", 1);
      });
    });

    context("Invalid Response Shape", () => {
      const invalidShapes = [
        { name: "null", body: null },
        { name: "empty array", body: [] },
        {
          name: "single object with no nested array",
          body: { name: "Solo", id: 1 },
        },
        { name: "array of primitives", body: [1, 2, 3, 4, 5] },
        { name: "array of nulls", body: [null] },
        { name: "array of objects with no selectable keys", body: [{}] },
        {
          name: "single object with nested array of empty objects",
          body: { items: [{}] },
        },
      ];

      invalidShapes.forEach(({ name, body }) => {
        it(`blocks advancing and shows an error for: ${name}`, () => {
          cy.intercept("**/get-url?url=*", { statusCode: 200, body }).as(
            "getUrl"
          );

          cy.visit(`/schema/${Cypress.env("modelZUID")}/fields`);
          cy.getBySelector("AddFieldBtn").click();
          cy.getBySelector("FieldItem_integration").click();
          cy.getBySelector("integrationConfigureButton").click();
          cy.getBySelector("integrationFormDialog").should("exist");
          cy.getBySelector("integrationEndpointInput")
            .find("input")
            .clear()
            .type(ENDPOINTS.generic);

          cy.getBySelector("integrationConnectButton").click();
          cy.wait("@getUrl");

          cy.getBySelector("integrationConnectionStatusContainer").should(
            "exist"
          );
          cy.getBySelector("integrationConnectionStatusLabel").should(
            "contain",
            "Unsupported Response Format"
          );
          cy.getBySelector("integrationConnectionStatusSubtitle")
            .invoke("text")
            .should("not.be.empty");

          // The action button must keep the user on the Connect step, not
          // advance to Display Type where the Configure dead-end would occur.
          cy.getBySelector("integrationConnectionStatusButton").click();
          cy.getBySelector("integrationEndpointInput").should("exist");
          cy.getBySelector("integrationSelectDisplayOptionsDialog").should(
            "not.exist"
          );
        });
      });
    });
  });

  describe("Item Selection", () => {
    // Serve the integration field's external data from the fixture: the live
    // endpoint has drifted from genericApi, which the assertions reference, so
    // exact-match checks (JSON viewer, reorder) flaked. Mocking makes it
    // deterministic and removes the external dependency.
    beforeEach(() => {
      cy.intercept("POST", "**/get-url*", { body: genericApi });
      // close any JSON viewer left open by a prior test
      cy.get("body").then(($b) => {
        if ($b.find('[data-cy="jsonCodeViewerCloseButton"]').length) {
          cy.get('[data-cy="jsonCodeViewerCloseButton"]').click({
            force: true,
          });
        }
      });
    });
    it("Create Content Item", () => {
      const modelZUID = Cypress.env("modelZUID");
      cy.intercept("**/get-url?url=*", {
        statusCode: 200,
        body: genericApi,
      }).as("reconfigureGetUrl");

      cy.visit(`/content/${modelZUID}/new`);
      cy.getBySelector("field:title").find("input").type(MODEL?.label);

      cy.getBySelector("field:players")
        .find('[data-cy="integrationSelectItemsButton"]')
        .click();
      cy.getBySelector("integrationSelectionFormDialog").should("exist");
    });

    it("Search Filter with - results", () => {
      cy.getBySelector("integrationSelectionFormSearchBox")
        .find("input")
        .clear()
        .type(genericApi[0].name);

      cy.get(".integrationSelectionFormListContainer")
        .children()
        .should("have.length", 2);
    });

    it("Search Filter - no items found", () => {
      cy.getBySelector("integrationSelectionFormSearchBox")
        .find("input")
        .clear()
        .type("xxxxxx");

      cy.getBySelector("NoResultsContainer").should("exist");
    });

    it("Search Filter - reset search term by clicking Search again button", () => {
      cy.getBySelector("NoResultsContainer").find("button").click();

      cy.getBySelector("integrationSelectionFormSearchBox")
        .find("input")
        .should("be.empty")
        .should("be.focused");
    });

    it("select 2 Items from the list", () => {
      cy.getBySelector("integrationSelectCard")
        .eq(0)
        .find(".MuiCheckbox-root")
        .click();
      cy.getBySelector("integrationSelectCard")
        .eq(1)
        .find(".MuiCheckbox-root")
        .click();

      cy.getBySelector("selectIntegrationFormDoneButton").click();

      cy.getBySelector("integrationSelectionFormDialog").should("not.exist");

      cy.getBySelector("integrationListValueContainer")
        .children()
        .should("have.length", 2);
    });

    it("View Item's JSON data", () => {
      cy.getBySelector("integrationListValueContainer")
        .find(".draggableCard")
        .eq(0)
        .find(".moreOptionButton")
        .click();
      cy.get(
        ".MuiPopover-root.moreOptionMenu ul li.moreOptionMenuItem-view"
      ).click();
      cy.get(".monaco-editor.integrationJsonViewerEditor").should((data) => {
        const editorText = data.text().replace(/\s+/g, "");
        const apiText = JSON.stringify(genericApi[0]).replace(/\s+/g, "");
        expect(editorText).to.equal(apiText);
      });
      cy.getBySelector("jsonCodeViewerCloseButton").click();
    });

    it("Reorder Item List", () => {
      const fistItemName = genericApi[0].name;
      const secondItemName = genericApi[1].name;

      const dataTransfer = new DataTransfer();

      cy.getBySelector("integrationListValueContainer")
        .find(".draggableCard")
        .eq(0)
        .find(".draggableCardDragHandle")
        .trigger("dragstart", { dataTransfer });

      cy.getBySelector("integrationListValueContainer")
        .find(".draggableCard")
        .eq(1)
        .trigger("drop", { dataTransfer });

      cy.getBySelector("integrationListValueContainer")
        .find(".draggableCard")
        .eq(0)
        .contains(secondItemName, { matchCase: false });
      cy.getBySelector("integrationListValueContainer")
        .find(".draggableCard")
        .eq(1)
        .contains(fistItemName, { matchCase: false });
    });

    it("Delete List Item", () => {
      cy.getBySelector("integrationListValueContainer")
        .find(".draggableCard")
        .eq(0)
        .find(".moreOptionButton")
        .click();
      cy.get(
        ".MuiPopover-root.moreOptionMenu ul li.moreOptionMenuItem-remove"
      ).click();

      cy.getBySelector("integrationListValueContainer")
        .children()
        .should("have.length", 1);
    });

    it("Save Item", () => {
      cy.intercept("**/v1/content/models/*/items").as("saveItem");
      cy.getBySelector("CreateItemSaveButton").click(forceClick);

      cy.wait("@saveItem");

      cy.getBySelector("toast").contains("Created Item");
    });

    it("Reload preserves saved selections", () => {
      cy.reload();

      cy.getBySelector("integrationListValueContainer")
        .children()
        .should("have.length", 1);
    });
  });

  describe("Search Filter with Non-string KeyPath", () => {
    it("Does not crash when a configured keyPath resolves to a number", () => {
      const modelZUID = Cypress.env("modelZUID");
      cy.intercept("**/get-url?url=*", {
        statusCode: 200,
        body: genericApi,
      }).as("reconfigureGetUrl");

      // Deterministic external data (live endpoint drifts from genericApi).
      cy.intercept("POST", "**/get-url*", { body: genericApi });

      cy.visit(`/content/${modelZUID}/new`);
      cy.getBySelector("field:title").find("input").type(MODEL?.label);

      cy.getBySelector("field:players")
        .find('[data-cy="integrationSelectItemsButton"]')
        .click();
      cy.getBySelector("integrationSelectionFormDialog").should("exist");

      cy.getBySelector("integrationSelectionFormSearchBox")
        .find("input")
        .clear()
        .type(genericApi[0].name);

      cy.getBySelector("integrationSelectionFormDialog").should("exist");
      cy.get(".integrationSelectionFormListContainer")
        .children()
        .should("have.length.at.least", 1);
    });
  });

  describe("maxValue Lockout and Resync", () => {
    let SHARED_MODEL = null;
    let SHARED_CONTENT = null;
    const modifiedApi = genericApi.map((player, i) =>
      i === 0 ? { ...player, name: "Jalen Thompson Updated" } : player
    );

    before(() => {
      cy.task("seed:content", "fixtures/integration/maxvalue.json").then(
        ({ model, items }) => {
          SHARED_MODEL = model;
          SHARED_CONTENT = items[0];
        }
      );
    });

    describe("maxValue Lockout", () => {
      it("Disables unselected checkboxes once the maxValue limit is reached", () => {
        cy.intercept("**/get-url?url=*", {
          statusCode: 200,
          body: genericApi,
        }).as("maxValueGetUrl");

        cy.visit(`/content/${SHARED_MODEL.ZUID}/new`);
        cy.getBySelector("field:title").find("input").type(SHARED_MODEL?.label);

        cy.getBySelector("field:players")
          .find('[data-cy="integrationSelectItemsButton"]')
          .click();
        cy.wait("@maxValueGetUrl");
        cy.getBySelector("integrationSelectionFormDialog").should("exist");

        cy.getBySelector("integrationSelectCard")
          .eq(0)
          .find(".MuiCheckbox-root")
          .click();
        cy.getBySelector("integrationSelectCard")
          .eq(1)
          .find(".MuiCheckbox-root")
          .click();

        cy.getBySelector("integrationSelectCard")
          .eq(2)
          .find("input")
          .should("be.disabled");
      });
    });

    describe("Resync", () => {
      it("shows resync button on a selected item when remote data has changed", () => {
        cy.intercept("**/get-url?url=*", {
          statusCode: 200,
          body: genericApi,
        }).as("getUrl");

        cy.visit(
          `/content/${SHARED_MODEL?.ZUID}/${SHARED_CONTENT?.meta?.ZUID}`
        );

        cy.getBySelector("field:players")
          .find('[data-cy="integrationSelectItemsButton"]')
          .click();

        cy.getBySelector("integrationSelectCard")
          .eq(0)
          .find(".MuiCheckbox-root")
          .click();
        cy.getBySelector("selectIntegrationFormDoneButton").click();
        cy.getBySelector("integrationSelectionFormDialog").should("not.exist");

        cy.intercept("**/get-url?url=*", {
          statusCode: 200,
          body: modifiedApi,
        }).as("getModifiedUrl");

        cy.getBySelector("field:players")
          .find('[data-cy="integrationSelectItemsButton"]')
          .click();

        cy.getBySelector("integrationSelectionFormDialog").should("exist");

        cy.getBySelector("integrationSelectCard")
          .eq(0)
          .find('[data-cy="integrationResyncButton"]')
          .should("exist");

        cy.get("body").click();
      });

      it("does not show resync button when remote data matches saved data", () => {
        cy.intercept("**/get-url?url=*", {
          statusCode: 200,
          body: genericApi,
        }).as("getUrl");

        cy.visit(
          `/content/${SHARED_MODEL?.ZUID}/${SHARED_CONTENT?.meta?.ZUID}`
        );

        cy.getBySelector("field:players")
          .find('[data-cy="integrationSelectItemsButton"]')
          .click();

        cy.getBySelector("integrationSelectionFormDialog").should("exist");

        cy.getBySelector("integrationSelectCard")
          .eq(0)
          .find('[data-cy="integrationResyncButton"]')
          .should("not.exist");

        cy.get("body").click(forceClick);
      });

      it("clicking resync updates the displayed item in the selected list", () => {
        cy.intercept("**/get-url?url=*", {
          statusCode: 200,
          body: genericApi,
        }).as("getUrl");
        cy.visit(
          `/content/${SHARED_MODEL?.ZUID}/${SHARED_CONTENT?.meta?.ZUID}`
        );

        cy.getBySelector("field:players")
          .find('[data-cy="integrationSelectItemsButton"]')
          .click();

        cy.getBySelector("integrationSelectionFormDialog").should("exist");

        cy.getBySelector("integrationSelectCard")
          .eq(0)
          .find(".MuiCheckbox-root")
          .click();
        cy.getBySelector("selectIntegrationFormDoneButton").click();

        cy.intercept("**/get-url?url=*", {
          statusCode: 200,
          body: modifiedApi,
        }).as("getModifiedUrl");

        cy.getBySelector("field:players")
          .find('[data-cy="integrationSelectItemsButton"]')
          .click();

        cy.getBySelector("integrationSelectCard")
          .eq(0)
          .find('[data-cy="integrationResyncButton"]')
          .click();

        cy.getBySelector("integrationSelectCard")
          .eq(0)
          .find('[data-cy="integrationResyncButton"]')
          .should("not.exist");

        cy.getBySelector("selectIntegrationFormDoneButton").click();
        cy.getBySelector("integrationSelectionFormDialog").should("not.exist");

        cy.getBySelector("integrationListValueContainer")
          .find(".draggableCard")
          .eq(0)
          .should("contain.text", modifiedApi[0].name);
      });
    });
  });

  describe("Reconfigure Display Options", () => {
    it("Persists keyPath changes when updating an integration field", () => {
      cy.intercept("**/get-url?url=*", {
        statusCode: 200,
        body: genericApi,
      }).as("reconfigureGetUrl");

      cy.visit(`/schema/${Cypress.env("modelZUID")}/fields`);

      cy.getBySelector("Field_text").click();

      cy.wait("@reconfigureGetUrl");

      cy.intercept("PUT", "**/content/models/*/fields/*").as("updateField");

      cy.getBySelector("integrationConfigureButton").click();
      cy.getBySelector("integrationFormDialog").should("exist");

      cy.getBySelector("integrationConfigureOptionNextButton").click();

      cy.getBySelector("integrationKeyPathSelector-itemId")
        .find("input")
        .should("have.value", KEY_PATHS.generic.itemId);
      cy.getBySelector("integrationKeyPathSelector-heading")
        .find("input")
        .should("have.value", KEY_PATHS.generic.heading);

      cy.getBySelector("integrationKeyPathSelector-subHeading").click();
      cy.get(`.MuiAutocomplete-listbox li:contains("position")`).click(
        forceClick
      );

      cy.getBySelector("integrationConfigureDisplayOptionsDoneButton").click();

      cy.getBySelector("FieldFormAddFieldBtn").click();

      cy.wait("@updateField").then(({ request }) => {
        expect(
          request.body.settings.integrationFieldConfig.keyPaths.subHeading
        ).to.equal("position");
      });
    });

    it("Cancelling mid-reconfigure leaves the displayed type unchanged", () => {
      cy.intercept("**/get-url?url=*", {
        statusCode: 200,
        body: genericApi,
      }).as("reconfigureGetUrl");

      cy.visit(`/schema/${Cypress.env("modelZUID")}/fields`);
      cy.get('[data-cy="Field_text"]').click();
      cy.wait("@reconfigureGetUrl");

      cy.get('[data-cy="integrationDisplayType"] input')
        .invoke("val")
        .as("originalType");

      cy.get('[data-cy="integrationConfigureButton"]').click();
      cy.get('[data-cy="integrationFormDialog"]').should("exist");

      cy.get('[data-cy="integrationDisplayOption-simple"]').click(forceClick);
      cy.contains("button", "Cancel").click();
      cy.get('[data-cy="integrationFormDialog"]').should("not.exist");

      cy.get("@originalType").then((originalType) => {
        cy.get('[data-cy="integrationDisplayType"] input').should(
          "have.value",
          originalType
        );
      });
    });

    it("Updates the displayed type after a successful reconfigure", () => {
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

      cy.get('[data-cy="integrationDisplayOption-simple"]').click(forceClick);
      cy.get('[data-cy="integrationConfigureOptionNextButton"]').click();

      cy.get('[data-cy="integrationKeyPathSelector-itemId"]').click();
      cy.get(`.MuiAutocomplete-listbox li:contains("playerId")`).click(
        forceClick
      );

      cy.get('[data-cy="integrationKeyPathSelector-heading"]').click();
      cy.get(`.MuiAutocomplete-listbox li:contains("name")`).click(forceClick);

      cy.get(
        '[data-cy="integrationConfigureDisplayOptionsDoneButton"]'
      ).click();

      cy.get('[data-cy="integrationDisplayType"] input').should(
        "have.value",
        "simple"
      );

      cy.get('[data-cy="FieldFormAddFieldBtn"]').click();
      cy.wait("@updateField").then(({ request }) => {
        expect(request.body.settings.integrationFieldConfig.type).to.equal(
          "simple"
        );
      });
    });

    it("Persists a new endpoint through the full Edit API URL flow", () => {
      const NEW_ENDPOINT =
        "https://8xbq19z1-dev.preview.stage.zesty.io/api/generic-v2.json";

      cy.intercept("**/get-url?url=*", {
        statusCode: 200,
        body: genericApi,
      }).as("reconfigureGetUrl");

      cy.visit(`/schema/${Cypress.env("modelZUID")}/fields`);
      cy.getBySelector("Field_text").click();
      cy.wait("@reconfigureGetUrl");

      cy.intercept("PUT", "**/content/models/*/fields/*").as("updateField");

      cy.getBySelector("integrationEditApiUrlButton").click();
      cy.getBySelector("integrationFormDialog").should("exist");

      cy.getBySelector("integrationEndpointInput")
        .find("input")
        .clear()
        .type(NEW_ENDPOINT);

      cy.intercept("**/get-url?url=*", {
        statusCode: 200,
        body: genericApi,
      }).as("getNewUrl");

      cy.getBySelector("integrationConnectButton").click();
      cy.wait("@getNewUrl");

      cy.getBySelector("integrationConnectionStatusLabel").should(
        "contain",
        "Connection Successful"
      );
      cy.getBySelector("integrationKeyPathsMismatchWarning").should(
        "not.exist"
      );

      cy.getBySelector("integrationConnectionStatusButton").click();
      cy.getBySelector("integrationConfigureOptionNextButton").click();
      cy.getBySelector("integrationConfigureDisplayOptionsDoneButton").click();

      cy.getBySelector("FieldFormAddFieldBtn").click();
      cy.wait("@updateField").then(({ request }) => {
        expect(request.body.settings.integrationFieldConfig.endpoint).to.equal(
          NEW_ENDPOINT
        );
      });
    });

    it("Edit API URL opens the Connect to API step; Edit Display Options still opens the Display Type step", () => {
      cy.intercept("**/get-url?url=*", {
        statusCode: 200,
        body: genericApi,
      }).as("reconfigureGetUrl");

      cy.visit(`/schema/${Cypress.env("modelZUID")}/fields`);
      cy.getBySelector("Field_text").click();
      cy.wait("@reconfigureGetUrl");

      // "Edit Display Options" preserves the original behavior — opens directly
      // at the Display Type step.
      cy.getBySelector("integrationConfigureButton").should(
        "contain",
        "Edit Display Options"
      );
      cy.getBySelector("integrationConfigureButton").click();
      cy.getBySelector("integrationFormDialog").should("exist");
      cy.getBySelector("integrationOptionsContainer").should("exist");
      cy.contains("button", "Cancel").click();

      // "Edit API URL" is the new entry point — opens at Connect to API,
      // which was previously unreachable once a field was created.
      cy.getBySelector("integrationEditApiUrlButton").should(
        "contain",
        "Edit API URL"
      );
      cy.getBySelector("integrationEditApiUrlButton").click();
      cy.getBySelector("integrationFormDialog").should("exist");
      cy.getBySelector("integrationEndpointInput").should("exist");
    });

    it("Warns, without blocking, when reconnecting to an endpoint whose shape no longer matches the saved key paths", () => {
      // Self-contained: create a dedicated special-type field rather than
      // relying on a field created (and named) by an earlier describe block —
      // the field's `name` is not guaranteed to match the typed label/type.
      const fieldLabel = "reconfigure shopify test field";

      connectToEndpoint(ENDPOINTS.shopify, "shopify", specialApi);
      addSpecialField("shopify");

      cy.intercept(`**/v1/content/models/**`).as("getModelFields");
      cy.getBySelector("FieldFormInput_label")
        .find("input")
        .focus()
        .type("{selectAll}{del}");
      cy.getBySelector("FieldFormInput_label").find("input").type(fieldLabel);
      cy.getBySelector("FieldFormAddFieldBtn").click();
      cy.wait("@getModelFields");

      cy.intercept("**/get-url?url=*", {
        statusCode: 200,
        body: specialApi,
      }).as("initialGetUrl");

      cy.visit(`/schema/${Cypress.env("modelZUID")}/fields`);
      cy.contains('[data-cy^="Field_"]', fieldLabel).click();
      cy.wait("@initialGetUrl");

      cy.getBySelector("integrationEditApiUrlButton").click();
      cy.getBySelector("integrationFormDialog").should("exist");

      cy.intercept("**/get-url?url=*", {
        statusCode: 200,
        body: specialApiReshaped,
      }).as("reshapedGetUrl");

      cy.getBySelector("integrationEndpointInput")
        .find("input")
        .clear()
        .type(ENDPOINTS.classy);
      cy.getBySelector("integrationConnectButton").click();
      cy.wait("@reshapedGetUrl");

      cy.getBySelector("integrationConnectionStatusLabel").should(
        "contain",
        "Connection Successful"
      );
      cy.getBySelector("integrationKeyPathsMismatchWarning").should(
        "contain",
        "different structure"
      );

      // The warning is non-blocking — Next still advances the flow.
      cy.getBySelector("integrationConnectionStatusButton").click();
      cy.getBySelector("integrationOptionsContainer").should("exist");
    });

    it("Warns on a generic (root-level array) field too, not just rootPath-based special types", () => {
      // Generic display types (simple/text/image/video/details) store an
      // empty rootPath — the response array itself is the root. This
      // specifically pins the fix for the case that was previously skipped.
      cy.intercept("**/get-url?url=*", {
        statusCode: 200,
        body: genericApi,
      }).as("reconfigureGetUrl");

      cy.visit(`/schema/${Cypress.env("modelZUID")}/fields`);
      cy.getBySelector("Field_text").click();
      cy.wait("@reconfigureGetUrl");

      cy.getBySelector("integrationEditApiUrlButton").click();
      cy.getBySelector("integrationFormDialog").should("exist");

      cy.intercept("**/get-url?url=*", {
        statusCode: 200,
        body: genericApiReshaped,
      }).as("reshapedGenericGetUrl");

      cy.getBySelector("integrationEndpointInput")
        .find("input")
        .clear()
        .type(ENDPOINTS.mux);
      cy.getBySelector("integrationConnectButton").click();
      cy.wait("@reshapedGenericGetUrl");

      cy.getBySelector("integrationConnectionStatusLabel").should(
        "contain",
        "Connection Successful"
      );
      cy.getBySelector("integrationKeyPathsMismatchWarning").should(
        "contain",
        "different structure"
      );
    });
  });

  describe("Non-unique Item ID (regression #4091)", () => {
    // Own model, seeded fresh, so reconfiguring itemId to a non-unique
    // keyPath here can't affect the itemId=playerId fields used elsewhere.
    let DUPLICATE_MODEL = null;

    before(() => {
      cy.task("seed:content", "fixtures/integration/maxvalue.json").then(
        ({ model }) => {
          DUPLICATE_MODEL = model;
        }
      );
    });

    beforeEach(() => {
      cy.intercept("POST", "**/get-url*", { body: genericApi });
    });

    it("Blocks Done and warns when the chosen Item ID is not unique across sampled items", () => {
      cy.intercept("**/get-url?url=*", {
        statusCode: 200,
        body: genericApi,
      }).as("reconfigureGetUrl");

      cy.visit(`/schema/${DUPLICATE_MODEL.ZUID}/fields`);
      cy.getBySelector("Field_players").click();
      cy.wait("@reconfigureGetUrl");

      cy.getBySelector("integrationConfigureButton").click();
      cy.getBySelector("integrationFormDialog").should("exist");
      cy.getBySelector("integrationConfigureOptionNextButton").click();

      // playerId (the field's current itemId) is unique — no warning, Done enabled.
      cy.getBySelector("integrationItemIdDuplicateWarning").should("not.exist");
      cy.getBySelector("integrationConfigureDisplayOptionsDoneButton").should(
        "not.be.disabled"
      );

      cy.getBySelector("integrationKeyPathSelector-itemId").click();
      cy.getBySelector("integrationKeyPathOption-position").click(forceClick);

      cy.getBySelector("integrationItemIdDuplicateWarning").should(
        "contain",
        "is not unique"
      );
      cy.getBySelector("integrationConfigureDisplayOptionsDoneButton").should(
        "be.disabled"
      );

      // Switching back to a unique keyPath clears the warning and re-enables Done.
      cy.getBySelector("integrationKeyPathSelector-itemId").click();
      cy.getBySelector("integrationKeyPathOption-playerId").click(forceClick);
      cy.getBySelector("integrationItemIdDuplicateWarning").should("not.exist");

      cy.intercept("PUT", "**/content/models/*/fields/*").as("updateField");
      cy.getBySelector("integrationConfigureDisplayOptionsDoneButton").click();
      cy.getBySelector("FieldFormAddFieldBtn").click();
      cy.wait("@updateField").then(({ request }) => {
        expect(
          request.body.settings.integrationFieldConfig.keyPaths.itemId
        ).to.equal("playerId");
      });
    });
  });
});

function connectToEndpoint(endpoint, type, apiData) {
  // Mock data for special display types since we don't have endpoints for these types:
  if (specialTypes.includes(type)) {
    cy.intercept("/get-url?url=*", {
      statusCode: 200,
      body: apiData,
    });
  }

  cy.visit(`/schema/${Cypress.env("modelZUID")}/fields`);

  cy.getBySelector("AddFieldBtn").click();

  cy.getBySelector("FieldItem_integration").click();

  cy.getBySelector("integrationConfigureButton").click();
  cy.getBySelector("integrationFormDialog").should("exist");
  cy.getBySelector("integrationEndpointInput")
    .find("input")
    .clear()
    .type(endpoint);

  cy.intercept("**/get-url?url=*").as("getUrl");

  cy.getBySelector("integrationConnectButton").click();

  cy.wait("@getUrl");

  cy.getBySelector("integrationConnectionStatusContainer").should("exist");

  cy.getBySelector("integrationConnectionStatusLabel").should(
    "contain",
    "Connection Successful"
  );
  cy.getBySelector("integrationConnectionStatusButton").click();
}

function addSpecialField(type) {
  cy.getBySelector("integrationRecommendedOptionsContainer")
    .contains(`${type} card`, { matchCase: false })
    .should("exist");

  cy.getBySelector("integrationRecommendedOptionsContainer")
    .find(`[data-cy="integrationDisplayOption-${type}"]`)
    .should("exist")
    .should("have.attr", "data-selected");

  cy.getBySelector("integrationOptionsContainer")
    .children()
    .should("have.length", genericTypes?.length);

  cy.getBySelector("integrationOtherOptionsContainer")
    .children()
    .should("have.length", specialTypes?.length - 1);

  cy.getBySelector("integrationConfigureOptionNextButton").click();

  cy.getBySelector("integrationKeyPathSelector-rootPath")
    .find(".MuiInputBase-root")
    .click();

  cy.get(
    `.MuiAutocomplete-listbox li p:contains("${KEY_PATHS.special.rootPath}")`
  ).click(forceClick);

  cy.getBySelector("integrationConfigureOptionKeyPathContainer")
    .children()
    .should("have.length", DISPLAY_OPTIONS_CONFIG?.[type]?.length);

  DISPLAY_OPTIONS_CONFIG?.[type].forEach((item) => {
    cy.getBySelector(`integrationKeyPathSelector-${item.name}`).click();
    cy.get(
      `.MuiAutocomplete-listbox li p:contains("${
        KEY_PATHS.special?.[item.name]
      }")`
    ).click(forceClick);
  });

  cy.getBySelector("integrationConfigureDisplayOptionsDoneButton").click();
}

function addGenericField(type) {
  cy.getBySelector(`integrationDisplayOption-${type}`).click();

  cy.getBySelector("integrationConfigureOptionNextButton").click();

  cy.getBySelector("integrationConfigureOptionKeyPathContainer")
    .children()
    .should("have.length", DISPLAY_OPTIONS_CONFIG?.[type]?.length);

  DISPLAY_OPTIONS_CONFIG?.[type].forEach((item) => {
    if (item.name === "details") {
      cy.getBySelector(
        "integrationConfigureDisplayOptionsAddDetailButton"
      ).click();
      cy.getBySelector("integrationDetailsSelectorRow-0")
        .find(".MuiInputBase-root")
        .click();

      cy.get(`.MuiAutocomplete-listbox li:contains("position")`).click(
        forceClick
      );
      cy.getBySelector("integrationDetailsSelectorRow-1")
        .find(".MuiInputBase-root")
        .click();

      cy.get(`.MuiAutocomplete-listbox li:contains("jerseyNo")`).click(
        forceClick
      );
    } else {
      cy.getBySelector(`integrationKeyPathSelector-${item.name}`).click();

      cy.get(
        `.MuiAutocomplete-listbox li:contains("${
          KEY_PATHS.generic[item.name]
        }")`
      ).click(forceClick);
    }
  });

  cy.getBySelector("integrationConfigureDisplayOptionsDoneButton").click();

  cy.getBySelector("integrationApiUrl")
    .find("input")
    .should("have.value", FIELD_DATA.endpoint);
  cy.getBySelector("integrationDisplayType")
    .find("input")
    .should("have.value", type);
}

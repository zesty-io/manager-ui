import { STARTER_BLOCKS } from "../../../../src/apps/schema/src/app/components/StarterBlocks/configs";
import { API_ENDPOINTS } from "../../../support/api";

const TIMEOUT = { timeout: 60_000 };
const testSufix = "------TEST";

const BLOCK_LABELS = STARTER_BLOCKS.map((block) => block.label);

const ERRORS = {
  label: "Display name is already in use. Please use another display name.",
  name: "Reference ID is already in use. Please use another Reference ID.",
};

const TEST_DATA = {
  existing: {
    label: `Starter Block${testSufix}`,
    name: `starter_block______test`,
    description: "Starter Block Existing Description",
    fields: [
      {
        contentModelZUID: null,
        datatype: "text",
        description: "test description",
        label: "starter block test label",
        name: "starter_block_test_label",
        required: false,
        settings: {
          defaultValue: "starter block test - default value",
          list: true,
        },
        sort: 1,
      },
    ],
  },
};

const POP_UPS = {
  formLoading: '[data-cy="starter-block-form-loading-backdrop"]',
  noResults: '[data-cy="no-results-page"]',
};

const starterBlockFormField = `[data-cy="starter-block-form-fields-container"] > div[data-cy-status]`;
const formLabelErrorContainer = '[data-cy="starter-block-form-label-error"]';
const formNameErrorContainer = '[data-cy="starter-block-form-name-error"]';
const schemaPageTitleContainer = 'nav[data-cy="breadcrumbs"] + div > h3';

function schemaField() {
  return cy
    .getElement('[data-cy="SEOFields"]')
    .parent()
    .find("div[data-cy-status]", TIMEOUT);
}

describe("Starter Blocks", () => {
  before(() => {
    deleteStarterBlocksTestData();
    createStarterBlocksTestData();
  });
  after(() => {
    deleteStarterBlocksTestData();
  });

  describe("Selection Dialogue", () => {
    it("should render starter blocks", () => {
      // openStarterBlocksDialogue();
      cy.visit("/schema");
      cy.getElement('[data-cy="create_new_content_item"]').click(TIMEOUT);
      cy.getElement('[data-cy="model-type-block"]').click();
      cy.getElement('[data-cy="create-model-next-button"]').click();

      cy.getElement('[data-cy="starter-blocks-container"]')
        .should("be.visible")
        .children()
        .should("have.length", STARTER_BLOCKS.length);

      STARTER_BLOCKS.forEach((block) => {
        cy.contains(block.label).should("exist");
      });
    });
    it("should be able to search starter blocks", () => {
      const noResultsSearchTerm = "xxx___xxx___xxx";
      cy.getElement('[data-cy="starter-blocks-search"] input')
        .clear()
        .type("hero");
      cy.getElement('[data-cy="starter-blocks-container"]')
        .children()
        .should("have.length", 2);

      cy.getElement('[data-cy="starter-blocks-search"] input')
        .clear()
        .type(noResultsSearchTerm);
      cy.getElement(POP_UPS.noResults).should("exist");
    });
    it("Pressing search again should clear search and focus on the search input", () => {
      cy.getElement(POP_UPS.noResults)
        .find("button")
        .contains("Search Again", { matchCase: false })
        .click(TIMEOUT);

      cy.getElement('[data-cy="starter-blocks-search"] input')
        .should("be.empty")
        .and("be.focused");
    });
  });

  describe("Starter Block Form", () => {
    beforeEach(() => {
      openStarterBlocksDialogue();
    });

    it("Display an error message when attempting to use a name that's already in use.", () => {
      cy.getElement('[data-cy="starter-block-card"]').first().click(TIMEOUT);
      cy.getElement('[data-cy="select-block-type-next-button"]').click();

      cy.getElement('[data-cy="starter-block-form-label"] input')
        .clear()
        .type(TEST_DATA.existing.label);
      cy.getElement('[data-cy="starter-block-form-submit"]').click();
      cy.getElement(POP_UPS.formLoading).should("exist");

      cy.getElement(formLabelErrorContainer).should("have.text", ERRORS.label);
      cy.getElement(formNameErrorContainer).should("have.text", ERRORS.name);
    });
  });

  describe("Create Stater Blocks", () => {
    beforeEach(() => {
      openStarterBlocksDialogue();
    });

    it(`[${STARTER_BLOCKS[0].label}]`, () => {
      const BLOCK = STARTER_BLOCKS[0];

      createStarterBlock(BLOCK?.label);
      const TEST_LABEL = `${BLOCK?.label}${testSufix}`;
      validatePrimaryDetails(BLOCK);

      cy.getElement('[data-cy="starter-block-form-fields-container"]').should(
        "not.exist"
      );

      cy.intercept("POST", "/v1/content/models").as("createModel");
      cy.intercept("/v1/content/models").as("getModels");

      cy.getElement('[data-cy="starter-block-form-label"] input')
        .clear()
        .type(TEST_LABEL);
      cy.getElement('[data-cy="starter-block-form-submit"]').click();
      cy.getElement(POP_UPS.formLoading).should("exist");

      cy.wait(["@createModel", "@getModels"], TIMEOUT);

      cy.contains("h3", TEST_LABEL, {
        matchCase: false,
        timeout: 20000,
      }).should("exist");

      // cy.getElement(schemaPageTitleContainer).should(
      //   "contain.text",
      //   TEST_LABEL,
      //   { matchCase: false, ...TIMEOUT }
      // );

      // cy.getElement("div > button + div + p + span").should("have.length", 0);
    });

    it(`[${STARTER_BLOCKS[1].label}]`, () => {
      const BLOCK = STARTER_BLOCKS[1];

      createStarterBlock(BLOCK?.label);
      const TEST_LABEL = `${BLOCK?.label}${testSufix}`;
      validatePrimaryDetails(BLOCK);

      BLOCK.fields.forEach((field) => {
        cy.getElement(starterBlockFormField).should(
          "contain.text",
          field.label
        );
      });

      fillOutFormAndSubmit(TEST_LABEL).then((res) => {
        cy.contains("h3", TEST_LABEL, {
          matchCase: false,
          timeout: 20000,
        }).should("exist");
        // cy.getElement(schemaPageTitleContainer).should(
        //   "contain.text",
        //   TEST_LABEL,
        //   { matchCase: false, ...TIMEOUT }
        // );

        // BLOCK.fields.forEach((field) => {
        //   schemaField().should("contain.text", field.label);
        // });
        cy.wrap({ ...res }).as("createModelResponse");
      });

      if (!!BLOCK?.code) {
        cy.get("@createModelResponse").then((res) => {
          const zuid = res?.webView?.ZUID;

          validateTemplateCode(zuid, BLOCK?.code);
        });
      }
    });

    it(`[${STARTER_BLOCKS[2].label}]`, () => {
      const BLOCK = STARTER_BLOCKS[2];

      createStarterBlock(BLOCK?.label);
      const TEST_LABEL = `${BLOCK?.label}${testSufix}`;
      validatePrimaryDetails(BLOCK);

      BLOCK.fields.forEach((field) => {
        // cy.getElement(starterBlockFormField).should(
        //   "contain.text",
        //   field.label
        // );
      });

      fillOutFormAndSubmit(TEST_LABEL).then((res) => {
        cy.contains("h3", TEST_LABEL, {
          matchCase: false,
          timeout: 20000,
        }).should("exist");
        // cy.getElement(schemaPageTitleContainer).should(
        //   "contain.text",
        //   TEST_LABEL,
        //   { matchCase: false, ...TIMEOUT }
        // );

        BLOCK.fields.forEach((field) => {
          // schemaField().should("contain.text", field.label);
        });
        cy.wrap({ ...res }).as("createModelResponse");
      });

      if (!!BLOCK?.code) {
        cy.get("@createModelResponse").then((res) => {
          const zuid = res?.webView?.ZUID;

          validateTemplateCode(zuid, BLOCK?.code);
        });
      }
    });

    it(`[${STARTER_BLOCKS[3].label}]`, () => {
      const BLOCK = STARTER_BLOCKS[3];

      createStarterBlock(BLOCK?.label);
      const TEST_LABEL = `${BLOCK?.label}${testSufix}`;
      validatePrimaryDetails(BLOCK);

      BLOCK.fields.forEach((field) => {
        cy.getElement(starterBlockFormField).should(
          "contain.text",
          field.label
        );
      });

      fillOutFormAndSubmit(TEST_LABEL).then((res) => {
        cy.contains("h3", TEST_LABEL, {
          matchCase: false,
          timeout: 20000,
        }).should("exist");
        // cy.getElement(schemaPageTitleContainer).should(
        //   "contain.text",
        //   TEST_LABEL,
        //   { matchCase: false, ...TIMEOUT }
        // );

        BLOCK.fields.forEach((field) => {
          // schemaField().should("contain.text", field.label);
        });
        cy.wrap({ ...res }).as("createModelResponse");
      });

      if (!!BLOCK?.code) {
        cy.get("@createModelResponse").then((res) => {
          const zuid = res?.webView?.ZUID;

          validateTemplateCode(zuid, BLOCK?.code);
        });
      }
    });

    it(`[${STARTER_BLOCKS[4].label}]`, () => {
      const BLOCK = STARTER_BLOCKS[4];

      createStarterBlock(BLOCK?.label);
      const TEST_LABEL = `${BLOCK?.label}${testSufix}`;
      validatePrimaryDetails(BLOCK);

      BLOCK.fields.forEach((field) => {
        cy.getElement(starterBlockFormField).should(
          "contain.text",
          field.label
        );
      });

      fillOutFormAndSubmit(TEST_LABEL).then((res) => {
        // cy.getElement(schemaPageTitleContainer).should(
        //   "contain.text",
        //   TEST_LABEL,
        //   { matchCase: false, ...TIMEOUT }
        // );

        BLOCK.fields.forEach((field) => {
          // schemaField().should("contain.text", field.label);
        });

        cy.wrap({ ...res }).as("createModelResponse");
      });

      if (!!BLOCK?.code) {
        cy.get("@createModelResponse").then((res) => {
          const zuid = res?.webView?.ZUID;

          validateTemplateCode(zuid, BLOCK?.code);
        });
      }
    });

    it(`[${STARTER_BLOCKS[5].label}]`, () => {
      const BLOCK = STARTER_BLOCKS[5];

      createStarterBlock(BLOCK?.label);

      const TEST_LABEL = `${BLOCK?.label}${testSufix}`;

      validatePrimaryDetails(BLOCK);

      BLOCK.fields.forEach((field) => {
        cy.getElement(starterBlockFormField).should(
          "contain.text",
          field.label
        );
      });

      fillOutFormAndSubmit(TEST_LABEL).then((res) => {
        // cy.getElement(schemaPageTitleContainer).should(
        //   "contain.text",
        //   TEST_LABEL,
        //   { matchCase: false, ...TIMEOUT }
        // );
        cy.contains("h3", TEST_LABEL, {
          matchCase: false,
          timeout: 20000,
        }).should("exist");

        BLOCK.fields.forEach((field) => {
          // schemaField().should("contain.text", field.label);
        });

        cy.wrap({ ...res }).as("createModelResponse");
      });

      if (!!BLOCK?.code) {
        cy.get("@createModelResponse").then((res) => {
          const zuid = res?.webView?.ZUID;

          validateTemplateCode(zuid, BLOCK?.code);
        });
      }
    });
  });
});

Cypress.Commands.add("getElement", (selector) => {
  return cy.get(selector, TIMEOUT);
});

function validatePrimaryDetails(BLOCK) {
  cy.location("href").then((path) => {
    cy.getElement('[data-cy="starter-block-form-label"] input').should(
      "have.value",
      BLOCK?.label
    );
    cy.getElement('[data-cy="starter-block-form-name"] input').should(
      "have.value",
      BLOCK?.name
    );
    cy.getElement('[data-cy="starter-block-form-description"]').should(
      "contain.text",
      BLOCK?.description
    );
    cy.getElement('[data-cy="starter-block-form-preview-link"]').should(
      "have.prop",
      "href",
      BLOCK?.previewLink === "#"
        ? `${path}${BLOCK?.previewLink}`
        : BLOCK?.previewLink
    );
    cy.getElement('[data-cy="starter-block-form-code-template-link"]').should(
      "have.prop",
      "href",
      BLOCK?.codeTemplateLink === "#"
        ? `${path}${BLOCK?.codeTemplateLink}`
        : BLOCK?.codeTemplateLink
    );
    cy.getElement('[data-cy="starter-block-form-code-reference-link"]').should(
      "have.prop",
      "href",
      BLOCK?.codeReference === "#"
        ? `${path}${BLOCK?.codeReference}`
        : BLOCK?.codeReference
    );
  });
}

function fillOutFormAndSubmit(fieldLabel = "") {
  cy.intercept("POST", "/v1/content/models").as("createModel");
  cy.intercept("PUT", "/v1/web/views/*").as("updateWebView");
  cy.intercept("/v1/content/models").as("getModels");

  cy.getElement('[data-cy="starter-block-form-label"] input')
    .clear()
    .type(fieldLabel);
  cy.getElement('[data-cy="starter-block-form-submit"]').click();
  cy.getElement(POP_UPS.formLoading).should("exist");

  return cy
    .wait(["@createModel", "@getModels", "@updateWebView"], TIMEOUT)
    .spread((createModel, getModels, updateWebView) => {
      return cy.wrap({
        createModel: createModel?.response?.body?.data,
        getModels: getModels?.response?.body?.data,
        webView: updateWebView?.response?.body?.data,
      });
    });
}

function validateTemplateCode(ZUID = "", code = "") {
  cy.apiRequest({
    method: "GET",
    url: `${API_ENDPOINTS.devInstance}/web/views/${ZUID}`,
  }).then((response) => {
    const viewCode = response?.data?.code;
    expect(viewCode).to.equal(code);
  });
}

function createStarterBlock(name) {
  cy.getElement('[data-cy="starter-block-card"]')
    .contains(name, { matchCase: false })
    .click(TIMEOUT);

  cy.getElement('[data-cy="select-block-type-next-button"]').click();
}

function openStarterBlocksDialogue() {
  cy.visit("/blocks", {
    onBeforeLoad(win) {
      win.localStorage.setItem("zesty:blocks:onboarding", "false");
    },
  });
  cy.getElement('[data-cy="create_new_content_item"]').click(TIMEOUT);
}

function deleteStarterBlocksTestData() {
  cy.apiRequest({
    url: `${API_ENDPOINTS.devInstance}/content/models`,
  }).then(({ status, data }) => {
    const forDeleteZuids = data
      ?.filter((item) => item?.label?.includes(testSufix))
      .map((del) => del?.ZUID);

    forDeleteZuids?.forEach((zuid) => {
      cy.deleteModel(zuid);
    });
  });
}

function createStarterBlocksTestData() {
  cy.createModel({
    label: TEST_DATA.existing.label,
    name: TEST_DATA.existing.name,
    description: TEST_DATA.existing.description,
    type: "block",
    listed: true,
  }).then(({ status, data }) => {
    TEST_DATA.existing.fields.forEach((field) => {
      cy.createField(data?.ZUID, { ...field });
    });
  });
}

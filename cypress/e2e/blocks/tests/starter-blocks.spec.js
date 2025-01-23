import {
  StarterBlockProps,
  STARTER_BLOCKS,
} from "../../../../src/apps/schema/src/app/components/configs";
import { API_ENDPOINTS } from "../../../support/api";
//"src/apps/schema/src/app/components/configs.ts"

const TIMEOUT = { timeout: 40_000 };
const testSufix = "------TEST";

const BLOCK_LABELS = [
  "Blank",
  "Side by Side Hero Image",
  "Hero Image Below",
  "Contact Us Form",
  "Feature Side By Side Image",
  "Single Testimonial",
];

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

const BUTTONS = {
  // SELECT MODEL TYPE DIALOG
  createModel: '[data-cy="create_new_content_item"]',
  blockModelType: '[data-cy="model-type-block"]',
  blockModelNext: '[data-cy="create-model-next-button"]',
  //SELECT BLOCK TYPE DIALOG
  blockTypeCard: '[data-cy="starter-block-card"]',
  blockTypeNext: '[data-cy="select-block-type-next-button"]',
  // STARTER BLOCK FORM
  starterBlockFormSubmit: '[data-cy="starter-block-form-submit"]',
};

const INPUTS = {
  //SELECT BLOCK TYPE DIALOG
  blockTypeSearch: '[data-cy="starter-blocks-search"] input',
  // STARTER BLOCK FORM
  starterBlockFormLabel: '[data-cy="starter-block-form-label"] input',
  starterBlockFormName: '[data-cy="starter-block-form-name"] input',
};

const CONTAINERS = {
  starterBlocks: '[data-cy="starter-blocks-container"]',
  starterBlockFields: '[data-cy="starter-block-form-fields-container"]',
  formLabelError: '[data-cy="starter-block-form-label-error"]',
  formNameError: '[data-cy="starter-block-form-name-error"]',
};

const POP_UPS = {
  formLoading: '[data-cy="starter-block-form-loading-backdrop"]',
  noResults: '[data-cy="no-results-page"]',
};
const DIALOGUES = {
  createModel: '[data-cy="create-model-dialog"]',
  selectBlockType: '[data-cy="starter-blocks-selection-dialog"]',
};

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
      //   cy.visit("/schema");
      openStarterBlocksDialogue();
      cy.getElement(CONTAINERS.starterBlocks)
        .should("be.visible")
        .children()
        .should("have.length", STARTER_BLOCKS.length);

      STARTER_BLOCKS.forEach((block) => {
        cy.contains(block.label).should("exist");
      });
    });
    it("should be able to search starter blocks", () => {
      const noResultsSearchTerm = "xxx___xxx___xxx";
      cy.getElement(INPUTS.blockTypeSearch).clear().type("hero");
      cy.getElement(CONTAINERS.starterBlocks)
        .children()
        .should("have.length", 2);

      cy.getElement(INPUTS.blockTypeSearch).clear().type(noResultsSearchTerm);
      cy.getElement(POP_UPS.noResults).should("exist");
    });
    it("Pressing search again should clear search and focus on the search input", () => {
      cy.getElement(POP_UPS.noResults)
        .find("button")
        .contains("Search Again", { matchCase: false })
        .click(TIMEOUT);

      cy.getElement(INPUTS.blockTypeSearch)
        .should("be.empty")
        .and("be.focused");
    });
  });

  describe("Starter Block Form", () => {
    beforeEach(() => {
      openStarterBlocksDialogue();
    });

    it("Display an error message when attempting to use a name that's already in use.", () => {
      cy.getElement(BUTTONS.blockTypeCard).first().click(TIMEOUT);
      cy.getElement(BUTTONS.blockTypeNext).click();

      cy.getElement(INPUTS.starterBlockFormLabel)
        .clear()
        .type(TEST_DATA.existing.label);
      cy.getElement(BUTTONS.starterBlockFormSubmit).click();
      cy.getElement(POP_UPS.formLoading).should("exist");

      cy.getElement(CONTAINERS.formLabelError).should(
        "have.text",
        ERRORS.label
      );
      cy.getElement(CONTAINERS.formNameError).should("have.text", ERRORS.name);
    });
  });

  describe("Create Stater Blocks", () => {
    beforeEach(() => {
      openStarterBlocksDialogue();
    });

    //BLANK STARTER BLOCK
    it(`[${STARTER_BLOCKS[0].label}]`, () => {
      const BLOCK = STARTER_BLOCKS[0];

      createStarterBlock(BLOCK?.label);
      const TEST_LABEL = `${BLOCK?.label}${testSufix}`;

      // CHECK THAT NO FIELDS ARE PRESENT
      cy.getElement(CONTAINERS.starterBlockFields).should("not.exist");

      cy.intercept("POST", "**/v1/content/models").as("createModel");
      cy.intercept("**/v1/content/models").as("getModels");
      // cy.intercept("**/v1/content/models/*/fields?showDeleted=true").as("getFields");

      cy.getElement(INPUTS.starterBlockFormLabel).clear().type(TEST_LABEL);

      cy.getElement(BUTTONS.starterBlockFormSubmit).click();

      cy.getElement(POP_UPS.formLoading).should("exist");

      cy.wait(["@createModel", "@getModels"], TIMEOUT);

      cy.getElement("h3")
        .contains(TEST_LABEL, { matchCase: false, ...TIMEOUT })
        .should("exist");

      // CHECK THAT NO FIELDS WERE CREATED
      cy.getElement("div > button + div + p + span").should("have.length", 0);
    });

    //Side by Side Hero Image
    it(`[${STARTER_BLOCKS[1].label}]`, () => {
      const BLOCK = STARTER_BLOCKS[1];

      createStarterBlock(BLOCK?.label);
      const TEST_LABEL = `${BLOCK?.label}${testSufix}`;

      //CHECK IF ALL FIELDS ARE PRESENT IN THE FORM
      BLOCK.fields.forEach((field) => {
        cy.getElement(`${CONTAINERS.starterBlockFields} > div`)
          .contains(field.label)
          .should("exist");
      });

      cy.intercept("POST", "**/v1/content/models").as("createModel");
      cy.intercept("**/v1/content/models").as("getModels");
      // cy.intercept("**/v1/content/models/*/fields?showDeleted=true").as("getFields");

      cy.getElement(INPUTS.starterBlockFormLabel).clear().type(TEST_LABEL);

      cy.getElement(BUTTONS.starterBlockFormSubmit).click();

      cy.getElement(POP_UPS.formLoading).should("exist");

      cy.wait(["@createModel", "@getModels"], TIMEOUT);

      //CHECK IF THE BLOCK NAME IS CORRECT
      cy.getElement("h3")
        .contains(TEST_LABEL, { matchCase: false, ...TIMEOUT })
        .should("exist");

      //CHECK IF ALL FIELDS ARE CREATED
      BLOCK.fields.forEach((field) => {
        cy.contains(field.label).should("exist");
      });
    });

    //Hero Image Below
    it(`[${STARTER_BLOCKS[2].label}]`, () => {
      const BLOCK = STARTER_BLOCKS[2];

      createStarterBlock(BLOCK?.label);
      const TEST_LABEL = `${BLOCK?.label}${testSufix}`;

      //CHECK IF ALL FIELDS ARE PRESENT IN THE FORM
      BLOCK.fields.forEach((field) => {
        cy.getElement(`${CONTAINERS.starterBlockFields} > div`)
          .contains(field.label)
          .should("exist");
      });

      cy.intercept("POST", "**/v1/content/models").as("createModel");
      cy.intercept("**/v1/content/models").as("getModels");
      // cy.intercept("**/v1/content/models/*/fields?showDeleted=true").as("getFields");

      cy.getElement(INPUTS.starterBlockFormLabel).clear().type(TEST_LABEL);

      cy.getElement(BUTTONS.starterBlockFormSubmit).click();

      cy.getElement(POP_UPS.formLoading).should("exist");

      cy.wait(["@createModel", "@getModels"], TIMEOUT);

      //CHECK IF THE BLOCK NAME IS CORRECT
      cy.getElement("h3")
        .contains(TEST_LABEL, { matchCase: false, ...TIMEOUT })
        .should("exist");

      //CHECK IF ALL FIELDS ARE CREATED
      BLOCK.fields.forEach((field) => {
        cy.contains(field.label).should("exist");
      });
    });

    //Contact Us Form
    it(`[${STARTER_BLOCKS[3].label}]`, () => {
      const BLOCK = STARTER_BLOCKS[3];

      createStarterBlock(BLOCK?.label);
      const TEST_LABEL = `${BLOCK?.label}${testSufix}`;

      //CHECK IF ALL FIELDS ARE PRESENT IN THE FORM
      BLOCK.fields.forEach((field) => {
        cy.getElement(`${CONTAINERS.starterBlockFields} > div`)
          .contains(field.label)
          .should("exist");
      });

      cy.intercept("POST", "**/v1/content/models").as("createModel");
      cy.intercept("**/v1/content/models").as("getModels");
      // cy.intercept("**/v1/content/models/*/fields?showDeleted=true").as("getFields");

      cy.getElement(INPUTS.starterBlockFormLabel).clear().type(TEST_LABEL);

      cy.getElement(BUTTONS.starterBlockFormSubmit).click();

      cy.getElement(POP_UPS.formLoading).should("exist");

      cy.wait(["@createModel", "@getModels"], TIMEOUT);

      //CHECK IF THE BLOCK NAME IS CORRECT
      cy.getElement("h3")
        .contains(TEST_LABEL, { matchCase: false, ...TIMEOUT })
        .should("exist");

      //CHECK IF ALL FIELDS ARE CREATED
      BLOCK.fields.forEach((field) => {
        cy.contains(field.label).should("exist");
      });
    });

    //Feature Side By Side Image
    it(`[${STARTER_BLOCKS[4].label}]`, () => {
      const BLOCK = STARTER_BLOCKS[4];

      createStarterBlock(BLOCK?.label);
      const TEST_LABEL = `${BLOCK?.label}${testSufix}`;

      //CHECK IF ALL FIELDS ARE PRESENT IN THE FORM
      BLOCK.fields.forEach((field) => {
        cy.getElement(`${CONTAINERS.starterBlockFields} > div`)
          .contains(field.label)
          .should("exist");
      });

      cy.intercept("POST", "**/v1/content/models").as("createModel");
      cy.intercept("**/v1/content/models").as("getModels");
      // cy.intercept("**/v1/content/models/*/fields?showDeleted=true").as("getFields");

      cy.getElement(INPUTS.starterBlockFormLabel).clear().type(TEST_LABEL);

      cy.getElement(BUTTONS.starterBlockFormSubmit).click();

      cy.getElement(POP_UPS.formLoading).should("exist");

      cy.wait(["@createModel", "@getModels"], TIMEOUT);

      //CHECK IF THE BLOCK NAME IS CORRECT
      cy.getElement("h3")
        .contains(TEST_LABEL, { matchCase: false, ...TIMEOUT })
        .should("exist");

      //CHECK IF ALL FIELDS ARE CREATED
      BLOCK.fields.forEach((field) => {
        cy.contains(field.label).should("exist");
      });
    });

    //Single Testimonial
    it(`[${STARTER_BLOCKS[5].label}]`, () => {
      const BLOCK = STARTER_BLOCKS[5];

      createStarterBlock(BLOCK?.label);
      const TEST_LABEL = `${BLOCK?.label}${testSufix}`;

      //CHECK IF ALL FIELDS ARE PRESENT IN THE FORM
      BLOCK.fields.forEach((field) => {
        cy.getElement(`${CONTAINERS.starterBlockFields} > div`)
          .contains(field.label)
          .should("exist");
      });

      cy.intercept("POST", "**/v1/content/models").as("createModel");
      cy.intercept("**/v1/content/models").as("getModels");
      // cy.intercept("**/v1/content/models/*/fields?showDeleted=true").as("getFields");

      cy.getElement(INPUTS.starterBlockFormLabel).clear().type(TEST_LABEL);

      cy.getElement(BUTTONS.starterBlockFormSubmit).click();

      cy.getElement(POP_UPS.formLoading).should("exist");

      cy.wait(["@createModel", "@getModels"], TIMEOUT);

      //CHECK IF THE BLOCK NAME IS CORRECT
      cy.getElement("h3")
        .contains(TEST_LABEL, { matchCase: false, ...TIMEOUT })
        .should("exist");

      //CHECK IF ALL FIELDS ARE CREATED
      BLOCK.fields.forEach((field) => {
        cy.contains(field.label).should("exist");
      });
    });
  });
});

Cypress.Commands.add("getElement", (selector) => {
  return cy.get(selector, TIMEOUT);
});

function createStarterBlock(name) {
  cy.getElement(BUTTONS.blockTypeCard)
    .contains(name, { matchCase: false })
    .click(TIMEOUT);

  cy.getElement(BUTTONS.blockTypeNext).click();
}

function openStarterBlocksDialogue() {
  cy.location("pathname").then((pathName) => {
    if (pathName !== "/schema" || !!Cypress.$(DIALOGUES.createModel).length) {
      cy.visit("/schema");
    }
  });
  cy.getElement(BUTTONS.createModel).click(TIMEOUT);
  cy.getElement(BUTTONS.blockModelType).click();
  cy.getElement(BUTTONS.blockModelNext).click();
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
    console.debug("createStarterBlocksTestData | status,data: ", {
      status,
      data,
    });

    TEST_DATA.existing.fields.forEach((field) => {
      cy.createField(data?.ZUID, { ...field });
    });
  });
}

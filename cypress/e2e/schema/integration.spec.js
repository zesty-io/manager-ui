import { API_ENDPOINTS } from "../../support/api";

const TEST_DATA = {};

const MODEL_SCHEMA = {
  label: "__INTEGRATION-TEST",
  name: "__integration_test",
  type: "templateset",
  description: "",
  parentZUID: null,
  listed: true,
};

const ADD_FIELD_DATA = {
  label: "__integration test field",
  name: "__integration_test_field",
  type: "integration",
  endpoint:
    "https://8xbq19z1-dev.preview.stage.zesty.io/api/__Integration_Field_Test_API.json",
};

describe("Integration Field", () => {
  before(() => {
    deleteTestData();
    createTestData();
  });

  after(() => {
    deleteTestData();
  });

  it("Add Field", () => {
    const modelZUID = Cypress.env("modelZUID");
    cy.visit(`/schema/${modelZUID}/fields`);

    cy.getElement('[data-cy="AddFieldBtn"]').click();

    cy.getElement('[data-cy="FieldItem_integration"]').click();

    cy.getElement('[data-cy="FieldFormInput_label"] input')
      .clear()
      .type(ADD_FIELD_DATA.label);
    cy.getElement('[data-cy="FieldFormInput_name"] input')
      .clear()
      .type(ADD_FIELD_DATA.name);
    cy.getElement('label:contains("Required field")').click();

    //CONNECT TO API

    cy.getElement('[data-cy="integrationConfigureButton"]').click();

    cy.getElement('[data-cy="integrationFormDialog"]').should("exist");
    cy.getElement('[data-cy="integrationEndpointInput"] input')
      .clear()
      .type(ADD_FIELD_DATA.endpoint);

    cy.getElement('[data-cy="integrationConnectButton"]').click();

    cy.getElement('[data-cy="integrationConnectionStatusContainer"]').should(
      "exist"
    );

    cy.getElement('[data-cy="integrationConnectionStatusLabel"]').should(
      "contain",
      "Connection Successful",
      { matchCase: false }
    );
    cy.getElement('[data-cy="integrationConnectionStatusButton"]').click();
  });
  describe("Generics Display Types", () => {
    it("Display Type - TEXT", () => {
      cy.getElement('[data-cy="integrationDisplayOption-text"]').click();

      cy.getElement('[data-cy="integrationConfigureOptionNextButton"]').click();

      cy.getElement('[data-cy="integrationConfigureOptionKeyPathContainer"]')
        .children()
        .should("have.length", 2);

      cy.getElement(
        '[data-cy="integrationConfigureOptionKeyPathContainer"] .fieldWrapper:eq(0) p'
      ).should("contain.text", "Heading", { matchCase: false });

      cy.getElement(
        '[data-cy="integrationConfigureOptionKeyPathContainer"] .fieldWrapper:eq(1) p'
      ).should("contain.text", "Sub Heading", { matchCase: false });

      cy.getElement(
        '[data-cy="integrationConfigureDisplayOptionsBackButton"]'
      ).click();
    });

    it("Display Type - IMAGE", () => {
      cy.getElement('[data-cy="integrationDisplayOption-image"]').click();

      cy.getElement('[data-cy="integrationConfigureOptionNextButton"]').click();

      cy.getElement('[data-cy="integrationConfigureOptionKeyPathContainer"]')
        .children()
        .should("have.length", 3);

      cy.getElement(
        '[data-cy="integrationConfigureOptionKeyPathContainer"] .fieldWrapper:eq(0) p'
      ).should("contain.text", "Heading", { matchCase: false });

      cy.getElement(
        '[data-cy="integrationConfigureOptionKeyPathContainer"] .fieldWrapper:eq(1) p'
      ).should("contain.text", "Sub Heading", { matchCase: false });

      cy.getElement(
        '[data-cy="integrationConfigureOptionKeyPathContainer"] .fieldWrapper:eq(2) p'
      ).should("contain.text", "Thumbnail", { matchCase: false });
      cy.getElement(
        '[data-cy="integrationConfigureDisplayOptionsBackButton"]'
      ).click();
    });

    it("Display Type - VIDEO", () => {
      cy.getElement('[data-cy="integrationDisplayOption-video"]').click();

      cy.getElement('[data-cy="integrationConfigureOptionNextButton"]').click();

      cy.getElement('[data-cy="integrationConfigureOptionKeyPathContainer"]')
        .children()
        .should("have.length", 3);

      cy.getElement(
        '[data-cy="integrationConfigureOptionKeyPathContainer"] .fieldWrapper:eq(0) p'
      ).should("contain.text", "Heading", { matchCase: false });

      cy.getElement(
        '[data-cy="integrationConfigureOptionKeyPathContainer"] .fieldWrapper:eq(1) p'
      ).should("contain.text", "Sub Heading", { matchCase: false });

      cy.getElement(
        '[data-cy="integrationConfigureOptionKeyPathContainer"] .fieldWrapper:eq(2) p'
      ).should("contain.text", "Thumbnail", { matchCase: false });

      cy.getElement(
        '[data-cy="integrationConfigureDisplayOptionsBackButton"]'
      ).click();
    });

    it("Display Type - SIMPLE", () => {
      cy.getElement('[data-cy="integrationDisplayOption-simple"]').click();

      cy.getElement('[data-cy="integrationConfigureOptionNextButton"]').click();

      cy.getElement('[data-cy="integrationConfigureOptionKeyPathContainer"]')
        .children()
        .should("have.length", 1);

      cy.getElement(
        '[data-cy="integrationConfigureOptionKeyPathContainer"] .fieldWrapper:eq(0) p'
      ).should("contain.text", "Heading", { matchCase: false });

      cy.getElement(
        '[data-cy="integrationConfigureDisplayOptionsBackButton"]'
      ).click();
    });

    it("Display Type - DETAILS", () => {
      cy.getElement('[data-cy="integrationDisplayOption-details"]').click();

      cy.getElement('[data-cy="integrationConfigureOptionNextButton"]').click();

      cy.getElement('[data-cy="integrationConfigureOptionKeyPathContainer"]')
        .children()
        .should("have.length", 2);

      cy.getElement(
        '[data-cy="integrationConfigureOptionKeyPathContainer"] .fieldWrapper:eq(0) p'
      ).should("contain.text", "Heading", { matchCase: false });

      cy.getElement(
        '[data-cy="integrationConfigureOptionKeyPathContainer"] .fieldWrapper:eq(1) p'
      ).should("contain.text", "Details", { matchCase: false });

      cy.getElement(
        '[data-cy="integrationConfigureDisplayOptionsBackButton"]'
      ).click();
    });
  });
});

function createTestData() {
  cy.apiRequest({
    url: `${API_ENDPOINTS.devInstance}/content/models`,
    method: "POST",
    body: MODEL_SCHEMA,
  }).then(({ status, data }) => {
    console.debug("data", data);
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
    console.debug("forDeleteData", forDeleteData);

    forDeleteZuids?.forEach((zuid) => {
      cy.apiRequest({
        url: `${API_ENDPOINTS.devInstance}/content/models/${zuid}`,
        method: "DELETE",
      });
    });
  });
}

Cypress.Commands.add("getElement", (selector) => {
  return cy.get(selector, { timeout: 40_000 });
});

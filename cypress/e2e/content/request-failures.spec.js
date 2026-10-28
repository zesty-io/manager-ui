import { v4 as uuidv4 } from "uuid";

// Anchored to the seeded item so sibling endpoints (items/publishings,
// items/batch) are never stubbed
const itemUrl = () =>
  new RegExp(
    `/content/models/[^/]+/items/${Cypress.env("failItemZUID")}(\\?.*)?$`
  );

describe("Failed requests are surfaced", () => {
  before(() => {
    cy.login();
    cy.task("seed:content", "fixtures/item.json").then(({ model, items }) => {
      Cypress.env("failModelZUID", model?.ZUID);
      Cypress.env("failItemZUID", items[0]?.meta?.ZUID);
    });
  });

  after(() => {
    cy.deleteModel(Cypress.env("failModelZUID"));
  });

  beforeEach(() => {
    cy.login();
    cy.blockLock();
  });

  const makeDirty = () => {
    cy.getBySelector("field:text")
      .find("input")
      .first()
      .clear()
      .type(`Edited ${uuidv4()}`);
    cy.getBySelector("SaveItemButton").should("be.enabled");
  };

  const visitItem = () => {
    cy.visit(
      `/content/${Cypress.env("failModelZUID")}/${Cypress.env("failItemZUID")}`
    );
  };

  [403, 404, 409, 503].forEach((statusCode) => {
    it(`Item save shows one error toast on ${statusCode} and stays dirty`, () => {
      cy.intercept("PUT", itemUrl(), {
        statusCode,
        body: { error: "Injected failure" },
      }).as("saveItem");

      visitItem();
      makeDirty();
      cy.getBySelector("SaveItemButton").click();
      cy.wait("@saveItem");

      cy.getBySelector("toast").should("have.length", 1);
      cy.getBySelector("toast").contains("Injected failure");
      cy.getBySelector("toast").contains("Saved").should("not.exist");
      cy.getBySelector("SaveItemButton").should("exist");
    });
  });

  it("Item save shows an error on network failure and stays dirty", () => {
    cy.intercept("PUT", itemUrl(), { forceNetworkError: true }).as("saveItem");

    visitItem();
    makeDirty();
    cy.getBySelector("SaveItemButton").click();
    cy.wait("@saveItem");

    cy.getBySelector("toast").should("have.length", 1);
    cy.getBySelector("SaveItemButton").should("exist");
  });

  [400, 403, 404, 503].forEach((statusCode) => {
    it(`Item load shows the not-found screen and an error toast on ${statusCode}`, () => {
      cy.intercept("GET", itemUrl(), {
        statusCode,
        body: { error: "Injected failure" },
      }).as("loadItem");

      visitItem();
      cy.wait("@loadItem");
      cy.getBySelector("ItemNotFound").should("exist");
      cy.getBySelector("toast").should("have.length", 1);
    });
  });

  it("Item load shows the not-found screen and an error toast on network failure", () => {
    cy.intercept("GET", itemUrl(), { forceNetworkError: true }).as("loadItem");

    visitItem();
    cy.wait("@loadItem");
    cy.getBySelector("ItemNotFound").should("exist");
    cy.getBySelector("toast").should("have.length", 1);
  });

  it("Instance settings save shows a single error toast on failure", () => {
    cy.intercept("PUT", "**/env/settings/*", {
      statusCode: 403,
      body: { error: "Injected failure" },
    }).as("saveSetting");

    cy.visit("/settings");
    cy.getBySelector("SubApp").should("exist");
    cy.get("[data-cy^=SettingTextarea-]")
      .find("textarea")
      .first()
      .type(uuidv4());
    cy.getBySelector("SaveSettings").click();
    cy.getBySelector("ConfirmSaveSettings").click();
    cy.wait("@saveSetting");

    cy.getBySelector("toast").should("have.length", 1);
    cy.getBySelector("toast").contains("Settings Saved").should("not.exist");
  });
});

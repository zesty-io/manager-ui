const { checkPropTypes } = require("prop-types");

describe("Headtags", () => {
  before(() => {
    cy.login();
    cy.visit("/settings/head");
  });

  it("Add a new headtag", () => {
    cy.get("#NewHeadtag").click();

    cy.get('[type="text"]')
      .first()
      .clear()
      .type("link", { force: true });

    cy.get("#SaveItemButton").click();
  });

  it("Edit a headtag", () => {
    cy.get('[type="text"]')
      .first()
      .clear()
      .type("content", { force: true });

    cy.get("#SaveItemButton").click();
  });

  it("Remove a headtag", () => {
    cy.get("#DelteHeadtag").click();
  });
});

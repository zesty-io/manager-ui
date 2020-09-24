describe("Headtag: create a tag", () => {
  before(() => {
    cy.login();
    cy.visit("/settings/head");
  });

  it("Adds a new headtag", () => {
    cy.get("#NewHeadtag").click();

    cy.get("article")
      .first()
      .get('[type="text"]')
      .first()
      .clear({ force: true })
      .type("link", { force: true });

    cy.get("#SaveItemButton").click();
    cy.contains("New head tag created", { timeout: 5000 }).should("exist");
  });

  it("Edit a headtag", () => {
    cy.get("#NewHeadtag").click();
    cy.get("#SaveItemButton").click();
    cy.contains("New head tag created", { timeout: 5000 }).should("exist");

    cy.get("article")
      .first()
      .get('[type="text"]')
      .first()
      .clear({ force: true })
      .type("content", { force: true });

    cy.get("#SaveItemButton").click();
    cy.contains("Successfully updated head tag", { timeout: 5000 }).should(
      "exist"
    );
  });

  it("Remove a headtag", () => {
    cy.get("#NewHeadtag").click();
    cy.get("#SaveItemButton").click();
    cy.contains("New head tag created", { timeout: 5000 }).should("exist");

    cy.get("article")
      .first()
      .get("#DeleteHeadtag")
      .first()
      .click({ force: true });
    cy.contains("Head tag deleted", { timeout: 5000 }).should("exist");
  });
});

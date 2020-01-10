describe("Meta", () => {
  before(() => {
    //initial login to set the cookie
    cy.login();
    cy.goHome();
  });
  it("Opens item meta tab", () => {
    cy.get("#MainNavigation")
      .contains("All Field Types")
      .click({ force: true });
    cy.get("[data-cy=meta]").should("exist");
    cy.get("[data-cy=meta]").click();
  });
  it("Renders all fields", () => {
    cy.get("[data-cy=itemParent]").should("exist");
    cy.get("[data-cy=metaLinkText]").should("exist");
    cy.get("[data-cy=metaTitle]").should("exist");
    cy.get("[data-cy=metaDescription]").should("exist");
    cy.get("[data-cy=metaKeywords]").should("exist");
    cy.get("[data-cy=sitemapPriority]").should("exist");
    cy.get("[data-cy=canonicalTag]").should("exist");
  });
  it("Selects Parent", () => {
    cy.get("[data-cy=itemParent] >  div").click();
    cy.get('[data-value="7-d6d2ff8dfc-80dq81"]').click();
    // select another parent, but switch it back to root level
    cy.get("[data-cy=itemParent] >  div").click();
    cy.get("[data-cy=itemParent]")
      .find('[data-value="0"]')
      .first()
      .click();
    // cy.pause();
    cy.get("#SaveItemButton").should("not.be.disabled");
    cy.get("#SaveItemButton").click();
    cy.contains("Saved a new ", { timeout: 5000 }).should("exist");
  });
  it("Updates Link Text", () => {
    cy.get("[data-cy=metaLinkText]")
      .find("input")
      .click()
      .clear()
      .type("All Field Types");

    cy.get("#SaveItemButton").should("not.be.disabled");
    cy.get("#SaveItemButton").click();
    cy.contains("Saved a new ", { timeout: 5000 }).should("exist");
  });
  it("Updates Path Part", () => {
    cy.get("[data-cy=itemRoute]")
      .find("input")
      .click()
      .clear()
      .type("new path part");

    cy.get("#SaveItemButton").should("not.be.disabled");
    cy.get("#SaveItemButton").click();
    cy.contains("Saved a new ", { timeout: 5000 }).should("exist");
  });
  it("Updates Meta Description", () => {
    cy.get("[data-cy=metaDescription]")
      .find("textarea")
      .click()
      .clear()
      .type("new Meta Description");

    cy.get("#SaveItemButton").should("not.be.disabled");
    cy.get("#SaveItemButton").click();
    cy.contains("Saved a new ", { timeout: 5000 }).should("exist");
  });
  it("Updates Meta Keywords", () => {
    cy.get("[data-cy=metaKeywords]")
      .find("textarea")
      .click()
      .clear()
      .type("key, words, here");

    cy.get("#SaveItemButton").should("not.be.disabled");
    cy.get("#SaveItemButton").click();
    cy.contains("Saved a new ", { timeout: 5000 }).should("exist");
  });
  it("Selects Sitemap Priority", () => {
    cy.get("[data-cy=sitemapPriority] >  div").click();
    cy.get('[data-value="-1"]').click();
    // cy.pause();
    cy.get("#SaveItemButton").should("not.be.disabled");
    cy.get("#SaveItemButton").click();
    cy.contains("Saved a new ", { timeout: 5000 }).should("exist");
  });
  it("Selects Canonical Tag Mode", () => {
    cy.get("[data-cy=canonicalTag] >  div").click();
    cy.get('[data-value="1"]')
      .last()
      .click();
    cy.get("[data-cy=canonicalTag] >  div").click();
    cy.get('[data-value="0"]')
      .last()
      .click();
    // cy.pause();
    cy.get("#SaveItemButton").should("not.be.disabled");
    cy.get("#SaveItemButton").click();
    cy.contains("Saved a new ", { timeout: 5000 }).should("exist");
  });
});

describe("Meta", () => {
  before(() => {
    //initial login to set the cookie
    cy.login();
    cy.visit("//content/6-556370-8sh47g/7-b939a4-457q19");
  });
  it("Opens item meta tab", () => {
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
    cy.get('[data-value="7-b89cdca3c4-pwf5rw"]').click();
    // select another parent, but switch it back to root level
    cy.get("[data-cy=itemParent] >  div").click();
    cy.get("[data-cy=itemParent]")
      .find('[data-value="0"]')
      .first()
      .click();
    cy.get("#SaveItemButton").click();
    cy.contains("Saved a new ").should("exist");
  });
  it("Updates Navigation Link Text", () => {
    cy.get("[data-cy=metaLinkText]")
      .find("input")
      .click()
      .clear()
      .type("All Field Types");

    cy.get("#SaveItemButton").click();
    cy.contains("Saved a new ").should("exist");
  });
  it("Updates Path Part", () => {
    cy.get("[data-cy=itemRoute]")
      .find("input")
      .click()
      .clear()
      .type("new path part");

    cy.get("#SaveItemButton").click();
    cy.contains("Saved a new ").should("exist");
  });
  it("Updates Meta Title", () => {
    cy.get("[data-cy=metaTitle]")
      .find("input")
      .click()
      .clear()
      .type("new Meta Title");

    cy.get("#SaveItemButton").should("not.be.disabled");
    cy.get("#SaveItemButton").click();
    cy.contains("Saved a new ").should("exist");
  });
  it("Updates Meta Description", () => {
    cy.get("[data-cy=metaDescription]")
      .find("textarea")
      .click()
      .clear()
      .type("new Meta Description");

    cy.get("#SaveItemButton").click();
    cy.contains("Saved a new ").should("exist");
  });
  it("Updates Meta Keywords", () => {
    cy.get("[data-cy=metaKeywords]")
      .find("textarea")
      .click()
      .clear()
      .type("key, words, here");

    cy.get("#SaveItemButton").click();
    cy.contains("Saved a new ").should("exist");
  });
  it("Selects Sitemap Priority", () => {
    cy.get("[data-cy=sitemapPriority] >  div").click();
    cy.get('[data-value="-1"]').click();
    cy.get("#SaveItemButton").click();
    cy.contains("Saved a new ").should("exist");
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
    cy.get("#SaveItemButton").click();
    cy.contains("Saved a new ").should("exist");
  });
});

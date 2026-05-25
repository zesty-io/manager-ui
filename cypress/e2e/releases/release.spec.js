describe("Release", () => {
  it("create release", () => {
    cy.visit("/release/create");
    // Releases may load from IndexedDB cache — wait for UI instead of network
    cy.get("[data-cy=release-name]").should("exist");

    const timestamp = Date.now();
    const title = `Title - ${timestamp}`;
    const desc = `Description - ${timestamp}`;

    cy.get("[data-cy=release-name]").type(title);
    cy.get("[data-cy=release-desc]").type(desc);

    cy.intercept("POST", "/v1/releases").as("createRelease");
    cy.get("[data-cy=release-createBtn]").click();
    cy.wait("@createRelease");

    cy.contains(`Created Release: ${title}`).should("exist");

    // URL should have redirected to release ZUID
    cy.url().should("include", "/release/27-");
  });

  // it("update release")

  // it("delete release")

  it("publish release", () => {});
});

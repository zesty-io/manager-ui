// TODO improve selectors
describe("Content media selection modal", () => {
  before(() => {
    cy.waitOn("*groups*", () => {
      cy.visit("/content/6-556370-8sh47g/new");
    });
  });
  it("Can select media items", () => {
    cy.wait(5_000);
    cy.get(".FieldTypeImageContent--EDuUS button", { timeout: 10000 })
      .last()
      .click({ force: true });
    cy.waitOn("/bin/1-6c9618c-r26pt/files", () => {
      // Test that modal popped up
      cy.get("h4").contains("Insert from Media");
      cy.get("[data-testid='media-thumbnail-content']")
        .first()
        .parent()
        .get("input[type=checkbox]")
        .first()
        .click({ force: true });
      cy.get("h4").contains("1 Selected");
    });
  });
});

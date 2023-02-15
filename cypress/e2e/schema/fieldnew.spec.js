/**
 * - Open Add Field Modal via button
 * - Open Add Field Modal via end of list button
 * - Open Add Field Modal via in between field
 * - Switch tabs in Add Field Modal
 * - Create fields
 * - Show error messages
 * - Create end of list field
 * - Create in-between field
 * - Update a field
 * - Deactivate a field
 * - Reactivate a field via dropdown menu
 * - Reactivate a field via Edit field modal
 * - Show hide system fields
 */
describe("Schema Fields", () => {
  const timestamp = Date.now();

  before(() => {
    cy.waitOn(
      "/v1/content/models/6-ce80dbfe90-ptjpm6/fields?showDeleted=true",
      () => {
        cy.visit("/schema/6-ce80dbfe90-ptjpm6/fields");
      }
    );
  });

  it("Open Add Field Modal via Button", () => {});

  it("Open Add Field Modal via end of list button", () => {});

  it("Open Add Field Modal via in between field", () => {});
});

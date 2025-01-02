class SettingsPage {
  createWorkflowLabel({ name, allowPublish = false }) {
    cy.visit("/settings/user/workflows");

    cy.get("button").contains("Create Status").click();
    cy.get('input[name="name"]').type(name);
    cy.get('textarea[name="description"]').type(`${name} Description`);
    cy.get('input[name="color"]').parent().find("button").click();
    cy.get('ul li[role="option"]').contains("Yellow").click();
    cy.get('input[name="addPermissionRoles"]').parent().find("button").click();
    cy.get('ul li[role="option"]').contains("Admin").click();
    cy.get('ul li[role="option"]').contains("Developer").click();
    cy.get('form[role="dialog"]').click();
    cy.get('input[name="removePermissionRoles"]')
      .parent()
      .find("button")
      .click();
    cy.get('ul li[role="option"]').contains("Admin").click();
    cy.get('ul li[role="option"]').contains("Developer").click();
    cy.get('form[role="dialog"]').click();
    if (allowPublish) {
      cy.get('input[name="allowPublish"]').click();
    }
    cy.get('[data-cy="create-status-label-submit-button"]').click();
  }

  deactivateWorkflowLabel(name) {
    cy.intercept("DELETE", "**/labels/*").as("deleteLabel");

    cy.visit("/settings/user/workflows");

    cy.contains(name)
      .closest('[data-cy="status-label"]:visible')
      .find("button")
      .click();
    cy.get('ul li[role="menuitem"]').contains("Deactivate Status").click();
    cy.get("button").contains("Deactivate Status").click();

    cy.wait("@deleteLabel");
  }
}

export default new SettingsPage();

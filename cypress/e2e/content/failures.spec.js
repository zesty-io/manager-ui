describe("Actions in content editor", () => {
  before(() => {
    //initial login to set the cookie
    cy.login();
  });

  // TODO: render error message for missing required field
  it.skip("Fails to save without filling all required fields", () => {
    cy.visit("/content/6-2543d4-dx4l70/7-255694-4gmw9w");

    cy.contains("Page Title").get("input[name='title']").clear();
    cy.get("#SaveItemButton").click();
    cy.contains("You are missing data in required textarea").should("exist");
  });
});

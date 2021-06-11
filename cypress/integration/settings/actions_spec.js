describe("Settings Actions", () => {
  before(() => {
    cy.login();
  });

  it("Edits settings input", () => {
    cy.visit("/settings/styles/1");
    cy.get("input")
      .first()
      .type("1180px", { force: true });
    cy.get("#SaveSettings").should("not.be.disabled");
    cy.get("#SaveSettings").click();
    cy.contains("Data has been updated", { timeout: 5000 }).should("exist");
  });

  it("Edits typography", () => {
    cy.visit("/settings/styles/2");
    cy.get("ul")
      .first()
      .get("li", { force: true });
    cy.get("#SaveSettings").should("not.be.disabled");
    cy.get("#SaveSettings").click();
    cy.contains("Data has been updated", { timeout: 5000 }).should("exist");
  });

  it("Edits link over decoration", () => {
    cy.visit("/settings/styles/3");
    cy.get("ul")
      .first()
      .get("li", { force: true });
    cy.get("#SaveSettings").should("not.be.disabled");
    cy.get("#SaveSettings").click();
    cy.contains("Data has been updated", { timeout: 5000 }).should("exist");
  });

  it("Edits navigation background", () => {
    cy.visit("/settings/styles/4");
    cy.get("input")
      .first()
      .type("#000", { force: true });
    cy.get("#SaveSettings").should("not.be.disabled");
    cy.get("#SaveSettings").click();
    cy.contains("Data has been updated", { timeout: 5000 }).should("exist");
  });

  it("Button font color", () => {
    cy.visit("/settings/styles/6");
    cy.get("input")
      .first()
      .type("#000", { force: true });
    cy.get("#SaveSettings").should("not.be.disabled");
    cy.get("#SaveSettings").click();
    cy.contains("Data has been updated", { timeout: 5000 }).should("exist");
  });

  it("Edits legend border color", () => {
    cy.visit("/settings/styles/7");
    cy.get("input")
      .first()
      .type("#000", { force: true });
    cy.get("#SaveSettings").should("not.be.disabled");
    cy.get("#SaveSettings").click();
    cy.contains("Data has been updated", { timeout: 5000 }).should("exist");
  });

  it("Edits grid gutter width", () => {
    cy.visit("/settings/styles/8");
    cy.get("input")
      .first()
      .type("10px", { force: true });
    cy.get("#SaveSettings").should("not.be.disabled");
    cy.get("#SaveSettings").click();
    cy.contains("Data has been updated", { timeout: 5000 }).should("exist");
  });

  it("Button font color", () => {
    cy.visit("/settings/styles/9");
    cy.get("input")
      .first()
      .type("300px", { force: true });
    cy.get("#SaveSettings").should("not.be.disabled");
    cy.get("#SaveSettings").click();
    cy.contains("Data has been updated", { timeout: 5000 }).should("exist");
  });

  it("Form input background", () => {
    cy.visit("/settings/styles/10");
    cy.get("input")
      .first()
      .type("#000", { force: true });
    cy.get("#SaveSettings").should("not.be.disabled");
    cy.get("#SaveSettings").click();
    cy.contains("Data has been updated", { timeout: 5000 }).should("exist");
  });

  it("Progress backgrouund", () => {
    cy.get("input")
      .first()
      .type("#000", { force: true });
    cy.get("#SaveSettings").should("not.be.disabled");
    cy.get("#SaveSettings").click();
    cy.contains("Data has been updated", { timeout: 5000 }).should("exist");
  });
});

describe("Code Editor: Create File", () => {
  before(() => {
    cy.login();
    cy.visit("/code");
  });

  it("Create File", () => {
    cy.get(".CreateFileBtn--2qcds").click();
    cy.get(".CreateFile--tzV8A")
      .get(".Select")
      .get(".selections")
      .get("li", { force: true });

    cy.get('input[type="text"]').type("mySnnipet");

    cy.get('button[kind="save"]').click();
  });
});

describe("Code Editor: Publish files", () => {
  before(() => {
    cy.login();
    cy.visit("/code");
  });

  it("Select file tu publish", () => {
    cy.get("#Navigation")
      .get("ul")
      .first()
      .get("article")
      .first()
      .get("ul")
      .first()
      .get("article")
      .first()
      .click();

    cy.get('button[kind="secondary"]')
      .get(".fa-cloud-upload-alt")
      .click();

    cy.contains("Published", { timeout: 5000 }).should("exist");
  });
});

describe("Code Editor: Sort resources", () => {
  before(() => {
    cy.login();
    cy.visit("/code");
  });

  it("Sort resources", () => {
    cy.get('button[kind="primary"]')
      .contains("Order")
      .click();

    cy.get('[data-index="0"]').trigger("mousedown", { which: 1, force: true });
    cy.get('[data-index="1"]')
      .trigger("mousemove", { which: 1, force: true })
      .trigger("mouseup", { force: true });

    cy.get('button[kind="save"]')
      .contains("Save Order")
      .click({ force: true });

    cy.contains("File sort order has been saved", { timeout: 5000 }).should(
      "exist"
    );
  });
});

describe("Code Editor: Diffing files", () => {
  before(() => {
    cy.login();
    cy.visit("/code");
  });

  it("Compare files", () => {
    cy.get("#Navigation")
      .get("ul")
      .first()
      .get("article")
      .first()
      .get("ul")
      .first()
      .get("article")
      .first()
      .get("ul")
      .first()
      .get("article")
      .first()
      .click();

    cy.get(".Link--2YRl2").click();
    cy.get(".original").should("exist");
    cy.get(".modified").should("exist");
  });
});

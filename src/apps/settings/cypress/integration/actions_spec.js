describe("Body colors & spacing", () => {
  before(() => {
    cy.login();
    cy.visit("/settings/styles/1");
  });

  it("Edits settings input", () => {
    cy.get("input")
      .first()
      .type("1180px", { force: true });
    cy.get("#SaveSettings").should("not.be.disabled");
    cy.get("#SaveSettings").click();
    cy.get("#zestyGrowler").should("have.class", "green-growl");
  });
});

describe("Typography", () => {
  before(() => {
    cy.login();
    cy.visit("/settings/styles/2");
  });

  it("Edits typography", () => {
    cy.get("ul")
      .first()
      .get("li", { force: true });
    cy.get("#SaveSettings").should("not.be.disabled");
    cy.get("#SaveSettings").click();
  });
});

describe("Responsive grid", () => {
  before(() => {
    cy.login();
    cy.visit("/settings/styles/8");
  });

  it("Edits grid gutter width", () => {
    cy.get("input")
      .first()
      .type("10px", { force: true });
    cy.get("#SaveSettings").should("not.be.disabled");
    cy.get("#SaveSettings").click();
  });
});

describe("Html elements", () => {
  before(() => {
    cy.login();
    cy.visit("/settings/styles/7");
  });

  it("Edits legend border color", () => {
    cy.get("input")
      .first()
      .type("#000", { force: true });
    cy.get("#SaveSettings").should("not.be.disabled");
    cy.get("#SaveSettings").click();
  });
});

describe("Links", () => {
  before(() => {
    cy.login();
    cy.visit("/settings/styles/3");
  });

  it("Edits link over decoration", () => {
    cy.get("ul")
      .first()
      .get("li", { force: true });
    cy.get("#SaveSettings").should("not.be.disabled");
    cy.get("#SaveSettings").click();
  });
});

describe("Navigation", () => {
  before(() => {
    cy.login();
    cy.visit("/settings/styles/4");
  });

  it("Edits navigation background", () => {
    cy.get("input")
      .first()
      .type("#000", { force: true });
    cy.get("#SaveSettings").should("not.be.disabled");
    cy.get("#SaveSettings").click();
  });
});

describe("Navigation", () => {
  before(() => {
    cy.login();
    cy.visit("/settings/styles/4");
  });

  it("Edits navigation background", () => {
    cy.get("input")
      .first()
      .type("#000", { force: true });
    cy.get("#SaveSettings").should("not.be.disabled");
    cy.get("#SaveSettings").click();
  });
});

describe("Buttons", () => {
  before(() => {
    cy.login();
    cy.visit("/settings/styles/6");
  });

  it("Button font color", () => {
    cy.get("input")
      .first()
      .type("#000", { force: true });
    cy.get("#SaveSettings").should("not.be.disabled");
    cy.get("#SaveSettings").click();
  });
});

describe("Buttons", () => {
  before(() => {
    cy.login();
    cy.visit("/settings/styles/6");
  });

  it("Button font color", () => {
    cy.get("input")
      .first()
      .type("#000", { force: true });
    cy.get("#SaveSettings").should("not.be.disabled");
    cy.get("#SaveSettings").click();
  });
});

describe("Interactive elements", () => {
  before(() => {
    cy.login();
    cy.visit("/settings/styles/9");
  });

  it("Button font color", () => {
    cy.get("input")
      .first()
      .type("300px", { force: true });
    cy.get("#SaveSettings").should("not.be.disabled");
    cy.get("#SaveSettings").click();
  });
});

describe("Forms", () => {
  before(() => {
    cy.login();
    cy.visit("/settings/styles/10");
  });

  it("Form input background", () => {
    cy.get("input")
      .first()
      .type("#000", { force: true });
    cy.get("#SaveSettings").should("not.be.disabled");
    cy.get("#SaveSettings").click();
  });
});

describe("UI Styling", () => {
  before(() => {
    cy.login();
    cy.visit("/settings/styles/10");
  });

  it("Progress backgrouund", () => {
    cy.get("input")
      .first()
      .type("#000", { force: true });
    cy.get("#SaveSettings").should("not.be.disabled");
    cy.get("#SaveSettings").click();
  });
});

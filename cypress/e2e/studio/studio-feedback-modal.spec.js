describe("Studio Feedback Modal", () => {
  let studioPath = "/";

  before(() => {
    cy.task("seed:content", "fixtures/studio.json").then(({ items }) => {
      studioPath = `/${items[0].web.pathPart}`;
    });
  });

  const openFeedbackModal = () => {
    cy.getBySelector("StudioFeedbackButton").click();
    cy.getBySelector("StudioFeedbackModal").should("exist");
  };

  beforeEach(() => {
    cy.waitOn("/v1/content/models**", () => {
      cy.visit(`/studio?path=${studioPath}`);
    });
  });

  it("opens the feedback modal with the expected copy", () => {
    cy.getBySelector("StudioFeedbackButton").should("contain.text", "Feedback");
    openFeedbackModal();

    cy.getBySelector("StudioFeedbackModal").should(
      "contain.text",
      "Share Feedback"
    );
    cy.getBySelector("StudioFeedbackModal").should(
      "contain.text",
      "Please tell us about your experience so we can improve."
    );
    cy.getBySelector("StudioFeedbackModal").should(
      "contain.text",
      "How was your experience with studio-mode"
    );
    cy.getBySelector("StudioFeedbackMessageInput")
      .find("textarea")
      .first()
      .should(
        "have.attr",
        "placeholder",
        "Please provide detailed feedback about your experience"
      );
    cy.getBySelector("StudioFeedbackCancelButton").should("exist");
    cy.getBySelector("StudioFeedbackSubmitButton").should("exist");
  });

  it("disables the submit button until text is entered", () => {
    openFeedbackModal();

    cy.getBySelector("StudioFeedbackSubmitButton").should("be.disabled");

    cy.getBySelector("StudioFeedbackMessageInput")
      .find("textarea")
      .first()
      .type("This is a feedback message");

    cy.getBySelector("StudioFeedbackSubmitButton").should("be.enabled");
  });

  it("closes without submitting and resets the textarea on cancel", () => {
    cy.intercept("POST", "**/sendEmail").as("sendEmail");

    openFeedbackModal();
    cy.getBySelector("StudioFeedbackMessageInput")
      .find("textarea")
      .first()
      .type("This message should never be sent");

    cy.getBySelector("StudioFeedbackCancelButton").click();
    cy.getBySelector("StudioFeedbackModal").should("not.exist");
    cy.get("@sendEmail.all").should("have.length", 0);

    openFeedbackModal();
    cy.getBySelector("StudioFeedbackMessageInput")
      .find("textarea")
      .first()
      .should("have.value", "");
  });

  it("submits the expected payload and closes on success", () => {
    cy.intercept("POST", "**/sendEmail", {
      statusCode: 200,
      body: {},
    }).as("sendEmail");

    openFeedbackModal();
    cy.getBySelector("StudioFeedbackMessageInput")
      .find("textarea")
      .first()
      .type("This is a feedback message");

    cy.getBySelector("StudioFeedbackSubmitButton").click();

    cy.window().then((win) => {
      cy.wait("@sendEmail").then(({ request }) => {
        expect(request.body.to).to.eq(win.CONFIG.SLACK_FEEDBACK_EMAIL);
        expect(request.body.subject).to.be.a("string").and.not.be.empty;
        expect(request.body.body).to.contain(
          `<b>Message:</b><br>This is a feedback message`
        );
        expect(request.body.body).to.contain(
          `<b>User:</b> ${request.body.from}`
        );
        expect(request.body.body).to.match(/<b>Instance:<\/b> .+\(.+\)/);
        expect(request.body.body).to.contain(`<b>Page:</b> ${studioPath}`);
        expect(request.body.body).to.contain("<b>Mode:</b> content");
        expect(request.body.body.split("<br>")).to.have.length(6);
      });
    });

    cy.getBySelector("StudioFeedbackModal").should("not.exist");
  });

  it("captures the active interaction mode at time of submission", () => {
    cy.intercept("POST", "**/sendEmail", {
      statusCode: 200,
      body: {},
    }).as("sendEmail");

    cy.getBySelector("StudioModeToggle").find('input[type="checkbox"]').check();
    openFeedbackModal();
    cy.getBySelector("StudioFeedbackMessageInput")
      .find("textarea")
      .first()
      .type("Feedback while in layout mode");

    cy.getBySelector("StudioFeedbackSubmitButton").click();

    cy.wait("@sendEmail").then(({ request }) => {
      expect(request.body.body).to.contain("<b>Mode:</b> layout");
    });
  });

  it("escapes HTML in the feedback message before sending", () => {
    cy.intercept("POST", "**/sendEmail", {
      statusCode: 200,
      body: {},
    }).as("sendEmail");

    openFeedbackModal();
    cy.getBySelector("StudioFeedbackMessageInput")
      .find("textarea")
      .first()
      .type('<img src=x onerror="alert(1)">');

    cy.getBySelector("StudioFeedbackSubmitButton").click();

    cy.wait("@sendEmail").then(({ request }) => {
      expect(request.body.body).to.not.contain("<img");
      expect(request.body.body).to.contain("&lt;img");
    });
  });

  it("shows an inline error and re-enables the form when submission fails", () => {
    cy.intercept("POST", "**/sendEmail", {
      statusCode: 500,
      body: {},
    }).as("sendEmail");

    openFeedbackModal();
    cy.getBySelector("StudioFeedbackMessageInput")
      .find("textarea")
      .first()
      .type("This is a feedback message");

    cy.getBySelector("StudioFeedbackSubmitButton").click();

    cy.wait("@sendEmail");

    cy.getBySelector("StudioFeedbackModal").should("exist");
    cy.getBySelector("StudioFeedbackErrorMessage").should("exist");
    cy.getBySelector("StudioFeedbackMessageInput")
      .find("textarea")
      .first()
      .should("have.value", "This is a feedback message");
    cy.getBySelector("StudioFeedbackSubmitButton").should("be.enabled");
  });
});

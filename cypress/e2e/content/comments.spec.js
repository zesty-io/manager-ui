const forceClick = { force: true };

const commentBox = '#commentInputField[contenteditable="true"]';

describe("Content Item: Comments", () => {
  let FIELDS;

  before(() => {
    cy.task("seed:content", "fixtures/item.json").then(
      ({ model, fields, items }) => {
        Cypress.env("modelZUID", model?.ZUID);
        Cypress.env("itemZUID", items[0]?.meta?.ZUID);
        FIELDS = fields;
      }
    );
    cy.waitOn("**/v1/content/models**", () => {
      cy.visit(
        `/content/${Cypress.env("modelZUID")}/${Cypress.env(
          "itemZUID"
        )}/comment/${FIELDS[0]?.ZUID}`
      );
    });
  });

  beforeEach(() => {
    // Workaround for Cypress issue with IntersectionObserver
    // Cypress issue: https://github.com/cypress-io/cypress/issues/3848
    cy.viewport(1440, 900);
  });

  it("Creates an initial comment", () => {
    cy.intercept("**/v1/comments").as("getAllComments");
    cy.get(commentBox).should("exist");
    cy.get(commentBox).focus().type("{selectAll}{del}This is a new comment.");
    cy.getBySelector("SubmitNewComment")
      .should("exist")
      .should("be.enabled")
      .click();
    cy.wait("@getAllComments");
    cy.getBySelector("CommentItem").should("have.length", 1);
  });

  it("Replies to a comment", () => {
    cy.intercept("**/v1/comments/**").as("getReplies");
    cy.get(commentBox).type("Hello, this is a new reply!");
    cy.getBySelector("SubmitNewComment")
      .should("exist")
      .should("be.enabled")
      .click();

    cy.wait("@getReplies");
    cy.getBySelector("CommentItem").should("have.length", 2);
  });

  it("Updates an existing comment", () => {
    const UPDATED_TEXT = "I am updating this comment now.";

    // Register the intercept before the action that triggers it. If it is set
    // up after the click, the request can fire before the route exists and
    // cy.wait() flakes with "no request ever occurred".
    cy.intercept("**/v1/comments/**").as("getReplies");

    cy.getBySelector("CommentMenuButton").first().click(forceClick);
    cy.getBySelector("EditCommentButton").click();
    cy.get(commentBox).type(`{selectall}{backspace}${UPDATED_TEXT}`);
    cy.getBySelector("SubmitNewComment").click();
    cy.wait("@getReplies");
    cy.getBySelector("CommentItem").first().contains(UPDATED_TEXT);
  });

  it("Resolves a comment", () => {
    // Intercepts must be registered before the click that triggers the
    // requests, otherwise they can fire first and cy.wait() flakes with
    // "no request ever occurred".
    cy.intercept("**/v1/comments/**").as("getReplies");
    cy.intercept("**/v1/instances/*/comments**").as("getCommentResourceData");
    cy.getBySelector("ResolveCommentButton")
      .should("exist")
      .should("be.enabled")
      .click(forceClick);
    cy.wait(["@getReplies", "@getCommentResourceData"]);
    cy.getBySelector("ResolveCommentButton").should("not.exist");
  });

  it("Reopens a comment when there is a new reply", () => {
    // Register intercepts before submitting the reply so the resulting
    // requests are always captured (prevents a "no request ever occurred"
    // flake).
    cy.intercept("**/v1/comments/**").as("getReplies");
    cy.intercept("**/v1/instances/*/comments**").as("getCommentResourceData");
    cy.get(commentBox).type("Reopening ticket.");
    cy.getBySelector("SubmitNewComment")
      .should("exist")
      .should("be.enabled")
      .click();

    cy.wait(["@getReplies", "@getCommentResourceData"]);
    cy.getBySelector("ResolveCommentButton").should("exist");
  });

  it("Delete a comment", () => {
    cy.intercept("DELETE", "**/v1/comments/**").as("deleteComment");
    cy.intercept("**/v1/instances/*/comments**").as("getComments");

    cy.getBySelector("CommentItem").should("exist");

    const beforeDeleteCount = Cypress.$('[data-cy="CommentItem"]').length;

    cy.log("beforeDeleteCount: ", beforeDeleteCount);

    cy.getBySelector("CommentItem")
      .eq(0)
      .find('[data-cy="CommentMenuButton"]')
      .click(forceClick);

    cy.getBySelector("DeleteCommentButton").click();

    cy.getBySelector("ConfirmDeleteCommentButton").click();

    cy.wait(["@deleteComment", "@getComments"]).spread(
      (deleteComment, getComments) => {
        const afterDeleteCount = getComments?.response?.body?.data?.length;
        expect(afterDeleteCount).to.be.lessThan(beforeDeleteCount);
      }
    );
  });
});

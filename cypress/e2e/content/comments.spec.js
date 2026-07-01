const forceClick = { force: true };

const commentBox = '#commentInputField[contenteditable="true"]';

describe("Content Item: Comments", () => {
  let FIELDS;

  before(() => {
    cy.task("seed:content", "fixtures/item.json")
      .then(({ model, fields, items }) => {
        Cypress.env("modelZUID", model?.ZUID);
        Cypress.env("itemZUID", items[0]?.meta?.ZUID);
        FIELDS = fields;
      })
      .then(() => {
        cy.waitOn("**/v1/content/models**", () => {
          cy.visit(
            `/content/${Cypress.env("modelZUID")}/${Cypress.env(
              "itemZUID"
            )}/comment/${FIELDS[0]?.ZUID}`
          );
        });
      });
  });

  beforeEach(() => {
    // Workaround for Cypress issue with IntersectionObserver
    // Cypress issue: https://github.com/cypress-io/cypress/issues/3848
    cy.viewport(1440, 900);
  });

  it("Creates an initial comment", () => {
    cy.intercept("POST", "/v1/comments").as("createComment");
    cy.intercept("GET", "/v1/instances/*/comments*").as("getAllComments");

    cy.get(commentBox).should("exist");
    cy.get(commentBox).focus().type("{selectAll}{del}This is a new comment.");
    cy.getBySelector("SubmitNewComment")
      .should("exist")
      .should("be.enabled")
      .click();
    cy.wait(["@createComment", "@getAllComments"]);
    cy.getBySelector("CommentItem").should("have.length", 1);
  });

  it("Replies to a comment", () => {
    cy.intercept("POST", "/v1/comments/*/replies").as("createReply");
    cy.intercept("GET", "/v1/instances/*/comments*").as("getAllComments");
    cy.get(commentBox).type("Hello, this is a new reply!");
    cy.getBySelector("SubmitNewComment")
      .should("exist")
      .should("be.enabled")
      .click();

    cy.wait(["@createReply", "@getAllComments"]);
    cy.getBySelector("CommentItem").should("have.length", 2);
  });

  it("Updates an existing comment", () => {
    const UPDATED_TEXT = "I am updating this comment now.";
    cy.intercept("PUT", "/v1/comments/*").as("updateComment");
    cy.intercept("GET", "/v1/instances/*/comments*").as("getAllComments");

    cy.getBySelector("CommentMenuButton").first().click(forceClick);
    cy.getBySelector("EditCommentButton").click();
    cy.get(commentBox).type(`{selectall}{backspace}${UPDATED_TEXT}`);
    cy.getBySelector("SubmitNewComment").click();
    cy.wait(["@updateComment", "@getAllComments"]);
    cy.getBySelector("CommentItem").first().contains(UPDATED_TEXT);
  });

  it("Resolves a comment", () => {
    cy.intercept("PUT", "/v1/comments/*?action=resolve").as("resolveComment");
    cy.intercept("GET", "/v1/instances/*/comments*").as("getAllComments");
    cy.getBySelector("ResolveCommentButton")
      .should("exist")
      .should("be.enabled")
      .click(forceClick);
    cy.wait(["@resolveComment", "@getAllComments"]);
    cy.getBySelector("ResolveCommentButton").should("not.exist");
  });

  it("Reopens a comment when there is a new reply", () => {
    cy.intercept("POST", "/v1/comments/*/replies").as("createReply");
    cy.intercept("GET", "/v1/instances/*/comments*").as("getAllComments");
    cy.get(commentBox).type("Reopening ticket.");
    cy.getBySelector("SubmitNewComment")
      .should("exist")
      .should("be.enabled")
      .click();

    cy.wait(["@createReply", "@getAllComments"]);
    cy.getBySelector("ResolveCommentButton").should("exist");
  });

  it("Delete a comment", () => {
    cy.intercept("DELETE", "/v1/comments/*").as("deleteComment");
    cy.intercept("GET", "/v1/instances/*/comments*").as("getAllComments");

    cy.getBySelector("CommentItem").should("exist");

    const beforeDeleteCount = Cypress.$('[data-cy="CommentItem"]').length;

    cy.log("beforeDeleteCount: ", beforeDeleteCount);

    cy.getBySelector("CommentItem")
      .eq(0)
      .find('[data-cy="CommentMenuButton"]')
      .click(forceClick);

    cy.getBySelector("DeleteCommentButton").click();

    cy.getBySelector("ConfirmDeleteCommentButton").click();

    cy.wait(["@deleteComment", "@getAllComments"]).spread(
      (deleteComment, getComments) => {
        const afterDeleteCount = getComments?.response?.body?.data?.length;
        expect(afterDeleteCount).to.be.lessThan(beforeDeleteCount);
      }
    );
  });
});

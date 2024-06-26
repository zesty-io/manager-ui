describe("Content Item: Comments", () => {
  before(() => {
    cy.waitOn("/v1/content/models*", () => {
      cy.waitOn("/v1/comments*", () => {
        cy.visit("/content/6-556370-8sh47g/7-b939a4-457q19");
      });
    });
    cy.getBySelector("DuoModeToggle").click();
  });

  it("Creates an initial comment", () => {
    cy.getBySelector("OpenCommentsButton").first().click();
    cy.get("#commentInputField").click().type("This is a new comment.");
    cy.getBySelector("SubmitNewComment").click();
    cy.intercept("/v1/comments/*").as("getAllComments");
    cy.wait("@getAllComments");
    cy.getBySelector("CommentItem").should("have.length", 1);
  });

  it("Replies to a comment", () => {
    cy.get("#commentInputField").click().type("Hello, this is a new reply!");
    cy.getBySelector("SubmitNewComment").click();
    cy.intercept("/v1/comments/*?showReplies=true&showResolved=true").as(
      "getReplies"
    );
    cy.wait("@getReplies");
    cy.getBySelector("CommentItem").should("have.length", 2);
  });

  it("Updates an existing comment", () => {
    const UPDATED_TEXT = "I am updating this comment now.";

    cy.getBySelector("CommentMenuButton").first().click();
    cy.getBySelector("EditCommentButton").click();
    cy.get("#commentInputField")
      .click()
      .type(`{selectall}{backspace}${UPDATED_TEXT}`);
    cy.getBySelector("SubmitNewComment").click();
    cy.intercept("/v1/comments/*?showReplies=true&showResolved=true").as(
      "getReplies"
    );
    cy.wait("@getReplies");
    cy.getBySelector("CommentItem").first().contains(UPDATED_TEXT);
  });

  it("Resolves a comment", () => {
    cy.getBySelector("ResolveCommentButton").click();
    cy.intercept("/v1/comments/*?showReplies=true&showResolved=true").as(
      "getReplies"
    );
    cy.intercept("/v1/instances/*/comments?resource=*").as(
      "getCommentResourceData"
    );
    cy.wait("@getReplies");
    cy.wait("@getCommentResourceData");
    cy.getBySelector("ResolveCommentButton").should("not.exist");
  });

  it("Reopens a comment when there is a new reply", () => {
    cy.get("#commentInputField").click().type("Reopening ticket.");
    cy.getBySelector("SubmitNewComment").click();
    cy.intercept("/v1/comments/*?showReplies=true&showResolved=true").as(
      "getReplies"
    );
    cy.intercept("/v1/instances/*/comments?resource=*").as(
      "getCommentResourceData"
    );
    cy.wait("@getReplies");
    cy.wait("@getCommentResourceData");
    cy.getBySelector("ResolveCommentButton").should("exist");
  });

  it("Delete a comment", () => {
    cy.getBySelector("CommentMenuButton").first().click();
    cy.getBySelector("DeleteCommentButton").click();
    cy.getBySelector("ConfirmDeleteCommentButton").click();
    cy.intercept("/v1/instances/*/comments?resource=*").as(
      "getCommentResourceData"
    );
    cy.wait("@getCommentResourceData");
    cy.getBySelector("OpenCommentsButton").first().click();
    cy.getBySelector("CommentItem").should("not.exist");
  });
});

const options = { timeout: 15000 };
const forceClick = { force: true };

describe("Content Item: Comments", () => {
  before(() => {
    cleanComments();
    cy.waitOn("/v1/content/models*", () => {
      cy.waitOn("/v1/comments*", () => {
        cy.visit("/content/6-556370-8sh47g/7-b939a4-457q19");
      });
    });
    cy.getBySelector("DuoModeToggle", { timeout: 50000 }).click();
  });

  it("Creates an initial comment", () => {
    cy.getBySelector("OpenCommentsButton", options).first().click(forceClick);
    cy.get("#commentInputField", options).should("exist");
    cy.get("#commentInputField")
      .should("exist")
      .click()
      .type("This is a new comment.");
    cy.getBySelector("SubmitNewComment").click();
    cy.intercept("/v1/comments/*").as("getAllComments");
    cy.wait("@getAllComments");
    cy.getBySelector("CommentItem").should("have.length", 1);
  });

  it("Replies to a comment", () => {
    cy.get("#commentInputField", options)
      .click()
      .type("Hello, this is a new reply!");
    cy.getBySelector("SubmitNewComment").click();
    cy.intercept("/v1/comments/*?showReplies=true&showResolved=true").as(
      "getReplies"
    );
    cy.wait("@getReplies");
    cy.getBySelector("CommentItem", options).should("have.length", 2);
  });

  it("Updates an existing comment", () => {
    const UPDATED_TEXT = "I am updating this comment now.";

    cy.getBySelector("CommentMenuButton", options).first().click(forceClick);
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
    cy.visit(
      "/content/6-556370-8sh47g/7-b939a4-457q19/comment/12-6d41d0-n10vtc"
    );

    cy.intercept("DELETE", "/v1/comments/*").as("deleteComment");
    cy.intercept("/v1/instances/*/comments?resource=*").as("getComments");

    cy.get('[data-cy="CommentItem"]', { timeout: 40000 }).should("exist");

    const beforeDeleteCount = Cypress.$('[data-cy="CommentItem"]').length;

    cy.log("beforeDeleteCount: ", beforeDeleteCount);

    cy.get('[data-cy="CommentItem"]:eq(0) [data-cy="CommentMenuButton"]').click(
      forceClick
    );

    cy.get('[data-cy="DeleteCommentButton"]').click(forceClick);

    cy.get('[data-cy="ConfirmDeleteCommentButton"]', options).click({
      force: true,
    });

    cy.wait(["@deleteComment", "@getComments"]).spread(
      (deleteComment, getComments) => {
        const afterDeleteCount = getComments?.response?.body?.data?.length;
        expect(afterDeleteCount).to.be.lessThan(beforeDeleteCount);
      }
    );
  });
});

function cleanComments() {
  cy.apiRequest({
    url: `https://accounts.api.dev.zesty.io/v1/instances/8-f48cf3a682-7fthvk/comments?resource=7-b939a4-457q19&scope=12-6d41d0-n10vtc&showResolved=true`,
    method: "GET",
  }).then((response) => {
    const zuids = response?.data?.map((item) => item?.ZUID);
    zuids.forEach((zuid) => {
      cy.apiRequest({
        url: `https://accounts.api.dev.zesty.io/v1/comments/${zuid}`,
        method: "DELETE",
      });
    });
  });
}

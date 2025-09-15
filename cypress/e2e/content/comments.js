const options = { timeout: 15000 };
const forceClick = { force: true };

const commentBox = '#commentInputField[contenteditable="true"]';

describe("Content Item: Comments", function () {
  before(function () {
    const currentField = Cypress.env("FIELDS")?.[0];
    const fieldZUID = currentField?.ZUID;
    cy.wrap(fieldZUID).as("fieldZUID");

    cy.visit(
      `/content/${Cypress.env("modelZUID")}/${Cypress.env(
        "itemZUID"
      )}/comment/${fieldZUID}`
    );
  });

  it("Creates an initial comment", function () {
    cy.get(commentBox, { timeout: 50000 })
      .should("exist")
      .focus()
      .type("{leftArrow}This is a new comment.")
      .should("contain.text", "This is a new comment.");
    cy.get('[data-cy="SubmitNewComment"]', options).should("exist").click();

    cy.get('[data-cy="CommentItem"]', options).should("have.length", 1);
  });

  it("Replies to a comment", function () {
    cy.get(commentBox, options)
      .should("exist")
      .type("{leftArrow}Hello, this is a new reply!");
    cy.get('[data-cy="SubmitNewComment"]', options).should("exist").click();

    cy.get('[data-cy="CommentItem"]').should("have.length", 2);
  });

  it("Updates an existing comment", function () {
    const UPDATED_TEXT = "I am updating this comment now.";
    cy.getBySelector("CommentMenuButton", options).first().click(forceClick);
    cy.getBySelector("EditCommentButton").click();
    cy.get(commentBox).should("exist").type(`{leftArrow}${UPDATED_TEXT}`);
    cy.getBySelector("SubmitNewComment").should("exist").click();
    cy.getBySelector("CommentItem").first().contains(UPDATED_TEXT);
  });

  it("Resolves a comment", function () {
    cy.getBySelector("ResolveCommentButton").click(forceClick);
    cy.getBySelector("ResolveCommentButton").should("not.exist");
  });

  it("Reopens a comment when there is a new reply", function () {
    cy.get(commentBox, options).type("{leftArrow}Reopening ticket.");
    cy.getBySelector("SubmitNewComment").should("exist").click();
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

  it("Delete a comment", function () {
    cy.intercept("DELETE", "/v1/comments/*").as("deleteComment");
    cy.intercept("/v1/instances/*/comments?resource=*").as("getComments");

    cy.get('[data-cy="CommentItem"]', { timeout: 40000 }).should("exist");

    const beforeDeleteCount = Cypress.$('[data-cy="CommentItem"]').length;

    cy.log("beforeDeleteCount: ", beforeDeleteCount);

    cy.get('[data-cy="CommentItem"]:eq(0) [data-cy="CommentMenuButton"]').click(
      forceClick
    );

    cy.get('[data-cy="DeleteCommentButton"]').click();

    cy.get('[data-cy="ConfirmDeleteCommentButton"]', options).click();

    cy.wait(["@deleteComment", "@getComments"]).spread(
      (deleteComment, getComments) => {
        const afterDeleteCount = getComments?.response?.body?.data?.length;
        expect(afterDeleteCount).to.be.lessThan(beforeDeleteCount);
      }
    );
  });
});

function cleanComments(fieldZUID) {
  cy.apiRequest({
    url: `https://accounts.api.dev.zesty.io/v1/instances/8-f48cf3a682-7fthvk/comments?resource=7-b939a4-457q19&scope=${fieldZUID}&showResolved=true`,
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

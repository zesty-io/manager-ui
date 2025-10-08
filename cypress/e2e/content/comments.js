const options = { timeout: 15000 };
const forceClick = { force: true };

const commentBox = '#commentInputField[contenteditable="true"]';

describe("Content Item: Comments", () => {
  before(() => {
    cy.task("seed:content", {
      fixturePath: "content/default.json",
      overrides: {
        model: {
          label: "content/comment.spec",
        },
      },
    }).then(({ model, fields, items }) => {
      Cypress.env("modelZUID", model?.ZUID);
      Cypress.env("itemZUID", items?.[0]?.meta?.ZUID);

      cy.visit(
        `/content/${model?.ZUID}/${items?.[0]?.meta?.ZUID}/comment/${fields[0]?.ZUID}`
      );
    });
  });

  it("Creates an initial comment", () => {
    cy.get(commentBox, { timeout: 50000 }).should("exist");
    cy.get(commentBox).focus().type("{selectAll}{del}This is a new comment.");
    cy.get('[data-cy="SubmitNewComment"]').click();

    cy.get('[data-cy="CommentItem"]').should("have.length", 1);
  });

  it("Replies to a comment", () => {
    cy.intercept("/v1/comments/*?showReplies=true&showResolved=true").as(
      "getReplies"
    );
    cy.get(commentBox, options).type("Hello, this is a new reply!");
    cy.get('[data-cy="SubmitNewComment"]').click();

    cy.wait("@getReplies");
    cy.get('[data-cy="CommentItem"]').should("have.length", 2);
  });

  it("Updates an existing comment", () => {
    const UPDATED_TEXT = "I am updating this comment now.";

    cy.getBySelector("CommentMenuButton", options).first().click(forceClick);
    cy.getBySelector("EditCommentButton").click();
    cy.get(commentBox).type(`{selectall}{backspace}${UPDATED_TEXT}`);
    cy.getBySelector("SubmitNewComment").click();
    cy.intercept("/v1/comments/*?showReplies=true&showResolved=true").as(
      "getReplies"
    );
    cy.wait("@getReplies");
    cy.getBySelector("CommentItem").first().contains(UPDATED_TEXT);
  });

  it("Resolves a comment", () => {
    cy.getBySelector("ResolveCommentButton").click(forceClick);
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
    cy.get(commentBox, options).type("Reopening ticket.");
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

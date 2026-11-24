// The replace upload itself is stubbed (the real storage service can't be
// exercised over http), so this only covers the refetch behaviour.
const PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

describe("Media replace file", () => {
  beforeEach(() => {
    cy.login();
    cy.intercept("PUT", "**/replace/**", { statusCode: 200, body: {} }).as(
      "replace"
    );
  });

  const openReplaceModal = () => {
    cy.intercept("GET", "**/bin/*/files").as("binFiles");
    cy.visit("/media");
    cy.wait("@binFiles").then(({ response }) => {
      const file = response.body.data.find((f) =>
        /\.(png|jpe?g)$/i.test(f.url)
      );
      expect(file, "an image file to replace").to.exist;
      cy.intercept("GET", `**/file/${file.id}`).as("getFile");
      cy.visit(`/media?fileId=${file.id}`);
      cy.wait("@getFile");
      cy.wrap(file).as("file");
    });
    cy.getBySelector("replace-file-btn").click();
  };

  const replaceWith = (file) => {
    const ext = file.url.split(".").pop().toLowerCase();
    cy.getBySelector("replace-file-input").selectFile(
      {
        contents: Cypress.Buffer.from(PNG_BASE64, "base64"),
        fileName: `replacement.${ext}`,
        mimeType: ext === "png" ? "image/png" : "image/jpeg",
      },
      { force: true }
    );
  };

  it("refetches the file after the replace completes", () => {
    openReplaceModal();
    cy.get("@file").then((file) => {
      cy.intercept("GET", `**/file/${file.id}`).as("refetchFile");
      replaceWith(file);
      cy.wait("@replace");
      cy.wait("@refetchFile");
    });
  });

  it("still refetches when the modal is closed before the upload finishes", () => {
    cy.intercept("PUT", "**/replace/**", (req) => {
      req.reply({ statusCode: 200, body: {}, delay: 1500 });
    }).as("slowReplace");
    openReplaceModal();
    cy.get("@file").then((file) => {
      replaceWith(file);
      cy.getBySelector("replace-file-done-btn").click();
      // The file modal is gone so its own query has no subscriber; the
      // list behind it is what gets refetched
      cy.intercept("GET", "**/bin/*/files").as("refetchBinFiles");
      cy.wait("@slowReplace");
      cy.wait("@refetchBinFiles");
    });
  });
});

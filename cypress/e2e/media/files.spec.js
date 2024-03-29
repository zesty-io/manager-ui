const CIRCLE_SVG = `
  <svg viewBox="0 0 2 2" xmlns="http://www.w3.org/2000/svg">
    <circle cx="1" cy="1" r="1" />
  </svg>
`;

const getRandomFileName = () =>
  `cypress_upload_test_${Math.floor(Math.random() * 1_000_000)}.svg`;

let currentFileId = "";

// Skipping since upload non-signed url flow cannot be performed in http environment
describe.skip("Media Files", () => {
  before(() => {
    cy.waitOn("**/files", () => {
      cy.visit("/media");
    });
  });

  it("Uploads a file to All Media", () => {
    const fileName = getRandomFileName();
    cy.get("input[type=file]")
      .first()
      .selectFile(
        {
          contents: Cypress.Buffer.from(CIRCLE_SVG),
          fileName,
          mimeType: "image/svg+xml",
          lastModified: Date.now(),
        },
        {
          // force:true is valid because we use hidden file inputs to do uploads
          force: true,
        }
      );
    // Wait for upload to complete
    cy.intercept("POST", "/file*").as("upload");
    cy.wait("@upload", { timeout: 10_000 });
    // // Click "Done" button to close upload modal
    cy.get('button:enabled:contains("Done")').click();
  });

  it("Displays skeleton loading when fetching images", () => {
    cy.wait(2000);
    cy.get(".MuiBox-root").then(($body) => {
      if ($body.get(".Load--0FE27")) {
        cy.get(".Load--0FE27").should("exist");
      }
    });
  });

  it("Displays file preview", () => {
    cy.get(".ThumbnailContainer").first().click();
    cy.get(".MuiInputLabel-root")
      .contains("ZUID")
      .next()
      .within(() => {
        cy.get("input")
          .invoke("val")
          .then((sometext) => (currentFileId = sometext));
      });
    cy.get('[data-cy="file-preview"]');
  });

  it("Renames filename", () => {
    cy.get("[aria-label='Open settings menu']").click();
    cy.contains("Rename").click();

    // type inside "New File Name" textfield
    cy.contains("New File Name").next().clear().type("CYPRESS TEST NEW FILE");

    // update endpoint
    cy.waitOn(`**/file/${currentFileId}`, () => {
      // check if the textfield has the updated value
      cy.contains("Update").click();
    });
    cy.get(".MuiTypography-body1")
      .contains("CYPRESS TEST NEW FILE")
      .should("exist");
  });

  it("Updates title", () => {
    cy.get("[aria-label='Title TextField']")
      .clear()
      .type("CYPRESS TEST NEW TITLE");

    // trigger save button
    cy.get(".MuiBox-root").then(($body) => {
      if ($body.find("[aria-label='Save Title Button']").length) {
        cy.get("[aria-label='Save Title Button']").click();

        // NOTE: have to remove waitOn for now since it's causing an intermittent issue on this update
        // check if Title textfield has the updated value
        cy.get("[aria-label='Title TextField']").within(() => {
          cy.get(".MuiInputBase-input").should(
            "have.value",
            "CYPRESS TEST NEW TITLE"
          );
        });
      }
    });
  });

  it("Copies File URL", () => {
    let fileUrl = "";
    cy.contains("File URL")
      .next()
      .within(() => {
        cy.get("input")
          .invoke("val")
          .then((val) => (fileUrl = val));
      });

    cy.get('[data-cy="copy-file-url-btn"]').click();
    cy.assertClipboardValue(fileUrl);
  });

  it("Copies file ZUID", () => {
    cy.get('[data-cy="copy-zuid-btn"]').click();
    cy.assertClipboardValue(currentFileId);
  });

  it("Creates new folder for dragging files", () => {
    // visit all media first
    cy.visit("/media");
    cy.wait(3000);

    cy.get("[aria-label='Create New Folder']").click();

    cy.get(".MuiDialog-container").within(() => {
      cy.contains("Folder Name").next().type("CYPRESS TEST FILE DRAG FOLDER");
      cy.contains("Create").click();
    });

    cy.intercept("POST", "/groups");

    cy.get(".MuiTreeView-root")
      .contains("CYPRESS TEST FILE DRAG FOLDER")
      .should("exist");
  });

  it("Drag and drop files on sidebar folder", () => {
    const dataTransfer = new DataTransfer();
    cy.wait(2000);

    // drag the thumbnail
    cy.get(`[data-cy="${currentFileId}"]`)
      .should("be.visible")
      .trigger("dragstart", {
        dataTransfer,
      });

    // drop it to the new folder
    cy.get(".MuiTreeView-root")
      .contains("CYPRESS TEST FILE DRAG FOLDER")
      .trigger("drop", {
        dataTransfer,
      });

    // visit the folder and check if the thumbnail is there
    cy.get(".MuiTreeView-root")
      .contains("CYPRESS TEST FILE DRAG FOLDER")
      .click();

    cy.get(".MuiBox-root").within(() => {
      cy.get(`[data-cy="${currentFileId}"]`).should("exist");
    });
  });

  it("Deletes folder", () => {
    cy.get(".MuiTreeView-root")
      .contains("CYPRESS TEST FILE DRAG FOLDER")
      .click();

    cy.get("[aria-label='Open folder menu']").click();

    cy.contains("Delete").click();

    cy.get(".MuiButton-containedError").click();

    cy.intercept("DELETE", "/groups");

    cy.get(".MuiTreeView-root")
      .contains("CYPRESS TEST FILE DRAG FOLDER")
      .should("not.exist");
  });

  it("Deletes file", () => {
    // click trash and delete modal button
    cy.visit(`/media?fileId=${currentFileId}`);
    cy.get("[aria-label='Trash Button']").click();
    cy.get("[aria-label='Delete Button']").click();

    // call delete endpoint
    cy.intercept("DELETE", `/file/${currentFileId}`);
  });

  it("Shows 404 Page", () => {
    // test invalid fileId
    cy.visit(`/media?fileId=${currentFileId}12`);
    cy.get(".NotFoundState").within(() => {
      cy.get(".MuiTypography-h4").contains("File Not Found").should("exist");
    });
  });
});

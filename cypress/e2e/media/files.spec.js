const CIRCLE_SVG = `
  <svg viewBox="0 0 2 2" xmlns="http://www.w3.org/2000/svg">
    <circle cx="1" cy="1" r="1" />
  </svg>
`;

const getRandomFileName = () =>
  `cypress_upload_test_${Math.floor(Math.random() * 1_000_000)}.svg`;

let currentFileId = "";

describe("Media Files", () => {
  before(() => {
    cy.waitOn("*groups*", () => {
      cy.visit("/media");
    });
  });

  it("uploads a file to a All Media", () => {
    const fileName = getRandomFileName();
    cy.get("input[type=file]").selectFile(
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
    cy.intercept("POST", "https://media-storage.api.dev.zesty.io/upload/gcp/*");
    cy.wait(3000);
    // // Click "Done" button to close upload modal
    cy.get('button:enabled:contains("Done")').click();
  });

  it("Open file modal and get Zuid", () => {
    cy.get(".ThumbnailContainer").first().click();
    cy.get("[aria-label='Zuid TextField']").within(() => {
      cy.get("input")
        .invoke("val")
        .then((sometext) => (currentFileId = sometext));
    });
  });

  it("Displays file preview", () => {
    cy.intercept("GET", `/file/${currentFileId}`);
    cy.get(".img-box").within(() => {
      cy.get("img").should("have.attr", "src");
    });
  });

  it("Displays file preview", () => {
    cy.intercept("GET", `/file/${currentFileId}`);
    cy.get(".img-box").within(() => {
      cy.get("img").should("have.attr", "src");
    });
  });

  it("Renames filename", () => {
    cy.log("RENAME", currentFileId);
    cy.get("[aria-label='Open settings menu']").click();
    cy.contains("Rename").click();

    // type inside "New File Name" textfield
    cy.get(".MuiDialog-container").within(() => {
      cy.contains("New File Name").next().clear().type("CYPRESS TEST NEW FILE");
      cy.contains("Update").click();
    });

    // call update endpoint
    cy.intercept("PATCH", `/file/${currentFileId}`);

    // check if the textfield has the updated value
    cy.get(".MuiTypography-body1")
      .contains("CYPRESS TEST NEW FILE")
      .should("exist");
  });

  it("Updates title", () => {
    cy.get(".MuiDialog-container").within(() => {
      cy.get("[aria-label='Title TextField']")
        .clear()
        .type("CYPRESS TEST NEW TITLE");

      // trigger save button
      cy.get(".MuiBox-root").then(($body) => {
        if ($body.find("[aria-label='Save Title Button']").length) {
          cy.get("[aria-label='Save Title Button']").click();
        }
      });

      cy.intercept("PATCH", `/file/${currentFileId}`);

      cy.get("[aria-label='Title TextField']").within(() => {
        cy.get(".MuiInputBase-input").should(
          "have.value",
          "CYPRESS TEST NEW TITLE"
        );
      });
    });
  });

  it("Copies File URL", () => {
    let fileUrl = "";
    cy.get(".FileUrlField").within(() => {
      cy.get("input")
        .invoke("val")
        .then((val) => (fileUrl = val));
    });

    cy.get(".CopyFileUrlBtn").click();
    cy.assertClipboardValue(fileUrl);
  });

  it("Copies file ZUID", () => {
    cy.get(".CopyZuidBtn").click();
    cy.assertClipboardValue(currentFileId);
  });

  it("Drag and drop files on sidebar", () => {
    // visit all media first
    cy.visit("/media");
    cy.wait(3000);

    // drag the thumbnail
    cy.get(`.${currentFileId}`)
      .should("be.visible")
      .trigger("dragstart")
      .trigger("dragleave");

    // drop it to the folder
    cy.get(".MuiTreeView-root").within(() => {
      cy.get(".2-b599f72-aeswx")
        .should("be.visible")
        .trigger("dragenter")
        .trigger("dragover")
        .trigger("drop")
        .trigger("dragend");
    });

    // check the folder if the thumbnail is there
    cy.get(".2-b599f72-aeswx").click();
    cy.get(".MuiBox-root").within(() => {
      cy.get(`.${currentFileId}`).should("exist");
    });
  });

  it("Deletes file", () => {
    // click trash and delete modal button
    cy.visit(`/media?fileId=${currentFileId}`);
    cy.get("[aria-label='Trash Button']").click();
    cy.get("[aria-label='Delete Button']").click();

    // call delete endpoint
    cy.intercept("DELETE", `/file/${currentFileId}`).as("deleteRequest");
    // cy.wait("@deleteRequest", { timeout: 1000 });
  });

  it("Shows 404 Page", () => {
    cy.visit(`/media?fileId=${currentFileId}`);
    cy.get(".NotFoundState").within(() => {
      cy.get(".MuiTypography-h4").contains("File Not Found").should("exist");
    });
  });
});

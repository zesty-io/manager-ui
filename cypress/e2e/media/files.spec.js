import { v4 as uuidv4 } from "uuid";

const CIRCLE_SVG = `
  <svg viewBox="0 0 2 2" xmlns="http://www.w3.org/2000/svg">
    <circle cx="1" cy="1" r="1" />
  </svg>
`;

const MEDIA_MANAGER_URL = Cypress.env("MEDIA_MANAGER_URL");

const getUploadFixture = () => ({
  contents: Cypress.Buffer.from(CIRCLE_SVG),
  fileName: `cypress_upload_test_${uuidv4()}.svg`,
  mimeType: "image/svg+xml",
  lastModified: Date.now(),
});

// Uploads a fresh fixture to All Media and opens its file modal, aliasing
// the uploaded file's id and bin id for the calling test.
const uploadAndOpenFile = () => {
  // All Media lists every file on the instance through a virtualized grid;
  // sorting newest-first keeps our freshly uploaded file within the
  // initially rendered rows regardless of how many other files exist.
  cy.waitOn("**/bins", () => {
    cy.visit("/media?sort=dateadded");
  });

  cy.intercept("POST", "**/upload/**").as("upload");
  cy.get("input[type=file]")
    .first()
    .selectFile(getUploadFixture(), { force: true });

  return cy.wait("@upload", { timeout: 30_000 }).then(({ response }) => {
    expect(response.statusCode).to.eq(201);
    const file = response.body.data[0];

    cy.getBySelector("upload-modal-done-btn").click();
    cy.getBySelector(file.id).click();

    return file;
  });
};

describe("Media Files", () => {
  describe("file actions", () => {
    let fileId;
    let fileBinId;

    beforeEach(() => {
      uploadAndOpenFile().then((file) => {
        fileId = file.id;
        fileBinId = file.bin_id;
      });
    });

    afterEach(() => {
      cy.deleteMediaFile(fileId);
    });

    it("renames the file", () => {
      const newFilename = `cypress-renamed-${uuidv4()}`;

      cy.getBySelector("file-modal-settings-btn").click();
      cy.getBySelector("file-modal-rename-menu-item").click();

      cy.getBySelector("rename-file-field")
        .find("input")
        .clear()
        .type(newFilename);

      cy.waitOn(`**/file/${fileId}`, () => {
        cy.getBySelector("rename-file-update-btn").click();
      });

      cy.contains(newFilename).should("exist");
    });

    it("updates the title", () => {
      const newTitle = `Cypress Test Title ${uuidv4()}`;

      // The title field is multiline, which renders a hidden `aria-hidden`
      // shadow textarea (for autosizing) alongside the real one — exclude it.
      cy.getBySelector("file-modal-title-field")
        .find("textarea:not([aria-hidden])")
        .clear()
        .type(newTitle);

      cy.getBySelector("file-modal-save-title-btn").click();

      cy.getBySelector("file-modal-title-field")
        .find("textarea:not([aria-hidden])")
        .should("have.value", newTitle);
    });

    it("copies the file URL", () => {
      cy.getBySelector("file-url-field")
        .find("input")
        .invoke("val")
        .then((fileUrl) => {
          cy.getBySelector("copy-file-url-btn").click();
          cy.assertClipboardValue(fileUrl);
        });
    });

    it("copies the file ZUID", () => {
      cy.getBySelector("copy-zuid-btn").click();
      cy.assertClipboardValue(fileId);
    });

    describe("drags the file onto a sidebar folder", () => {
      let folderId;

      afterEach(() => {
        if (!folderId) return;
        cy.apiRequest({
          method: "DELETE",
          url: `${MEDIA_MANAGER_URL}/group/${folderId}`,
        });
      });

      it("moves the file into the dropped folder", () => {
        cy.getBySelector("file-modal-close-btn").click();

        cy.apiRequest({
          method: "POST",
          url: `${MEDIA_MANAGER_URL}/group`,
          body: {
            name: `cypress_drag_folder_${uuidv4()}`,
            bin_id: fileBinId,
            group_id: fileBinId,
          },
        }).then((response) => {
          folderId = response.data[0].id;

          const dataTransfer = new DataTransfer();

          cy.getBySelector(fileId)
            .should("be.visible")
            .trigger("dragstart", { dataTransfer });

          cy.getBySelector(folderId).trigger("drop", { dataTransfer });

          cy.getBySelector(folderId).click();
          cy.getBySelector(fileId).should("exist");
        });
      });
    });

    it("deletes the file", () => {
      cy.getBySelector("file-modal-delete-btn").click();
      cy.getBySelector("delete-file-confirm-btn").click();

      cy.getBySelector(fileId).should("not.exist");
    });
  });

  describe("missing file", () => {
    it("shows the 404 state", () => {
      cy.visit("/media?fileId=bogus");

      cy.getBySelector("media-not-found-state").within(() => {
        cy.contains("File Not Found").should("exist");
      });
    });
  });
});

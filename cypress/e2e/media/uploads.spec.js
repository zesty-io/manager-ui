import { v4 as uuidv4 } from "uuid";

const CIRCLE_SVG = `
  <svg viewBox="0 0 2 2" xmlns="http://www.w3.org/2000/svg">
    <circle cx="1" cy="1" r="1" />
  </svg>
`;

const BIN_ZUID = "1-6c9618c-r26pt";
const FOLDER_ZUID = "2-eaaaca5-p1nggr";

const getUploadFixture = () => ({
  contents: Cypress.Buffer.from(CIRCLE_SVG),
  fileName: `cypress_upload_test_${uuidv4()}.svg`,
  mimeType: "image/svg+xml",
  lastModified: Date.now(),
});

describe("Media uploads", () => {
  let uploadedFileId;

  beforeEach(() => {
    uploadedFileId = undefined;
  });

  afterEach(() => {
    cy.deleteMediaFile(uploadedFileId);
  });

  it("uploads a file to All Media", () => {
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

    cy.wait("@upload", { timeout: 30_000 }).then(({ response }) => {
      expect(response.statusCode).to.eq(201);
      uploadedFileId = response.body.data[0].id;

      cy.getBySelector("upload-modal-done-btn").click();
      cy.getBySelector(uploadedFileId).should("exist");
    });
  });

  it("uploads a file to a folder", () => {
    cy.waitOn(`**/group/${FOLDER_ZUID}`, () => {
      cy.visit(`/media/folder/${FOLDER_ZUID}`);
    });

    cy.intercept("POST", "**/upload/**").as("upload");
    cy.get("input[type=file]")
      .first()
      .selectFile(getUploadFixture(), { force: true });

    cy.wait("@upload", { timeout: 40_000 }).then(({ response }) => {
      expect(response.statusCode).to.eq(201);
      uploadedFileId = response.body.data[0].id;

      cy.getBySelector("upload-modal-done-btn").click();
      cy.getBySelector(uploadedFileId).should("exist");
    });
  });

  it("uploads a file to a bin", () => {
    cy.waitOn(`**/bin/${BIN_ZUID}/files`, () => {
      cy.visit(`/media/folder/${BIN_ZUID}`);
    });

    cy.intercept("POST", "**/upload/**").as("upload");
    cy.get("input[type=file]")
      .first()
      .selectFile(getUploadFixture(), { force: true });

    cy.wait("@upload", { timeout: 30_000 }).then(({ response }) => {
      expect(response.statusCode).to.eq(201);
      uploadedFileId = response.body.data[0].id;

      cy.getBySelector("upload-modal-done-btn").click();
      cy.getBySelector(uploadedFileId).should("exist");
    });
  });

  it("uploads a file via drag 'n drop", () => {
    cy.waitOn(`**/group/${FOLDER_ZUID}`, () => {
      cy.visit(`/media/folder/${FOLDER_ZUID}`);
    });

    cy.intercept("POST", "**/upload/**").as("upload");
    // Drop onto the dropzone root (not the hidden file input) so react-dropzone's
    // drag listeners, which are attached to the root element, actually fire.
    cy.getBySelector("dnd-provider-box").selectFile(getUploadFixture(), {
      action: "drag-drop",
      force: true,
    });

    cy.wait("@upload", { timeout: 30_000 }).then(({ response }) => {
      expect(response.statusCode).to.eq(201);
      uploadedFileId = response.body.data[0].id;

      cy.getBySelector("upload-modal-done-btn").click();
      cy.getBySelector(uploadedFileId).should("exist");
    });
  });

  it("displays upload message when dragging a file into the grid", () => {
    cy.waitOn(`**/group/${FOLDER_ZUID}`, () => {
      cy.visit(`/media/folder/${FOLDER_ZUID}`);
    });

    cy.getBySelector("dnd-provider-box")
      .trigger("dragover")
      .contains("Upload files to");
  });
});

import { v4 as uuidv4 } from "uuid";

const CIRCLE_SVG = `
  <svg viewBox="0 0 2 2" xmlns="http://www.w3.org/2000/svg">
    <circle cx="1" cy="1" r="1" />
  </svg>
`;

const BIN_ZUID = "1-6c9618c-r26pt";
const MEDIA_MANAGER_URL = Cypress.env("MEDIA_MANAGER_URL");

const getUploadFixture = () => ({
  contents: Cypress.Buffer.from(CIRCLE_SVG),
  fileName: `cypress_upload_test_${uuidv4()}.svg`,
  mimeType: "image/svg+xml",
  lastModified: Date.now(),
});

describe("Media uploads", () => {
  let uploadedFileId;
  let folderId;

  before(() => {
    // Create a scratch folder instead of relying on a hardcoded ZUID, which
    // drifts whenever the dev instance snapshot is re-seeded.
    cy.apiRequest({
      method: "POST",
      url: `${MEDIA_MANAGER_URL}/group`,
      body: {
        name: `cypress_upload_folder_${uuidv4()}`,
        bin_id: BIN_ZUID,
        group_id: BIN_ZUID,
      },
    }).then((response) => {
      folderId = response.data[0].id;
    });
  });

  after(() => {
    if (!folderId) return;
    cy.apiRequest({
      method: "DELETE",
      url: `${MEDIA_MANAGER_URL}/group/${folderId}`,
    });
  });

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
    cy.waitOn(`**/group/${folderId}`, () => {
      cy.visit(`/media/folder/${folderId}`);
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
    cy.waitOn(`**/group/${folderId}`, () => {
      cy.visit(`/media/folder/${folderId}`);
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
    cy.waitOn(`**/group/${folderId}`, () => {
      cy.visit(`/media/folder/${folderId}`);
    });

    // react-dropzone only flips `isDragActive` on `dragenter` (not
    // `dragover`), and only when the drag's dataTransfer advertises a
    // "Files" type, so the dataTransfer needs a real file item attached.
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(
      new File([CIRCLE_SVG], "cypress_dragover_test.svg", {
        type: "image/svg+xml",
      })
    );

    cy.getBySelector("dnd-provider-box")
      .trigger("dragenter", { dataTransfer })
      .contains("Upload files to");
  });
});

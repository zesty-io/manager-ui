const dummyString = "Cypress large upload test file..\n"; // 32 bytes
const LARGE_TEXT = new Array(1000001).join(dummyString); // just over 32MB

const getRandomFileName = () =>
  `cypress_upload_test_${Math.floor(Math.random() * 1_000_000)}.txt`;

describe("Media uploads", () => {
  before(() => {
    cy.waitOn("*groups*", () => {
      cy.visit("/media");
      //cy.visit("/media/2-eaaaca5-p1nggr")
      //cy.get('[data-cy="media-loading-spinner"]').should("exist")
      cy.get('[data-cy="media-loading-spinner"]').should("not.exist");
    });
  });

  it("uploads a file to a All Media", () => {
    const fileName = getRandomFileName();

    cy.get("input[type=file]")
      .first()
      .selectFile(
        {
          contents: Cypress.Buffer.from(LARGE_TEXT),
          fileName,
          mimeType: "text/plain",
          lastModified: Date.now(),
        },
        {
          // force:true is valid because we use hidden file inputs to do uploads
          force: true,
        }
      );
    cy.get('button:enabled:contains("Done")');
    // Wait for upload to complete. Close icon exists when upload is complete
    // This a large file upload so it could take quite some time, and thus has
    // a long timeout
    cy.get('[data-testid="CloseRoundedIcon"]', { timeout: 1200_000 });
    // Click "Done" button to close upload modal
    cy.get('button:enabled:contains("Done")').click();
    // Assert file exists
    cy.get(`div.MuiCardContent-root:contains("${fileName}")`).should("exist");

    // CLEANUP

    // Click filename to open file modal
    cy.get(`div.MuiCardContent-root:contains("${fileName}")`).click();
    // Click delete button
    cy.get('[data-testid="DeleteIcon"]').click();
    // Click delete confirmation
    cy.get('button:enabled:contains("Delete")').click();
  });

  it("uploads a file to a folder", () => {
    cy.visit("/media/2-eaaaca5-p1nggr");
    cy.intercept("*instance*").as("instance");
    cy.intercept("*groups*").as("groups");
    cy.intercept("*bins*").as("bins");
    cy.intercept("*bin/1-6c9618c-r26pt").as("binZuid");
    cy.intercept("*group/2-eaaaca5-p1nggr").as("groupZuid");
    cy.wait("@groups")
      .wait("@bins")
      .wait("@groupZuid")
      .wait("@binZuid")
      .wait("@instance");
    const fileName = getRandomFileName();
    cy.get("input[type=file]")
      .first()
      .selectFile(
        {
          contents: Cypress.Buffer.from(LARGE_TEXT),
          fileName,
          mimeType: "text/plain",
          lastModified: Date.now(),
        },
        {
          // force:true is valid because we use hidden file inputs to do uploads
          force: true,
        }
      );
    // Wait for upload to complete. Close icon exists when upload is complete
    // This a large file upload so it could take quite some time, and thus has
    // a long timeout
    cy.get('[data-testid="CloseRoundedIcon"]', { timeout: 1200_000 });
    // Click "Done" button to close upload modal
    cy.get('button:enabled:contains("Done")').click();
    // Assert file exists
    cy.get(`div.MuiCardContent-root:contains("${fileName}")`).should("exist");
    // CLEANUP
    // Click filename to open file modal
    cy.get(`div.MuiCardContent-root:contains("${fileName}")`).click();
    // Click delete button
    cy.get('[data-testid="DeleteIcon"]').click();
    // Click delete confirmation
    cy.get('button:enabled:contains("Delete")').click();
  });

  it("uploads a file to a bin", () => {
    cy.visit("/media/1-6c9618c-r26pt");
    cy.intercept("*instance*").as("instance");
    cy.intercept("*groups*").as("groups");
    cy.intercept("*bins*").as("bins");
    cy.intercept("*bin/1-6c9618c-r26pt").as("binZuid");
    cy.intercept("*bin/1-6c9618c-r26pt/files").as("binFiles");
    cy.wait("@groups")
      .wait("@bins")
      .wait("@binZuid")
      .wait("@instance")
      .wait("@binFiles");
    const fileName = getRandomFileName();
    cy.get("input[type=file]")
      .first()
      .selectFile(
        {
          contents: Cypress.Buffer.from(LARGE_TEXT),
          fileName,
          mimeType: "text/plain",
          lastModified: Date.now(),
        },
        {
          // force:true is valid because we use hidden file inputs to do uploads
          force: true,
        }
      );
    // Wait for upload to complete. Close icon exists when upload is complete
    // This a large file upload so it could take quite some time, and thus has
    // a long timeout
    cy.get('[data-testid="CloseRoundedIcon"]', { timeout: 1200_000 });
    // Click "Done" button to close upload modal
    cy.get('button:enabled:contains("Done")').click();
    // Assert file exists
    cy.get(`div.MuiCardContent-root:contains("${fileName}")`).should("exist");
    // CLEANUP
    // Click filename to open file modal
    cy.get(`div.MuiCardContent-root:contains("${fileName}")`).click();
    // Click delete button
    cy.get('[data-testid="DeleteIcon"]').click();
    // Click delete confirmation
    cy.get('button:enabled:contains("Delete")').click();
  });

  it("uploads a file via drag 'n drop", () => {
    cy.visit("/media/2-eaaaca5-p1nggr");
    cy.intercept("*instance*").as("instance");
    cy.intercept("*groups*").as("groups");
    cy.intercept("*bins*").as("bins");
    cy.intercept("*bin/1-6c9618c-r26pt").as("binZuid");
    cy.intercept("*group/2-eaaaca5-p1nggr").as("groupZuid");
    cy.wait("@groups")
      .wait("@bins")
      .wait("@groupZuid")
      .wait("@binZuid")
      .wait("@instance");
    const fileName = getRandomFileName();
    cy.get("input[type=file]")
      .first()
      .selectFile(
        {
          contents: Cypress.Buffer.from(LARGE_TEXT),
          fileName,
          mimeType: "text/plain",
          lastModified: Date.now(),
        },
        {
          // TODO is this a sufficient test of drag-n-drop?
          subject: "drag-n-drop",
          // force:true is valid because we use hidden file inputs to do uploads
          force: true,
        }
      );
    // Wait for upload to complete. Close icon exists when upload is complete
    // This a large file upload so it could take quite some time, and thus has
    // a long timeout
    cy.get('[data-testid="CloseRoundedIcon"]', { timeout: 1200_000 });
    // Click "Done" button to close upload modal
    cy.get('button:contains("Done")').click();
    // Assert file exists
    cy.get(`div.MuiCardContent-root:contains("${fileName}")`).should("exist");
    // CLEANUP
    // Click filename to open file modal
    cy.get(`div.MuiCardContent-root:contains("${fileName}")`).click();
    // Click delete button
    cy.get('[data-testid="DeleteIcon"]').click();
    // Click delete confirmation
    cy.get('button:enabled:contains("Delete")').click();
  });
});

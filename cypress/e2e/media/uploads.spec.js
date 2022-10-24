describe("Media uploads", () => {
  before(() => {
    cy.waitOn("*groups*", () => {
      cy.visit("/media");
      //cy.visit("/media/2-eaaaca5-p1nggr")
    });
  });

  it("uploads a file to a All Media", () => {
    const fileName = `cypress_upload_test_${Math.floor(
      Math.random() * 1_000_000
    )}.txt`;
    cy.get("input[type=file]").selectFile(
      {
        contents: Cypress.Buffer.from(
          "This is a dummy file for Cypress tests of media uploads"
        ),
        fileName,
        mimeType: "text/plain",
        lastModified: Date.now(),
      },
      {
        // force:true is valid because we use hidden file inputs to do uploads
        force: true,
      }
    );
    // Wait for upload to complete
    cy.intercept(
      "POST",
      "https://media-storage.api.dev.zesty.io/upload/gcp/*"
    ).as("upload");
    cy.wait("@upload", { timeout: 20_000 });
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
    const fileName = `cypress_upload_test_${Math.floor(
      Math.random() * 1_000_000
    )}.txt`;
    cy.get("input[type=file]")
      .first()
      .selectFile(
        {
          contents: Cypress.Buffer.from(
            "This is a dummy file for Cypress tests of media uploads"
          ),
          fileName,
          mimeType: "text/plain",
          lastModified: Date.now(),
        },
        {
          // force:true is valid because we use hidden file inputs to do uploads
          force: true,
        }
      );
    // Wait for upload to complete
    cy.intercept(
      "POST",
      "https://media-storage.api.dev.zesty.io/upload/gcp/*"
    ).as("upload");
    cy.wait("@upload", { timeout: 20_000 });
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
    const fileName = `cypress_upload_test_${Math.floor(
      Math.random() * 1_000_000
    )}.txt`;
    cy.get("input[type=file]")
      .first()
      .selectFile(
        {
          contents: Cypress.Buffer.from(
            "This is a dummy file for Cypress tests of media uploads"
          ),
          fileName,
          mimeType: "text/plain",
          lastModified: Date.now(),
        },
        {
          // force:true is valid because we use hidden file inputs to do uploads
          force: true,
        }
      );
    // Wait for upload to complete
    cy.intercept(
      "POST",
      "https://media-storage.api.dev.zesty.io/upload/gcp/*"
    ).as("upload");
    cy.wait("@upload", { timeout: 20_000 });
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
    const fileName = `cypress_upload_test_${Math.floor(
      Math.random() * 1_000_000
    )}.txt`;
    cy.get("input[type=file]")
      .first()
      .selectFile(
        {
          contents: Cypress.Buffer.from(
            "This is a dummy file for Cypress tests of media uploads"
          ),
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
    // Wait for upload to complete
    cy.intercept(
      "POST",
      "https://media-storage.api.dev.zesty.io/upload/gcp/*"
    ).as("upload");
    cy.wait("@upload", { timeout: 20_000 });
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

  it.skip("displays upload message when dragging a file into the grid", () => {
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
    const fileName = `cypress_upload_test_${Math.floor(
      Math.random() * 1_000_000
    )}.txt`;
    cy.get('[data-testid="dnd-provider-box"]')
      .trigger("dragover")
      .contains("Upload files to");
  });
});

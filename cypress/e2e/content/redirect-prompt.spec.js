import { v4 as uuidv4 } from "uuid";

// The "URL Path Change Detected" modal must open when the URL Path Part of a
// published item is changed and SAVED (not only when it is published).
describe("Content item redirect prompt on save", () => {
  const modelZUIDs = [];
  let modelZUID;
  let itemZUID;

  const saveItem = () => {
    cy.intercept("PUT", "**/content/models/**/items/**").as("saveItem");
    cy.getBySelector("SaveItemButton").should("be.enabled").click();
    cy.wait("@saveItem", { timeout: 30000 });
  };

  const savePathPart = (pathPart) => {
    // The field runs a debounced (1s) uniqueness search after typing; saving
    // before it finishes is a no-op, so wait for that request first.
    cy.intercept(
      {
        method: "GET",
        url: /\/search\/items\?q=/,
      },
      (req) => {
        if (req.url.includes(pathPart)) req.alias = "pathUniqueness";
      }
    );
    // {selectall} avoids an intermediate empty value (which flags the required
    // error and can race with the uniqueness check's error update)
    cy.getBySelector("pathPart").find("input").type(`{selectall}${pathPart}`);
    cy.wait("@pathUniqueness", { timeout: 30000 });
    cy.getBySelector("pathPart").should("contain", `/${pathPart}`);
    cy.getBySelector("pathPart")
      .find('[role="progressbar"]')
      .should("not.exist");
    saveItem();
  };

  // Fresh published item per test so every test starts with saved path == live path
  beforeEach(() => {
    cy.login();
    cy.blockLock();
    cy.blockAnnouncements();
    cy.task("seed:content", "fixtures/meta.json").then(({ model, items }) => {
      modelZUID = model?.ZUID;
      itemZUID = items[0]?.meta?.ZUID;
      modelZUIDs.push(modelZUID);
      cy.task("api:publishItem", { modelZUID, itemZUID });
      cy.intercept("GET", "**/v1/content/items/publishings**").as(
        "getPublishings"
      );
      cy.visit(`/content/${modelZUID}/${itemZUID}/meta`);
      cy.wait("@getPublishings", { timeout: 30000 });
      // Item and meta form fully loaded before interacting
      cy.getBySelector("pathPart").find("input").should("not.have.value", "");
      cy.getBySelector("SaveItemButton").should("not.exist");
    });
  });

  after(() => {
    modelZUIDs.forEach((zuid) => cy.deleteModel(zuid));
  });

  it("opens the redirect prompt after saving a changed path part", () => {
    const newPathPart = `redirect-${uuidv4().slice(0, 8)}`;
    savePathPart(newPathPart);

    cy.getBySelector("RedirectsChangeDialog", { timeout: 30000 }).should(
      "be.visible"
    );
    // The seeded item gets a generated pathPart (formatPathPart(itemLabel)),
    // so a live path always exists
    cy.getBySelector("RedirectsChangeDialogOldPath").should("not.be.empty");
    cy.getBySelector("RedirectsChangeDialogNewPath").should(
      "contain",
      newPathPart
    );
    cy.getBySelector("RedirectsChangeDialogCancelButton").click();
    cy.getBySelector("RedirectsChangeDialog").should("not.exist");
  });

  it("does not re-open the prompt when a later save only changes a non-path field", () => {
    savePathPart(`redirect-${uuidv4().slice(0, 8)}`);
    cy.getBySelector("RedirectsChangeDialog", { timeout: 30000 }).should(
      "be.visible"
    );
    cy.getBySelector("RedirectsChangeDialogCancelButton").click();
    cy.getBySelector("RedirectsChangeDialog").should("not.exist");

    cy.getBySelector("metaTitle")
      .find("input, textarea")
      .first()
      .clear()
      .type(`Title ${uuidv4().slice(0, 8)}`);
    saveItem();

    cy.getBySelector("SaveItemButton").should("not.exist");
    cy.getBySelector("RedirectsChangeDialog").should("not.exist");
  });
});

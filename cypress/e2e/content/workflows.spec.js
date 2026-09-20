import ContentItemPage from "./pages/ContentItemPage";

const NOW = Date.now();

const TITLES = {
  publishLabel: `Publish Approval - ${NOW}`,
  testLabel: `Random Test Label - ${NOW}`,
  noPermissionLabel: `No Permission Label - ${NOW}`,
};
const LABEL_DATA = {
  publishLabel: {
    name: TITLES.publishLabel,
    description: "",
    color: "#4E5BA6",
    allowPublish: true,
    addPermissionRoles: ["30-86f8ccec82-swp72s", "30-8ee88afe82-gmx631"],
    removePermissionRoles: ["30-86f8ccec82-swp72s", "30-8ee88afe82-gmx631"],
  },
  testLabel: {
    name: TITLES.testLabel,
    description: "",
    color: "#4E5BA6",
    allowPublish: false,
    addPermissionRoles: ["30-86f8ccec82-swp72s", "30-8ee88afe82-gmx631"],
    removePermissionRoles: ["30-86f8ccec82-swp72s", "30-8ee88afe82-gmx631"],
  },
  // addPermissionRoles set to a role the test user does NOT have, so the app
  // blocks adding it — this is what the "cannot add without permission" test needs.
  noPermissionLabel: {
    name: TITLES.noPermissionLabel,
    description: "",
    color: "#4E5BA6",
    allowPublish: false,
    addPermissionRoles: ["30-fcb3fc9083-mz27f9"],
    removePermissionRoles: ["30-fcb3fc9083-mz27f9"],
  },
};
const cleanUp = () => {
  cy.task("cleanup:labels");
};

// retries disabled: these tests are an ordered, testIsolation:false chain that
// adds/applies workflow labels — a retry re-adds a label that already persisted,
// drifting the active-label count.
describe("Content Item Workflows", { retries: 0 }, () => {
  let ITEM = null;
  before(() => {
    cleanUp();

    Object.values(LABEL_DATA).forEach((data) => {
      cy.task("api:createLabel", data);
    });

    cy.task("seed:content", "fixtures/item.json")
      .then(({ model, items }) => {
        Cypress.env("modelZUID", model?.ZUID);
        Cypress.env("itemZUID", items[0]?.meta?.ZUID);
        ITEM = items?.[0];
      })
      .then(() => {
        cy.visit(
          `/content/${Cypress.env("modelZUID")}/${Cypress.env("itemZUID")}`
        );
      });
  });

  after(() => {
    cleanUp();
  });

  it("Can add a workflow label", () => {
    // Intercept must be registered before the click that fires the PUT.
    cy.intercept("PUT", "**/labels/*").as("updateLabel");

    ContentItemPage.elements.versionSelector().should("exist").click();
    ContentItemPage.elements.addWorkflowStatusLabel().should("exist").click();
    ContentItemPage.elements
      .workflowStatusLabelOption()
      .contains(TITLES.testLabel)
      .should("exist")
      .click({ force: true });

    cy.get("body").type("{esc}");

    cy.wait("@updateLabel")
      .its("response.statusCode")
      .should("be.oneOf", [200, 201]);

    cy.reload();

    ContentItemPage.elements.versionSelector().should("exist").click();
    ContentItemPage.elements
      .versionItem()
      .first()
      .within(() => {
        ContentItemPage.elements
          .activeWorkflowStatusLabel()
          .should("have.length", 1);
      });

    cy.get("body").type("{esc}");
  });

  it("Cannot add a workflow label when role has no permission", () => {
    ContentItemPage.elements.versionSelector().should("exist").click();
    ContentItemPage.elements.addWorkflowStatusLabel().should("exist").click();
    // Click the label the test user lacks permission to add (deterministic, by
    // name) — .first() was non-deterministic and often landed on an addable label.
    ContentItemPage.elements
      .workflowStatusLabelOption()
      .contains(TITLES.noPermissionLabel)
      .should("exist")
      .click({ force: true });

    cy.get("body").type("{esc}");

    cy.reload();

    ContentItemPage.elements.versionSelector().should("exist").click();
    ContentItemPage.elements
      .versionItem()
      .first()
      .within(() => {
        ContentItemPage.elements
          .activeWorkflowStatusLabel()
          .should("have.length", 1);
      });

    cy.get("body").type("{esc}");
  });

  it("Cannot publish a content item if label with allowPublish is missing", () => {
    ContentItemPage.elements
      .publishItemButton()
      .should("exist")
      .click({ force: true });
    ContentItemPage.elements
      .confirmPublishItemButton()
      .should("exist")
      .click({ force: true });
    ContentItemPage.elements
      .toast()
      .contains(
        `Cannot Publish: "${ITEM?.web?.metaTitle}". Does not have a status that allows publishing`
      );
  });

  it("Can publish a content item if label with allowPublish is applied", () => {
    // Intercept must be registered before the click that fires the PUT.
    cy.intercept("PUT", "**/labels/*").as("updateLabel");

    cy.reload();
    ContentItemPage.elements.versionSelector().should("exist").click();
    ContentItemPage.elements.addWorkflowStatusLabel().should("exist").click();
    ContentItemPage.elements
      .workflowStatusLabelOption()
      .contains(TITLES.publishLabel)
      .should("exist")
      .click({ force: true });

    cy.get("body").type("{esc}");

    cy.wait("@updateLabel")
      .its("response.statusCode")
      .should("be.oneOf", [200, 201]);

    cy.reload();

    cy.intercept("POST", "**/items/*/publishings").as("publishItem");

    ContentItemPage.elements.publishItemButton().should("exist").click();
    ContentItemPage.elements.confirmPublishItemButton().should("exist").click();

    // Wait for the publish to persist, then reload so the indicator reads the
    // fresh published state — it intermittently failed to render off the live
    // post-publish refetch under load.
    cy.wait("@publishItem")
      .its("response.statusCode")
      .should("be.oneOf", [200, 201]);

    cy.reload();

    ContentItemPage.elements.contentPublishedIndicator().should("exist");
  });
});

// Covers https://github.com/zesty-io/manager-ui/issues/3537 (bulk publish item):
// selecting a mix of allowed/blocked items from the multipage table publishes
// only the allowed ones and names the blocked one, instead of a generic
// "Error publishing items" toast (or blocking the whole batch).
//
// retries disabled: same rationale as above -- this creates a real,
// instance-wide `allowPublish` label, and a retry would re-run the workflow
// label assignment against an item that already has it applied.
describe(
  "Content List Bulk Publish with Workflow Status",
  { retries: 0 },
  () => {
    const BULK_NOW = Date.now();
    const BULK_PUBLISH_LABEL = `Bulk Publish Approval - ${BULK_NOW}`;

    let MODEL_ZUID;
    let ITEMS = [];

    before(() => {
      cy.task("cleanup:labels");
      cy.task("api:createLabel", {
        name: BULK_PUBLISH_LABEL,
        description: "",
        color: "#4E5BA6",
        allowPublish: true,
        addPermissionRoles: ["30-86f8ccec82-swp72s", "30-8ee88afe82-gmx631"],
        removePermissionRoles: ["30-86f8ccec82-swp72s", "30-8ee88afe82-gmx631"],
      });

      cy.task("seed:content", "fixtures/lists.json").then(
        ({ model, items }) => {
          MODEL_ZUID = model?.ZUID;
          ITEMS = items;
          // Give only the second item the allow-publish label -- the first item
          // is left with no workflow status at all, which is enough to block it
          // once any allowPublish label exists on the instance.
          cy.visit(`/content/${MODEL_ZUID}/${items[1]?.meta?.ZUID}`);
        }
      );
    });

    after(() => {
      cy.task("cleanup:labels");
    });

    it("Excludes the item blocked by workflow status from bulk publish and publishes the rest", () => {
      cy.intercept("PUT", "**/labels/*").as("updateLabel");

      ContentItemPage.elements.versionSelector().should("exist").click();
      ContentItemPage.elements.addWorkflowStatusLabel().should("exist").click();
      ContentItemPage.elements
        .workflowStatusLabelOption()
        .contains(BULK_PUBLISH_LABEL)
        .should("exist")
        .click({ force: true });

      cy.get("body").type("{esc}");

      cy.wait("@updateLabel")
        .its("response.statusCode")
        .should("be.oneOf", [200, 201]);

      cy.visit(`/content/${MODEL_ZUID}`);
      cy.getBySelector("listItemTable")
        .find('[data-cy="itemListRow"]')
        .should("have.length.greaterThan", 1);

      cy.intercept("POST", "**/items/publishings/batch").as("batchPublish");

      // Select the first two rows: ITEMS[0] (no label -- blocked) and
      // ITEMS[1] (has the allow-publish label -- allowed). Checkbox index 0 is
      // the header "select all" checkbox.
      cy.getBySelector("listItemTable")
        .find("input[type=checkbox]")
        .eq(1)
        .click();
      cy.getBySelector("listItemTable")
        .find("input[type=checkbox]")
        .eq(2)
        .click();

      cy.getBySelector("MultiPageTablePublish").click();
      cy.getBySelector("ConfirmPublishButton").click();

      cy.getBySelector("toast").contains(ITEMS[0]?.web?.metaTitle);
      cy.getBySelector("toast").contains(
        "Does not have a status that allows publishing"
      );

      cy.wait("@batchPublish").then(({ request, response }) => {
        expect(response.statusCode).to.be.oneOf([200, 201]);
        const publishedZUIDs = request.body?.map((item) => item.ZUID);
        expect(publishedZUIDs).to.not.include(ITEMS[0]?.meta?.ZUID);
        expect(publishedZUIDs).to.include(ITEMS[1]?.meta?.ZUID);
      });
    });
  }
);

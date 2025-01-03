import instanceZUID from "../../../src/utility/instanceZUID";
import CONFIG from "../../../src/shell/app.config";
import {
  AUTHORIZED_ROLES,
  colorMenu,
} from "../../../src/apps/settings/src/app/views/User/Workflows/constants";

const INSTANCE_API = `${
  CONFIG?.[process.env.NODE_ENV]?.API_INSTANCE_PROTOCOL
}${instanceZUID}${CONFIG?.[process.env.NODE_ENV]?.API_INSTANCE}`;

const FOCUSED_LABEL_COLOR = "rgba(253, 133, 58, 0.1)";

const ENDPOINTS = {
  instance: "**/v1/instances/**",
  userRoles: "**/v1/users/**/roles",
  instanceRoles: "**/v1/instances/**/roles",
  instanceUsers: `**/v1/instances/**/users`,
  instanceUserRoles: `**/v1/instances/**/users/roles`,
  allStatusLabels: "**/v1/env/labels?showDeleted=true",
  statusLabels: "**/v1/env/labels",
};

const USER_ROLES = {
  restricted: {
    data: [
      {
        ZUID: "30-8ee88afe82-gmx631",
        entityZUID: "8-f48cf3a682-7fthvk",
        name: "Developer",
        systemRoleZUID: "31-71cfc74-d3v3l0p3r",
        systemRole: {
          ZUID: "31-71cfc74-d3v3l0p3r",
          name: "Developer",
        },
      },
    ],
  },
  authorized: {
    data: [
      {
        ZUID: "30-8ee88afe82-gmx631",
        entityZUID: "8-f48cf3a682-7fthvk",
        name: "Admin",
        systemRoleZUID: "31-71cfc74-4dm13",
        systemRole: {
          ZUID: "31-71cfc74-4dm13",
          name: "Admin",
        },
      },
    ],
  },
};

const LABELS = {
  restrictedPageHeader: "You need permission to view and edit workflows",
  restrictedPageSubheader:
    "Contact the instance owner or administrators listed below to upgrade your role to Admin or Owner",
  activeLabelsHeader: "Active Statuses",
  activeLabelsSubheader:
    "Active statuses are available to be added and removed from content items",
  deactivatedLabelsHeader: "Deactivated Statuses",
  deactivatedLabelsSubheader:
    "These statuses can be re-activated at any time if you would like to add or remove them from content items",
};

const FORM_DATA = {
  create: {
    name: "Test Status Label - Create",
    description: "Test Status Label - Create Description",
    color: "Grey",
    addPermissionRoles: "Admin",
    removePermissionRoles: "Admin",
    allowPublish: true,
  },
  edit: {
    name: "Test Status Label - Edited",
    description: "Test Status Label - Edited Description",
    color: "Rose",
    addPermissionRoles: "Admin",
    removePermissionRoles: "Admin",
    allowPublish: false,
  },
  delete: {
    name: "Test Status Label - Deleted",
    description: "Test Status Label - Deleted Description",
    color: "Red",
    addPermissionRoles: [],
    removePermissionRoles: [],
    allowPublish: false,
  },
};

describe("Workflow Status Labels: Restricted User", () => {
  before(() => {
    cy.waitUntilStatusLabelsAreLoaded();
  });
  it("displays restricted access message and admin profiles", () => {
    cy.intercept("GET", ENDPOINTS?.userRoles, {
      statusCode: 200,
      body: {
        ...USER_ROLES?.restricted,
      },
    }).as("getRestrictedUser");

    cy.intercept("GET", ENDPOINTS?.instanceUserRoles).as(
      "getInstanceUserRoles"
    );

    cy.visit("/settings/user/workflows");

    cy.wait("@getRestrictedUser")
      .its("response.body")
      .then((body) => {
        cy.wrap(body).as("userRoles");
      });
    cy.contains(LABELS?.restrictedPageHeader).should("exist");
    cy.contains(LABELS?.restrictedPageSubheader).should("exist");
    cy.get('[data-cy="restricted-image"]').should("exist");

    cy.wait("@getInstanceUserRoles")
      .its("response.body")
      .then((body) => {
        const authorizedUsers = body?.data.filter((user) =>
          AUTHORIZED_ROLES.includes(user?.role?.systemRoleZUID)
        );
        cy.get('[data-cy="user-profile-container"]')
          .children()
          .its("length")
          .should("eq", authorizedUsers.length);
      });
  });
});

describe("Workflow Status Labels: Authorized User", () => {
  before(() => {
    cy.cleanTestData();
    cy.createTestData();
  });

  context("Workflow Page", () => {
    before(() => {
      cy.waitUntilStatusLabelsAreLoaded();
    });
    it("displays workflow page elements for authorized users", () => {
      cy.contains("Workflows").should("exist");
      cy.get("button").contains("Create Status").should("exist");
      cy.get('input[placeholder="Search Statuses"]').should("exist");
      cy.get('input[value="deactivated"]').should("exist");
    });

    it("Show Deactivated Labels: Displays active and deactivated status labels", () => {
      cy.get('input[value="deactivated"]').click();
      cy.contains(LABELS.activeLabelsHeader).should("exist");
      cy.contains(LABELS.activeLabelsHeader).should("exist");
      cy.contains(LABELS.deactivatedLabelsHeader).should("exist");
      cy.contains(LABELS.deactivatedLabelsHeader).should("exist");
    });
  });

  context("Create New Status Label", () => {
    before(() => {
      cy.waitUntilStatusLabelsAreLoaded();
    });

    it("Form Validation: should display error message when required fields are empty", function () {
      cy.get("button").contains("Create Status").click();
      const nameFieldErrorMessage = "Name is required";
      cy.get('[data-cy="status-label-submit-button"]').click();
      cy.contains(nameFieldErrorMessage).should("exist");
      cy.get("button").contains("Cancel").click();
    });

    it("Fills out and submits form", () => {
      cy.createStatusLabel({ ...FORM_DATA.create }).then(function (data) {
        const {
          statusLabels: { active },
          createdStatusLabel,
        } = data;
        expect(createdStatusLabel.name).to.equal(FORM_DATA.create.name);
        expect(createdStatusLabel.description).to.equal(
          FORM_DATA.create.description
        );
        expect(createdStatusLabel.color).to.equal(
          colorMenu.find((color) => color?.label === FORM_DATA.create.color)
            ?.value
        );
        expect(createdStatusLabel.addPermissionRoles).to.have.lengthOf(1);
        expect(createdStatusLabel.removePermissionRoles).to.have.lengthOf(1);
        expect(createdStatusLabel.allowPublish).to.be.true;

        cy.get(
          '[data-cy="active-labels-container"] [data-cy="status-label"]'
        ).should("have.length", active.length);
      });

      cy.wait(1000);
    });

    it("Highlights the newly created status label.", () => {
      cy.get('[data-cy="active-labels-container"] [data-cy="status-label"]')
        .contains(FORM_DATA.create.name)
        .parents('[data-cy="status-label"]')
        .should("have.css", "background-color", FOCUSED_LABEL_COLOR);
    });

    it("Clicking outside the focused label restores it to its default state.", () => {
      cy.get('[data-cy="active-labels-container"]').click();
      cy.get('[data-cy="active-labels-container"] [data-cy="status-label"]')
        .contains(FORM_DATA.create.name)
        .parents('[data-cy="status-label"]')
        .should("not.have.css", "background-color", FOCUSED_LABEL_COLOR);
    });
  });

  context("Edit Status Label", () => {
    before(() => {
      cy.waitUntilStatusLabelsAreLoaded();
    });

    it("Open Status Label and Edit Details", () => {
      cy.intercept("PUT", `${ENDPOINTS?.statusLabels}/**`).as(
        "editStatusLabel"
      );
      cy.get(
        '[data-cy="active-labels-container"] [data-cy="status-label"]:visible'
      )
        .contains(FORM_DATA.create.name)
        .parents('[data-cy="status-label"]')
        .find("button")
        .click();
      cy.get('ul li[role="menuitem"]').contains("Edit Status").click();

      cy.get("button")
        .contains("Deactivate Status")
        .should("exist")
        .and("be.enabled");

      cy.get('input[name="name"]').clear().type(FORM_DATA.edit.name);
      cy.get('textarea[name="description"]')
        .clear()
        .type(FORM_DATA.edit.description);
      cy.get('input[name="color"]').parent().find("button").click();
      cy.get('ul li[role="option"]').contains(FORM_DATA.edit.color).click();
      cy.get("span.MuiChip-label")
        .contains(FORM_DATA.edit.addPermissionRoles)
        .parent()
        .find('svg[data-testid="CancelIcon"]')
        .click();
      cy.get('form[role="dialog"]').click();
      cy.get("span.MuiChip-label")
        .contains(FORM_DATA.edit.removePermissionRoles)
        .parent()
        .find('svg[data-testid="CancelIcon"]')
        .click();
      cy.get('form[role="dialog"]').click();
      cy.get('input[name="allowPublish"]').uncheck();

      cy.get('[data-cy="status-label-submit-button"]').click();

      cy.intercept(ENDPOINTS.allStatusLabels).as("getAllStatusLabels");

      cy.wait(["@editStatusLabel", "@getAllStatusLabels"]).spread(
        (editStatusLabel, getAllStatusLabels) => {
          const targetLabelZUID = editStatusLabel.response.body.data;
          const updatedLabel = getAllStatusLabels.response.body.data.find(
            (label) => label.ZUID === targetLabelZUID
          );

          expect(editStatusLabel.response.statusCode).to.eq(200);
          expect(getAllStatusLabels.response.statusCode).to.eq(200);

          expect(updatedLabel).to.deep.include({
            name: FORM_DATA.edit.name,
            color: colorMenu.find(
              (color) => color?.label === FORM_DATA.edit.color
            )?.value,
            addPermissionRoles: [],
            removePermissionRoles: [],
            allowPublish: false,
          });
        }
      );
    });
  });

  context("Re-order Status Labels", () => {
    before(() => {
      cy.waitUntilStatusLabelsAreLoaded();
    });

    it("Drag status label to a new position", () => {
      const dataTransfer = new DataTransfer();
      cy.get(`[data-cy="status-label"]`)
        .find('[data-cy="status-label-drag-handle"]')
        .eq(0)
        .trigger("dragstart", {
          dataTransfer,
        });

      cy.get(`[data-cy="status-label"]`)
        .find('[data-cy="status-label-drag-handle"]')
        .eq(1)
        .trigger("dragover", {
          dataTransfer,
        })
        .trigger("drop", {
          dataTransfer,
        });

      cy.intercept("PUT", ENDPOINTS.statusLabels).as("reorderStatusLabel");
      cy.intercept("GET", ENDPOINTS.allStatusLabels).as("getAllStatusLabels");
      cy.wait(["@reorderStatusLabel", "@getAllStatusLabels"]).spread(
        (reorderStatusLabel, getAllStatusLabels) => {
          expect(reorderStatusLabel.response.statusCode).to.eq(200);
          expect(getAllStatusLabels.response.statusCode).to.eq(200);

          const reorderedLabels = reorderStatusLabel?.request?.body?.data;
          const updatedLabel = getAllStatusLabels.response.body.data;
          reorderedLabels.forEach((label, index) => {
            expect(
              updatedLabel.find((item) => item?.ZUID === label?.ZUID).sort
            ).to.eq(label.sort);
          });
        }
      );
      cy.wait(1000);
    });
  });

  context("Deactivate Status Label", () => {
    before(() => {
      cy.waitUntilStatusLabelsAreLoaded().then((data) => {
        cy.wrap(data).as("deactivateInitialStatusLabels");
      });
    });

    it("Deactivate using menu options", function () {
      cy.deactivateStatusLabel(FORM_DATA?.edit?.name).then(function (data) {
        expect(
          !data?.statusLabels?.active?.find(
            (label) => label?.name === FORM_DATA?.edit?.name
          )
        ).to.be.true;
        expect(
          !!data?.statusLabels?.deactivated?.find(
            (label) => label?.name === FORM_DATA?.edit?.name
          )
        ).to.be.true;
      });

      cy.get(".notistack-Snackbar")
        .contains(`Status De-activated`)
        .should("exist");
      cy.get(".notistack-Snackbar")
        .contains(FORM_DATA?.edit?.name)
        .should("exist");
    });

    it("Deactivate using deactivation button in edit status label form", function () {
      cy.get(
        '[data-cy="active-labels-container"] [data-cy="status-label"]:visible'
      )
        .contains(FORM_DATA.delete.name)
        .parents('[data-cy="status-label"]')
        .find("button")
        .click();

      cy.get('ul li[role="menuitem"]').contains("Edit Status").click();

      cy.get("form button").contains("Deactivate Status").click();

      cy.get('[data-cy="deactivation-dialog"] button')
        .contains("Deactivate Status")
        .click();

      // cy.intercept("DELETE", `${ENDPOINTS?.statusLabels}/**`).as(
      //   "deactivateStatusLabel"
      // );
      cy.intercept(ENDPOINTS.allStatusLabels).as("getAllStatusLabels");

      cy.wait("@getAllStatusLabels");

      cy.wait(1500);

      cy.get(".notistack-Snackbar")
        .contains(`Status De-activated`)
        .should("exist");
      cy.get(".notistack-Snackbar")
        .contains(FORM_DATA?.delete?.name)
        .should("exist");
    });
  });

  context("Filter Active and Deactivated Status Labels", () => {
    before(() => {
      cy.waitUntilStatusLabelsAreLoaded().then((data) => {
        cy.wrap(data).as("activeDeactivatedStatusLabels");
      });
      cy.get('input[value="deactivated"]').click();
    });

    it("Displays active/deactivated status labels", function () {
      cy.get(
        '[data-cy="active-labels-container"] [data-cy="status-label"]'
      ).should(
        "have.length",
        this.activeDeactivatedStatusLabels?.active?.length
      );

      cy.get(
        '[data-cy="deactivated-labels-container"] [data-cy="status-label"]'
      ).should(
        "have.length",
        this.activeDeactivatedStatusLabels?.deactivated?.length
      );
    });

    it("Displays Error page when search results returns empty", function () {
      cy.wait(1500);
      cy.get('input[placeholder="Search Statuses"]').clear().type("xxxxx");

      cy.get('[data-cy="active-labels-container"]').should("not.exist");
      cy.get('[data-cy="deactivated-labels-container"]').should("not.exist");
      cy.get('[data-cy="no-results-page"]').should("exist");
    });

    it("Clears and focuses search field when clicking 'Search Again'", function () {
      cy.wait(1500);
      cy.get("button").contains("Search Again").click();

      cy.get('[data-cy="active-labels-container"]').should("exist");
      cy.get('[data-cy="deactivated-labels-container"]').should("exist");
      cy.get('[data-cy="no-results-page"]').should("not.exist");

      cy.get('input[placeholder="Search Statuses"]')
        .should("be.empty")
        .and("have.focus");
    });
  });
});

Cypress.Commands.add("cleanTestData", () => {
  cy.intercept(ENDPOINTS.allStatusLabels).as("getAllLabels");
  cy.visit("/settings/user/workflows");
  cy.wait("@getAllLabels")
    .its("response.body.data")
    .then((data) => {
      const testData = data?.filter(
        (label) =>
          !label?.deletedAt &&
          [
            FORM_DATA?.create?.name,
            FORM_DATA?.edit?.name,
            FORM_DATA?.delete?.name,
          ]?.includes(label?.name)
      );

      if (testData?.length > 0) {
        cy.getCookie(Cypress.env("COOKIE_NAME")).then((cookie) => {
          const token = cookie?.value;
          testData.forEach((label) => {
            cy.request({
              url: `${INSTANCE_API}/env/labels/${label?.ZUID}`,
              method: "DELETE",
              headers: {
                authorization: `Bearer ${token}`,
              },
            });
          });
        });
      }
    });
});

Cypress.Commands.add("createTestData", () => {
  cy.getCookie(Cypress.env("COOKIE_NAME")).then((cookie) => {
    const token = cookie?.value;
    cy.request({
      url: `${INSTANCE_API}/env/labels`,
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: {
        ...FORM_DATA?.delete,
        color: colorMenu.find(
          (color) => color?.label === FORM_DATA.delete.color
        )?.value,
      },
    });
  });
});

Cypress.Commands.add("waitUntilStatusLabelsAreLoaded", () => {
  cy.intercept("GET", ENDPOINTS.allStatusLabels, (req) => {
    req.continue();
  }).as("getAllStatusLabels");
  cy.visit("/settings/user/workflows");
  return cy
    .wait("@getAllStatusLabels", { timeout: 30000 })
    .then(({ response }) => {
      return parseStatusLabels(response?.body?.data);
    });
});

Cypress.Commands.add(
  "createStatusLabel",
  ({
    name,
    description,
    color,
    addPermissionRoles,
    removePermissionRoles,
    allowPublish,
  }) => {
    cy.get("button").contains("Create Status").click();

    cy.intercept("POST", ENDPOINTS?.statusLabels).as("createStatusLabel");
    cy.intercept(ENDPOINTS.allStatusLabels).as("getAllStatusLabels");

    cy.get('input[name="name"]').type(name);
    cy.get('textarea[name="description"]').type(description);
    cy.get('input[name="color"]').parent().find("button").click();
    cy.get('ul li[role="option"]').contains(color).click();
    cy.get('input[name="addPermissionRoles"]').parent().find("button").click();
    cy.get('ul li[role="option"]').contains(addPermissionRoles).click();
    cy.get('form[role="dialog"]').click();
    cy.get('input[name="removePermissionRoles"]')
      .parent()
      .find("button")
      .click();
    cy.get('ul li[role="option"]').contains(removePermissionRoles).click();
    cy.get('form[role="dialog"]').click();

    if (allowPublish) {
      cy.get('input[name="allowPublish"]').check();
    } else {
      cy.get('input[name="allowPublish"]').uncheck();
    }

    cy.get('[data-cy="status-label-submit-button"]').click();

    return cy
      .wait(["@createStatusLabel", "@getAllStatusLabels"])
      .spread((createStatusLabel, getAllStatusLabels) => {
        return {
          createdStatusLabel: createStatusLabel?.response?.body?.data,
          statusLabels: parseStatusLabels(
            getAllStatusLabels?.response?.body?.data
          ),
        };
      });
  }
);

Cypress.Commands.add("deactivateStatusLabel", (labelName) => {
  cy.intercept("DELETE", `${ENDPOINTS?.statusLabels}/**`).as(
    "deactivateStatusLabel"
  );
  cy.intercept("GET", ENDPOINTS.allStatusLabels).as("getAllStatusLabels");

  return cy
    .get('[data-cy="active-labels-container"] [data-cy="status-label"]:visible')
    .contains(labelName)
    .parents('[data-cy="status-label"]')
    .find("button")
    .click()
    .then(() => {
      // Click the "Deactivate Status" option in the menu
      cy.get('ul li[role="menuitem"]').contains("Deactivate Status").click();

      // Confirm the deactivation action by clicking the "Deactivate Status" button
      cy.get("button").contains("Deactivate Status").click();

      // Wait for both the DELETE request (deactivating the status) and the GET request (reloading the status labels)
      return cy
        .wait(["@deactivateStatusLabel", "@getAllStatusLabels"])
        .spread((deactivateStatusLabel, getAllStatusLabels) => {
          // Return both responses as an object
          return {
            deactivatedStatusLabel: deactivateStatusLabel?.response?.body?.data,
            statusLabels: parseStatusLabels(
              getAllStatusLabels?.response?.body?.data
            ),
          };
        });
    });
});

function parseStatusLabels(statusLabels) {
  const { active, deactivated } = statusLabels?.reduce(
    (acc, curr) => {
      if (!!curr.deletedAt) {
        acc.deactivated.push(curr);
      } else {
        acc.active.push(curr);
      }
      return acc;
    },
    { active: [], deactivated: [] }
  );

  return { active, deactivated };
}

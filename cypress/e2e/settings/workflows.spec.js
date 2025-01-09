import instanceZUID from "../../../src/utility/instanceZUID";
import CONFIG from "../../../src/shell/app.config";
import {
  AUTHORIZED_ROLES,
  colorMenu,
} from "../../../src/apps/settings/src/app/views/User/Workflows/constants";

const TIMEOUT = { timeout: 60_000 };

const INSTANCE_API = `${
  CONFIG?.[process.env.NODE_ENV]?.API_INSTANCE_PROTOCOL
}${instanceZUID}${CONFIG?.[process.env.NODE_ENV]?.API_INSTANCE}`;

const FOCUSED_LABEL_COLOR = "rgba(253, 133, 58, 0.1)";

const ENDPOINTS = {
  userRoles: "**/v1/users/**/roles",
  instanceUserRoles: `**/v1/instances/**/users/roles`,
  allStatusLabels: "**/v1/env/labels?showDeleted=true",
  statusLabels: "**/v1/env/labels",
};

const RESTRICTED_USER = {
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

const EMPTY_SEARCH_TEXT = "xx_yy_zz_00";

const FORM_DATA = {
  create: {
    name: "Test__Create",
    description: "Test__Create Description",
    color: "Grey",
    addPermissionRoles: "Admin",
    removePermissionRoles: "Admin",
    allowPublish: true,
  },
  edit: {
    name: "Test__Edit",
    description: "Test__Edit Description",
    color: "Rose",
    addPermissionRoles: "Admin",
    removePermissionRoles: "Admin",
    allowPublish: false,
  },
  delete: {
    name: "Test__Delete",
    description: "Test__Delete Description",
    color: "Red",
    addPermissionRoles: [],
    removePermissionRoles: [],
    allowPublish: false,
  },
};

describe("Workflow Status Labels: Restricted User", () => {
  it("displays restricted access message and admin profiles", () => {
    cy.intercept("GET", ENDPOINTS?.userRoles, {
      statusCode: 200,
      body: RESTRICTED_USER,
    }).as("getRestrictedUser");
    cy.intercept("GET", ENDPOINTS?.instanceUserRoles).as(
      "getInstanceUserRoles"
    );

    cy.visit("/settings/user/workflows");
    cy.get('[data-cy="workflows-restricted-page"]', TIMEOUT);

    cy.wait("@getInstanceUserRoles")
      .its("response.body.data")
      .then((users) => {
        const authorizedUsers = users.filter((user) =>
          AUTHORIZED_ROLES.includes(user?.role?.systemRoleZUID)
        );
        cy.get('[data-cy="user-profile-container"] > *').should(
          "have.length",
          authorizedUsers.length
        );
      });
    cy.contains(LABELS?.restrictedPageHeader).should("exist");
    cy.contains(LABELS?.restrictedPageSubheader).should("exist");
    cy.get('[data-cy="restricted-image"]').should("exist");
  });
});

describe("Workflow Status Labels: Authorized User", () => {
  before(() => {
    cy.cleanTestData();
    cy.createTestData();
  });

  context("Workflow Page", () => {
    before(() => {
      cy.goToWorkflowsPage();
    });
    it("displays workflow page elements for authorized users", () => {
      cy.contains("Workflows").should("exist");
      cy.get("button").contains("Create Status").should("exist");
      cy.get('input[placeholder="Search Statuses"]').should("exist");
      cy.get('input[value="deactivated"]').should("exist");
    });

    it("Show Deactivated Labels: Displays active and deactivated sections", () => {
      cy.get('input[value="deactivated"]').click();
      cy.contains(LABELS.activeLabelsHeader).should("exist");
      cy.contains(LABELS.activeLabelsHeader).should("exist");
      cy.contains(LABELS.deactivatedLabelsHeader).should("exist");
      cy.contains(LABELS.deactivatedLabelsHeader).should("exist");
    });
  });

  context("Create New Status Label", { retries: 1 }, () => {
    before(() => {
      cy.goToWorkflowsPage();
    });

    it("Form Validation: should display error message when required fields are empty", function () {
      cy.get("button").contains("Create Status").click();
      const nameFieldErrorMessage = "Name is required";
      cy.get('[data-cy="status-label-submit-button"]').click();
      cy.contains(nameFieldErrorMessage).should("exist");
      cy.get("button").contains("Cancel").click();
    });

    it("Fills out and submits form", () => {
      cy.get("button").contains("Create Status").click();
      cy.intercept("POST", ENDPOINTS?.statusLabels).as("createStatusLabel");
      cy.intercept(ENDPOINTS.allStatusLabels).as("getAllStatusLabels");

      cy.get('input[name="name"]').type(FORM_DATA.create.name);
      cy.get('textarea[name="description"]').type(FORM_DATA.create.description);
      cy.get('input[name="color"]').parent().find("button").click();
      cy.get('ul li[role="option"]').contains(FORM_DATA.create.color).click();

      cy.get('input[name="addPermissionRoles"]')
        .parent()
        .find("button")
        .click();
      cy.get('ul li[role="option"]')
        .contains(FORM_DATA.create.addPermissionRoles)
        .click();
      cy.get('form[role="dialog"]').click();

      cy.get('input[name="removePermissionRoles"]')
        .parent()
        .find("button")
        .click();
      cy.get('ul li[role="option"]')
        .contains(FORM_DATA.create.removePermissionRoles)
        .click();
      cy.get('form[role="dialog"]').click();

      if (FORM_DATA.create.allowPublish) {
        cy.get('input[name="allowPublish"]').check();
      } else {
        cy.get('input[name="allowPublish"]').uncheck();
      }

      cy.get('[data-cy="status-label-submit-button"]').click();

      cy.wait(["@createStatusLabel", "@getAllStatusLabels"]).spread(
        (createStatusLabel, getAllStatusLabels) => {
          const createdStatusLabel = createStatusLabel?.response?.body?.data;
          const { active } = parseStatusLabels(
            getAllStatusLabels?.response?.body?.data
          );

          expect(createdStatusLabel).to.include({
            name: FORM_DATA.create.name,
            description: FORM_DATA.create.description,
            color: colorMenu.find(
              (color) => color?.label === FORM_DATA.create.color
            )?.value,
            allowPublish: FORM_DATA.create.allowPublish,
          });
          expect(createdStatusLabel.addPermissionRoles).to.have.lengthOf(1);
          expect(createdStatusLabel.removePermissionRoles).to.have.lengthOf(1);

          cy.get(
            '[data-cy="active-labels-container"] [data-cy="status-label"]'
          ).should("have.length", active.length);
        }
      );
      cy.wait(1500);
    });

    it("Highlights the newly created status label.", () => {
      cy.get('[data-cy="active-labels-container"] [data-cy="status-label"]')
        .contains(FORM_DATA.create.name, TIMEOUT)
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
    it("Open Status Label and Edit Details", { retries: 1 }, () => {
      cy.goToWorkflowsPage();
      cy.wait(1500);
      cy.get(
        '[data-cy="active-labels-container"] [data-cy="status-label"]',
        TIMEOUT
      )
        .last()
        .find('[data-cy="status-label-more-actions"]')
        .click();
      cy.get('[data-cy="menu-item-edit"]').click();

      cy.get("button").contains("Deactivate Status").should("be.enabled");

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
      cy.get("span.MuiChip-label")
        .contains(FORM_DATA.edit.removePermissionRoles)
        .parent()
        .find('svg[data-testid="CancelIcon"]')
        .click();
      cy.get('input[name="allowPublish"]').uncheck();

      cy.get('[data-cy="status-label-submit-button"]').click();

      cy.intercept("PUT", `${ENDPOINTS?.statusLabels}/**`).as(
        "editStatusLabel"
      );
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
      cy.goToWorkflowsPage();
    });

    it("Drag status label to a new position", { retries: 1 }, () => {
      const dataTransfer = new DataTransfer();

      cy.get(`[data-cy="status-label"]`)
        .find('[data-cy="status-label-drag-handle"]')
        .eq(0)
        .trigger("dragstart", { dataTransfer });

      cy.get(`[data-cy="status-label"]`)
        .find('[data-cy="status-label-drag-handle"]')
        .eq(1)
        .trigger("dragover", { dataTransfer })
        .trigger("drop", { dataTransfer });

      cy.intercept("PUT", ENDPOINTS.statusLabels).as("reorderStatusLabel");
      cy.intercept("GET", ENDPOINTS.allStatusLabels).as("getAllStatusLabels");

      cy.wait(["@reorderStatusLabel", "@getAllStatusLabels"]).spread(
        (reorderStatusLabel, getAllStatusLabels) => {
          const reorderedLabels = reorderStatusLabel?.request?.body?.data;
          const updatedLabel = getAllStatusLabels?.response?.body?.data;

          expect(reorderStatusLabel.response.statusCode).to.eq(200);
          expect(getAllStatusLabels.response.statusCode).to.eq(200);

          reorderedLabels.forEach((label) => {
            expect(
              updatedLabel.find((item) => item?.ZUID === label?.ZUID)?.sort
            ).to.eq(label.sort);
          });
        }
      );
    });
  });

  context("Deactivate Status Label", () => {
    it("Deactivate using menu options", { retries: 1 }, function () {
      cy.goToWorkflowsPage();
      cy.get(
        '[data-cy="active-labels-container"] [data-cy="status-label"]',
        TIMEOUT
      )
        .last()
        .find('[data-cy="status-label-more-actions"]')
        .click();
      cy.get('[data-cy="menu-item-deactivate"]').click();
      cy.get('[data-cy="deactivation-dialog-confirm-button"]').click();

      cy.intercept("DELETE", `${ENDPOINTS?.statusLabels}/**`).as(
        "deactivateStatusLabel"
      );
      cy.intercept("GET", ENDPOINTS.allStatusLabels).as("getAllStatusLabels");

      cy.wait(["@deactivateStatusLabel", "@getAllStatusLabels"]).spread(
        (deactivateStatusLabel, getAllStatusLabels) => {
          const deactivatedLabel = deactivateStatusLabel?.response?.body?.data;
          const { active, deactivated } = parseStatusLabels(
            getAllStatusLabels?.response?.body?.data
          );

          expect(active?.some((label) => label.ZUID === deactivatedLabel)).to.be
            .false;
          expect(deactivated?.some((label) => label.ZUID === deactivatedLabel))
            .to.be.true;
        }
      );

      cy.get(".notistack-Snackbar").contains(
        new RegExp(`Status De-activated:\\s*${FORM_DATA?.edit?.name}`)
      );
    });

    it("Deactivate using form button", { retries: 1 }, function () {
      cy.goToWorkflowsPage();
      cy.get(
        '[data-cy="active-labels-container"] [data-cy="status-label"]',
        TIMEOUT
      )
        .last()
        .find('[data-cy="status-label-more-actions"]')
        .click();
      cy.get('[data-cy="menu-item-edit"]').click();
      cy.get('[data-cy="form-deactivate-status-button"]').click();
      cy.get('[data-cy="deactivation-dialog-confirm-button"]').click();

      cy.intercept("DELETE", `${ENDPOINTS?.statusLabels}/**`).as(
        "deactivateStatusLabel"
      );
      cy.intercept("GET", ENDPOINTS.allStatusLabels).as("getAllStatusLabels");

      cy.wait(["@deactivateStatusLabel", "@getAllStatusLabels"]).spread(
        (deactivateStatusLabel, getAllStatusLabels) => {
          const deactivatedLabel = deactivateStatusLabel?.response?.body?.data;
          const { active, deactivated } = parseStatusLabels(
            getAllStatusLabels?.response?.body?.data
          );

          expect(active?.some((label) => label.ZUID === deactivatedLabel)).to.be
            .false;
          expect(deactivated?.some((label) => label.ZUID === deactivatedLabel))
            .to.be.true;
        }
      );

      cy.get(".notistack-Snackbar").contains(
        new RegExp(`Status De-activated:\\s*${FORM_DATA?.delete?.name}`)
      );
    });
  });

  context("Filter Active and Deactivated Status Labels", () => {
    before(() => {
      cy.getStatusLabels().then((data) =>
        cy.wrap(data).as("activeDeactivatedStatusLabels")
      );
      cy.goToWorkflowsPage();
      cy.get('input[value="deactivated"]').click();
    });

    it("Displays active/deactivated status labels", function () {
      const { active, deactivated } = this.activeDeactivatedStatusLabels || {};
      cy.get(
        '[data-cy="active-labels-container"] [data-cy="status-label"]'
      ).should("have.length", active?.length);
      cy.get(
        '[data-cy="deactivated-labels-container"] [data-cy="status-label"]'
      ).should("have.length", deactivated?.length);
    });

    it("Displays Error page when search results returns empty", () => {
      cy.get('input[placeholder="Search Statuses"]')
        .clear()
        .type(EMPTY_SEARCH_TEXT);
      cy.get(
        '[data-cy="active-labels-container"], [data-cy="deactivated-labels-container"]'
      ).should("not.exist");
      cy.get('[data-cy="no-results-page"]').should("exist");
    });

    it("Clears and focuses search field when clicking 'Search Again'", () => {
      cy.get("button").contains("Search Again").click();
      cy.get(
        '[data-cy="active-labels-container"], [data-cy="deactivated-labels-container"]'
      ).should("exist");
      cy.get('[data-cy="no-results-page"]').should("not.exist");
      cy.get('input[placeholder="Search Statuses"]').should("be.empty");
    });
  });
});

Cypress.Commands.add("goToWorkflowsPage", () => {
  cy.visit("/settings/user/workflows");
  cy.get('[data-cy="workflows-authorized-page"]', TIMEOUT);
});

Cypress.Commands.add("cleanTestData", () => {
  const defaultLabelsZuid = [
    "36-14b315-d24ft",
    "36-n33d5-23v13w",
    "36-14b315-4pp20v3d",
  ];

  cy.apiRequest({ url: `${INSTANCE_API}/env/labels?showDeleted=true` }).then(
    (response) => {
      response?.data
        ?.filter(
          (label) =>
            !label?.deletedAt && !defaultLabelsZuid.includes(label?.ZUID)
        )
        .forEach((label) => {
          cy.apiRequest({
            url: `${INSTANCE_API}/env/labels/${label.ZUID}`,
            method: "DELETE",
          });
        });
    }
  );
});

Cypress.Commands.add("createTestData", () => {
  cy.apiRequest({
    url: `${INSTANCE_API}/env/labels`,
    method: "POST",
    body: {
      ...FORM_DATA?.delete,
      color: colorMenu.find((color) => color?.label === FORM_DATA.delete.color)
        ?.value,
    },
  });
});

Cypress.Commands.add("getStatusLabels", () => {
  return cy
    .apiRequest({
      url: `${INSTANCE_API}/env/labels?showDeleted=true`,
    })
    .then((response) => {
      return {
        ...parseStatusLabels(response?.data),
      };
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

import { colorMenu } from "../../../src/shell/services/types";

const FOCUSED_LABEL_COLOR = "rgba(253, 133, 58, 0.1)";

const API_ENDPOINTS = {
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
    name: "Test Status Label",
    description: "Test Status Label Description",
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
};

describe("Workflow Status Labels: Restricted User", () => {
  it("displays restricted access message and admin profiles", () => {
    cy.intercept("GET", API_ENDPOINTS?.userRoles, {
      statusCode: 200,
      body: {
        ...USER_ROLES?.restricted,
      },
    }).as("getRestrictedUser");

    cy.intercept("GET", API_ENDPOINTS?.instanceUserRoles).as(
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
          ["Owner", "Admin"].includes(user?.role?.name)
        );
        cy.get('[data-cy="user-profile-container"]')
          .children()
          .its("length")
          .should("eq", authorizedUsers.length);
      });
  });
});

describe("Workflow Status Labels: Authorized User", () => {
  context("Workflow Page", () => {
    before(() => {
      cy.visit("/settings/user/workflows");
    });
    it("displays workflow page elements for authorized users", () => {
      cy.visit("/settings/user/workflows");
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
      cy.intercept("GET", API_ENDPOINTS.allStatusLabels).as(
        "getAllStatusLabels"
      );

      cy.visit("/settings/user/workflows");
      cy.wait(["@getAllStatusLabels"]);

      cy.get("button").contains("Create Status").click();
    });

    it("Form Validation: should display error message when required fields are empty", () => {
      const nameFieldErrorMessage = "Name is required";
      cy.get('[data-cy="status-label-submit-button"]').click();
      cy.contains(nameFieldErrorMessage).should("exist");
    });
    it("Fills out and submits form", () => {
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
      cy.get('input[name="allowPublish"]').check();

      cy.get('[data-cy="status-label-submit-button"]').click();

      cy.intercept("POST", API_ENDPOINTS?.statusLabels).as("createStatusLabel");

      cy.wait("@createStatusLabel").then(({ response }) => {
        const responseData = response?.body?.data;
        expect(response?.statusCode).to.be.ok;
        expect(responseData.name).to.equal(FORM_DATA.create.name);
        expect(responseData.description).to.equal(FORM_DATA.create.description);
        expect(responseData.color).to.equal(
          colorMenu.find((color) => color?.label === FORM_DATA.create.color)
            ?.value
        );
        expect(responseData.addPermissionRoles).to.have.lengthOf(1);
        expect(responseData.removePermissionRoles).to.have.lengthOf(1);
        expect(responseData.allowPublish).to.be.true;
      });
    });
    it("Shows the newly created label and focuses it", () => {
      cy.get('[data-cy="active-labels-container"] [data-cy="status-label"]')
        .last()
        .should("have.css", "background-color", FOCUSED_LABEL_COLOR);
    });

    it("Clicking outside the focused label restores it to its default state.", () => {
      cy.get('[data-cy="active-labels-container"] [data-cy="status-label"]')
        .eq(1)
        .click();
      cy.get('[data-cy="active-labels-container"] [data-cy="status-label"]')
        .last()
        .should("not.have.css", "background-color", FOCUSED_LABEL_COLOR);
    });
  });

  context("Edit Status Label", () => {
    it("Open Status Label and Edit Details", () => {
      cy.intercept("PUT", `${API_ENDPOINTS?.statusLabels}/**`).as(
        "editStatusLabel"
      );
      cy.intercept("GET", API_ENDPOINTS.allStatusLabels).as(
        "getAllStatusLabels"
      );

      cy.visit("/settings/user/workflows");

      cy.wait("@getAllStatusLabels").then((interception) => {
        cy.wrap(interception.response.body.data).as("statusLabels");
      });

      cy.get(
        '[data-cy="active-labels-container"] [data-cy="status-label"]:visible'
      )
        .last()
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
    it("Drag status label to a new position", () => {
      cy.intercept("PUT", API_ENDPOINTS.statusLabels).as("reorderStatusLabel");
      cy.intercept("GET", API_ENDPOINTS.allStatusLabels).as(
        "getAllStatusLabels"
      );

      cy.visit("/settings/user/workflows");
      cy.wait("@getAllStatusLabels").then((interception) => {
        cy.wrap(interception.response.body.data).as("oldStatusLabels");
      });

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

      cy.wait("@reorderStatusLabel")
        .its("response.statusCode")
        .should("eq", 200);
    });
  });

  context("Deactivate Status Label", () => {
    it("opens deactivation dialog and connfirms deactivation", () => {
      cy.intercept("DELETE", `${API_ENDPOINTS?.statusLabels}/**`).as(
        "deactivateStatusLabel"
      );

      cy.intercept("GET", API_ENDPOINTS.allStatusLabels).as(
        "getAllStatusLabels"
      );

      cy.visit("/settings/user/workflows");
      cy.wait("@getAllStatusLabels").then((interception) => {
        cy.wrap(interception.response.body.data).as("oldStatusLabels");
      });

      cy.get(
        '[data-cy="active-labels-container"] [data-cy="status-label"]:visible'
      )
        .last()
        .find("button")
        .click();

      cy.get('ul li[role="menuitem"]').contains("Deactivate Status").click();
      cy.get('[data-cy="deactivation-dialog"]').should("exist");
      cy.get("h5").contains(`Deactivate Status`).should("exist");
      cy.get("h5").contains(FORM_DATA?.edit?.name).should("exist");

      cy.get("button").contains("Cancel").should("exist");
      cy.get("button").contains("Deactivate Status").should("exist");

      cy.get("button").contains("Deactivate Status").click();

      cy.wait(["@deactivateStatusLabel", "@getAllStatusLabels"]).spread(
        (deactivateStatusLabel, newStatusLabels) => {
          const targetLabelZUID = deactivateStatusLabel.response.body.data;

          expect(deactivateStatusLabel.response.statusCode).to.eq(200);
          expect(newStatusLabels.response.statusCode).to.eq(200);

          cy.get("@oldStatusLabels").then((oldStatusLabels) => {
            const oldLabelCount = oldStatusLabels.filter(
              (label) => !label?.deletedAt
            ).length;
            cy.get(".notistack-Snackbar")
              .contains(`Status De-activated`)
              .should("exist");
            cy.get(".notistack-Snackbar")
              .contains(FORM_DATA?.edit?.name)
              .should("exist");
            cy.get(
              '[data-cy="active-labels-container"] [data-cy="status-label"]:visible'
            ).should("have.length", oldLabelCount - 1);
          });
        }
      );
    });
  });
});

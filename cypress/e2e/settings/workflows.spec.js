const FOCUSED_LABEL_COLOR = "rgba(253, 133, 58, 0.1)";

const ENDPOINTS = {
  userRole: "**/v1/users/**/roles",
  instanceUsers: `**/v1/instances/**/users/roles`,
  workflowStatusLabels: "**/v1/env/labels?showDeleted=true",
  createStatusLabel: "/v1/env/labels",
};
const USERS_ROLE_RESTRICTED = {
  data: [
    {
      ZUID: "30-86f8ccec82-swp72s",
      entityZUID: "8-f48cf3a682-7fthvk",
      name: "Developer",
      systemRoleZUID: "31-71cfc74-4dm13",
      systemRole: {
        ZUID: "31-71cfc74-4dm13",
        name: "Developer",
      },
    },
    {
      ZUID: "30-949785e98a-230bxj",
      entityZUID: "8-e486ecc489-tvdpvb",
      name: "Contributor",
      systemRoleZUID: "31-71cfc74-c0ntr1b0t0r",
      systemRole: {
        ZUID: "31-71cfc74-c0ntr1b0t0r",
        name: "Contributor",
      },
    },
  ],
};
const USERS_ROLE_AUTORIZED = {
  data: [
    {
      ZUID: "30-86f8ccec82-swp72s",
      entityZUID: "8-f48cf3a682-7fthvk",
      name: "Admin",
      systemRoleZUID: "31-71cfc74-4dm13",
      systemRole: {
        ZUID: "31-71cfc74-4dm13",
        name: "Admin",
      },
    },
    {
      ZUID: "30-949785e98a-230bxj",
      entityZUID: "8-e486ecc489-tvdpvb",
      name: "Contributor",
      systemRoleZUID: "31-71cfc74-c0ntr1b0t0r",
      systemRole: {
        ZUID: "31-71cfc74-c0ntr1b0t0r",
        name: "Contributor",
      },
    },
  ],
};
const INSTANCE_USERS = {
  data: [
    {
      ZUID: "5-44ccc74-xxxxxxx",
      firstName: "Test",
      lastName: "User-1",
      email: "Test@User1.io",
      role: {
        ZUID: "30-88a0ead882-xxxxxxx",
        entityZUID: "8-f48cf3a682-xxxxxxx",
        name: "Owner",
      },
    },
    {
      ZUID: "5-57801f6-zzzzzz",
      firstName: "Test",
      lastName: "User-2",
      email: "Test.blair@User2.io",
      role: {
        ZUID: "30-fcb3fc9083-zzzzzz",
        entityZUID: "8-f48cf3a682-zzzzzz",
        name: "Admin",
      },
    },
    {
      ZUID: "5-84d1e6d4ae-yyyyyy",
      firstName: "Test",
      lastName: "User-3",
      email: "Test.galindo@User3.io",
      role: {
        ZUID: "30-86f8ccec82-yyyyyy",
        entityZUID: "8-f48cf3a682-yyyyyy",
        name: "Admin",
      },
    },
  ],
};
const WORKFLOW_STATUS_LABELS = {
  data: [
    {
      ZUID: "status-1",
      name: "In Review",
      description: "Content is being reviewed",
      color: "#F04438",
      sort: 1,
      deletedAt: null,
      allowPublish: true,
      addPermissionRoles: ["role-1"],
      removePermissionRoles: ["role-1"],
    },
    {
      ZUID: "status-2",
      name: "Approved",
      description: "Content has been approved",
      color: "#12B76A",
      sort: 2,
      deletedAt: null,
      allowPublish: true,
      addPermissionRoles: [],
      removePermissionRoles: [],
    },
    {
      ZUID: "status-3",
      name: "Archived",
      description: "Archived content",
      color: "#7A5AF8",
      sort: 3,
      deletedAt: "2024-03-15",
      allowPublish: false,
      addPermissionRoles: [],
      removePermissionRoles: [],
    },
  ],
};
const CREATE_STATUS_LABEL_RESPONSE_DATA = {
  ZUID: "status-4",
  name: "Test Label",
  description: "Test Label Description",
  color: "#F79009",
  sort: 4,
  allowPublish: true,
  addPermissionRoles: ["30-86f8ccec82-swp72s"],
  removePermissionRoles: ["30-86f8ccec82-swp72s"],
};
const EDIT_STATUS_LABEL_DATA = {
  ZUID: "status-4",
  name: "Pending Approval",
  description: "Pending Approval Description",
  color: "#EE46BC",
  sort: 4,
  allowPublish: false,
  addPermissionRoles: [],
  removePermissionRoles: [],
};

describe("Workflow Status Labels", () => {
  context("Restricted User", () => {
    before(() => {
      //RESTRICTED USER
      cy.intercept("GET", ENDPOINTS?.userRole, {
        statusCode: 200,
        body: {
          ...USERS_ROLE_RESTRICTED,
        },
      }).as("getRestrictedUser");
      // INSTANCE USERS
      cy.intercept("GET", ENDPOINTS?.instanceUsers, {
        statusCode: 200,
        body: {
          ...INSTANCE_USERS,
        },
      }).as("getInstanceUsers");
    });
    it("displays restricted access message and admin profiles", () => {
      cy.visit("/settings/user/workflows");
      cy.wait("@getRestrictedUser");
      cy.wait("@getInstanceUsers");
      cy.contains("You need permission to view and edit workflows").should(
        "exist"
      );
      cy.contains(
        "Contact the instance owner or administrators listed below to upgrade your role to Admin or Owner"
      ).should("exist");
      cy.get('[data-cy="restricted-image"]').should("exist");
    });

    it("Should display 3 admin profiles", () => {
      cy.get(
        '[data-cy="user-profile-container"] [data-cy="user-profile"]'
      ).should("have.length", 3);
    });
  });

  context("Authorized User", () => {
    before(() => {
      cy.intercept("GET", ENDPOINTS?.userRole, {
        statusCode: 200,
        body: {
          ...USERS_ROLE_AUTORIZED,
        },
      }).as("getAuthorizedUser");
      cy.intercept("GET", ENDPOINTS.workflowStatusLabels, {
        statusCode: 200,
        body: {
          ...WORKFLOW_STATUS_LABELS,
        },
      }).as("getWorkflowLabels");
    });
    it("displays workflow page elements", () => {
      cy.visit("/settings/user/workflows");
      cy.wait(["@getAuthorizedUser", "@getWorkflowLabels"]);
      cy.contains("Workflows").should("exist");
      cy.get("button").contains("Create Status").should("exist");
      cy.get('input[placeholder="Search Statuses"]').should("exist");
      cy.get('input[value="deactivated"]').should("exist");
    });

    it("Should display 2 active status labels", () => {
      cy.get(
        '[data-cy="active-labels-container"] [data-cy="status-label"]:visible'
      ).should("have.length", 2);
    });

    context("Show Deactivated Labels", () => {
      it("displays correct headings and labels", () => {
        cy.get('input[value="deactivated"]').click();
        cy.get('input[value="deactivated"]').should("be.checked");
        cy.contains("Active Statuses").should("exist");
        cy.contains("Deactivated Statuses").should("exist");
        cy.contains(
          "Active statuses are available to be added and removed from content items"
        ).should("exist");
        cy.contains(
          "These statuses can be re-activated at any time if you would like to add or remove them from content items"
        ).should("exist");
      });
      it("Should display 2 active status labels", () => {
        cy.get(
          '[data-cy="active-labels-container"] [data-cy="status-label"]:visible'
        ).should("have.length", 2);
      });

      it("Should display 1 deactivated status labels", () => {
        cy.get(
          '[data-cy="deactivated-labels-container"] [data-cy="status-label"]:visible'
        ).should("have.length", 1);
      });
    });
    context("Search Functionality", () => {
      it("filters active and deactivated labels", () => {
        cy.get('[data-cy="status-label-search-box"] input').type("approved");
        cy.get(
          '[data-cy="active-labels-container"] [data-cy="status-label"]:visible'
        ).should("have.length", 1);
        cy.get(
          '[data-cy="deactivated-labels-container"] [data-cy="status-label"]:visible'
        ).should("have.length", 0);

        cy.get('[data-cy="status-label-search-box"] input').clear();
        cy.get('[data-cy="status-label-search-box"] input').type("archived");
        cy.get(
          '[data-cy="active-labels-container"] [data-cy="status-label"]:visible'
        ).should("have.length", 0);
        cy.get(
          '[data-cy="deactivated-labels-container"] [data-cy="status-label"]:visible'
        ).should("have.length", 1);
      });

      it("handles no results and reset", () => {
        cy.get('[data-cy="status-label-search-box"] input').clear();
        cy.get('[data-cy="status-label-search-box"] input').type("xxxxxx");
        cy.get('[data-cy="no-results-page"]').should("exist");
        cy.get("button").contains("Search Again").click();

        cy.get('[data-cy="no-results-page"]').should("not.exist");
        cy.get(
          '[data-cy="active-labels-container"] [data-cy="status-label"]:visible'
        ).should("have.length", 2);
        cy.get(
          '[data-cy="deactivated-labels-container"] [data-cy="status-label"]:visible'
        ).should("have.length", 1);
        cy.get('input[placeholder="Search Statuses"]')
          .should("have.value", "")
          .and("have.focus");
      });
    });
  });

  context("Create Status Label", () => {
    before(() => {
      cy.get("button").contains("Create Status").click();
    });
    it("displays form with all fields", () => {
      cy.get('form[role="dialog"]').should("exist");
      cy.get('input[name="name"]').should("exist");
      cy.get('textarea[name="description"]').should("exist");
      cy.get('input[name="color"]').should("exist");
      cy.get('input[name="addPermissionRoles"]').should("exist");
      cy.get('input[name="removePermissionRoles"]').should("exist");
      cy.get('input[name="allowPublish"]').should("exist");
      cy.get("button").contains("Cancel").should("exist");
      cy.get("button").contains("Create Status").should("exist");
    });

    it("fills out and submits form", () => {
      cy.get('input[name="name"]').type("Test Label");
      cy.get('textarea[name="description"]').type("Test Label Description");
      cy.get('input[name="color"]').parent().find("button").click();
      cy.get('ul li[role="option"]').contains("Yellow").click();
      cy.get('input[name="addPermissionRoles"]')
        .parent()
        .find("button")
        .click();
      cy.get('ul li[role="option"]').contains("Admin").click();
      cy.get('form[role="dialog"]').click();
      cy.get('input[name="removePermissionRoles"]')
        .parent()
        .find("button")
        .click();
      cy.get('ul li[role="option"]').contains("Admin").click();
      cy.get('form[role="dialog"]').click();
      cy.get('input[name="allowPublish"]').click();
    });

    it("submits form and verifies request data", () => {
      cy.intercept("POST", ENDPOINTS?.createStatusLabel, {
        statusCode: 200,
        body: {
          data: CREATE_STATUS_LABEL_RESPONSE_DATA,
        },
      }).as("createStatusLabel");
      cy.intercept("GET", ENDPOINTS?.workflowStatusLabels, {
        statusCode: 200,
        body: {
          data: [
            ...WORKFLOW_STATUS_LABELS.data,
            { ...CREATE_STATUS_LABEL_RESPONSE_DATA },
          ],
        },
      }).as("getWorkflowLabels");

      cy.get('[data-cy="create-status-label-submit-button"]').click();

      cy.wait("@createStatusLabel").then((interception) => {
        const { ZUID, sort, ...reqData } = CREATE_STATUS_LABEL_RESPONSE_DATA;
        console.log("interception.request.body:", {
          req: interception.request.body,
          DATA: reqData,
        });
        expect(interception.request.body).to.deep.equal(reqData);
      });
      cy.wait("@getWorkflowLabels");
    });

    it("Shows the newly created label and focuses it", () => {
      cy.get(
        '[data-cy="active-labels-container"] [data-cy="status-label"]:visible'
      ).should("have.length", 3);

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
    it(`opens edit form and verifies pre-filled data`, () => {
      // const label = WORKFLOW_STATUS_LABELS.data[0];
      cy.get(
        '[data-cy="active-labels-container"] [data-cy="status-label"]:visible'
      )
        .last()
        .find("button")
        .click();
      cy.get('ul li[role="menuitem"]').contains("Edit Status").click();
      cy.get('input[name="name"]').should(
        "have.value",
        CREATE_STATUS_LABEL_RESPONSE_DATA?.name
      );
      cy.get('textarea[name="description"]').should(
        "have.value",
        CREATE_STATUS_LABEL_RESPONSE_DATA?.description
      );
      cy.get('input[name="color"]').should(
        "have.value",
        CREATE_STATUS_LABEL_RESPONSE_DATA?.color
      );
      cy.get('input[name="addPermissionRoles"]').should(
        "have.value",
        CREATE_STATUS_LABEL_RESPONSE_DATA?.addPermissionRoles.join(", ")
      );
      cy.get('input[name="removePermissionRoles"]').should(
        "have.value",
        CREATE_STATUS_LABEL_RESPONSE_DATA?.removePermissionRoles.join(", ")
      );
      cy.get('input[name="allowPublish"]').should(
        !!CREATE_STATUS_LABEL_RESPONSE_DATA?.allowPublish
          ? "be.checked"
          : "not.be.checked"
      );
    });
    it("Deactivation button should be visible and enabled", () => {
      cy.get("button")
        .contains("Deactivate Status")
        .should("exist")
        .and("be.enabled");
    });

    it("verifies edited request data and apply changes to form", () => {
      cy.intercept(
        "PUT",
        `${ENDPOINTS?.createStatusLabel}/${EDIT_STATUS_LABEL_DATA?.ZUID}`,
        {
          statusCode: 200,
          body: {
            data: EDIT_STATUS_LABEL_DATA?.ZUID,
          },
        }
      ).as("editStatusLabel");
      cy.intercept("GET", ENDPOINTS?.workflowStatusLabels, {
        statusCode: 200,
        body: {
          data: [...WORKFLOW_STATUS_LABELS.data, { ...EDIT_STATUS_LABEL_DATA }],
        },
      }).as("getWorkflowLabels");

      cy.get('input[name="name"]').clear();
      cy.get('input[name="name"]').type(EDIT_STATUS_LABEL_DATA.name);
      cy.get('textarea[name="description"]').clear();
      cy.get('textarea[name="description"]').type(
        EDIT_STATUS_LABEL_DATA.description
      );
      cy.get('input[name="color"]').parent().find("button").click();
      cy.get('ul li[role="option"]').contains("Pink").click();
      cy.get("span.MuiChip-label")
        .contains("Admin")
        .parent()
        .find('svg[data-testid="CancelIcon"]')
        .click();
      cy.get('form[role="dialog"]').click();
      cy.get("span.MuiChip-label")
        .contains("Admin")
        .parent()
        .find('svg[data-testid="CancelIcon"]')
        .click();
      cy.get('form[role="dialog"]').click();
      cy.get('input[name="allowPublish"]').click();
      cy.get('[data-cy="create-status-label-submit-button"]').click();
      cy.wait("@editStatusLabel").then((interception) => {
        const { ZUID, sort, ...reqData } = EDIT_STATUS_LABEL_DATA;
        expect(interception.request.body).to.deep.equal(reqData);
      });
      cy.wait("@getWorkflowLabels");
    });
  });

  context("Deactivate Status Label", () => {
    it("opens deactivation dialog and verifies elements", () => {
      cy.get(
        '[data-cy="active-labels-container"] [data-cy="status-label"]:visible'
      )
        .last()
        .find("button")
        .click();

      cy.get('ul li[role="menuitem"]').contains("Deactivate Status").click();
      cy.get('[data-cy="deactivation-dialog"]').should("exist");
      cy.get("h5").contains(`Deactivate Status`).should("exist");
      cy.get("h5").contains(EDIT_STATUS_LABEL_DATA?.name).should("exist");

      cy.get("button").contains("Cancel").should("exist");
      cy.get("button").contains("Deactivate Status").should("exist");
    });
    it("deactivates status label and verifies request", () => {
      cy.intercept(
        "DELETE",
        `${ENDPOINTS?.createStatusLabel}/${EDIT_STATUS_LABEL_DATA?.ZUID}`,
        {
          statusCode: 200,
          body: {},
        }
      ).as("deactivateStatusLabel");
      cy.intercept("GET", ENDPOINTS?.workflowStatusLabels, {
        statusCode: 200,
        body: {
          data: [
            ...WORKFLOW_STATUS_LABELS.data,
            {
              ...EDIT_STATUS_LABEL_DATA,
              deletedAt: new Date().toISOString(),
            },
          ],
        },
      }).as("getWorkflowLabels");
      cy.get("button").contains("Deactivate Status").click();
      cy.wait("@deactivateStatusLabel").then((interception) => {
        expect(interception.request.url).to.include(
          `${ENDPOINTS?.createStatusLabel}/${EDIT_STATUS_LABEL_DATA?.ZUID}`
        );
      });

      cy.wait("@getWorkflowLabels");
    });
    it("Snackbar should show the success message with the label name", () => {
      cy.get(".notistack-Snackbar")
        .contains(`Status De-activated`)
        .should("exist");
      cy.get(".notistack-Snackbar")
        .contains(EDIT_STATUS_LABEL_DATA?.name)
        .should("exist");
    });
    it("Labels should now show 2 active and 2 deactivated labels", () => {
      cy.get(
        '[data-cy="active-labels-container"] [data-cy="status-label"]:visible'
      ).should("have.length", 2);

      cy.get(
        '[data-cy="deactivated-labels-container"] [data-cy="status-label"]:visible'
      ).should("have.length", 2);
    });
  });
});

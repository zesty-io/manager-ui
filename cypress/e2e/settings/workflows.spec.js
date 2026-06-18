import instanceZUID from "../../../src/utility/instanceZUID";
import CONFIG from "../../../src/shell/app.config";
import {
  AUTHORIZED_ROLES,
  colorMenu,
} from "../../../src/apps/settings/src/app/views/User/Workflows/constants";

const TIMEOUT = { timeout: 40_000 };

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

const TEST_DATA = {
  new: {
    name: "Test__new",
    description: "Test__new Description",
    color: "Grey",
    addPermissionRoles: "Admin",
    removePermissionRoles: "Admin",
    allowPublish: true,
  },
  edited: {
    name: "Test__edited",
    description: "Test__edited Description",
    color: "Pink",
    addPermissionRoles: [],
    removePermissionRoles: [],
    allowPublish: true,
  },
  temp1: {
    name: "Test__temp1",
    description: "Test__temp1 Description",
    color: "Red",
    addPermissionRoles: [],
    removePermissionRoles: [],
    allowPublish: false,
  },
  temp2: {
    name: "Test__temp2",
    description: "Test__temp2 Description",
    color: "Yellow",
    addPermissionRoles: [],
    removePermissionRoles: [],
    allowPublish: false,
  },
  temp3: {
    name: "Test__temp3",
    description: "Test__temp3 Description",
    color: "Purple",
    addPermissionRoles: [],
    removePermissionRoles: [],
    allowPublish: false,
  },
};

before(() => {
  cy.cleanTestData();
  cy.createTestData();
  // Under CI load the POSTs can be slow and the page may load from IndexedDB
  // cache before they complete — confirm the labels are visible before tests start
  cy.goToWorkflowsPage();
  cy.contains(TEST_DATA.temp1.name, TIMEOUT).should("exist");
  cy.contains(TEST_DATA.temp2.name, TIMEOUT).should("exist");
  cy.contains(TEST_DATA.temp3.name, TIMEOUT).should("exist");
});

after(() => {
  cy.cleanTestData();
});

describe("Restricted User", { retries: 1 }, () => {
  it("displays restricted access message and admin profiles", () => {
    cy.intercept("GET", ENDPOINTS?.userRoles, {
      statusCode: 200,
      body: RESTRICTED_USER,
    }).as("getRestrictedUser");
    cy.intercept("GET", ENDPOINTS?.instanceUserRoles).as(
      "getInstanceUserRoles"
    );

    cy.visit("/settings/user/workflows");
    cy.getBySelector("workflows-restricted-page");

    cy.wait("@getInstanceUserRoles")
      .its("response.body.data")
      .then((users) => {
        const authorizedUsers = users.filter((user) =>
          AUTHORIZED_ROLES.includes(user?.role?.systemRoleZUID)
        );
        cy.getBySelector("user-profile-container")
          .children()
          .should("have.length", authorizedUsers.length);
      });
    cy.contains(LABELS?.restrictedPageHeader).should("exist");
    cy.contains(LABELS?.restrictedPageSubheader).should("exist");
    cy.getBySelector("restricted-image").should("exist");
  });
});

describe("Authorized User", { retries: 1 }, () => {
  it("displays workflow page elements for authorized users", () => {
    cy.goToWorkflowsPage();
    cy.getBySelector("active-labels-container");

    cy.contains("Workflows").should("exist");
    cy.get("button").contains("Create Status").should("exist");
    cy.get('input[placeholder="Search Statuses"]').should("exist");
    cy.get('input[value="deactivated"]').should("exist");
  });

  it("Show Deactivated Labels: Displays active and deactivated sections", () => {
    cy.get('input[value="deactivated"]').click();
    cy.contains(LABELS.activeLabelsHeader).should("exist");
    cy.contains(LABELS.deactivatedLabelsHeader).should("exist");
  });
});

describe("Create New Status Label", { retries: 1 }, () => {
  it("Form Validation: should display error message when required fields are empty", function () {
    cy.get("button").contains("Create Status").click(TIMEOUT);

    cy.getBySelector("status-label-form");

    const nameFieldErrorMessage = "Name is required";
    cy.getBySelector("status-label-submit-button").click();
    cy.contains(nameFieldErrorMessage).should("exist");
    cy.get("button").contains("Cancel").click();
  });

  it("Fills out and submits form", () => {
    cy.get("button").contains("Create Status").click(TIMEOUT);

    cy.getBySelector("status-label-form");

    cy.get('input[name="name"]').type(TEST_DATA.new.name);
    cy.get('textarea[name="description"]').type(TEST_DATA.new.description);
    cy.get('input[name="color"]').parent().find("button").click();
    cy.get('ul li[role="option"]').contains(TEST_DATA.new.color).click();

    cy.get('input[name="addPermissionRoles"]').parent().find("button").click();
    cy.get('ul li[role="option"]')
      .contains(TEST_DATA.new.addPermissionRoles)
      .click();
    cy.get('form[role="dialog"]').click();

    cy.get('input[name="removePermissionRoles"]')
      .parent()
      .find("button")
      .click();
    cy.get('ul li[role="option"]')
      .contains(TEST_DATA.new.removePermissionRoles)
      .click();
    cy.get('form[role="dialog"]').click();

    if (TEST_DATA.new.allowPublish) {
      cy.get('input[name="allowPublish"]').check();
    } else {
      cy.get('input[name="allowPublish"]').uncheck();
    }

    cy.intercept("POST", ENDPOINTS?.statusLabels).as("createStatusLabel");
    cy.intercept(ENDPOINTS.allStatusLabels).as("getAllStatusLabels");

    cy.getBySelector("status-label-submit-button").click();

    cy.wait(["@createStatusLabel", "@getAllStatusLabels"], TIMEOUT).spread(
      (createStatusLabel, getAllStatusLabels) => {
        const createdStatusLabel = createStatusLabel?.response?.body?.data;
        const { active } = parseStatusLabels(
          getAllStatusLabels?.response?.body?.data
        );

        expect(createdStatusLabel).to.include({
          name: TEST_DATA.new.name,
          description: TEST_DATA.new.description,
          color: colorMenu.find((color) => color?.label === TEST_DATA.new.color)
            ?.value,
          allowPublish: TEST_DATA.new.allowPublish,
        });
        expect(createdStatusLabel.addPermissionRoles).to.have.lengthOf(1);
        expect(createdStatusLabel.removePermissionRoles).to.have.lengthOf(1);

        cy.getBySelector("active-labels-container").within(() => {
          cy.getBySelector("status-label").should("have.length", active.length);
        });
      }
    );
  });

  it("Highlights the newly created status label.", () => {
    cy.getBySelector("active-labels-container")
      .contains(TEST_DATA.new.name)
      .parents('[data-cy="status-label"]')
      .should("have.css", "background-color", FOCUSED_LABEL_COLOR, TIMEOUT);
  });

  it("Clicking outside the focused label restores it to its default state.", () => {
    cy.getBySelector("active-labels-container").click();
    cy.getBySelector("active-labels-container")
      .contains(TEST_DATA.new.name)
      .parents('[data-cy="status-label"]')
      .should("not.have.css", "background-color", FOCUSED_LABEL_COLOR);
  });
});

describe("Edit Status Label", { retries: 1 }, () => {
  it("Open Status Label and Edit Details", () => {
    cy.getBySelector("active-labels-container");

    cy.getBySelector("active-labels-container")
      .contains(TEST_DATA?.temp1?.name)
      .parents('[data-cy="status-label"]')
      .within(() => {
        cy.getBySelector("status-label-more-actions").click({ force: true });
      });

    cy.getBySelector("menu-item-edit").click({ force: true });

    cy.getBySelector("status-label-form");

    cy.get("button").contains("Deactivate Status").should("be.enabled");

    cy.get('input[name="name"]').clear().type(TEST_DATA.edited.name);

    cy.get('textarea[name="description"]')
      .clear()
      .type(TEST_DATA.edited.description);

    cy.get('input[name="color"]').parent().find("button").click();
    cy.get('ul li[role="option"]').contains(TEST_DATA.edited.color).click();

    cy.intercept("PUT", `${ENDPOINTS?.statusLabels}/**`).as("editStatusLabel");
    cy.intercept(ENDPOINTS.allStatusLabels).as("getAllStatusLabels");

    cy.getBySelector("status-label-submit-button").click();

    cy.wait(["@editStatusLabel", "@getAllStatusLabels"], TIMEOUT).spread(
      (editStatusLabel, getAllStatusLabels) => {
        const targetLabelZUID = editStatusLabel.response.body.data;
        const updatedLabel = getAllStatusLabels.response.body.data.find(
          (label) => label.ZUID === targetLabelZUID
        );

        expect(editStatusLabel.response.statusCode).to.eq(200);
        expect(getAllStatusLabels.response.statusCode).to.eq(200);
        expect(updatedLabel).to.deep.include({
          name: TEST_DATA.edited.name,
          description: TEST_DATA.edited.description,
          color: colorMenu.find(
            (color) => color?.label === TEST_DATA.edited.color
          )?.value,
        });
      }
    );
  });
});

describe("Re-order Status Labels", { retries: 1 }, () => {
  it("Drag status label to a new position", () => {
    const dataTransfer = new DataTransfer();

    cy.getBySelector("active-labels-container");

    cy.intercept("PUT", ENDPOINTS.statusLabels).as("reorderStatusLabel");
    cy.intercept("GET", ENDPOINTS.allStatusLabels).as("getAllStatusLabels");

    cy.getBySelector("status-label-drag-handle")
      .eq(0)
      .trigger("dragstart", { dataTransfer });

    cy.getBySelector("status-label-drag-handle")
      .eq(1)
      .trigger("dragover", { dataTransfer })
      .trigger("drop", { dataTransfer });

    cy.wait(["@reorderStatusLabel", "@getAllStatusLabels"], TIMEOUT).spread(
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

describe("Deactivate Status Label", { retries: 1 }, () => {
  it("Deactivate using menu options", () => {
    cy.getBySelector("active-labels-container");

    cy.getBySelector("active-labels-container")
      .contains(TEST_DATA?.temp2?.name)
      .parents('[data-cy="status-label"]')
      .within(() => {
        cy.getBySelector("status-label-more-actions").click(TIMEOUT);
      });

    cy.getBySelector("menu-item-deactivate").click();

    cy.intercept("DELETE", `${ENDPOINTS?.statusLabels}/**`).as(
      "deactivateStatusLabel"
    );
    cy.intercept("GET", ENDPOINTS.allStatusLabels).as("getAllStatusLabels");

    cy.getBySelector("deactivation-dialog-confirm-button").click();

    cy.wait(["@deactivateStatusLabel", "@getAllStatusLabels"]).spread(
      (deactivateStatusLabel, getAllStatusLabels) => {
        const deactivatedLabel = deactivateStatusLabel?.response?.body?.data;
        const { active, deactivated } = parseStatusLabels(
          getAllStatusLabels?.response?.body?.data
        );

        expect(active?.some((label) => label.ZUID === deactivatedLabel)).to.be
          .false;
        expect(deactivated?.some((label) => label.ZUID === deactivatedLabel)).to
          .be.true;
      }
    );

    cy.get(".notistack-Snackbar", TIMEOUT)
      .should("exist")
      .contains(
        new RegExp(`Status De-activated:\\s*${TEST_DATA?.temp2?.name}`)
      );
  });

  it("Deactivate using form button", () => {
    cy.getBySelector("active-labels-container");

    cy.getBySelector("active-labels-container")
      .contains(TEST_DATA?.temp3?.name)
      .parents('[data-cy="status-label"]')
      .within(() => {
        cy.getBySelector("status-label-more-actions").click(TIMEOUT);
      });

    cy.getBySelector("menu-item-edit").click();

    cy.intercept("DELETE", `${ENDPOINTS?.statusLabels}/**`).as(
      "deactivateStatusLabel"
    );
    cy.intercept("GET", ENDPOINTS.allStatusLabels).as("getAllStatusLabels");

    cy.getBySelector("form-deactivate-status-button").click();

    cy.getBySelector("deactivation-dialog-confirm-button").click();

    cy.wait(["@deactivateStatusLabel", "@getAllStatusLabels"]).spread(
      (deactivateStatusLabel, getAllStatusLabels) => {
        const deactivatedLabel = deactivateStatusLabel?.response?.body?.data;
        const { active, deactivated } = parseStatusLabels(
          getAllStatusLabels?.response?.body?.data
        );

        expect(active?.some((label) => label.ZUID === deactivatedLabel)).to.be
          .false;
        expect(deactivated?.some((label) => label.ZUID === deactivatedLabel)).to
          .be.true;
      }
    );
    cy.get(".notistack-Snackbar", TIMEOUT)
      .should("exist")
      .contains(
        new RegExp(`Status De-activated:\\s*${TEST_DATA?.temp3?.name}`)
      );
  });
});

describe("Filter Active and Deactivated Status Labels", { retries: 1 }, () => {
  it("Displays active/deactivated status labels", () => {
    cy.get('input[value="deactivated"]').click(TIMEOUT);
    // Asserting on specific test labels rather than total count — the instance
    // has pre-existing labels we don't control, making count assertions flaky in CI
    cy.getBySelector("active-labels-container").within(() => {
      cy.contains(TEST_DATA.new.name).should("exist");
      cy.contains(TEST_DATA.edited.name).should("exist");
    });
    cy.getBySelector("deactivated-labels-container").within(() => {
      cy.contains(TEST_DATA.temp2.name).should("exist");
      cy.contains(TEST_DATA.temp3.name).should("exist");
    });
  });

  it("Displays Error page when search results returns empty", () => {
    cy.get('input[value="deactivated"]').click(TIMEOUT);
    cy.get('input[placeholder="Search Statuses"]')
      .clear()
      .type(EMPTY_SEARCH_TEXT);
    cy.getBySelector("active-labels-container").should("not.exist");
    cy.getBySelector("deactivated-labels-container").should("not.exist");
    cy.getBySelector("no-results-page").should("exist");
  });

  it("Clears and focuses search field when clicking 'Search Again'", () => {
    cy.get('input[value="deactivated"]').click(TIMEOUT);
    cy.get("button").contains("Search Again").click();
    cy.getBySelector("active-labels-container").should("exist");
    cy.getBySelector("deactivated-labels-container").should("exist");
    cy.getBySelector("no-results-page").should("not.exist");
    cy.get('input[placeholder="Search Statuses"]').should("be.empty");
  });
});

Cypress.Commands.add("goToWorkflowsPage", () => {
  cy.visit("/settings/user/workflows");
  cy.getBySelector("workflows-authorized-page", { timeout: 60_000 });
});

Cypress.Commands.add("cleanTestData", function () {
  const testLabels = [
    TEST_DATA?.new?.name,
    TEST_DATA?.edited?.name,
    TEST_DATA?.temp1?.name,
    TEST_DATA?.temp2?.name,
    TEST_DATA?.temp3?.name,
  ];

  // Query ACTIVE labels only (no showDeleted=true). The shared dev instance has
  // accumulated a huge number of soft-deleted test labels, and showDeleted=true
  // returns all of them — the query can exceed the 30s request timeout and fail
  // this before() hook, taking the whole spec down. We only delete active labels
  // here anyway, so the deleted history is irrelevant.
  cy.apiRequest({ url: `${INSTANCE_API}/env/labels` }).then(
    (response) => {
      response?.data
        ?.filter(
          (label) => !label?.deletedAt && testLabels.includes(label?.name)
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
  const testLabels = [TEST_DATA?.temp1, TEST_DATA?.temp2, TEST_DATA?.temp3];
  testLabels.forEach((label) => {
    cy.apiRequest({
      url: `${INSTANCE_API}/env/labels`,
      method: "POST",
      body: {
        ...label,
        color: colorMenu.find((color) => color?.label === label.color)?.value,
      },
    });
  });
});

Cypress.Commands.add("getStatusLabels", () => {
  return cy
    .apiRequest({
      url: `${INSTANCE_API}/env/labels?showDeleted=true`,
    })
    .then((response) => {
      return parseStatusLabels(response?.data);
    });
});

function parseStatusLabels(statusLabels = []) {
  const { active, deactivated } = statusLabels.reduce(
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

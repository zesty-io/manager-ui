// Studio's mode toggle is the entry point to layout mode, which writes view
// source. These specs assert the toggle offers only the modes the signed-in
// role is entitled to.
//
// Both the roles response and the user record are rewritten rather than
// fabricated: `fetchUserRole` matches the role whose `entityZUID` equals the
// current instance, and `hasPermission` short-circuits to true for staff, so
// a stub that dropped either field would pass for the wrong reason.
const ENDPOINTS = {
  userRoles: "**/v1/users/**/roles",
  user: "**/v1/users/*",
};

// Contributor: content access, no code access.
const CONTRIBUTOR_ROLE_ZUID = "31-71cfc74-c0ntr1b0t0r";
// Developer: code access.
const DEVELOPER_ROLE_ZUID = "31-71cfc74-d3v3l0p3r";

describe("Studio mode entitlement", () => {
  const asRole = (systemRoleZUID) => {
    cy.intercept("GET", ENDPOINTS.userRoles, (req) => {
      req.continue((res) => {
        if (!Array.isArray(res.body?.data)) return;
        res.body.data = res.body.data.map((role) => ({
          ...role,
          systemRoleZUID,
          systemRole: {
            ...role.systemRole,
            ZUID: systemRoleZUID,
            // `super` is a second short-circuit in hasPermission.
            super: false,
          },
        }));
      });
    }).as("getUserRoles");

    cy.intercept("GET", ENDPOINTS.user, (req) => {
      req.continue((res) => {
        if (!res.body?.data) return;
        res.body.data = { ...res.body.data, staff: false };
      });
    }).as("getUser");
  };

  const visitStudio = () => {
    cy.waitOn("/v1/content/models**", () => {
      cy.visit("/studio?path=/");
    });
    cy.getBySelector("StudioHeader").should("exist");
  };

  it("offers both modes to a role with content and code access", () => {
    asRole(DEVELOPER_ROLE_ZUID);
    visitStudio();

    cy.getBySelector("StudioModeToggle").should("exist");
    cy.getBySelector("StudioModeToggleOption-content").should("exist");
    cy.getBySelector("StudioModeToggleOption-layout").should("exist");
  });

  it("hides the toggle entirely for a role without code access", () => {
    asRole(CONTRIBUTOR_ROLE_ZUID);
    visitStudio();

    // Assert the positive case first. Without it the two negatives below pass
    // on any page that failed to render, which is what makes a bare
    // should("not.exist") vacuous in this suite.
    cy.getBySelector("StudioPreviewFrame").should("exist");

    cy.getBySelector("StudioModeToggleOption-layout").should("not.exist");
    cy.getBySelector("StudioModeToggle").should("not.exist");
  });
});

// Deliberately not covered here: "a contributor stays in content mode".
// It was written and then removed — it passed unchanged against a mutation
// that reverted the permission check, because the mode defaults to content
// and nothing in the test drove it anywhere else. It asserted the default,
// not the gate.

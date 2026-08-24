// Studio resolves its mode from the signed-in user's permissions rather than
// asking them to choose one. These specs assert that resolution: which modes an
// account is entitled to, that the switch is offered only to staff, and
// that the entitlement holds on paths the switch does not control.
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
  const codeId = "11-studio-test-view";
  let itemZUID = "";
  let studioPath = "/";

  before(() => {
    cy.task("seed:content", "fixtures/studio.json").then(({ items }) => {
      itemZUID = items[0].meta.ZUID;
      studioPath = `/${items[0].web.pathPart}`;
    });
  });

  const asRole = (systemRoleZUID, { staff = false } = {}) => {
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
        // `hasPermission` short-circuits to true for staff, so role-based
        // tests must clear it; the switch-gate test sets it deliberately.
        res.body.data = { ...res.body.data, staff };
      });
    }).as("getUser");
  };

  const postBridgeMessage = (message) => {
    cy.getBySelector("StudioHeader").should("exist");
    cy.window().then(
      (win) =>
        new Cypress.Promise((resolve) => {
          win.requestAnimationFrame(() => {
            win.requestAnimationFrame(() => {
              win.postMessage({ source: "studio-bridge", message }, "*");
              resolve();
            });
          });
        })
    );
  };

  const visitStudio = () => {
    cy.waitOn("/v1/content/models**", () => {
      cy.visit(`/studio?path=${studioPath}`);
    });
    cy.getBySelector("StudioHeader").should("exist");
  };

  it("offers every mode to a staff account with content and code access", () => {
    asRole(DEVELOPER_ROLE_ZUID, { staff: true });
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

  // Mode is resolved from permissions and is not selectable. Staff are the
  // exception, gated on the same `user.staff` flag that decides whether Studio
  // appears in the global menu.
  it("offers no mode switch to a non-staff account, even with full access", () => {
    asRole(DEVELOPER_ROLE_ZUID, { staff: false });
    visitStudio();

    // Positive first: the app rendered and the role carries both capabilities,
    // so a missing switch is the gate rather than a blank page or a narrow
    // role. Without this the assertion below passes on any failed render.
    cy.getBySelector("StudioPreviewFrame").should("exist");
    cy.getBySelector("StudioModeToggle").should("not.exist");
  });

  // The layout half of the merged save must not gate a role that has no layout
  // half. This broke once: `useMultiPermission("UPDATE", [])` returns true for
  // an empty list, so swapping it for a static role check disabled Save for
  // content-only roles outright. Nothing caught it — the CI account carries
  // CODE, so only a role stub can reach this.
  it("leaves Save usable for a content-only role with a pending content edit", () => {
    asRole(CONTRIBUTOR_ROLE_ZUID);
    visitStudio();
    cy.getBySelector("StudioPreviewFrame").should("exist");

    cy.window().should((win) => {
      expect(
        win.zestyStore.getState().content[itemZUID]?.meta?.ZUID,
        "page item hydrated in store"
      ).to.eq(itemZUID);
    });
    cy.window().then((win) => {
      win.zestyStore.dispatch({ type: "MARK_ITEM_DIRTY", itemZUID });
    });

    // saveBarCanSave gates the MODAL's Save All, not the bar button — the bar
    // button has no disabled prop and only opens the modal, so asserting on it
    // passes either way.
    cy.getBySelector("StudioContentSaveChangesButton").click();
    cy.getBySelector("StudioSaveChangesModal").should("exist");
    cy.getBySelector("StudioSaveAllButton").should("not.be.disabled");
  });

  it("refuses a layout-write message from a role without code access", () => {
    asRole(CONTRIBUTOR_ROLE_ZUID);
    visitStudio();
    cy.getBySelector("StudioPreviewFrame").should("exist");

    // The mode toggle is not a gate on this path. These messages arrive from
    // the preview window, so anything able to postMessage can send them —
    // which is exactly what this spec does.
    postBridgeMessage({
      type: "TEMPLATE_SOURCE_MAP",
      templateSourceByCodeId: {
        [codeId]:
          '<div data-layout-id="1">One</div><div data-layout-id="2">Two</div>',
      },
    });
    postBridgeMessage({
      type: "REORDER_OUTPUT",
      regions: [
        {
          codeId,
          selector: "[data-layout-id]",
          orderedLayoutIds: ["2", "1"],
          layoutStructure: [
            { layoutId: "2", parentLayoutId: null },
            { layoutId: "1", parentLayoutId: null },
          ],
          outputHtml:
            '<div data-layout-id="2">Two</div><div data-layout-id="1">One</div>',
        },
      ],
      primaryCodeId: codeId,
      selectedLayoutId: "2",
      selectedLayoutBreadcrumb: [{ layoutId: "2", label: "div" }],
      selector: "[data-layout-id]",
    });

    // A bare should("not.exist") here is a race, not an assertion: it resolves
    // on the first check, before the message has been handled, and so passes
    // even when the write IS staged. Verified by mutation — removing the guard
    // left it green.
    //
    // Instead, stage a content change the contributor IS entitled to make and
    // wait for its save bar. That bar appearing proves the message queue has
    // drained past the layout write, so the Layout section's absence from the
    // modal is now evidence rather than timing.
    cy.window().then((win) => {
      win.zestyStore.dispatch({ type: "MARK_ITEM_DIRTY", itemZUID });
    });

    cy.getBySelector("StudioContentSaveBar").should("exist");
    cy.getBySelector("StudioContentSaveChangesButton").click();
    cy.getBySelector("StudioSaveChangesModal").should("exist");
    cy.getBySelector("StudioSaveChangeRow").should("exist");
    cy.getBySelector("StudioSaveChangeSection-Layout").should("not.exist");
  });
});

// Deliberately not covered here: "a contributor stays in content mode".
// It was written and then removed — it passed unchanged against a mutation
// that reverted the permission check, because the mode defaults to content
// and nothing in the test drove it anywhere else. It asserted the default,
// not the gate.

describe("Studio Freestyle Alert", () => {
  let studioPath = "/";
  let itemZUID = "";
  let modelZUID = "";

  before(() => {
    cy.task("seed:content", "fixtures/studio.json").then(({ items }) => {
      itemZUID = items[0].meta.ZUID;
      modelZUID = items[0].meta.contentModelZUID;
      studioPath = `/${items[0].web.pathPart}`;
    });
  });

  // A Freestyle-built layout is identified by a per-item view file at
  // /z/pvl/<itemZUID>.zhtml. Rather than create (and have to clean up) a real
  // view file on the dev instance — which would also change how the page
  // actually renders — append a synthetic entry to the web views response.
  const stubFreestyleView = () => {
    cy.intercept({ method: "GET", url: "**/web/views*" }, (req) => {
      req.continue((res) => {
        if (Array.isArray(res.body?.data)) {
          res.body.data.push({
            ZUID: "11-freestyle-pvl-view",
            fileName: `/z/pvl/${itemZUID}.zhtml`,
            type: "templateset",
            version: 1,
          });
        }
      });
    }).as("webViews");
  };

  const visitStudio = () => {
    cy.waitOn("/v1/content/models**", () => {
      cy.visit(`/studio?path=${studioPath}`);
    });
    cy.getBySelector("StudioHeader").should("exist");
  };

  const setStudioMode = (mode) => {
    cy.getBySelector("StudioHeader").should("exist");
    cy.getBySelector("StudioModeToggle")
      .find('input[type="checkbox"]')
      [mode === "layout" ? "check" : "uncheck"]();
  };

  it("does not show the alert for a page that was not built in Freestyle", () => {
    visitStudio();

    cy.getBySelector("StudioSidePanel").should("exist");
    cy.getBySelector("StudioFreestyleAlert").should("not.exist");

    setStudioMode("layout");
    cy.getBySelector("StudioFreestyleAlert").should("not.exist");
  });

  it("shows a dismiss-only alert in content mode for a Freestyle layout", () => {
    stubFreestyleView();
    visitStudio();

    cy.getBySelector("StudioFreestyleAlert")
      .should("exist")
      .and("contain.text", "This layout was created in Freestyle")
      .and("contain.text", "Editing only available in Freestyle");

    // Per design the content-mode alert has no "Edit in Freestyle" action.
    cy.getBySelector("StudioFreestyleAlertEditButton").should("not.exist");
    cy.getBySelector("StudioFreestyleAlertCloseButton").should("exist");
  });

  it("dismisses the content mode alert", () => {
    stubFreestyleView();
    visitStudio();

    cy.getBySelector("StudioFreestyleAlert").should("exist");
    cy.getBySelector("StudioFreestyleAlertCloseButton").click();
    cy.getBySelector("StudioFreestyleAlert").should("not.exist");
  });

  it("shows the alert with an Edit in Freestyle action in layout mode", () => {
    stubFreestyleView();
    visitStudio();

    setStudioMode("layout");

    // Layout mode drops the side panel, so this is the floating canvas alert.
    cy.getBySelector("StudioSidePanel").should("not.exist");
    cy.getBySelector("StudioFreestyleAlert")
      .should("exist")
      .and("contain.text", "This layout was created in Freestyle");
    cy.getBySelector("StudioFreestyleAlertEditButton").should("exist");
  });

  it("links to the item in the Freestyle app", () => {
    stubFreestyleView();
    visitStudio();

    setStudioMode("layout");

    cy.getBySelector("StudioFreestyleAlertEditButton").click();

    cy.location("pathname").should(
      "eq",
      `/content/${modelZUID}/${itemZUID}/freestyle`
    );
  });

  it("dismisses the layout mode alert", () => {
    stubFreestyleView();
    visitStudio();

    setStudioMode("layout");

    cy.getBySelector("StudioFreestyleAlert").should("exist");
    cy.getBySelector("StudioFreestyleAlertCloseButton").click();
    cy.getBySelector("StudioFreestyleAlert").should("not.exist");
  });
});

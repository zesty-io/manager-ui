import { API_ENDPOINTS } from "../../support/api";

describe("Studio Freestyle Alert", () => {
  let studioPath = "/";
  let itemZUID = "";
  let modelZUID = "";
  let webViews = [];

  before(() => {
    // modelZUID comes off the returned model, not items[0].meta — the seeded
    // item's meta does not carry contentModelZUID back, which would leave both
    // the path assertions and the deleteModel cleanup silently undefined.
    cy.task("seed:content", "fixtures/studio.json").then(({ model, items }) => {
      itemZUID = items[0].meta.ZUID;
      modelZUID = model.ZUID;
      studioPath = `/${items[0].web.pathPart}`;
    });

    // Snapshot the instance's real views once so the stub below can replay them
    // verbatim rather than proxying to the upstream API per request.
    cy.apiRequest({
      url: `${API_ENDPOINTS.devInstance}/web/views?status=dev`,
    }).then(({ data }) => {
      webViews = data || [];
    });
  });

  after(() => {
    if (modelZUID) cy.deleteModel(modelZUID);
  });

  // A Freestyle-built layout is identified by a per-item view file at
  // /z/pvl/<itemZUID>.zhtml. Rather than create (and have to clean up) a real
  // view file on the dev instance — which would also change how the page
  // actually renders — serve the real view list plus a synthetic entry.
  //
  // This replies directly instead of proxying with req.continue: the "Edit in
  // Freestyle" test navigates away mid-flight, and an aborted upstream request
  // fails the test outright when a response callback is attached.
  const stubFreestyleView = () => {
    cy.intercept({ method: "GET", url: "**/web/views*" }, (req) => {
      req.reply({
        statusCode: 200,
        body: {
          data: [
            ...webViews,
            {
              ZUID: "11-freestyle-pvl-view",
              fileName: `/z/pvl/${itemZUID}.zhtml`,
              type: "templateset",
              version: 1,
            },
          ],
        },
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
    // The panel button keeps its normal destination.
    cy.getBySelector("StudioEditInManagerButton").should("exist");
    cy.getBySelector("StudioEditInFreestyleButton").should("not.exist");

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

    // Per design the content-mode alert itself is dismiss-only — the action
    // lives in the side panel's own full-width button instead.
    cy.getBySelector("StudioFreestyleAlertEditButton").should("not.exist");
    cy.getBySelector("StudioFreestyleAlertCloseButton").should("exist");

    cy.getBySelector("StudioEditInManagerButton").should("not.exist");
    cy.getBySelector("StudioEditInFreestyleButton")
      .should("exist")
      .and("contain.text", "Edit in Freestyle");
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

  it("links to the item in the Freestyle app from layout mode", () => {
    stubFreestyleView();
    visitStudio();

    setStudioMode("layout");

    cy.getBySelector("StudioFreestyleAlertEditButton").click();

    cy.location("pathname").should(
      "eq",
      `/content/${modelZUID}/${itemZUID}/freestyle`
    );
  });

  it("links to the item in the Freestyle app from the content mode panel", () => {
    stubFreestyleView();
    visitStudio();

    cy.getBySelector("StudioEditInFreestyleButton").click();

    cy.location("pathname").should(
      "eq",
      `/content/${modelZUID}/${itemZUID}/freestyle`
    );
  });

  it("keeps the layout mode alert after dismissing it in content mode", () => {
    stubFreestyleView();
    visitStudio();

    cy.getBySelector("StudioFreestyleAlertCloseButton").click();
    cy.getBySelector("StudioFreestyleAlert").should("not.exist");

    // Layout mode's overlay is the only route to Freestyle there, so a content
    // mode dismissal must not suppress it.
    setStudioMode("layout");
    cy.getBySelector("StudioFreestyleAlert").should("exist");
    cy.getBySelector("StudioFreestyleAlertEditButton").should("exist");
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

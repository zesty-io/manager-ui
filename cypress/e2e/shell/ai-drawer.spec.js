describe("AI drawer", () => {
  const MCP_CLIENT = /\/client$/;
  const MODEL_ZUID = "6-a1a600-k0b6f0";
  const ITEM_ZUID = "7-a1be38-1b42ht";

  const openDrawer = (win) => {
    Object.keys(win.localStorage)
      .filter((key) => key.startsWith("ai-drawer-"))
      .forEach((key) => win.localStorage.removeItem(key));
    win.localStorage.setItem("showAiDrawer", "true");
  };

  it("renders a prose reply as a message in the content app", () => {
    cy.intercept(
      { method: "POST", url: MCP_CLIENT },
      {
        statusCode: 200,
        body: {
          data: "Here is a friendlier headline.",
          message: "",
          tools: [],
        },
      }
    ).as("mcp");
    cy.visit(`/content/${MODEL_ZUID}/${ITEM_ZUID}`, {
      onBeforeLoad: openDrawer,
    });

    cy.get('[data-cy="AIChatPrompt"] textarea:not([aria-hidden])').type(
      "Suggest a headline"
    );
    cy.getBySelector("AIChatSend").click();

    cy.wait("@mcp").its("request.body").should("include", {
      modelZuid: MODEL_ZUID,
      itemZuid: ITEM_ZUID,
    });
    cy.getBySelector("AIChatMessage").should(
      "contain.text",
      "Here is a friendlier headline."
    );
    cy.contains("Error parsing AI response").should("not.exist");
  });

  it("stays unavailable outside the content, blocks and code apps", () => {
    cy.visit("/launchpad", { onBeforeLoad: openDrawer });
    cy.getBySelector("AIChatClose").should("exist");
    cy.contains("Only available in content app.").should("exist");
    cy.getBySelector("AIChatPrompt").should("not.exist");
  });
});

const options = { timeout: 20_000 };
const forceClick = { force: true };

// Fires a paste event carrying `html` on the TinyMCE iframe body
const pasteHtml = (html) =>
  cy.iframe("#wysiwyg_basic_ifr").then(($body) => {
    const body = $body[0];
    const win = body.ownerDocument.defaultView;
    const data = new win.DataTransfer();
    data.setData("text/html", html);
    data.setData("text/plain", "");
    body.dispatchEvent(
      new win.ClipboardEvent("paste", {
        clipboardData: data,
        bubbles: true,
        cancelable: true,
      })
    );
  });

const clearEditor = () =>
  cy
    .iframe("#wysiwyg_basic_ifr")
    .should("be.visible")
    .click()
    .type("{selectall}{backspace}");

describe("WYSIWYG: Google Docs paste cleanup", () => {
  before(() => {
    cy.task("seed:content", "fixtures/content.json").then(
      ({ model, items }) => {
        Cypress.env("modelZUID", model?.ZUID);
        Cypress.env("itemZUID", items[0]?.meta?.ZUID);
      }
    );
    cy.waitOn("/v1/content/models*", () => {
      cy.visit(
        `/content/${Cypress.env("modelZUID")}/${Cypress.env("itemZUID")}`
      );
    });
    cy.getBySelector("DuoModeToggle").click(forceClick);
  });

  beforeEach(() => {
    clearEditor();
  });

  // Bold/italic/underline conversion is not asserted here: a synthetic paste in
  // Cypress' Chromium reaches the plugin with the style attributes already
  // stripped by TinyMCE's WebKit filter, so it can't exercise that path.
  it("strips Docs markup and keeps structure", () => {
    cy.fixture("google-docs-paste.html").then((html) => {
      pasteHtml(html);
    });

    cy.iframe("#wysiwyg_basic_ifr", options).should(($body) => {
      const body = $body[0];
      expect(body.querySelector("h1")?.textContent).to.eq("Pasted heading");
      expect(body.querySelectorAll("li")).to.have.length(2);
      expect(body.querySelectorAll("li > p")).to.have.length(0);
      expect(body.querySelectorAll("[style]")).to.have.length(0);
      expect(
        body.querySelectorAll("[id^='docs-internal-guid']")
      ).to.have.length(0);
      expect(body.querySelectorAll("span")).to.have.length(0);
      // The empty <h2><b><br><br></b></h2> block is gone
      expect(body.querySelectorAll("h2")).to.have.length(0);
    });
  });

  it("leaves non-Docs pastes alone", () => {
    pasteHtml("<ul><li><p>Plain item</p></li></ul>");

    cy.iframe("#wysiwyg_basic_ifr", options).should(($body) => {
      expect($body[0].querySelectorAll("li > p")).to.have.length(1);
    });
  });
});

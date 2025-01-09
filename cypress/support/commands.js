import instanceZUID from "../../src/utility/instanceZUID";
import CONFIG from "../../src/shell/app.config";

const INSTANCE_API_ENDPOINT = `${
  CONFIG?.[process.env.NODE_ENV]?.API_INSTANCE_PROTOCOL
}${instanceZUID}${CONFIG?.[process.env.NODE_ENV]?.API_INSTANCE}`;

const DEFAULT_STATUS_LABELS_ZUIDS = [
  "36-14b315-4pp20v3d",
  "36-14b315-d24ft",
  "36-n33d5-23v13w",
];

const DEFAULT_STATUS_LABELS_NAMES = ["Approved", "Needs Review", "Draft"];

Cypress.Commands.add("login", () => {
  const formBody = new FormData();

  formBody.append("email", Cypress.env("email"));
  formBody.append("password", Cypress.env("password"));

  return cy
    .request({
      url: `${Cypress.env("API_AUTH")}/login`,
      method: "POST",
      body: formBody,
    })
    .then(async (res) => {
      const response = await new Response(res.body).json();
      // We need the cookie value returned reset so it is unsecure and
      // accessible by javascript
      cy.setCookie(Cypress.env("COOKIE_NAME"), response.meta.token);
    })
    .then(() => {
      return cy.get("body");
    });
});

Cypress.Commands.add("blockLock", () => {
  cy.intercept("/door/knock*", (req) => {
    req.reply({});
  });
});

Cypress.Commands.add("waitOn", (path, cb) => {
  cy.intercept(path).as("waitingOn");
  cy.blockAnnouncements();
  cb();
  cy.wait("@waitingOn", {
    timeout: 30000,
  });
});

Cypress.Commands.add("assertClipboardValue", (value) => {
  cy.window().then((win) => {
    win.navigator?.clipboard?.readText().then((text) => {
      expect(text).to.eq(value);
    });
  });
});

Cypress.Commands.add("getBySelector", (selector, ...args) => {
  return cy.get(`[data-cy=${selector}]`, { timeout: 40_000, ...args });
});

Cypress.Commands.add("blockAnnouncements", () => {
  cy.intercept("/-/instant/6-90fbdcadfc-4lc0s5.json", (req) => {
    req.reply({});
  });
});

Cypress.Commands.add(
  "apiRequest",
  ({ method = "GET", url = "", body = undefined }) => {
    return cy.getCookie(Cypress.env("COOKIE_NAME")).then((cookie) => {
      const token = cookie?.value;
      return cy
        .request({
          url,
          method,
          headers: { authorization: `Bearer ${token}` },
          ...(body ? { body: body } : {}),
        })
        .then((response) => ({
          status: response?.isOkStatusCode ? "success" : "error",
          data: response?.body?.data,
        }));
    });
  }
);

Cypress.Commands.add("workflowStatusLabelCleanUp", function () {
  cy.apiRequest({
    url: `${INSTANCE_API_ENDPOINT}/env/labels?showDeleted=true`,
  }).then((response) => {
    console.debug("workflowStatusLabelCleanUp | response LABELS: ", response);

    response?.data
      ?.filter(
        (label) =>
          !label?.deletedAt &&
          !DEFAULT_STATUS_LABELS_NAMES.includes(label?.name) &&
          !DEFAULT_STATUS_LABELS_ZUIDS.includes(label?.ZUID)
      )
      .forEach((label) => {
        cy.apiRequest({
          url: `${INSTANCE_API_ENDPOINT}/env/labels/${label.ZUID}`,
          method: "DELETE",
        });
      });
  });
});

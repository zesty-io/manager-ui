import instanceZUID from "../../src/utility/instanceZUID";
import CONFIG from "../../src/shell/app.config";

const API_ENDPOINTS = {
  devInstance: `${
    CONFIG[process.env.NODE_ENV]?.API_INSTANCE_PROTOCOL
  }${instanceZUID}${CONFIG[process.env.NODE_ENV]?.API_INSTANCE}`,
};

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
  cy.blockAnnouncements();
  cy.intercept(path).as("waitingOn");
  cb();
  cy.wait("@waitingOn", {
    timeout: 40_000,
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
          failOnStatusCode: false,
        })
        .then((response) => {
          return {
            status: response?.isOkStatusCode ? "success" : "error",
            data: response?.body?.data,
          };
        });
    });
  }
);

Cypress.Commands.add("deleteStatusLabels", (labels = []) => {
  cy.log(`[CLEAN UP]: Status Labels`);
  cy.apiRequest({
    url: `${API_ENDPOINTS}/env/labels?showDeleted=true`,
  }).then((response) => {
    response?.data
      ?.filter(
        (resData) => !resData?.deletedAt && [...labels].includes(resData?.name)
      )
      .forEach((labelForDelete) => {
        cy.apiRequest({
          url: `${API_ENDPOINTS.devInstance}/env/labels/${labelForDelete.ZUID}`,
          method: "DELETE",
        });
      });
  });
});

Cypress.Commands.add("cleanStatusLabels", () => {
  const DEFAULT_STATUS_LABELS_ZUIDS = [
    "36-14b315-4pp20v3d",
    "36-14b315-d24ft",
    "36-n33d5-23v13w",
  ];
  const DEFAULT_STATUS_LABELS_NAMES = ["Approved", "Needs Review", "Draft"];
  cy.log(`[DELETE]: Status Labels`);
  cy.apiRequest({
    url: `${API_ENDPOINTS.devInstance}/env/labels?showDeleted=true`,
  }).then((response) => {
    response?.data
      ?.filter(
        (resData) =>
          !resData?.deletedAt &&
          !DEFAULT_STATUS_LABELS_NAMES.includes(resData?.name) &&
          !DEFAULT_STATUS_LABELS_ZUIDS.includes(resData?.ZUID)
      )
      .forEach((labelForDelete) => {
        console.debug("labelForDelete | labelForDelete: ", labelForDelete);
        cy.apiRequest({
          url: `${API_ENDPOINTS.devInstance}/env/labels/${labelForDelete.ZUID}`,
          method: "DELETE",
        });
      });
  });
});

Cypress.Commands.add("deleteContentModels", (models = []) => {
  cy.log(`[CLEAN UP] Content Models`);
  cy.apiRequest({
    url: `${API_ENDPOINTS.devInstance}/content/models`,
  }).then((response) => {
    response?.data
      ?.filter((resData) => [...models].includes(resData?.label))
      .forEach((forDelete) => {
        cy.apiRequest({
          url: `${API_ENDPOINTS.devInstance}/content/models/${forDelete.ZUID}`,
          method: "DELETE",
        });
      });
  });
});

Cypress.Commands.add("createContentModel", (payload) => {
  return cy.apiRequest({
    url: `${API_ENDPOINTS.devInstance}/content/models`,
    method: "POST",
    body: payload,
  });
});

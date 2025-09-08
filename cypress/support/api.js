import instanceZUID from "../../src/utility/instanceZUID";
import CONFIG from "../../src/shell/app.config";

export const API_ENDPOINTS = {
  devInstance: `${
    CONFIG[process.env.NODE_ENV]?.API_INSTANCE_PROTOCOL
  }${instanceZUID}${CONFIG[process.env.NODE_ENV]?.API_INSTANCE}`,
  mediaManager: CONFIG[process.env.NODE_ENV]?.SERVICE_MEDIA_MANAGER,
};

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

Cypress.Commands.add("getModels", () => {
  return cy.apiRequest({
    url: `${API_ENDPOINTS.devInstance}/content/models`,
  });
});

Cypress.Commands.add("createModel", (payload) => {
  return cy.apiRequest({
    url: `${API_ENDPOINTS.devInstance}/content/models`,
    method: "POST",
    body: payload,
  });
});

Cypress.Commands.add("deleteModel", (zuid) => {
  return cy.apiRequest({
    url: `${API_ENDPOINTS.devInstance}/content/models/${zuid}`,
    method: "DELETE",
  });
});

Cypress.Commands.add("deleteModels", (models = []) => {
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

Cypress.Commands.add("createItems", (modelZUID, items) => {
  return cy.apiRequest({
    url: `${API_ENDPOINTS.devInstance}/content/models/${modelZUID}/items/batch`,
    method: "POST",
    body: items,
  });
});

Cypress.Commands.add("getItems", (modelZUID) => {
  return cy.apiRequest({
    url: `${API_ENDPOINTS.devInstance}/content/models/${modelZUID}/items`,
  });
});

Cypress.Commands.add("updateItem", (modelZUID, itemZUID, data) => {
  return cy.apiRequest({
    url: `${API_ENDPOINTS.devInstance}/content/models/${modelZUID}/items/${itemZUID}`,
    method: "PUT",
    body: data,
  });
});

Cypress.Commands.add("createField", (zuid, payload) => {
  return cy.apiRequest({
    url: `${API_ENDPOINTS.devInstance}/content/models/${zuid}/fields`,
    method: "POST",
    body: payload,
  });
});

Cypress.Commands.add("deleteStatusLabels", (labels = []) => {
  cy.log(`[CLEAN UP]: Status Labels`);
  cy.apiRequest({
    url: `${API_ENDPOINTS.devInstance}/env/labels?showDeleted=true`,
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

Cypress.Commands.add("createStatusLabel", (payload) => {
  cy.apiRequest({
    url: `${API_ENDPOINTS?.devInstance}/env/labels`,
    method: "POST",
    body: payload,
  });
});

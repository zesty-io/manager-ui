import Cookies from "js-cookie";
import instanceZUID from "../../src/utility/instanceZUID";
import CONFIG from "../../src/shell/app.config";
import { formatPathPart } from "../../src/utility/formatPathPart";

export const API_ENDPOINTS = {
  devInstance: `${
    CONFIG[process.env.NODE_ENV]?.API_INSTANCE_PROTOCOL
  }${instanceZUID}${CONFIG[process.env.NODE_ENV]?.API_INSTANCE}`,
  mediaManager: CONFIG[process.env.NODE_ENV]?.SERVICE_MEDIA_MANAGER,
};

export async function fetchAPI(url, method = "GET", data = null) {
  const BEARER_TOKEN = `Bearer ${Cookies.get(Cypress.env("COOKIE_NAME"))}`;
  return await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${Cookies.get(Cypress.env("COOKIE_NAME"))}`,
    },
    body: !data ? null : JSON.stringify(data),
  })
    .then((response) => {
      return response.json().then(function (json) {
        return json?.data || json;
      });
    })
    .catch((err) => {
      return null;
    });
}

Cypress.Commands.add(
  "apiRequest",
  ({ method = "GET", url = "", body = undefined }) => {
    return cy
      .request({
        url,
        method,
        headers: {
          authorization: `Bearer ${Cookies.get(Cypress.env("COOKIE_NAME"))}`,
        },
        ...(body ? { body: body } : {}),
        failOnStatusCode: false,
      })
      .then((response) => {
        return {
          status: response?.isOkStatusCode ? "success" : "error",
          data: response?.body?.data,
        };
      });
    // });
  }
);

Cypress.Commands.add("deleteModel", (modelZUID) => {
  cy.log(`[CLEAN UP] Content Models`);
  return cy.apiRequest({
    url: `${API_ENDPOINTS.devInstance}/content/models/${modelZUID}`,
    method: "DELETE",
  });
});

Cypress.Commands.add("deleteModels", (models = []) => {
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

Cypress.Commands.add("createModel", (payload) => {
  return cy
    .getModels()
    .then(({ data }) => {
      const model = data?.find((res) => res?.name === payload?.name);

      if (!!model) {
        cy.deleteModel(model?.ZUID);
      }
    })
    .then(() => {
      return cy
        .apiRequest({
          url: `${API_ENDPOINTS.devInstance}/content/models`,
          method: "POST",
          body: payload,
        })
        .then(({ data }) => {
          return data || null;
        });
    });
});

Cypress.Commands.add("createField", (modelZUID, payload) => {
  return cy.apiRequest({
    url: `${API_ENDPOINTS.devInstance}/content/models/${modelZUID}/fields`,
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

Cypress.Commands.add("getModel", (modelZUID) => {
  return cy
    .apiRequest({
      url: `${API_ENDPOINTS.devInstance}/content/models/${modelZUID}`,
    })
    .then((res) => {
      return res?.data || null;
    });
});

Cypress.Commands.add("getModels", () => {
  return cy.apiRequest({
    url: `${API_ENDPOINTS.devInstance}/content/models`,
  });
});

Cypress.Commands.add("getItem", (modelZUID, itemZUID) => {
  return cy
    .apiRequest({
      url: `${API_ENDPOINTS.devInstance}/content/models/${modelZUID}/items/${itemZUID}`,
    })
    .then((res) => {
      return res?.data || [];
    });
});

Cypress.Commands.add("getItems", (modelZUID) => {
  return cy
    .apiRequest({
      url: `${API_ENDPOINTS.devInstance}/content/models/${modelZUID}/items`,
    })
    .then((res) => {
      return res?.data?.sort((a, b) => a?.meta?.sort - b?.meta?.sort) || [];
    });
});

Cypress.Commands.add("updateItem", (modelZUID, itemZUID, data) => {
  return cy
    .apiRequest({
      url: `${API_ENDPOINTS.devInstance}/content/models/${modelZUID}/items/${itemZUID}`,
      method: "PUT",
      body: data,
    })
    .then((res) => {
      return res?.data || null;
    });
});

Cypress.Commands.add("deleteItems", (modelZUID, itemZUIDs = []) => {
  return cy
    .apiRequest({
      url: `${API_ENDPOINTS.devInstance}/content/models/${modelZUID}/items/batch`,
      method: "DELETE",
      body: itemZUIDs,
    })
    .then((res) => {
      return res?.data || null;
    });
});

Cypress.Commands.add("createItems", (modelZUID, items) => {
  return cy.getItems(modelZUID).then((getItemsRes) => {
    const activeItems = getItemsRes?.map((item) => item?.web?.pathPart);
    const forDeleteZuids = items
      ?.filter((item) =>
        activeItems?.includes(formatPathPart(item?.web?.metaTitle))
      )
      .map((item) => item?.meta?.ZUID);

    if (!!forDeleteZuids?.length) {
      cy.deleteItems(modelZUID, forDeleteZuids);
    }

    return cy
      .apiRequest({
        url: `${API_ENDPOINTS.devInstance}/content/models/${modelZUID}/items/batch`,
        method: "POST",
        body: items,
      })
      .then((res) => {
        return res?.data || null;
      });
  });
});

Cypress.Commands.add("getField", (modelZUID, fieldZUID) => {
  return cy
    .apiRequest({
      url: `${API_ENDPOINTS.devInstance}/content/models/${modelZUID}/fields/${fieldZUID}`,
      method: "GET",
    })
    .then((res) => {
      return res?.data || null;
    });
});

Cypress.Commands.add("getFields", (modelZUID, showDeleted = false) => {
  const queryParams = !!showDeleted ? "?showDeleted=true" : "";
  return cy
    .apiRequest({
      url: `${API_ENDPOINTS.devInstance}/content/models/${modelZUID}/fields${queryParams}`,
      method: "GET",
    })
    .then((res) => {
      return res?.data || null;
    });
});

Cypress.Commands.add("deleteFields", (modelZUID, fieldZUIDs = []) => {
  if (!!fieldZUIDs?.length) {
    const fieldPromises = [...fieldZUIDs]?.map(async (fieldZUID) => {
      fetchAPI(
        `${API_ENDPOINTS.devInstance}/content/models/${modelZUID}/fields/${fieldZUID}`,
        "DELETE"
      );
    });

    Promise.all(fieldPromises).then((fieldPromiseResponse) => {
      cy.getFields(modelZUID).then((newFields) => {
        const updatedFields = newFields.map((field) => ({
          name: field?.name,
          ZUID: field?.ZUID,
        }));
        Cypress.env("FIELDS", updatedFields);
      });
    });
  }
});

Cypress.Commands.add("undeleteFields", (modelZUID, fieldZUIDs = []) => {
  if (!!fieldZUIDs?.length) {
    const fieldPromises = [...fieldZUIDs]?.map(async (fieldZUID) => {
      return await fetchAPI(
        `${API_ENDPOINTS.devInstance}/content/models/${modelZUID}/fields/${fieldZUID}?action=undelete`,
        "PUT"
      );
    });

    return cy.wrap(Promise.all(fieldPromises)).then(() => {
      return cy.getFields(modelZUID).then((newFields) => {
        const updatedFields = newFields.map((field) => ({
          name: field?.name,
          ZUID: field?.ZUID,
        }));
        Cypress.env("FIELDS", updatedFields);
        return updatedFields;
      });
    });
  }
});

Cypress.Commands.add("updateFields", (modelZUID, fields = []) => {
  if (!fields || !fields?.length) return;

  return cy.getFields(modelZUID).then((getFieldsResponse) => {
    const fieldsMap = getFieldsResponse?.reduce((acc, field) => {
      acc[field?.name] = field;
      return acc;
    }, {});

    const fieldPromises = fields?.map(async (field) => {
      const activeField = { ...fieldsMap?.[field?.name], ...field };
      return await fetchAPI(
        `${API_ENDPOINTS.devInstance}/content/models/${modelZUID}/fields/${activeField.ZUID}`,
        "PUT",
        {
          ...activeField,
          settings: {
            ...activeField?.settings,
            list: activeField?.settings?.list,
          },
        }
      ).then(async (updatedRes) => {
        return { name: field?.name, ZUID: updatedRes?.ZUID };
      });
    });
    return cy.wrap(Promise.allSettled(fieldPromises));
  });
});

Cypress.Commands.add("createFields", (modelZUID, fields = []) => {
  if (!fields || !fields?.length) return cy.wrap([]);
  const fieldPromises = fields?.map(async (field) => {
    return await fetchAPI(
      `${API_ENDPOINTS.devInstance}/content/models/${modelZUID}/fields`,
      "POST",
      {
        ...field,
        settings: {
          list: true,
          defaultValue: null,
          ...field?.settings,
        },
      }
    ).then((resData) => {
      return { name: field?.name, ZUID: resData?.ZUID };
    });
  });
  return cy.wrap(Promise.all(fieldPromises));
});

Cypress.Commands.add("publishItem", (modelZUID, itemZUID) => {
  return cy.getItem(modelZUID, itemZUID).then((item) => {
    const payload = {
      version: item?.meta?.version,
      publishAt: "now",
      unpublishAt: "never",
    };
    return cy
      .apiRequest({
        url: `${API_ENDPOINTS?.devInstance}/content/models/${modelZUID}/items/${itemZUID}/publishings`,
        method: "POST",
        body: payload,
      })
      .then(({ data }) => {
        return data;
      });
  });
});

Cypress.Commands.add("unpublishItem", (modelZUID, itemZUID) => {
  return cy
    .apiRequest({
      url: `${API_ENDPOINTS?.devInstance}/content/models/${modelZUID}/items/${itemZUID}/publishings`,
    })
    .then(({ data }) => {
      const activeItem = data?.find((item) => !!item?._active);
      if (!!activeItem) {
        const payload = {
          version: activeItem?.meta?.version,
          publishAt: "now",
          unpublishAt: "never",
        };
        return cy
          .apiRequest({
            url: `${API_ENDPOINTS?.devInstance}/content/models/${modelZUID}/items/${itemZUID}/publishings/${activeItem?.ZUID}`,
            method: "POST",
            body: payload,
          })
          .then(({ data }) => {
            return data;
          });
      }
      return null;
    });
});

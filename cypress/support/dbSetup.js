import Cookies from "js-cookie";
import { API_ENDPOINTS, fetchAPI } from "./api";

import { formatPathPart } from "../../src/utility/formatPathPart";

export const MODEL = {
  label: `CYPRESS_E2E@${Cypress.env("COMMIT_ID")}`,
  name: `cypress_e2e_${Cypress.env("COMMIT_ID")}`,
  type: "templateset",
  description: "",
  listed: true,
};

export const FIELDS = {
  text: {
    datatype: "text",
    name: "text",
    label: "text",
    sort: 1,
    required: false,
    settings: {
      list: true,
      limit: "5",
    },
  },
  textarea: {
    datatype: "textarea",
    name: "textarea",
    label: "textarea",
    sort: 2,
    required: false,
    settings: {
      list: true,
    },
  },
  wysiwyg_basic: {
    datatype: "wysiwyg_basic",
    name: "wysiwyg_basic",
    label: "wysiwyg basic",
    sort: 3,
    required: false,
    settings: {
      list: true,
    },
  },

  wysiwyg_advanced: {
    datatype: "wysiwyg_advanced",
    name: "wysiwyg_advanced",
    label: "wysiwyg advanced",
    sort: 4,
    required: false,
    settings: {
      list: true,
    },
  },

  date: {
    datatype: "date",
    name: "date",
    label: "date",
    sort: 5,
    required: false,
    settings: {
      list: true,
    },
  },

  images: {
    datatype: "images",
    name: "images",
    label: "images",
    sort: 6,
    required: false,
    settings: {
      list: true,
      limit: "5",
    },
  },
  article_writer: {
    datatype: "article_writer",
    name: "article_writer",
    label: "article writer",
    sort: 7,
    required: false,
    settings: {
      list: true,
    },
  },
  dropdown: {
    datatype: "dropdown",
    name: "dropdown",
    label: "dropdown",
    sort: 8,
    required: false,
    settings: {
      list: true,
      options: {
        custom_option_one: "Custom Option One",
        custom_option_two: "Custom Option Two",
      },
    },
  },
  link: {
    datatype: "link",
    name: "link",
    label: "link",
    sort: 9,
    required: false,
    settings: {
      list: true,
    },
  },
  internal_link: {
    datatype: "internal_link",
    name: "internal_link",
    label: "internal link",
    sort: 10,
    required: false,
    settings: {
      list: true,
    },
  },
  datetime: {
    datatype: "datetime",
    name: "datetime",
    label: "datetime",
    sort: 11,
    required: false,
    settings: {
      list: true,
    },
  },
  yes_no: {
    datatype: "yes_no",
    name: "yes_no",
    label: "yes/no",
    sort: 12,
    required: false,
    settings: {
      list: true,
      options: {
        0: "No",
        1: "Yes",
      },
    },
  },
  // yes_no_custom: {
  //   datatype: "yes_no",
  //   name: "yes_no_custom",
  //   label: "yes/no custom",
  //   sort: 13,
  //   required: false,
  //   settings: {
  //     options: {
  //       0: "Custom One",
  //       1: "Custom Two",
  //     },
  //   },
  // },
  fontawesome: {
    datatype: "fontawesome",
    name: "fontawesome",
    label: "fontawesome",
    sort: 14,
    required: false,
    settings: {
      list: true,
    },
  },
  number: {
    datatype: "number",
    name: "number",
    label: "number",
    sort: 15,
    required: false,
    settings: {
      list: true,
    },
  },
  currency: {
    datatype: "currency",
    name: "currency",
    label: "currency",
    sort: 16,
    required: false,
    settings: {
      list: true,
    },
  },
  color: {
    datatype: "color",
    name: "color",
    label: "color",
    sort: 17,
    required: false,
    settings: {
      list: true,
    },
  },
  uuid: {
    datatype: "uuid",
    name: "uuid",
    label: "uuid",
    sort: 18,
    required: false,
    settings: {
      list: true,
    },
  },
  files: {
    datatype: "files",
    name: "files",
    label: "files",
    sort: 19,
    required: false,
    settings: {
      list: true,
    },
  },
  sort: {
    datatype: "sort",
    name: "sort",
    label: "sort",
    sort: 20,
    required: false,
    settings: {
      list: true,
    },
  },
  markdown: {
    datatype: "markdown",
    name: "markdown",
    label: "markdown",
    sort: 21,
    required: false,
    settings: {
      list: true,
    },
  },
  one_to_one: {
    datatype: "one_to_one",
    name: "one_to_one",
    label: "one to one",
    sort: 22,
    required: false,
    settings: {
      list: true,
    },
  },
  one_to_many: {
    datatype: "one_to_many",
    name: "one_to_many",
    label: "one to many",
    sort: 23,
    required: false,
    settings: {
      list: true,
    },
  },
  block_selector: {
    datatype: "block_selector",
    name: "block_selector",
    label: "block selector",
    sort: 24,
    required: false,
    settings: {
      list: true,
    },
  },
};

export const ITEM_DATA = {
  web: {
    pathPart: formatPathPart(MODEL?.label),
    canonicalTagMode: 1,
    metaLinkText: MODEL?.label,
    metaTitle: MODEL?.label,
    parentZUID: "0",
  },
  meta: {
    contentModelZUID: "",
  },
  data: null,
};

export const ITEM = {
  web: {
    pathPart: formatPathPart(MODEL?.label),
    canonicalTagMode: 1,
    metaLinkText: MODEL?.label,
    metaTitle: MODEL?.label,
    parentZUID: "0",
  },
  meta: {
    contentModelZUID: "",
  },
  data: null,
};

export const ITEMS = Array(4)
  .fill(0)
  .map((_, index) => {
    const label = `CYPRESS Item ${index + 1}`;
    return {
      web: {
        metaLinkText: label,
        metaTitle: label,
        pathPart: formatPathPart(label),
      },
      data: {
        text: label,
      },
    };
  });

Cypress.Commands.add("setFieldProperties", (fields = []) => {
  if (!fields || !fields?.length) return cy.wrap([]);
  const modelZUID = Cypress.env("modelZUID");
  return cy.getFields(modelZUID, true).then((getFieldsResponse) => {
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
      ).then((updatedRes) => {
        return { name: field?.name, ZUID: updatedRes?.ZUID };
      });
    });
    return cy.wrap(Promise.all(fieldPromises));
  });
});

Cypress.Commands.add("setContentItemData", (data) => {
  const modelZUID = Cypress.env("modelZUID");
  const itemZUID = Cypress.env("itemZUID");

  return cy.getItem(modelZUID, itemZUID).then((item) => {
    const payload = {
      ...item,
      data,
    };
    return cy
      .apiRequest({
        url: `${API_ENDPOINTS.devInstance}/content/models/${modelZUID}/items/${itemZUID}`,
        method: "PUT",
        body: payload,
      })
      .then((res) => {
        return cy.getItems(modelZUID).then((items) => {
          Cypress.env("ITEMS", items);
          Cypress.env("ITEM", items?.[0]);
          return cy.wrap(items);
        });
      });
  });
});

Cypress.Commands.add("setupInitialContentModel", () => {
  if (
    !!Cypress.env("MODEL") &&
    !!Cypress.env("FIELDS") &&
    !!Cypress.env("ITEMS") &&
    !!Cypress.env("ITEM")
  )
    return cy.wrap({
      model: Cypress.env("MODEL"),
      fields: Cypress.env("FIELDS"),
      items: Cypress.env("ITEMS"),
      item: Cypress.env("ITEM"),
    });
  cy.log("------ INITIALIZING TEST DATA ------");
  const { text, ...otherFields } = FIELDS;
  const textFieldPayload = [text];
  const fieldsPayload = Object.values(otherFields);

  return cy
    .createModel(MODEL)
    .then((model) => {
      return cy
        .createFields(model?.ZUID, textFieldPayload)
        .then((textField) => {
          const otherFieldsPayload = fieldsPayload.map((field) => ({
            ...field,
            ...(["one_to_one", "one_to_many"].includes(field?.datatype)
              ? {
                  relatedModelZUID: model?.ZUID,
                  relatedFieldZUID: textField?.[0]?.ZUID,
                }
              : {}),
          }));
          return cy
            .createFields(model?.ZUID, otherFieldsPayload)
            .then((otherFields) => {
              return { model, fields: [...textField, ...otherFields] };
            });
        });
    })
    .then(({ model, fields }) => {
      return cy
        .createItems(model?.ZUID, [
          {
            ...ITEM,
            meta: {
              contentModelZUID: model?.ZUID,
              sort: 0,
            },
          },
        ])
        .then((itemResponse) => {
          return cy
            .createItems(
              model?.ZUID,
              ITEMS.map((item, index) => ({
                ...item,
                meta: {
                  sort: index + 1,
                },
                web: {
                  ...item?.web,
                  parentZUID: itemResponse?.[0],
                },
              }))
            )
            .then((itemsResponse) => {
              return {
                model,
                fields,
              };
            });
        });
    })
    .then(({ model, fields }) => {
      return cy.getItems(model?.ZUID).then((getItemsResponse) => {
        return {
          model,
          fields,
          items: getItemsResponse,
        };
      });
    })
    .then(({ model, fields, items }) => {
      const item = items?.[0];
      Cypress.env("modelZUID", model?.ZUID);
      Cypress.env("itemZUID", item?.meta?.ZUID);
      Cypress.env("MODEL", model);
      Cypress.env("FIELDS", fields);
      Cypress.env("ITEM", item);
      Cypress.env("ITEMS", items);
      return cy.wrap({ model, fields, item, items });
    });
});
Cypress.Commands.add("resetContentModel", () => {
  const modelZUID = Cypress.env("modelZUID");
  const fieldsPayload = Object.values(FIELDS);
  cy.apiRequest({
    url: `${API_ENDPOINTS.devInstance}/content/models/${modelZUID}/fields?showDeleted=true`,
  }).then(({ data: fields }) => {
    const deletedFields = fields
      ?.filter((field) => !!field?.deletedAt)
      ?.map((item) => item?.ZUID);
    if (!!deletedFields?.length) {
      cy.undeleteFields(modelZUID, deletedFields);
    }
  });
  cy.setFieldProperties(fieldsPayload);
  cy.setContentItemData(null);
});

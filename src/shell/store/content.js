import moment from "moment-timezone";
import cloneDeep from "lodash/cloneDeep";

import { notify } from "shell/store/notifications";
import { request } from "utility/request";
import { fetchNav, navContent } from "apps/content-editor/src/store/navContent";
import { instanceApi } from "../../shell/services/instance";

export function content(state = {}, action) {
  const item = state[action.itemZUID];

  if (action.itemZUID && !item) {
    console.error(`Missing Item: ${action.itemZUID}`);
  }

  switch (action.type) {
    case "GENERATE_NEW_ITEM":
    case "FETCH_ITEM_SUCCESS":
      // We only allow items which include meta, web & data
      if (
        action.itemZUID &&
        action.data &&
        action.data.meta &&
        action.data.web &&
        action.data.data
      ) {
        // Only update items that don't exist locally or that are not dirty
        // otherwise we lose users local changes
        if (!state[action.itemZUID] || !state[action.itemZUID].dirty) {
          return {
            ...state,
            [action.itemZUID]: {
              ...state[action.itemZUID],
              ...action.data,
            },
          };
        } else {
          return state;
        }
      } else {
        console.error("Broken item", action.data);
        return state;
      }

    case "LOAD_ITEM_VERSION":
      return {
        ...state,
        [action.itemZUID]: {
          ...state[action.itemZUID],
          ...action.data,
          dirty: false,
        },
      };

    case "FETCH_ITEMS_SUCCESS":
    case "SEARCH_ITEMS_SUCCESS":
    case "LOADED_LOCAL_ITEMS":
      if (action.data) {
        let items = { ...state };

        Object.keys(action.data).forEach((itemZUID) => {
          // Ensure all items include meta, web & data

          if (
            action.data[itemZUID] &&
            action.data[itemZUID].meta &&
            action.data[itemZUID].web &&
            action.data[itemZUID].data
          ) {
            // Only update items that don't exist locally or that are not dirty
            // otherwise we lose users local changes
            if (!items[itemZUID] || !items[itemZUID].dirty) {
              items[itemZUID] = {
                // Keep derived publishing/scheduling state when updating items
                ...items[itemZUID],
                ...action.data[itemZUID],
                dirty: false,
              };
            }
          }
        });

        return items;
      } else {
        return state;
      }

    case "FETCH_ITEM_PUBLISHING":
      if (action.payload.data[action.payload.itemZUID]) {
        state[action.payload.itemZUID] = {
          ...state[action.payload.itemZUID],
          ...action.payload.data[action.payload.itemZUID],
        };
      } else {
        if (state[action.payload.itemZUID]) {
          // no publish or schedule records so remove them from the item
          delete state[action.payload.itemZUID].publishing;
          delete state[action.payload.itemZUID].scheduling;
        }
      }

      return { ...state };

    case "FETCH_ITEMS_PUBLISHING":
      let newState = { ...state };

      Object.keys(action.data).forEach((itemZUID) => {
        // Update publishings for items we have on hand
        if (newState[itemZUID]) {
          newState[itemZUID] = {
            ...newState[itemZUID],
            ...action.data[itemZUID],
          };
        } else {
          // Otherwise we store an empty record so when the item is eventually loaded
          // we will have it's publishing state preloaded
          // We ensure data, meta & web exist so we don't break the data shape expectations
          newState[itemZUID] = {
            data: {},
            meta: {},
            web: {},
            ...action.data[itemZUID],
          };
        }
      });

      return newState;

    case "REMOVE_ITEM":
      let removed = { ...state };
      delete removed[action.itemZUID];
      return removed;

    case "SET_ITEM_WEB":
      if (item) {
        return {
          ...state,
          [action.itemZUID]: {
            ...item,
            web: {
              ...item.web,
              [action.key]: action.value,
            },
            dirty: true,
          },
        };
      }
      return state;

    case "SET_ITEM_DATA":
      if (item) {
        return {
          ...state,
          [action.itemZUID]: {
            ...item,
            data: {
              ...item.data,
              [action.key]: action.value,
            },
            dirty: true,
          },
        };
      }
      return state;

    case "SET_ITEM_META":
      if (item) {
        return {
          ...state,
          [action.itemZUID]: {
            ...item,
            meta: {
              ...item.meta,
              [action.key]: action.value,
            },
            dirty: true,
          },
        };
      }
      return state;

    case "MARK_ITEM_DIRTY":
      if (item) {
        return {
          ...state,
          [action.itemZUID]: {
            ...item,
            dirty: true,
          },
        };
      }
      return state;

    case "UNMARK_ITEMS_DIRTY":
      return Object.keys(state).reduce((acc, itemZUID) => {
        if (state[itemZUID].dirty && action.items.includes(itemZUID)) {
          acc[itemZUID] = { ...state[itemZUID] };
          acc[itemZUID].dirty = false;
        } else {
          acc[itemZUID] = state[itemZUID];
        }
        return acc;
      }, {});

    default:
      return state;
  }
}

// create the new item in the store
export function generateItem(modelZUID, data = {}) {
  return (dispatch, getState) => {
    const state = getState();
    const itemZUID = `new:${modelZUID}`;
    const item = {
      dirty: false,
      data,
      web: {
        canonicalTagMode: 1,
      },
      meta: {
        ZUID: itemZUID,
        langID: 1,
        contentModelZUID: modelZUID,
        createdByUserZUID: state.user.user_zuid,
        createdAt: moment().utc().format("YYYY-MM-DDTHH:MM:SSZ"),
      },
    };

    dispatch({
      type: "GENERATE_NEW_ITEM",
      itemZUID: itemZUID,
      data: item,
    });

    return item;
  };
}

// API call actions

export function fetchItem(modelZUID, itemZUID) {
  return (dispatch) => {
    return dispatch({
      type: "FETCH_RESOURCE",
      uri: `${CONFIG.API_INSTANCE}/content/models/${modelZUID}/items/${itemZUID}`,
      handler: (res) => {
        if (res.status === 404 || res.data === null) {
          dispatch({
            type: "REMOVE_ITEM",
            itemZUID,
          });
          return res;
        }

        // Only insert valid items into state
        if (res?.data?.meta?.ZUID) {
          dispatch({
            type: "FETCH_ITEM_SUCCESS",
            data: { ...res.data, dirty: false },
            itemZUID,
          });
        }
        return res;
      },
    });
  };
}

export function searchItems(
  term,
  query = {
    order: "created",
    dir: "DESC",
    limit: "100",
  }
) {
  return (dispatch) => {
    return dispatch({
      type: "FETCH_RESOURCE",
      uri: `${CONFIG.API_INSTANCE}/search/items?q=${term}&order=${query.order}&dir=${query.dir}&limit=${query.limit}`,
      handler: (res) => {
        if (res.status === 200 && Array.isArray(res.data)) {
          dispatch({
            type: "SEARCH_ITEMS_SUCCESS",
            data: res.data.reduce((acc, item) => {
              acc[item.meta.ZUID] = item;
              return acc;
            }, {}),
          });
        } else {
          dispatch(
            notify({
              kind: "warn",
              message: `Failed to fetch resource. ${res.status}`,
            })
          );
        }
        return res;
      },
    });
  };
}

export function fetchItems(modelZUID, options = {}) {
  if (!modelZUID) {
    console.error("content:fetchItems() Missing modelZUID");
    console.trace();
    return () => {};
  }

  options.limit = options.limit || 100;
  options.page = options.page || 1;

  return (dispatch, getState) => {
    // TODO load items for selected lang
    // const state = getState();
    // const lang = state.user.selected_lang;

    // if (!options.lang) {
    //   options.lang = lang;
    // }

    const params = new URLSearchParams(options).toString();

    return dispatch({
      type: "FETCH_RESOURCE",
      uri: `${CONFIG.API_INSTANCE}/content/models/${modelZUID}/items?${params}`,
      handler: (res) => {
        if (res.status === 400) {
          dispatch(
            notify({
              kind: "warn",
              message: res.error,
            })
          );
        }

        if (res.status === 200) {
          dispatch({
            type: "FETCH_ITEMS_SUCCESS",
            data: res.data
              .filter((item) => {
                if (item.meta && item.web && item.data) {
                  return true;
                } else {
                  console.error("Broken item", item);
                  return false;
                }
              }) // We only allow items which include meta, web & data
              .reduce((acc, item) => {
                acc[item.meta.ZUID] = item;
                return acc;
              }, {}),
          });
        }

        return res;
      },
    });
  };
}

// NOTE has major performance issues on large sites. Will most likely remove this code
// export function fetchAllItems() {
//   return (dispatch, getState) => {
//     const state = getState();
//     const modelZUIDs = Object.keys(state.models);
//
//     const modelReqs = modelZUIDs.map(ZUID => dispatch(fetchItems(ZUID)));
//
//     return Promise.all(modelReqs)
//       .then(res => {
//         console.log("Fetched all items", res);
//       })
//       .catch(err => {
//         console.error("Error fetching all items", err);
//       });
//   };
// }

export function saveItem({
  itemZUID,
  action = "",
  skipContentItemValidation = false,
}) {
  return (dispatch, getState) => {
    const state = getState();
    const item = cloneDeep(state.content[itemZUID]);
    const fields = Object.keys(state.fields)
      .filter(
        (fieldZUID) =>
          state.fields[fieldZUID].contentModelZUID ===
          item.meta.contentModelZUID
      )
      .map((fieldZUID) => state.fields[fieldZUID]);

    // Check required fields are not empty strings or null valuess
    // Some falsey values are allowed. e.g. false, 0
    const missingRequired = fields.filter(
      (field) =>
        field.required &&
        (item.data[field.name] === "" || item.data[field.name] === null)
    );

    // Check minlength is satisfied
    const lackingCharLength = fields?.filter(
      (field) =>
        field.settings?.minCharLimit &&
        (item.data[field.name]?.length < field.settings?.minCharLimit ||
          !item.data[field.name])
    );

    const regexPatternMismatch = fields?.filter(
      (field) =>
        field.settings?.regexMatchPattern &&
        !new RegExp(field.settings?.regexMatchPattern).test(
          item.data[field.name]
        )
    );

    const regexRestrictPatternMatch = fields?.filter(
      (field) =>
        field.settings?.regexRestrictPattern &&
        new RegExp(field.settings?.regexRestrictPattern).test(
          item.data[field.name]
        )
    );

    const invalidRange = fields?.filter(
      (field) =>
        field.settings?.minValue !== null &&
        field.settings?.maxValue !== null &&
        (item.data[field.name] < field.settings?.minValue ||
          item.data[field.name] > field.settings?.maxValue)
    );

    // When skipContentItemValidation is true, this means that only the
    // SEO meta tags were changed, so we skip validating the content item
    if (
      !skipContentItemValidation &&
      (missingRequired?.length ||
        lackingCharLength?.length ||
        regexPatternMismatch?.length ||
        regexRestrictPatternMatch?.length ||
        invalidRange?.length)
    ) {
      return Promise.resolve({
        err: "VALIDATION_ERROR",
        ...(!!missingRequired?.length && { missingRequired }),
        ...(!!lackingCharLength?.length && { lackingCharLength }),
        ...(!!regexPatternMismatch?.length && { regexPatternMismatch }),
        ...(!!regexRestrictPatternMatch?.length && {
          regexRestrictPatternMatch,
        }),
        ...(!!invalidRange?.length && { invalidRange }),
      });
    }

    if (item.web.metaDescription) {
      item.web.metaDescription = item.web.metaDescription.slice(0, 160);
    }
    if (item.web.metaTitle) {
      item.web.metaTitle = item.web.metaTitle.slice(0, 150);
    }
    if (item.web.metaLinkText) {
      item.web.metaLinkText = item.web.metaLinkText.slice(0, 150);
    }
    if (item.web.metaKeywords) {
      item.web.metaKeywords = item.web.metaKeywords.slice(0, 255);
    }
    /*
      Nav item will not be found if item does exist in the nav such is the case
      when the item is in a dataset
    */
    const navItem = state.navContent.raw.find(
      (nav) => nav.ZUID === item.meta.ZUID
    );

    // fetch nav only when metaLinkText is updated
    if (item.web.metaLinkText !== navItem?.label) {
      dispatch(fetchNav());
    }

    return request(
      `${CONFIG.API_INSTANCE}/content/models/${item.meta.contentModelZUID}/items/${itemZUID}${action}`,
      {
        method: "PUT",
        json: true,
        body: {
          data: item.data,
          meta: item.meta,
          web: item.web,
        },
      }
    ).then(async (res) => {
      dispatch(instanceApi.util.invalidateTags(["ContentNav"]));
      dispatch(
        instanceApi.util.invalidateTags([{ type: "ItemVersions", itemZUID }])
      );
      dispatch({
        type: "UNMARK_ITEMS_DIRTY",
        items: [itemZUID],
      });

      if (res.status === 200) {
        await dispatch(fetchItem(item.meta.contentModelZUID, itemZUID));
      }

      zesty.trigger("PREVIEW_REFRESH");

      return res;
    });
  };
}

export function createItem({ modelZUID, itemZUID, skipPathPartValidation }) {
  return (dispatch, getState) => {
    const state = getState();

    let item = cloneDeep(state.content[itemZUID]);

    const fields = Object.keys(state.fields)
      .filter(
        (fieldZUID) => state.fields[fieldZUID].contentModelZUID === modelZUID
      )
      .map((fieldZUID) => state.fields[fieldZUID]);

    // Temp ZUID for store lookups
    delete item.meta.ZUID;
    // Temp timestamp for sorting
    delete item.meta.createdAt;

    // Remove content item data keys that are not in the fields list, this handles the case where a field is deleted/renamed from the model while the item is being created
    Object.keys(item.data).forEach((key) => {
      if (!fields.find((field) => field.name === key)) {
        delete item.data[key];
      }
    });

    // cover cases where the creating user zuid is missing
    if (!item.meta.createdByUserZUID) {
      item.meta.createdByUserZUID = state.user.user_zuid;
    }

    // Check required fields are not empty, except the og and tc fields since these
    // are handled by the meta component
    const missingRequired = fields.filter((field) => {
      if (
        !field.deletedAt &&
        !["og_title", "og_description", "tc_title", "tc_description"].includes(
          field.name
        ) &&
        field.required
      ) {
        if (!item.data[field.name] && item.data[field.name] != 0) {
          return true;
        }
      }
      return false;
    });

    const hasMissingRequiredSEOFields = skipPathPartValidation
      ? !item?.web?.metaTitle
      : !item?.web?.metaTitle ||
        !item?.web?.metaDescription ||
        !item?.web?.pathPart;

    // Check minlength is satisfied
    const lackingCharLength = fields?.filter(
      (field) =>
        field.settings?.minCharLimit &&
        (item.data[field.name]?.length < field.settings?.minCharLimit ||
          !item.data[field.name])
    );

    const regexPatternMismatch = fields?.filter(
      (field) =>
        field.settings?.regexMatchPattern &&
        !new RegExp(field.settings?.regexMatchPattern).test(
          item.data[field.name]
        )
    );

    const regexRestrictPatternMatch = fields?.filter(
      (field) =>
        field.settings?.regexRestrictPattern &&
        new RegExp(field.settings?.regexRestrictPattern).test(
          item.data[field.name]
        )
    );

    const invalidRange = fields?.filter(
      (field) =>
        field.settings?.minValue !== null &&
        field.settings?.maxValue !== null &&
        (item.data[field.name] < field.settings?.minValue ||
          item.data[field.name] > field.settings?.maxValue)
    );

    if (
      missingRequired?.length ||
      lackingCharLength?.length ||
      regexPatternMismatch?.length ||
      regexRestrictPatternMatch?.length ||
      invalidRange?.length ||
      hasMissingRequiredSEOFields
    ) {
      return Promise.resolve({
        err: "VALIDATION_ERROR",
        ...(!!missingRequired?.length && { missingRequired }),
        ...(!!lackingCharLength?.length && { lackingCharLength }),
        ...(!!regexPatternMismatch?.length && { regexPatternMismatch }),
        ...(!!regexRestrictPatternMatch?.length && {
          regexRestrictPatternMatch,
        }),
        ...(!!invalidRange?.length && { invalidRange }),
      });
    }

    if (item.web.metaDescription) {
      item.web.metaDescription = item.web.metaDescription.slice(0, 160);
    }

    return request(`${CONFIG.API_INSTANCE}/content/models/${modelZUID}/items`, {
      method: "POST",
      json: true,
      body: {
        data: item.data,
        web: item.web,
        meta: item.meta,
      },
    }).then((res) => {
      if (!res.error) {
        dispatch(instanceApi.util.invalidateTags(["ContentNav"]));
        dispatch({
          type: "REMOVE_ITEM",
          itemZUID,
        });
      }
      return res;
    });
  };
}

export function deleteItem(modelZUID, itemZUID) {
  return (dispatch) => {
    return request(
      `${CONFIG.API_INSTANCE}/content/models/${modelZUID}/items/${itemZUID}`,
      {
        method: "DELETE",
      }
    ).then((res) => {
      if (res.status >= 400) {
        dispatch(
          notify({
            message: `Failure deleting item: ${res.statusText}`,
            kind: "error",
          })
        );
      } else {
        dispatch(instanceApi.util.invalidateTags(["ContentNav"]));
        dispatch({
          type: "REMOVE_ITEM",
          itemZUID,
        });
        dispatch(
          notify({
            message: `Successfully deleted item`,
            kind: "save",
          })
        );
      }
      return res;
    });
  };
}

export function publish(modelZUID, itemZUID, data, meta = {}) {
  return (dispatch, getState) => {
    const item = getState().content[itemZUID];
    let title;

    if (item) {
      title = `"${item.web.metaTitle || item.web.metaLinkText}" version ${
        data.version
      }`;
    } else {
      title = `item ${itemZUID} version ${data.version}`;
    }

    return request(
      `${CONFIG.API_INSTANCE}/content/models/${modelZUID}/items/${itemZUID}/publishings`,
      {
        method: "POST",
        json: true,
        body: {
          publishAt: "now", //default
          unpublishAt: "never", //default
          ...data,
        },
      }
    )
      .then((res) => {
        if (res.status >= 400) {
          return Promise.reject(new Error(res.error));
        }
      })
      .then(() => {
        const message = data.publishAt
          ? `Scheduled ${title} to publish on ${meta.localTime} in the ${meta.localTimezone} timezone`
          : `Published ${title} now`;

        return dispatch(
          notify({
            message,
            kind: "save",
          })
        );
      })
      .then(() => {
        dispatch(
          instanceApi.util.invalidateTags([
            { type: "ItemPublishing", itemZUID },
          ])
        );
        return dispatch(fetchItemPublishing(modelZUID, itemZUID));
      })
      .catch((err) => {
        const message = data.publishAt
          ? `Error scheduling ${title}`
          : `Error publishing ${title}`;
        dispatch(
          notify({
            message,
            kind: "error",
          })
        );
        throw err;
      });
  };
}

export function unpublish(modelZUID, itemZUID, publishZUID, options = {}) {
  return (dispatch, getState) => {
    const instance = getState().instance;
    const item = getState().content[itemZUID];

    let title;
    if (item?.web) {
      title = `"${item.web.metaTitle || item.web.metaLinkText}"`;
    } else {
      title = `item ${itemZUID}`;
    }

    return request(
      `${CONFIG.API_INSTANCE}/content/models/${modelZUID}/items/${itemZUID}/publishings/${publishZUID}`,
      {
        method: "DELETE",
      }
    )
      .then((res) => {
        if (res.error) {
          throw res.error;
        }

        const message = options.version
          ? `Unscheduled version ${options.version}`
          : `Unpublished ${title}`;

        return dispatch(
          notify({
            message,
            kind: "save",
          })
        );
      })
      .then(() => {
        dispatch(
          instanceApi.util.invalidateTags([
            { type: "ItemPublishing", itemZUID },
          ])
        );
        return dispatch(fetchItemPublishing(modelZUID, itemZUID));
      })
      .catch((err) => {
        const message = options.version
          ? `Error Unscheduling version ${options.version}`
          : `Error Unpublishing ${title}`;
        return dispatch(
          notify({
            message,
            kind: "error",
          })
        );
      });
  };
}

export function fetchItemPublishing(modelZUID, itemZUID) {
  return (dispatch) => {
    return dispatch({
      type: "FETCH_RESOURCE",
      uri: `${CONFIG.API_INSTANCE}/content/models/${modelZUID}/items/${itemZUID}/publishings`,
      handler: (res) => {
        if (Array.isArray(res.data)) {
          dispatch({
            type: "FETCH_ITEM_PUBLISHING",
            payload: {
              data: parsePublishState(res.data),
              itemZUID,
            },
          });
          dispatch(
            instanceApi.util.invalidateTags([
              { type: "ItemPublishing", id: itemZUID },
            ])
          );
        }
      },
    });
  };
}

export function fetchItemPublishings() {
  return (dispatch) => {
    return dispatch({
      type: "FETCH_RESOURCE",
      uri: `${CONFIG.API_INSTANCE}/content/items/publishings?limit=100000`,
      handler: (res) => {
        if (res.status === 200) {
          dispatch({
            type: "FETCH_ITEMS_PUBLISHING",
            data: parsePublishState(res.data),
          });
        } else {
          dispatch(
            notify({
              kind: "warn",
              message: `${res.status}:Failed to fetch item publishings${
                res.error ? ": " + res.error : ""
              }`,
            })
          );
        }
      },
    });
  };
}

export function checkLock(itemZUID) {
  return () => {
    return request(
      `${CONFIG.SERVICE_REDIS_GATEWAY}/door/knock?path=${itemZUID}`,
      {
        credentials: "omit",
      }
    );
  };
}

export function unlock(itemZUID) {
  return () => {
    return request(
      `${CONFIG.SERVICE_REDIS_GATEWAY}/door/unlock?path=${itemZUID}`,
      {
        credentials: "omit",
      }
    );
  };
}

export function lock(itemZUID) {
  return (dispatch, getState) => {
    const user = getState().user;
    if (user) {
      return request(`${CONFIG.SERVICE_REDIS_GATEWAY}/door/lock`, {
        method: "POST",
        credentials: "omit",
        json: true,
        body: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          userZUID: user.ZUID,
          path: itemZUID,
        },
      });
    }
  };
}

/**
  Every item can have a publishings and schedulings state

  @items array of publish/schedule objects
  @return {
    itemZUID: {
      publishings: {},
      schedulings: {}
    },
    ...
  }
**/
function parsePublishState(records) {
  let publishStates = {};

  records.forEach((record) => {
    // 1) Ensure we have a record setup with shape
    if (!publishStates[record.itemZUID]) {
      publishStates[record.itemZUID] = {
        publishing: {},
        scheduling: {},
      };
    }

    // 2) Determine if this is a publish or schedule record

    // NEVER PUBLISHED ITEM
    // Empty res.data array

    // SCHEDULED NEVER PUBLISHED ITEM
    // 0	{…}
    // ZUID	18-773b0cc-c8j5mr
    // itemZUID	7-9a87a6b9b5-13d5k4
    // version	1
    // versionZUID	9-90a9baf9b6-tqxx02
    // publishAt	2018-12-21T00:26:00Z    <-- publishAt is in the future to indicate scheduled
    // unpublishAt	null
    // publishedByUserZUID	5-44ccc74-tr1vmph
    // createdAt	2018-12-18T00:26:52Z
    // updatedAt	2018-12-18T00:26:52Z

    // PUBLISHED ITEM
    // 0	{…}
    // ZUID	18-773b176-1llgj6
    // itemZUID	7-9a87a6b9b5-13d5k4
    // version	2
    // versionZUID	9-80d6b3b6ea-s01c08
    // publishAt	2018-12-18T00:29:42Z   <-- publishAt is in the past to indicate published now
    // unpublishAt	null
    // publishedByUserZUID	5-44ccc74-tr1vmph
    // createdAt	2018-12-18T00:29:43Z
    // updatedAt	2018-12-18T00:29:43Z

    // UNPUBLISHED ITEM
    // ZUID	18-7623b41-dd16lt
    // itemZUID	7-75d3a25-bbwlf5
    // version	17
    // versionZUID	9-7623b41-4nzvt2
    // publishAt	2018-12-04T18:36:49Z
    // unpublishAt	2018-12-14T19:26:45Z
    // publishedByUserZUID	5-44ccc74-3mkkrv
    // createdAt	2018-12-04T18:36:49Z
    // updatedAt	2018-12-14T19:23:46Z

    // PUBLISHED AND SCHEDULED ITEM
    // 0	{…}
    // ZUID	18-773b1e0-lznfhp
    // itemZUID	7-9a87a6b9b5-13d5k4
    // version	3
    // versionZUID	9-c2a1ba9f82-qpm8lk
    // publishAt	2018-12-28T00:26:00Z
    // unpublishAt	null
    // publishedByUserZUID	5-44ccc74-tr1vmph
    // createdAt	2018-12-18T00:31:28Z
    // updatedAt	2018-12-18T00:31:28Z
    // 1	{…}
    // ZUID	18-773b176-1llgj6
    // itemZUID	7-9a87a6b9b5-13d5k4
    // version	2
    // versionZUID	9-80d6b3b6ea-s01c08
    // publishAt	2018-12-18T00:29:42Z
    // unpublishAt	2018-12-28T00:26:00Z
    // publishedByUserZUID	5-44ccc74-tr1vmph
    // createdAt	2018-12-18T00:29:43Z
    // updatedAt	2018-12-18T00:31:28Z

    //////////////////

    /**
      How to determine if an item is published, scheduled or unpublished

      publishAtGMT                        unpublishAtGMT
      2018-12-02                          2018-12-08
      <---------------------------------->

      ^nowGMT (scheduled)
      ^nowGMT (published)
      ^nowGMT (unpublished)

      If `publishAt` is set but unpublishAt is not you only need to determine if `nowGMT` is after `publishAt`. a.k.a is it live
      If both `publishAt` and `unpublishAt` are set you need determine all 3 states.
    **/
    const nowGMT = moment.utc();
    const publishAtGMT = moment(record.publishAt);
    const unpublishAtGMT = moment(record.unpublishAt);

    // Current time is before publishAt so it is scheduled
    if (nowGMT.isBefore(publishAtGMT)) {
      record.isScheduled = true;

      // We don't null out `publishAt` so even if it is set we need to confirm
      // there is not a `unpublishAt` set and if so whether it has been passed
      if (unpublishAtGMT && nowGMT.isAfter(unpublishAtGMT)) {
        record.isScheduled = false;
      }

      // Current time is after publishAt so it is published
    } else if (nowGMT.isAfter(publishAtGMT)) {
      record.isPublished = true;

      // Current time has passed unpublishAt so it is un-published
      if (unpublishAtGMT && nowGMT.isAfter(unpublishAtGMT)) {
        record.isPublished = false;
      }
    } else {
      console.log("Unsure if this item is published or scheduled");
    }

    // 3) Set record if it's the most current version
    if (record.isScheduled) {
      if (
        !publishStates[record.itemZUID].scheduling.version ||
        publishStates[record.itemZUID].scheduling.version < record.version
      ) {
        publishStates[record.itemZUID].scheduling = record;
      }
    } else if (record.isPublished) {
      if (
        !publishStates[record.itemZUID].publishing.version ||
        publishStates[record.itemZUID].publishing.version < record.version
      ) {
        publishStates[record.itemZUID].publishing = record;
      }
    }
  });

  return publishStates;
}

// utility functions
export function fetchGlobalItem() {
  let globalsData = {};
  return (dispatch, getState) => {
    if (Object.keys(globalsData).length) {
      return globalsData;
    }

    const state = getState();
    const clippingsModelZUID = Object.keys(state.models).find(
      (modelZUID) => state.models[modelZUID].name === "clippings"
    );

    if (clippingsModelZUID) {
      const clippingsItemZUID = Object.keys(state.content).find((itemZUID) => {
        return (
          state.content[itemZUID] &&
          state.content[itemZUID].meta.contentModelZUID === clippingsModelZUID
        );
      });

      if (clippingsItemZUID) {
        globalsData = state.content[clippingsItemZUID].data;
      } else {
        dispatch(fetchItems(clippingsModelZUID));
      }
    }
    return globalsData;
  };
}

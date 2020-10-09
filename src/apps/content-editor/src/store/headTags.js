import { request } from "utility/request";
import { notify } from "shell/store/notifications";

export function headTags(state = [], action) {
  switch (action.type) {
    case "FETCH_HEADTAGS_SUCCESS":
      return { ...state, ...action.data };

    case "ADD_HEADTAG":
      return { ...state, [action.tag.ZUID]: action.tag };

    case "DELETE_HEADTAG":
      let removedTag = { ...state };
      delete removedTag[action.id];
      return removedTag;

    case "UPDATE_TAG_SORT":
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          sort: action.sort
        }
      };

    case "UPDATE_TAG_TYPE":
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          type: action.value,
          attributes: [...state[action.id].attributes, ...action.attributes]
        }
      };

    case "ADD_TAG_ATTRIBUTE":
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          attributes: [...state[action.id].attributes, action.attr]
        }
      };

    case "DELETE_TAG_ATTRIBUTE":
      const attrs = [...state[action.id].attributes];
      attrs.splice(action.index, 1);

      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          attributes: attrs
        }
      };

    case "UPDATE_TAG_ATTRIBUTE":
      let tags = {
        ...state,
        [action.id]: {
          ...state[action.id],
          attributes: [...state[action.id].attributes]
        }
      };

      tags[action.id].attributes[action.index] = action.attr;

      return tags;

    default:
      return state;
  }
}

// Transform attributes into an array structure.
// Also helpful for maintaining order
function transformAttributes(attrs) {
  return Object.keys(attrs).map(key => {
    return {
      key: key,
      value: attrs[key]
    };
  });
}

export const fetchHeadTags = () => {
  return dispatch => {
    return dispatch({
      type: "FETCH_RESOURCE",
      uri: `${CONFIG.API_INSTANCE}/web/headtags`,
      handler: res => {
        if (res.status === 200) {
          dispatch({
            type: "FETCH_HEADTAGS_SUCCESS",
            data: res.data.reduce((acc, tag) => {
              acc[tag.ZUID] = tag;
              acc[tag.ZUID].attributes = transformAttributes(tag.attributes);

              return acc;
            }, {})
          });
        } else {
          dispatch(
            notify({
              kind: "warn",
              message: `Failed to fetch head tags`
            })
          );
          if (res.error) {
            throw new Error(res.error);
          }
        }
      }
    });
  };
};

/*
"type": "script",
"attributes": {
  "key":"value"
},
"resourceZUID": "{{headtag_resource_zuid}}",
"sortOrder": 1
*/
export const createHeadTag = tag => {
  return dispatch => {
    return request(`${CONFIG.API_INSTANCE}/web/headtags`, {
      method: "POST",
      json: true,
      body: tag
    }).then(res => {
      if (!res.data.error) {
        res.data.attributes = transformAttributes(res.data.attributes);
        dispatch({
          type: "ADD_HEADTAG",
          tag: res.data
        });
      }
      return res;
    });
  };
};

export const deleteHeadTag = id => {
  return dispatch => {
    return request(`${CONFIG.API_INSTANCE}/web/headtags/${id}`, {
      method: "DELETE"
    }).then(res => {
      if (!res.data.error) {
        dispatch({
          type: "DELETE_HEADTAG",
          id
        });
        return res;
      }
    });
  };
};

export const saveHeadTag = tag => {
  return dispatch => {
    return request(`${CONFIG.API_INSTANCE}/web/headtags/${tag.ZUID}`, {
      method: "PUT",
      json: true,
      body: tag
    });
  };
};

export const addTagAttribute = (id, attr = { key: "", value: "" }) => {
  return dispatch => {
    return dispatch({
      type: "ADD_TAG_ATTRIBUTE",
      id,
      attr
    });
  };
};

export const deleteTagAttribute = (id, index) => {
  return dispatch => {
    return dispatch({
      type: "DELETE_TAG_ATTRIBUTE",
      id,
      index
    });
  };
};

export const updateTagAttribute = (id, index, attr) => {
  return dispatch => {
    return dispatch({
      type: "UPDATE_TAG_ATTRIBUTE",
      id,
      index,
      attr
    });
  };
};

export const updateTagSort = (id, sort) => {
  return dispatch => {
    return dispatch({
      type: "UPDATE_TAG_SORT",
      id,
      sort
    });
  };
};

export const updateTagType = (id, value) => {
  return dispatch => {
    const attributes = [];

    // if (value === "meta") {
    //   attributes.push({ key: "name", value: "" });
    //   attributes.push({ key: "content", value: "" });
    // }
    // if (value === "script") {
    //   attributes.push({ key: "rel", value: "preload" });
    //   attributes.push({ key: "as", value: "script" });
    //   attributes.push({ key: "type", value: "text/javascript" });
    //   attributes.push({ key: "src", value: "" });
    // }
    // if (value === "link") {
    //   attributes.push({ key: "rel", value: "preload" });
    //   attributes.push({ key: "as", value: "style" });
    //   attributes.push({ key: "type", value: "text/css" });
    //   attributes.push({ key: "media", value: "screen" });
    //   attributes.push({ key: "href", value: "" });
    // }

    return dispatch({
      type: "UPDATE_TAG_TYPE",
      id,
      value,
      attributes
    });
  };
};

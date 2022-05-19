import { formatName } from "utility/formatName";
import { request } from "utility/request";
import { notify } from "shell/store/notifications";

export function fields(state = {}, action) {
  switch (action.type) {
    case "FETCH_FIELDS_SUCCESS":
    case "LOADED_LOCAL_FIELDS":
      return { ...state, ...action.payload };

    case "FETCH_FIELD_SUCCESS":
      return { ...state, [action.payload.fieldZUID]: action.payload.data };

    case "SET_FIELD_VALUE":
      return {
        ...state,
        [action.payload.fieldZUID]: {
          // Maintain previous field state
          ...state[action.payload.fieldZUID],
          // Update field value
          [action.payload.key]: action.payload.value,
          // Mark as updated
          dirty: true,
        },
      };

    case "SET_FIELD_SETTING":
      return {
        ...state,
        [action.payload.fieldZUID]: {
          // Maintain previous field state
          ...state[action.payload.fieldZUID],

          // Update field options
          settings: {
            ...state[action.payload.fieldZUID].settings,
            [action.payload.key]: action.payload.value,
          },

          // Mark as updated
          dirty: true,
        },
      };

    case "SAVE_FIELD_SUCCESS":
      return {
        ...state,
        [action.payload.fieldZUID]: {
          ...state[action.payload.fieldZUID],
          dirty: false,
        },
      };

    default:
      return state;
  }
}

export function updateField(fieldZUID, key, value) {
  if (key === "name") {
    value = formatName(value);
  }

  return {
    type: "SET_FIELD_VALUE",
    payload: { fieldZUID, key, value },
  };
}

export function updateFieldSetting(fieldZUID, key, value) {
  return {
    type: "SET_FIELD_SETTING",
    payload: { fieldZUID, key, value },
  };
}

export function fetchFields(modelZUID) {
  return (dispatch) => {
    return dispatch({
      type: "FETCH_RESOURCE",
      uri: `${CONFIG.API_INSTANCE}/content/models/${modelZUID}/fields?showDeleted=true`,
      handler: (res) => {
        if (Array.isArray(res.data)) {
          return dispatch({
            type: "FETCH_FIELDS_SUCCESS",
            payload: res.data.reduce((acc, field, i) => {
              acc[field.ZUID] = field;
              acc[field.ZUID].settings = acc[field.ZUID].settings || {};
              acc[field.ZUID].settings.list =
                acc[field.ZUID].settings.list || false;

              return acc;
            }, {}),
          });
        }
      },
    });
  };
}

export function fetchField(modelZUID, fieldZUID) {
  return (dispatch) => {
    return dispatch({
      type: "FETCH_RESOURCE",
      uri: `${CONFIG.API_INSTANCE}/content/models/${modelZUID}/fields/${fieldZUID}`,
      handler: (res) => {
        return dispatch({
          type: "FETCH_FIELD_SUCCESS",
          payload: {
            fieldZUID,
            data: res.data,
          },
        });
      },
    });
  };
}

export function saveField(modelZUID, fieldZUID, payload) {
  return (dispatch, getState) => {
    const state = getState();
    const field = payload || state.fields[fieldZUID];

    if (!field) {
      throw new Error(`Field(${fieldZUID}) is missing from store.`);
    }

    // Copy so we don't alter the in store field
    const modifedField = { ...field };

    // Update value to current user
    modifedField.updatedByUserZUID = state.user.user_zuid;

    // API does not allow submitting this value
    // delete field.name;

    // Remove local derived state
    delete modifedField.isOpen;

    return request(
      `${CONFIG.API_INSTANCE}/content/models/${modelZUID}/fields/${fieldZUID}`,
      {
        method: "PUT",
        json: true,
        body: modifedField,
      }
    ).then((res) => {
      dispatch({
        type: "SAVE_FIELD_SUCCESS",
        payload: { modelZUID, fieldZUID },
      });

      // dispatch(fetchField(modelZUID, fieldZUID));
      return res;
    });
  };
}

export function createField(modelZUID, payload) {
  return (dispatch) => {
    return request(
      `${CONFIG.API_INSTANCE}/content/models/${modelZUID}/fields`,
      {
        method: "POST",
        json: true,
        body: payload,
      }
    )
      .then((res) => {
        dispatch(fetchFields(modelZUID));
        return res;
      })
      .catch((err) => {
        console.error("Failed creating field", err);
        dispatch(
          notify({
            kind: "warn",
            message: `Failed to create field. ${err.message}`,
          })
        );
      });
  };
}

export function deactivateField(modelZUID, fieldZUID) {
  return (dispatch, getState) => {
    // TODO what is the endpoint for deactivation? Just a DELETE operation?
    return request(
      `${CONFIG.API_INSTANCE}/content/models/${modelZUID}/fields/${fieldZUID}`,
      {
        method: "DELETE",
      }
    ).then((res) => {
      dispatch(fetchFields(modelZUID));
      return res;
    });
  };
}

export function activateField(modelZUID, fieldZUID) {
  return (dispatch) => {
    return request(
      `${CONFIG.API_INSTANCE}/content/models/${modelZUID}/fields/${fieldZUID}?action=undelete`,
      {
        method: "PUT",
      }
    ).then((res) => {
      dispatch(fetchFields(modelZUID));
      return res;
    });
  };
}

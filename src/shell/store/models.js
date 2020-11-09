import { formatName } from "utility/formatName";
import { request } from "utility/request";
import { notify } from "shell/store/notifications";

export function models(state = {}, action) {
  switch (action.type) {
    case "FETCH_MODELS_SUCCESS":
    case "LOADED_LOCAL_MODELS":
      return { ...action.payload };

    case "FETCH_MODEL_SUCCESS":
    case "CREATE_MODEL_SUCCESS":
      return {
        ...state,
        [action.payload.ZUID]: {
          ...action.payload
        }
      };

    case "SAVE_MODEL_SUCCESS":
      return {
        ...state,
        [action.payload.ZUID]: {
          ...state[action.payload.ZUID],
          dirty: false
        }
      };

    case "SET_MODEL_VALUE":
      return {
        ...state,
        [action.payload.ZUID]: {
          ...state[action.payload.ZUID],
          [action.payload.key]: action.payload.value,
          dirty: true
        }
      };

    default:
      return state;
  }
}

export function updateModel(ZUID, key, value) {
  if (key === "name") {
    value = formatName(value);
  }

  return {
    type: "SET_MODEL_VALUE",
    payload: {
      ZUID,
      key,
      value
    }
  };
}

// API call actions

export function fetchModels() {
  return dispatch => {
    return dispatch({
      type: "FETCH_RESOURCE",
      uri: `${CONFIG.API_INSTANCE}/content/models`,
      handler: res => {
        if (res.status === 200) {
          return dispatch({
            type: "FETCH_MODELS_SUCCESS",
            payload: res.data.reduce((acc, model) => {
              acc[model.ZUID] = model;
              return acc;
            }, {})
          });
        } else {
          dispatch(
            notify({
              kind: "warn",
              message: `Failed to fetch models`
            })
          );
          if (res.error) {
            throw new Error(res.error);
          }
        }
      }
    });
  };
}

export function fetchModel(modelZUID) {
  return dispatch => {
    return dispatch({
      type: "FETCH_RESOURCE",
      uri: `${CONFIG.API_INSTANCE}/content/models/${modelZUID}`,
      handler: res => {
        return dispatch({
          type: "FETCH_MODEL_SUCCESS",
          payload: res.data
        });
      }
    });
  };
}

export function createModel(payload) {
  return dispatch => {
    // TODO check payload.name against existing state

    return request(`${CONFIG.API_INSTANCE}/content/models`, {
      method: "POST",
      json: true,
      body: payload
    }).then(res => {
      if (res.status === 200) {
        dispatch({
          type: "CREATE_MODEL_SUCCESS",
          payload: res.data
        });
      }
      return res;
    });
  };
}

export function duplicateModel(ZUID) {
  return (dispatch, getState) => {
    const state = getState();
    const model = state.models[ZUID];
    const fields = Object.values(state.fields).filter(
      field => field.contentModelZUID === ZUID
    );

    if (!model) {
      dispatch(
        notify({
          kind: "warn",
          message: `Missing model: ${ZUID}`
        })
      );
      return;
    }

    const duplicateModel = { ...model };

    // Model name must be unique
    duplicateModel.name = `${duplicateModel.name}_${Date.now()}`;
    duplicateModel.label = `${duplicateModel.label}_${Date.now()}`;

    // API will create these for the new model
    delete duplicateModel.ZUID;
    delete duplicateModel.masterZUID;

    return request(`${CONFIG.API_INSTANCE}/content/models`, {
      method: "POST",
      json: true,
      body: duplicateModel
    }).then(modelResponse => {
      if (modelResponse.status === 200) {
        dispatch({
          type: "CREATE_MODEL_SUCCESS",
          payload: modelResponse.data
        });

        return Promise.all(
          fields.map(field => {
            const duplicateField = { ...field };

            delete duplicateField.ZUID;
            delete duplicateField.contentModelZUID;

            return request(
              `${CONFIG.API_INSTANCE}/content/models/${modelResponse.data.ZUID}/fields`,
              {
                method: "POST",
                json: true,
                body: duplicateField
              }
            );
          })
        )
          .then(() => {
            return modelResponse;
          })
          .catch(err => {
            console.error("Failed duplicating model fields", err);
            throw err;
          });
      } else {
        return modelResponse;
      }
    });
  };
}

export function saveModel(modelZUID, payload) {
  return (dispatch, getState) => {
    // Update value to current user
    payload.updatedByUserZUID = getState().user.user_zuid;

    return request(`${CONFIG.API_INSTANCE}/content/models/${modelZUID}`, {
      method: "PUT",
      json: true,
      body: payload
    }).then(res => {
      if (res.status === 200) {
        dispatch({
          type: "SAVE_MODEL_SUCCESS",
          payload: res.data
        });
      }

      return res;
    });
  };
}

export function deleteModel(modelZUID) {
  return dispatch => {
    return request(`${CONFIG.API_INSTANCE}/content/models/${modelZUID}`, {
      method: "DELETE"
    }).then(() => dispatch(fetchModels()));
  };
}

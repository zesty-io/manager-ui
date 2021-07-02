import { notify } from "shell/store/notifications";
import { resolvePathPart } from "./files";
import { request } from "utility/request";

export function headers(state = [], action) {
  switch (action.type) {
    case "FETCH_HEADERS_SUCCESS":
      return action.payload;

    default:
      return state;
  }
}

export function fetchHeaders() {
  return (dispatch) => {
    return dispatch({
      type: "FETCH_RESOURCE",
      uri: `${CONFIG.API_INSTANCE}/web/headers`,
      handler: (res) => {
        dispatch({
          type: "FETCH_HEADERS_SUCCESS",
          payload: res.data,
        });

        return res;
      },
    });
  };
}

export function saveSort(type, headers) {
  if (!Array.isArray(headers)) {
    throw new Error("saveSort requires an array of headers");
  }

  const pathPart = resolvePathPart(type);

  return (dispatch) => {
    const body = headers.map((header) => {
      return {
        ZUID: header.ZUID,
        sort: header.sort,
      };
    });

    return request(`${CONFIG.API_INSTANCE}/web/${pathPart}?action=updateSort`, {
      method: "PUT",
      json: true,
      body,
    })
      .then((res) => {
        if (res.status === 200) {
          dispatch(
            notify({
              kind: "save",
              message: "File sort order has been saved",
            })
          );
        } else {
          dispatch(
            notify({
              kind: "warn",
              message: res.error,
            })
          );
        }

        return res;
      })
      .catch((err) => {
        dispatch(
          notify({
            kind: "error",
            message:
              "We ran into an error saving the file sort order. This is most likely an issue on our end.",
          })
        );

        throw err;
      });
  };
}

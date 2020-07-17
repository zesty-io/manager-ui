import uniqBy from "lodash.uniqby";
// import isEqual from "lodash/fp/isEqual";
import { notify } from "shell/store/notifications";

export function auditTrail(state = [], action) {
  switch (action.type) {
    case "FETCH_FILE_AUDIT_TRAIL_SUCCESS":
      return uniqBy([...state, ...action.payload], "ZUID");

    default:
      return state;
  }
}

export function fetchAuditTrail(fileZUID) {
  return dispatch => {
    return request(`${CONFIG.API_INSTANCE}/env/audits?affectedZUID=${fileZUID}`)
      .then(res => {
        if (res.status === 200) {
          dispatch({
            type: "FETCH_FILE_AUDIT_TRAIL_SUCCESS",
            payload: res.data
          });
        } else {
          notify({
            kind: "warn",
            message: `Unable to load file versions. ${res.status}`
          });
        }
        return res;
      })
      .catch(err => {
        console.error(err);
        notify({
          kind: "warn",
          message: "API Error loading file versions"
        });
      });
  };
}

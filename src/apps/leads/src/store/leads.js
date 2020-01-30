import { request } from "utility/request";
import { notify } from "shell/store/notifications";

export function leads(state = [], action) {
  switch (action.type) {
    case "FETCH_LEADS_SUCCESS":
      return [...state, ...action.payload];
    case "DELETE_LEAD_SUCCESS":
      // Remove the deleted lead from the Store
      state = state.filter(lead => lead.zuid !== action.payload);
      return state;
    case "NEW_NOTIFICATION":
      return state;
    default:
      return state;
  }
}

export function fetchLeads() {
  return dispatch => {
    return request(`${CONFIG.API_INSTANCE}/env/leads`)
      .then(res => {
        dispatch({
          type: "FETCH_LEADS_SUCCESS",
          payload: res.data
        });
      })
      .catch(err => {
        console.error(err);
        notify({
          kind: "warn",
          message: err.message
        });
      });
  };
}

export function deleteLead(leadZuid) {
  return dispatch => {
    return request(`${CONFIG.API_INSTANCE}/env/leads/${leadZuid}`, {
      method: "DELETE"
    })
      .then(res => {
        if (res.hasOwnProperty("error")) {
          throw {
            message: res.error
          };
        }
        dispatch({
          type: "DELETE_LEAD_SUCCESS",
          payload: leadZuid
        });
      })
      .catch(err => {
        dispatch(
          notify({
            kind: "error",
            message: err.message
          })
        );
      });
  };
}

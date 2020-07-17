import { deepFreeze } from "utility/deepFreeze";
import { request } from "utility/request";

export function logs(state = {}, action) {
  switch (action.type) {
    case "FETCH_LOGS_SUCCESS":
      return action.data;

    case "FETCH_AUDIT_TRAIL_DRAFT":
      return {
        ...state,
        [action.itemZUID]: {
          ...state[action.itemZUID],
          auditTrailDraft: action.data
        }
      };
    case "FETCH_AUDIT_TRAIL_PUB":
      return {
        ...state,
        [action.itemZUID]: {
          ...state[action.itemZUID],
          auditTrailPublish: action.data
        }
      };
    case "FETCH_PUBLISH_DATA":
      return {
        ...state,
        [action.itemZUID]: {
          ...state[action.itemZUID],
          publishData: action.data
        }
      };
    default:
      return state;
  }
}

// Actions
export function getLogs(siteId) {
  return dispatch => {
    dispatch({
      type: "FETCHING_LOGS"
    });

    request(`${CONFIG.API_INSTANCE}/env/audits`)
      .then(json => {
        // Normalize logs by zuid
        let data = {};
        json.data.forEach(log => {
          data[log.ZUID] = log;
        });

        // Logs are immutable so we freeze them
        data = deepFreeze(data);

        dispatch({
          type: "FETCH_LOGS_SUCCESS",
          data: data
        });
      })
      .catch(err => {
        dispatch({
          type: "FETCH_LOGS_ERROR",
          err
        });
      });
  };
}

export function fetchAuditTrailDrafting(instanceZUID, itemZUID, limit = 5) {
  return dispatch => {
    return request(
      `${CONFIG.API_INSTANCE}/env/audits?affectedZUID=${itemZUID}&order=created&dir=desc&action=2&limit=${limit}`
    ).then(data => {
      if (data) {
        dispatch({
          type: "FETCH_AUDIT_TRAIL_DRAFT",
          itemZUID,
          data: data.data
        });
      } else {
        console.error(
          "An error fetching Audit trail happened. it is broken, fix it"
        );
      }
    });
  };
}

export function fetchAuditTrailPublish(instanceZUID, itemZUID, limit = 3) {
  return dispatch => {
    return request(
      `${CONFIG.API_INSTANCE}/env/audits?affectedZUID=${itemZUID}&order=created&dir=desc&action=4&limit=${limit}`
    ).then(data => {
      if (data) {
        dispatch({ type: "FETCH_AUDIT_TRAIL_PUB", itemZUID, data: data.data });
      } else {
        console.error(
          "An error fetching Audit trail happened. it is broken, fix it"
        );
      }
    });
  };
}

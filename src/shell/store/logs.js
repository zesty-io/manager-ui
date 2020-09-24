import { request } from "utility/request";

export function logs(state = {}, action) {
  switch (action.type) {
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
    default:
      return state;
  }
}

// Actions
export function fetchAuditTrailDrafting(itemZUID, limit = 5) {
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

export function fetchAuditTrailPublish(itemZUID, limit = 3) {
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

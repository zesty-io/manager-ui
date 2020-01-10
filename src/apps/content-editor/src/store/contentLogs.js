import { request } from "utility/request";

export function contentLogs(state = {}, action) {
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

export function fetchPublishRecords(itemZUID) {
  return (dispatch, getState) => {
    return request(
      `${CONFIG.service.sites}/content/items/${itemZUID}/publish-schedule`
    ).then(data => {
      if (data) {
        dispatch({ type: "FETCH_PUBLISH_DATA", itemZUID, data: data.data });
      } else {
        console.error(
          "An error fetching Publish data happened. it is broken, fix it"
        );
      }
    });
  };
}

export function saveDraft(setZUID, itemZUID) {
  return (dispatch, getState) => {
    const item = getState().items[setZUID][itemZUID];
    if (!item) {
      console.error("No item found in store, something is terribly wrong here");
    }
    return request(
      `${CONFIG.service.sites}/content/sets/${setZUID(
        contentModelZUID
      )}/items/${itemZUID}`,
      {
        method: "PATCH",
        body: {
          content: item,
          canonical_tag_mode: "0",
          listed: 0,
          parent_zuid: "0",
          path_part: "",
          sitemap_priority: "-1.0"
        }
      }
    );
  };
}

export function publishItem() {
  return (dispatch, getState) => {
    // save draft
    // publish schedule with no publish_at
  };
}

export function publishSchedule({ itemZUID, version_zuid, publish_at = null }) {
  // this will only run immediately after a draft save. this returns a new version ZUID
  if (publish_at) {
    return request(
      `${CONFIG.service.sites}/content/items/${itemZUID}/publish-schedule`,
      {
        method: "POST",
        body: {
          publish_at,
          version_zuid
        }
      }
    );
  } else {
    return request(
      `${CONFIG.service.sites}/content/items/${itemZUID}/publish-schedule`,
      {
        method: "POST",
        body: {
          version_zuid
        }
      }
    );
  }
  // this should likely initiate a re-fetch of publish data
}

export function unPublishItem() {
  return (dispatch, getState) => {
    // publishRecordZUID will have to come from a seperate endpoint
    // CONFIG.service.sites/content/items/{itemZUID}/publish-schedule/{publishRecordZUID}
    // this is the UNpublish endpoint PATCH
    // payload is -
    /*
      {take_offline_at: "2018-08-23 10:45:01"}
    */
    // res is new version zuid
  };
}

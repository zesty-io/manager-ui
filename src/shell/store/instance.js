import { request } from "utility/request";
import { notify } from "shell/store/notifications";

/**
 * Unique instance id from URL
 */
const ZUID = window.location.host.split(".")[0];

const DATA = [
  {
    ZUID: "22-a4f0de84d2-dwmz55",
    instanceZUID: "8-f48cf3a682-7fthvk",
    domain: "test.zesty.io2",
    branch: "live",
    createdByUserZUID: "5-c2a5c791e3-krq7ts",
    updatedByUserZUID: "5-c2a5c791e3-krq7ts",
    createdAt: "2022-10-04T17:02:00Z",
    updatedAt: "2022-10-04T17:02:00Z",
  },
  {
    ZUID: "22-ae8bdffeed-gczn62",
    instanceZUID: "8-f48cf3a682-7fthvk",
    domain: "zesty.test.zesty.dev",
    branch: "dev",
    createdByUserZUID: "5-8e92cfe2e6-d2s3bd",
    updatedByUserZUID: "5-8e92cfe2e6-d2s3bd",
    createdAt: "2024-02-28T22:14:33Z",
    updatedAt: "2024-02-28T22:14:33Z",
  },
  {
    ZUID: "22-d8fd8ddb95-79pwvr",
    instanceZUID: "8-f48cf3a682-7fthvk",
    domain: "zesty-pw.zesty.site",
    branch: "live",
    createdByUserZUID: "5-44ccc74-tr1vmph",
    updatedByUserZUID: "5-44ccc74-tr1vmph",
    createdAt: "2024-06-21T23:27:19Z",
    updatedAt: "2024-06-21T23:27:19Z",
  },
  {
    ZUID: "22-e094b583c6-v6j66t",
    instanceZUID: "8-f48cf3a682-7fthvk",
    domain: "stage.zesty.pw",
    branch: "live",
    createdByUserZUID: "5-44ccc74-tr1vmph",
    updatedByUserZUID: "5-44ccc74-tr1vmph",
    createdAt: "2022-11-02T22:27:30Z",
    updatedAt: "2022-11-02T22:27:30Z",
  },
  {
    ZUID: "22-e09ea5b39b-st0c75",
    instanceZUID: "8-f48cf3a682-7fthvk",
    domain: "zesty.pw",
    branch: "live",
    createdByUserZUID: "5-44ccc74-tr1vmph",
    updatedByUserZUID: "5-44ccc74-tr1vmph",
    createdAt: "2019-01-25T19:03:05Z",
    updatedAt: "2019-01-25T19:03:05Z",
  },
  {
    ZUID: "22-f4deb09dbc-v46b7j",
    instanceZUID: "8-f48cf3a682-7fthvk",
    domain: "zesty-pw.zesty.dev",
    branch: "dev",
    createdByUserZUID: "5-44ccc74-tr1vmph",
    updatedByUserZUID: "5-44ccc74-tr1vmph",
    createdAt: "2020-10-15T18:26:08Z",
    updatedAt: "2020-10-15T18:26:08Z",
  },
  {
    ZUID: "22-f8aec9b9f5-808lz7",
    instanceZUID: "8-f48cf3a682-7fthvk",
    domain: "qa1.zesty.pw",
    branch: "dev",
    createdByUserZUID: "5-44ccc74-tr1vmph",
    updatedByUserZUID: "5-44ccc74-tr1vmph",
    createdAt: "2020-10-15T18:27:08Z",
    updatedAt: "2020-10-15T18:27:08Z",
  },
];

export function instance(
  state = {
    ZUID: ZUID,
    settings: {
      seo: {},
    },
  },
  action
) {
  switch (action.type) {
    case "FETCHING_INSTANCE_SUCCESS":
      return { ...state, ...action.payload.data };
    case "FETCH_DOMAINS_SUCCESS":
      return { ...state, domains: action.payload.data };
    default:
      return state;
  }
}

export function fetchInstance() {
  return (dispatch) => {
    dispatch({
      type: "FETCHING_INSTANCE",
    });

    return request(`${CONFIG.API_ACCOUNTS}/instances/${ZUID}`)
      .then((res) => {
        if (res.status === 200) {
          dispatch({
            type: "FETCHING_INSTANCE_SUCCESS",
            payload: {
              data: res.data,
            },
          });
        }

        return res;
      })
      .catch((err) => {
        console.error("fetchInstance failed:", err);
        return Promise.reject(err);
      });
  };
}

export function fetchDomains() {
  return (dispatch) => {
    request(`${CONFIG.API_ACCOUNTS}/instances/${ZUID}/domains`)
      .then((res) => {
        dispatch({
          type: "FETCH_DOMAINS_SUCCESS",
          payload: {
            data: res.data.sort((a, b) => {
              const dateA = new Date(a.createdAt);
              const dateB = new Date(b.createdAt);

              const epochA = dateA.valueOf();
              const epochB = dateB.valueOf();

              return epochA - epochB;
            }),
          },
        });

        return res;
      })
      .catch((err) => {
        // dispatch(
        //   notify({
        //     kind: "warn",
        //     message: "Failed to load domains",
        //   })
        // );
        dispatch({
          type: "FETCH_DOMAINS_SUCCESS",
          payload: {
            data: DATA.sort((a, b) => {
              const dateA = new Date(a.createdAt);
              const dateB = new Date(b.createdAt);

              const epochA = dateA.valueOf();
              const epochB = dateB.valueOf();

              return epochA - epochB;
            }),
          },
        });
      });
  };
}

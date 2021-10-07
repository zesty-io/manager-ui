import { createSlice } from "@reduxjs/toolkit";
import chunk from "lodash/chunk";

import { request } from "utility/request";

import { publish } from "shell/store/content";
import { notify } from "shell/store/notifications";

export const releases = createSlice({
  name: "releases",
  initialState: {
    // Local derived state

    /*
    idle - initial state
    loaded - data loaded from indexeddb
    pending - publish pending
    success - publish total success
    error - publish error

    Valid Transitions
    idle->loaded
    loaded->pending
    pending->{success,error}
    error->pending
    success->loaded
    */
    status: "idle",
    successes: 0,
    failures: 0,

    // API state
    data: [
      {
        ZUID: "00-000-0000",
        name: "Release Plan 1",
        description: "User provided description of plan",
        createdAt: "2020...",
        createdByUserZUID: "5-user-zuid",
        updatedAt: "2021-...",
        updatedByUserZUID: "5-user-zuid",
      },
    ],
  },
  reducers: {
    fetchReleasesSuccess(state, action) {
      state.data = action.payload;
    },

    loadedPlan(state, action) {
      // // no cache, initial load
      // const plan = action.payload;
      // if (!plan) {
      //   state.status = "loaded";
      // } else {
      //   // If user refreshed page and had pending operation,
      //   // let's reset statuses so they can start over
      //   if (plan.status === "pending") {
      //     plan.status = "loaded";
      //   }
      //   plan.data.forEach((step) => {
      //     if (step.status === "pending") {
      //       step.status = "idle";
      //     }
      //   });
      //   return plan;
      // }
    },
    resetPlan(state) {
      state.data = [];
      state.status = "loaded";
      state.successes = 0;
      state.failures = 0;
    },
    // addStep(state, action) {
    //   // prevent duplicate ZUIDs
    //   if (!state.data.find((step) => step.ZUID === action.payload.ZUID)) {
    //     state.data.push(action.payload);
    //     if (state.status === "success") {
    //       state.status = "loaded";
    //     }
    //   }
    // },
    // removeStep(state, action) {
    //   const removeStepIndex = state.data.findIndex(
    //     (step) => step.ZUID === action.payload.ZUID
    //   );
    //   if (removeStepIndex !== -1) {
    //     state.data.splice(removeStepIndex, 1);
    //   }
    // },
    // updateStep(state, action) {
    //   const updateStep = state.data.find(
    //     (step) => step.ZUID === action.payload.ZUID
    //   );
    //   if (updateStep) {
    //     updateStep.version = action.payload.version;
    //   }
    // },
    publishPending(state, action) {
      const step = state.data.find((step) => step.ZUID === action.payload);
      if (step) {
        step.status = "pending";
      }
    },
    publishSuccess(state, action) {
      const removeStepIndex = state.data.findIndex(
        (step) => step.ZUID === action.payload
      );
      if (removeStepIndex !== -1) {
        state.data.splice(removeStepIndex, 1);
        state.successes++;
      }
    },
    publishFailure(state, action) {
      const step = state.data.find((step) => step.ZUID === action.payload.ZUID);
      if (step) {
        step.status = "error";
        step.error = action.payload.error;
        state.errors++;
      }
    },
    publishPlanPending(state) {
      state.status = "pending";
      // reset errors on start of publish
      state.errors = 0;
    },
    publishPlanSuccess(state) {
      state.status = "success";
    },
    publishPlanFailure(state) {
      state.status = "error";
    },
  },
});

export const { actions, reducer } = releases;

// export const {
//   loadedPlan,
//   resetPlan,
//   // addStep,
//   // removeStep,
//   // updateStep,
//   publishPending,
//   publishSuccess,
//   publishFailure,
//   publishPlanPending,
//   publishPlanSuccess,
//   publishPlanFailure,
// } = actions;

// export default reducer;

function asyncBatch(chunkedData, fn) {
  return chunkedData.reduce((promise, batch) => {
    return promise.then((results) => {
      return Promise.allSettled(batch.map(fn)).then((data) => {
        results.push(data);
        return results;
      });
    });
  }, Promise.resolve([]));
}

// Publish content in batches, marking all
// successes/failures until all batches processed
export function publishAll() {
  const PUBLISH_BATCH_SIZE = 15;
  return (dispatch, getState) => {
    const { content, publishPlan } = getState();
    dispatch(actions.publishPlanPending());
    return asyncBatch(chunk(publishPlan.data, PUBLISH_BATCH_SIZE), (step) => {
      dispatch(actions.publishPending(step.ZUID));
      return dispatch(
        publish(content[step.ZUID].meta.contentModelZUID, step.ZUID, {
          version: step.version,
        })
      )
        .then(() => {
          dispatch(actions.publishSuccess(step.ZUID));
        })
        .catch((err) => {
          dispatch(
            actions.publishFailure({ ZUID: step.ZUID, error: err.message })
          );
        });
    }).then(() => {
      const state = getState();
      if (!state.publishPlan.data.length) {
        dispatch(actions.publishPlanSuccess());
      } else {
        dispatch(actions.publishPlanFailure());
      }
    });
  };
}

/**
 * Adds database structures to support feature
 * @return Promise
 */
export function activate() {
  return () => {
    return request(`${CONFIG.API_INSTANCE}/env/releases/activate`, {
      method: "POST",
    });
  };
}

/**
 * Load all releases for instance
 * @returns Promise
 */
export function fetchReleases() {
  return (dispatch) => {
    return request(`${CONFIG.API_INSTANCE}/env/releases`).then((res) => {
      if (res.status === 200) {
        dispatch(actions.fetchReleasesSuccess(res.data));
      } else {
        if (
          res.status === 400 &&
          res.error === "Bad Request: release not activated"
        ) {
          // return dispatch(activate())
          // TODO handle activation
        } else {
          dispatch(
            notify({
              kind: "warn",
              message: "There was an unknown error loading your releases",
            })
          );
        }
      }
      return res;
    });
  };
}

export function fetchRelease(zuid) {
  return (dispatch) => {
    return request(`${CONFIG.API_INSTANCE}/env/releases/${zuid}`).then(
      (res) => {
        if (res.status === 200) {
          dispatch(actions.fetchReleaseSuccess(res.data));
        } else {
          // todo handle error
        }

        return res;
      }
    );
  };
}

export function createRelease(payload) {
  return (dispatch) => {
    return request(`${CONFIG.API_INSTANCE}/env/releases`, {
      method: "POST",
      body: payload,
      json: true,
    })
      .then((res) => {
        if (res.status === 201) {
          dispatch(
            notify({
              kind: "success",
              message: `Created Release: ${res.data.name}`,
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
        console.error(err);
        dispatch(
          notify({
            kind: "warn",
            message: "Failed creating a release",
          })
        );
      });
  };
}

import { createSlice } from "@reduxjs/toolkit";
import chunk from "lodash/chunk";
import idb from "utility/idb";
import { publish } from "shell/store/content";

function asyncBatch(chunkedData, fn) {
  return chunkedData.reduce((promise, batch) => {
    return promise.then(results => {
      return Promise.allSettled(batch.map(fn)).then(data => {
        results.push(data);
        return results;
      });
    });
  }, Promise.resolve([]));
}

const { actions, reducer } = createSlice({
  name: "publishPlan",
  initialState: {
    data: [], // [{ZUID, version, status}] idle/pending/error
    status:
      "idle" /*
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
  },
  reducers: {
    loadedPlan(state, action) {
      state.data = action.payload.data;
      state.status = "loaded";
    },
    addStep(state, action) {
      // prevent duplicate ZUIDs
      if (!state.data.find(step => step.ZUID === action.payload.ZUID)) {
        state.data.push(action.payload);
        if (state.status === "success") {
          state.status = "loaded";
        }
      }
    },
    removeStep(state, action) {
      const removeStepIndex = state.data.findIndex(
        step => step.ZUID === action.payload.ZUID
      );
      if (removeStepIndex !== -1) {
        state.data.splice(removeStepIndex, 1);
      }
    },
    updateStep(state, action) {
      const updateStep = state.data.find(
        step => step.ZUID === action.payload.ZUID
      );
      if (updateStep) {
        updateStep.version = action.payload.version;
      }
    },
    publishPending(state, action) {
      const step = state.data.find(step => step.ZUID === action.payload);
      if (step) {
        step.status = "pending";
      }
    },
    publishSuccess(state, action) {
      const removeStepIndex = state.data.findIndex(
        step => step.ZUID === action.payload
      );
      if (removeStepIndex !== -1) {
        state.data.splice(removeStepIndex, 1);
      }
    },
    publishFailure(state, action) {
      const step = state.data.find(step => step.ZUID === action.payload.ZUID);
      if (step) {
        step.status = "error";
        step.error = action.payload.error;
      }
    },
    publishPlanPending(state, action) {
      state.status = "pending";
    },
    publishPlanSuccess(state, action) {
      state.status = "success";
    },
    publishPlanFailure(state, action) {
      state.status = "error";
    }
  }
});

export const {
  loadedPlan,
  addStep,
  removeStep,
  updateStep,
  publishPending,
  publishSuccess,
  publishFailure,
  publishPlanPending,
  publishPlanSuccess,
  publishPlanFailure
} = actions;

export default reducer;

// Publish content in batches, marking all
// successes/failures until all batches processed
export function publishAll() {
  const PUBLISH_BATCH_SIZE = 2;
  return (dispatch, getState) => {
    const { content, publishPlan } = getState();
    dispatch(actions.publishPlanPending());
    return asyncBatch(chunk(publishPlan.data, PUBLISH_BATCH_SIZE), step => {
      dispatch(actions.publishPending(step.ZUID));
      return dispatch(
        publish(content[step.ZUID].meta.contentModelZUID, step.ZUID, {
          version: step.version
        })
      )
        .then(() => {
          dispatch(actions.publishSuccess(step.ZUID));
        })
        .catch(err => {
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

import { createSlice } from "@reduxjs/toolkit";
import chunk from "lodash/chunk";
import idb from "utility/idb";
import { publish } from "shell/store/content";

function batchAsync(chunkedData, fn) {
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
    status: "idle" // idle/loaded/pending/success/error
  },
  reducers: {
    loadedPlan(state, action) {
      state.data = action.payload.data;
      state.status = "loaded";
    },
    addStep(state, action) {
      if (!state.data.find(step => step.ZUID === action.payload.ZUID)) {
        state.data.push(action.payload);
        state.status = "loaded";
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

export const { loadedPlan } = actions;

export default reducer;

export function addStep(step) {
  return (dispatch, getState) => {
    dispatch(actions.addStep(step));
    const state = getState();
    return idb.set(`${state.instance.ZUID}:publishPlan`, state.publishPlan);
  };
}

export function removeStep(step) {
  return (dispatch, getState) => {
    dispatch(actions.removeStep(step));
    const state = getState();
    return idb.set(`${state.instance.ZUID}:publishPlan`, state.publishPlan);
  };
}

export function updateStep(step) {
  return (dispatch, getState) => {
    dispatch(actions.updateStep(step));
    const state = getState();
    return idb.set(`${state.instance.ZUID}:publishPlan`, state.publishPlan);
  };
}

export function publishAll() {
  return (dispatch, getState) => {
    const { content, publishPlan } = getState();
    dispatch(publishPlanPending());
    return batchAsync(chunk(publishPlan.data, 2), step => {
      dispatch(publishPending(step.ZUID));
      return dispatch(
        publish(content[step.ZUID].meta.contentModelZUID, step.ZUID, {
          version: step.version
        })
      )
        .then(() => {
          dispatch(publishSuccess(step.ZUID));
          const state = getState();
          idb.set(`${state.instance.ZUID}:publishPlan`, state.publishPlan);
        })
        .catch(err => {
          console.error(err);
          dispatch(publishFailure({ ZUID: step.ZUID, error: err.message }));
        });
    }).then(() => {
      const state = getState();
      if (
        state.publishPlan.data.filter(step => step.status === "success")
          .length === state.publishPlan.data.length
      ) {
        dispatch(publishPlanSuccess());
      } else {
        dispatch(publishPlanFailure());
      }
    });
  };
}

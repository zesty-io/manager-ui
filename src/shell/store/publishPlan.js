import { createSlice } from "@reduxjs/toolkit";
import chunk from "lodash/chunk";
import idb from "utility/idb";
import { publish } from "shell/store/content";

const { actions, reducer } = createSlice({
  name: "publishPlan",
  initialState: [],
  reducers: {
    loadedPlan(state, action) {
      return action.payload;
    },
    addStep(state, action) {
      return action.payload;
    },
    removeStep(state, action) {
      return action.payload;
    },
    updateStep(state, action) {
      return action.payload;
    }
  }
});

export const { loadedPlan } = actions;

export default reducer;

export function addStep(step) {
  return (dispatch, getState) => {
    const state = getState();
    const newPlan = [...state.publishPlan];
    newPlan.push(step);

    dispatch(actions.addStep(newPlan));
    idb.set(`${state.instance.ZUID}:publishPlan`, newPlan);
  };
}

export function removeStep(removeStep) {
  return (dispatch, getState) => {
    const state = getState();
    const removeStepIndex = state.publishPlan.findIndex(
      step => step.ZUID === removeStep.ZUID
    );
    if (removeStepIndex !== -1) {
      const newPlan = [...state.publishPlan];
      newPlan.splice(removeStepIndex, 1);

      dispatch(actions.removeStep(newPlan));
      idb.set(`${state.instance.ZUID}:publishPlan`, newPlan);
    }
  };
}

export function updateStep(updateStep) {
  return (dispatch, getState) => {
    const state = getState();
    const newPlan = [...state.publishPlan];
    const updateStepIndex = newPlan.findIndex(
      step => step.ZUID === updateStep.ZUID
    );
    const newStep = { ...newPlan[updateStepIndex] };
    newStep.version = updateStep.version;
    newPlan[updateStepIndex] = newStep;

    dispatch(actions.updateStep(newPlan));
    idb.set(`${state.instance.ZUID}:publishPlan`, newPlan);
  };
}

function batchAsync(chunkedData, fn) {
  return chunkedData.reduce((promise, batch) => {
    return promise.then(results => {
      console.log("batch: ", batch);
      return Promise.allSettled(batch.map(fn)).then(data => {
        results.push(data);
        return results;
      });
    });
  }, Promise.resolve([]));
}

export function publishAll() {
  return (dispatch, getState) => {
    const { content, publishPlan } = getState();
    batchAsync(chunk(publishPlan, 2), step => {
      console.log(step);
      return dispatch(
        publish(content[step.ZUID].meta.contentModelZUID, step.ZUID, {
          version: step.version
        })
      )
        .then(res => {
          console.log("publish succeeded for: ", step);
        })
        .catch(res => {
          console.error(res);
        });
    }).then(() => console.log("publish complete"));
  };
}

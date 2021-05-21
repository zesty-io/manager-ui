import { createSlice } from "@reduxjs/toolkit";
import idb from "utility/idb";

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

      dispatch(actions.addStep(newPlan));
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

import { createSlice } from "@reduxjs/toolkit";
import { request } from "utility/request";
import { notify } from "shell/store/notifications";

export const releaseMembers = createSlice({
  name: "releaseMembers",
  initialState: {
    // API state
    data: {},
  },
  reducers: {
    fetchMembersSuccess(state, action) {
      state.data[action.payload.releaseZUID] = action.payload.data;
    },

    addMember(state, action) {
      state.data[action.payload.ZUID] = action.payload;
    },
    updateMember(state, action) {
      state.data[action.payload.ZUID] = action.payload;
    },
    deleteMember(state, action) {
      delete state.data[action.payload.ZUID];
    },

    // loadedPlan(state, action) {
    //   // no cache, initial load
    //   const plan = action.payload;
    //   if (!plan) {
    //     state.status = "loaded";
    //   } else {
    //     // If user refreshed page and had pending operation,
    //     // let's reset statuses so they can start over
    //     if (plan.status === "pending") {
    //       plan.status = "loaded";
    //     }
    //     plan.data.forEach((step) => {
    //       if (step.status === "pending") {
    //         step.status = "idle";
    //       }
    //     });
    //     return plan;
    //   }
    // },

    // resetPlan(state) {
    //   state.data = [];
    //   state.status = "loaded";
    //   state.successes = 0;
    //   state.failures = 0;
    // },

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
    // publishPending(state, action) {
    //   const step = state.data.find((step) => step.ZUID === action.payload);
    //   if (step) {
    //     step.status = "pending";
    //   }
    // },
    // publishSuccess(state, action) {
    //   const removeStepIndex = state.data.findIndex(
    //     (step) => step.ZUID === action.payload
    //   );
    //   if (removeStepIndex !== -1) {
    //     state.data.splice(removeStepIndex, 1);
    //     state.successes++;
    //   }
    // },
    // publishFailure(state, action) {
    //   const step = state.data.find((step) => step.ZUID === action.payload.ZUID);
    //   if (step) {
    //     step.status = "error";
    //     step.error = action.payload.error;
    //     state.errors++;
    //   }
    // },
    // publishPlanPending(state) {
    //   state.status = "pending";
    //   // reset errors on start of publish
    //   state.errors = 0;
    // },
    // publishPlanSuccess(state) {
    //   state.status = "success";
    // },
    // publishPlanFailure(state) {
    //   state.status = "error";
    // },
  },
});

export const { actions, reducer } = releaseMembers;

export function fetchMembers(releaseZUID) {
  return (dispatch) => {
    return request(
      `${CONFIG.API_INSTANCE}/releases/${releaseZUID}/members`
    ).then((res) => {
      dispatch(
        actions.fetchMembersSuccess({
          releaseZUID,
          data: res.data,
        })
      );

      return res;
    });
  };
}

export function createMember(releaseZUID, payload) {
  return (dispatch) => {
    return request(`${CONFIG.API_INSTANCE}/releases/${releaseZUID}/members`, {
      method: "POST",
      body: payload,
      json: true,
    }).then((res) => {
      dispatch(fetchMembers(releaseZUID));
      return res;
    });
  };
}

export function updateMember(releaseZUID, memberZUID, payload) {
  return (dispatch, getState) => {
    return request(
      `${CONFIG.API_INSTANCE}/releases/${releaseZUID}/members/${memberZUID}`,
      {
        method: "PUT",
        body: payload,
        json: true,
      }
    ).then((res) => {
      const state = getState();
      const release = state.releases.data.find(
        (release) => release.ZUID === releaseZUID
      );
      const member = state.releaseMembers.data[releaseZUID]?.find(
        (member) => member.ZUID === memberZUID
      );
      const item = state.content[member.resourceZUID];

      dispatch(
        notify({
          kind: "success",
          message: `Updated release(${release.name}) member(${item?.web.metaTitle}) to version ${payload.version}`,
        })
      );
      dispatch(fetchMembers(releaseZUID));
      return res;
    });
  };
}

export function deleteMember(releaseZUID, memberZUID) {
  return (dispatch) => {
    return request(
      `${CONFIG.API_INSTANCE}/releases/${releaseZUID}/members/${memberZUID}`,
      {
        method: "DELETE",
      }
    ).then((res) => {
      dispatch(fetchMembers(releaseZUID));
      return res;
    });
  };
}

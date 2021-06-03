import idb from "utility/idb";
import instanceZuid from "utility/instanceZuid";
import {
  resetPlan,
  addStep,
  removeStep,
  updateStep,
  publishPending,
  publishSuccess,
  publishFailure,
  publishPlanPending,
  publishPlanSuccess,
  publishPlanFailure
} from "../publishPlan";
import { toggleNav } from "../ui";
export const localStorage = store => next => action => {
  const result = next(action);

  try {
    const state = store.getState();

    switch (action.type) {
      case `${toggleNav}`:
        const ui = { ...state.ui };
        // we already store tabs separately
        delete ui.tabs;
        delete ui.loadedTabs;
        idb.set(`${state.instance.ZUID}:ui`, ui);
        break;
      case `${resetPlan}`:
      case `${addStep}`:
      case `${removeStep}`:
      case `${updateStep}`:
      case `${publishPending}`:
      case `${publishSuccess}`:
      case `${publishFailure}`:
      case `${publishPlanPending}`:
      case `${publishPlanSuccess}`:
      case `${publishPlanFailure}`:
        idb.set(`${instanceZuid}:publishPlan`, state.publishPlan);
        break;
      case "FETCH_ITEM_SUCCESS":
      case "FETCH_ITEMS_SUCCESS":
      case "SEARCH_ITEMS_SUCCESS":
        idb.set(`${instanceZuid}:content`, state.content);
        break;

      case "FETCH_FIELD_SUCCESS":
      case "FETCH_FIELDS_SUCCESS":
        idb.set(`${instanceZuid}:fields`, state.fields);
        break;

      case "FETCH_MODEL_SUCCESS":
      case "FETCH_MODELS_SUCCESS":
        idb.set(`${instanceZuid}:models`, state.models);
        break;

      case "FETCH_CONTENT_NAV_SUCCESS":
        idb.set(`${instanceZuid}:navContent`, state.navContent.raw);
        break;
    }
  } catch (err) {
    console.error("IndexedDB:set:error", err);
  }

  return result;
};

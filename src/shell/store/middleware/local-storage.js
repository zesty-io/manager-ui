import idb from "utility/idb";
// import { actions } from "shell/store/releases";
import { toggleNav, toggleContentActions } from "../ui";

export const localStorage = (store) => (next) => (action) => {
  const result = next(action);

  try {
    const state = store.getState();

    switch (action.type) {
      case `${toggleNav}`:
      case `${toggleContentActions}`:
        const ui = { ...state.ui };
        // we already store tabs separately
        delete ui.tabs;
        delete ui.loadedTabs;
        idb.set(`${state.instance.ZUID}:ui`, ui);
        break;

      // case `${actions.resetPlan}`:
      // case `${actions.addStep}`:
      // case `${actions.removeStep}`:
      // case `${actions.updateStep}`:
      // case `${actions.publishPending}`:
      // case `${actions.publishSuccess}`:
      // case `${actions.publishFailure}`:
      // case `${actions.publishPlanPending}`:
      // case `${actions.publishPlanSuccess}`:
      // case `${actions.publishPlanFailure}`:
      //   idb.set(`${state.instance.ZUID}:publishPlan`, state.publishPlan);
      //   break;

      case "FETCH_ITEM_SUCCESS":
      case "FETCH_ITEMS_SUCCESS":
      case "SEARCH_ITEMS_SUCCESS":
        idb.set(`${state.instance.ZUID}:content`, state.content);
        break;

      case "FETCH_FIELD_SUCCESS":
      case "FETCH_FIELDS_SUCCESS":
        idb.set(`${state.instance.ZUID}:fields`, state.fields);
        break;

      case "FETCH_MODEL_SUCCESS":
      case "FETCH_MODELS_SUCCESS":
        idb.set(`${state.instance.ZUID}:models`, state.models);
        break;

      case "FETCH_CONTENT_NAV_SUCCESS":
        idb.set(`${state.instance.ZUID}:navContent`, state.navContent.raw);
        break;

      case "FETCH_LANGUAGES_SUCCESS":
        idb.set(`${state.instance.ZUID}:languages`, state.languages);
        break;
    }
  } catch (err) {
    console.error("IndexedDB:set:error", err);
  }

  return result;
};

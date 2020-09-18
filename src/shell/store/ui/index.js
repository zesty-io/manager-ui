// Local UI State
import { combineReducers } from "redux";
import { globalSubMenu } from "./global-sub-menu";
import { helpMenuVisible } from "./globalHelpMenu";

export default combineReducers({
  globalSubMenu,
  helpMenuVisible
});

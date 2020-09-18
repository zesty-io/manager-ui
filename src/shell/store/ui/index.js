// Local UI State
import { combineReducers } from "redux";
import { globalSubMenu } from "./global-sub-menu";
// import { accountsMenuVisible } from "./global-accounts-menu";
import { helpMenuVisible } from "./globalHelpMenu";

export default combineReducers({
  globalSubMenu,
  // accountsMenuVisible,
  helpMenuVisible
});

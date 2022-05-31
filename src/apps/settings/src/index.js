import Settings from "./app/App";

import { store, injectReducer } from "shell/store";
import { settings } from "shell/store/settings";

injectReducer(store, "settings", settings);

export default Settings;

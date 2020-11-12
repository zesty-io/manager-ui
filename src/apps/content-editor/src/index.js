import ContentEditor from "./app";

import { injectReducer, store } from "shell/store";

import { modal } from "./store/modal";
import { listFilters } from "./store/listFilters";

// Inject reducers into shared app shell store
injectReducer(store, "modal", modal);
injectReducer(store, "listFilters", listFilters);

export default ContentEditor;

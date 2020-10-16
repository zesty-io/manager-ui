import { injectReducer, store } from "shell/store";
import { modal } from "./store/modal";
import { listFilters } from "./store/listFilters";
import { headTags } from "./store/headTags";
import ContentEditor from "./app";

// Inject reducers into shared app shell store
injectReducer(store, "modal", modal);
injectReducer(store, "listFilters", listFilters);
injectReducer(store, "headTags", headTags);

export default ContentEditor;

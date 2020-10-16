import { injectReducer, store } from "shell/store";
import { logsInView } from "./store/logsInView";
import AuditApp from "./views/app";

injectReducer(store, "logsInView", logsInView);

export default AuditApp;

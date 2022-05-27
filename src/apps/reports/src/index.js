import { injectReducer, store } from "shell/store";
import { logsInView } from "./store/logsInView";
import { ReportingApp } from "./app/ReportingApp";

injectReducer(store, "logsInView", logsInView);

export default ReportingApp;

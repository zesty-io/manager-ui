import { store, injectReducer } from "shell/store";
import { files } from "./store/files";
import { status } from "./store/status";
import { auditTrail } from "./store/auditTrail";
import { headers } from "./store/headers";
import { navCode } from "./store/navCode";
import { CodeEditor } from "./app/views/CodeEditor";

injectReducer(store, "files", files);
injectReducer(store, "status", status);
injectReducer(store, "auditTrail", auditTrail);
injectReducer(store, "headers", headers);
injectReducer(store, "navCode", navCode);

export default CodeEditor;

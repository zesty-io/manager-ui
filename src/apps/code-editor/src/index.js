import { Suspense } from "react";
import { SubAppSkeleton } from "shell/components/SubAppSkeleton";
import { useTranslation } from "react-i18next";
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

// Local Suspense boundary so lazy-loading the "code-editor" namespace shows a
// fallback in the sub-app area only, instead of blanking the whole shell.
const CodeApp = () => (
  <Suspense fallback={<SubAppSkeleton />}>
    <CodeAppInner />
  </Suspense>
);

const CodeAppInner = () => {
  // Requesting the namespaces here triggers their lazy load and suspends this
  // subtree until ready; child components use bare useTranslation() with
  // qualified keys once they're in the store.
  // "schema" is hoisted here because FileList imports NoResults from the
  // schema app, which resolves keys under the schema namespace.
  useTranslation(["code", "schema"]);
  return <CodeEditor />;
};

export default CodeApp;

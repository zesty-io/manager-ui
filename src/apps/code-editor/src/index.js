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
  // Requesting the namespace here triggers its lazy load and suspends this
  // subtree until ready; child components use bare useTranslation() with
  // qualified keys once it's in the store.
  useTranslation("code");
  return <CodeEditor />;
};

export default CodeApp;

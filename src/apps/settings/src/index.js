import { Suspense } from "react";
import { SubAppSkeleton } from "shell/components/SubAppSkeleton";
import { useTranslation } from "react-i18next";

import Settings from "./app/App";

import { store, injectReducer } from "shell/store";
import { settings } from "shell/store/settings";

injectReducer(store, "settings", settings);

// Inner — triggers the "settings" namespace lazy load and suspends this
// subtree until ready; child components use bare useTranslation() with
// qualified keys once it's in the store.
// "schema" is loaded here because settings borrows the shared NoResults
// component from the schema app, which resolves its keys against that namespace.
const SettingsAppInner = () => {
  useTranslation(["settings", "schema"]);
  return <Settings />;
};

// Outer (exported) — owns the Suspense boundary so the namespace loads
// lazily without blanking the whole shell.
const SettingsApp = () => (
  <Suspense fallback={<SubAppSkeleton />}>
    <SettingsAppInner />
  </Suspense>
);

export default SettingsApp;

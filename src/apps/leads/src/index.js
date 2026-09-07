import { Suspense } from "react";
import { SubAppSkeleton } from "shell/components/SubAppSkeleton";
import { useTranslation } from "react-i18next";
import { store, injectReducer } from "shell/store";
import { leads } from "./store/leads";
import { filter } from "./store/filter";
import Leads from "./app/views/Leads";

injectReducer(store, "leads", leads);
injectReducer(store, "filter", filter);

// Inner component — triggers the "leads" namespace lazy load and suspends
// this subtree until the translations are ready. Child components use
// bare useTranslation() with qualified keys once the namespace is in the store.
const LeadsAppInner = () => {
  useTranslation("leads");
  return <Leads />;
};

// Outer component — owns the Suspense boundary so only the sub-app subtree
// is blocked while the namespace loads, not the whole shell.
const LeadsApp = () => (
  <Suspense fallback={<SubAppSkeleton />}>
    <LeadsAppInner />
  </Suspense>
);

export default LeadsApp;

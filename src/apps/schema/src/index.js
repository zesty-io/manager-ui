import { Suspense } from "react";
import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";

import { store, injectReducer } from "shell/store";

import { navSchema } from "./store/navSchema";
import { parents } from "./store/parents";

import { SchemaApp } from "./app";

injectReducer(store, "navSchema", navSchema);
injectReducer(store, "parents", parents);

// Inner component — triggers the "schema" namespace lazy load and suspends
// this subtree until the translations are ready. Child components use bare
// useTranslation() with qualified keys once the namespace is in the store.
const SchemaAppInner = () => {
  useTranslation("schema");
  return <SchemaApp />;
};

// Outer (exported) — owns the Suspense boundary so only the schema sub-app
// area shows a fallback instead of blanking the whole shell.
const SchemaAppWithI18n = () => (
  <Suspense
    fallback={<Box sx={{ height: "100%", backgroundColor: "grey.50" }} />}
  >
    <SchemaAppInner />
  </Suspense>
);

export default SchemaAppWithI18n;

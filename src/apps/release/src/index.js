import { Suspense } from "react";
import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";

import ReleaseApp from "./app";

const ReleaseAppInner = () => {
  useTranslation(["release"]);
  return <ReleaseApp />;
};

const ReleaseAppRoot = () => (
  <Suspense
    fallback={<Box sx={{ height: "100%", backgroundColor: "grey.50" }} />}
  >
    <ReleaseAppInner />
  </Suspense>
);

export default ReleaseAppRoot;

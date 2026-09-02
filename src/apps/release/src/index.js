import { Suspense } from "react";
import { SubAppSkeleton } from "shell/components/SubAppSkeleton";
import { useTranslation } from "react-i18next";

import ReleaseApp from "./app";

const ReleaseAppInner = () => {
  useTranslation(["release"]);
  return <ReleaseApp />;
};

const ReleaseAppRoot = () => (
  <Suspense fallback={<SubAppSkeleton />}>
    <ReleaseAppInner />
  </Suspense>
);

export default ReleaseAppRoot;

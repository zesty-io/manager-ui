import { Suspense } from "react";
import { SubAppSkeleton } from "shell/components/SubAppSkeleton";
import { useTranslation } from "react-i18next";
import { MarketplaceWrapper } from "./app";

// Inner — triggers the "marketplace" namespace lazy load; suspends until ready
const MarketplaceAppInner = () => {
  useTranslation("marketplace");

  return <MarketplaceWrapper />;
};

// Outer (exported) — owns the Suspense boundary for the sub-app subtree
const MarketplaceApp = () => (
  <Suspense fallback={<SubAppSkeleton />}>
    <MarketplaceAppInner />
  </Suspense>
);

export default MarketplaceApp;

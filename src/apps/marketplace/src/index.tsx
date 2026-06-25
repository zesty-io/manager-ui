import { Suspense } from "react";
import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import { MarketplaceWrapper } from "./app";

// Inner — triggers the "marketplace" namespace lazy load; suspends until ready
const MarketplaceAppInner = () => {
  useTranslation("marketplace");

  return <MarketplaceWrapper />;
};

// Outer (exported) — owns the Suspense boundary for the sub-app subtree
const MarketplaceApp = () => (
  <Suspense
    fallback={<Box sx={{ height: "100%", backgroundColor: "grey.50" }} />}
  >
    <MarketplaceAppInner />
  </Suspense>
);

export default MarketplaceApp;

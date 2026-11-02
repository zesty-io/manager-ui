import { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Route } from "react-router-dom";
import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

// Holds the metrics the legacy `.bodyText` class rendered with
const bodyTextSx = { lineHeight: "24px", letterSpacing: 0 };

export function GetStarted(props) {
  const { t } = useTranslation();
  return (
    <Box component="section" data-cy="leadsGetStarted" sx={{ p: 4 }}>
      <Typography
        variant="h2"
        component="h1"
        sx={{ fontWeight: 200, lineHeight: "48px", letterSpacing: "0.32px" }}
      >
        {t("common.getStarted")}
      </Typography>
      <Typography
        variant="h5"
        component="h2"
        data-cy="leadsGetStartedHeading"
        sx={{ letterSpacing: "0.08px" }}
      >
        {t("leads.captureLeadsOnYourInstance")}
      </Typography>

      <Typography variant="body2" sx={bodyTextSx}>
        {t("leads.getStartedBodyText")}
      </Typography>
      <Typography variant="body2" sx={bodyTextSx}>
        {t("leads.learnMoreAbout")}{" "}
        <a
          href="https://zesty.org/services/web-engine/guides/how-to-create-a-lead-form#zlf-zesty-leads-form"
          target="_blank"
          data-cy="leadFormDocsLink"
        >
          {t("leads.howToCreateALeadForm")}
        </a>
      </Typography>
    </Box>
  );
}

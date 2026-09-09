import { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Route } from "react-router-dom";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

// Holds the metrics the legacy `.bodyText` class rendered with
const bodyTextSx = { lineHeight: "24px", letterSpacing: 0 };

export function GetStarted(props) {
  return (
    <Box component="section" data-cy="leadsGetStarted" sx={{ p: 4 }}>
      <Typography
        variant="h2"
        component="h1"
        sx={{ fontWeight: 200, lineHeight: "48px", letterSpacing: "0.32px" }}
      >
        Get Started
      </Typography>
      <Typography variant="h5" component="h2" sx={{ letterSpacing: "0.08px" }}>
        Capture leads on your instance
      </Typography>

      <Typography variant="body2" sx={bodyTextSx}>
        By creating a form on your instance which includes the zlf input you can
        begin instantly capturing leads.
      </Typography>
      <Typography variant="body2" sx={bodyTextSx}>
        Learn more about{" "}
        <a
          href="https://zesty.org/services/web-engine/guides/how-to-create-a-lead-form#zlf-zesty-leads-form"
          target="_blank"
          data-cy="leadFormDocsLink"
        >
          How to Create a Lead Form
        </a>
      </Typography>
    </Box>
  );
}

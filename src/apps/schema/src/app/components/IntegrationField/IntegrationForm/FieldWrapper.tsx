import { FC, useEffect, useState } from "react";
import { Box, Tooltip, Typography } from "@mui/material";

import InfoIcon from "@mui/icons-material/Info";

export const FieldWrapper = ({
  name,
  label,
  toolTip,
  isRequired,
  children,
}: {
  name?: string;
  label?: string;
  toolTip?: string;
  isRequired?: boolean;
  children: React.ReactNode;
}) => {
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        rowGap: 0.5,
      }}
    >
      <Typography
        variant="body2"
        color="text.primary"
        fontWeight={600}
        noWrap
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-start",
          alignItems: "center",
        }}
      >
        {label}
        {isRequired && <span>*</span>}
        {!!toolTip && (
          <Box component="span" sx={{ ml: 0.5 }}>
            <Tooltip title={toolTip} placement="top">
              <InfoIcon color="action" sx={{ fontSize: 12 }} />
            </Tooltip>
          </Box>
        )}
      </Typography>
      {children}
    </Box>
  );
};

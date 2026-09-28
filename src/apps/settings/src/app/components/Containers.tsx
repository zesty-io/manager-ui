import React from "react";
import Box from "@mui/material/Box";
import { Stack, Typography, Tooltip } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";

export const MainWrapper = ({
  rowGap = 2,
  fullWidth = false,
  children,
  sx,
}: {
  rowGap?: number | string;
  fullWidth?: boolean;
  children: React.ReactNode;
  sx?: React.CSSProperties;
}) => {
  return (
    <Box
      maxWidth={fullWidth ? "100%" : "640px"}
      display="flex"
      flexDirection="column"
      justifyContent="flex-start"
      rowGap={rowGap}
      boxSizing="border-box"
      sx={{
        "& .MuiInputBase-root .MuiSelect-select": {
          paddingTop: "8px",
          paddingBottom: "8px",
        },
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};

export const FieldWrapper = ({
  label,
  tooltip,
  children,
  ...other
}: {
  label: string;
  tooltip?: string;
  children: React.ReactNode;
}) => {
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        position: "relative",
        boxSizing: "border-box",
        rowGap: "8px",
        "& label": {
          margin: "0!important",
        },
      }}
      {...other}
    >
      <Stack direction="row" spacing="4px" alignItems="center" height="20px">
        <Typography
          variant="body2"
          component="span"
          fontWeight={600}
          color="text.primary"
        >
          {label}
        </Typography>
        {!tooltip ? null : (
          <Tooltip title={tooltip} placement="top" enterNextDelay={500}>
            <InfoIcon sx={{ fontSize: "14px", color: "action.active" }} />
          </Tooltip>
        )}
      </Stack>
      {children}
    </Box>
  );
};

export const FieldRow = ({
  children,
  ...other
}: {
  children: React.ReactNode;
}) => {
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        position: "relative",
        boxSizing: "border-box",
        columnGap: "4px",
      }}
      {...other}
    >
      {children}
    </Box>
  );
};

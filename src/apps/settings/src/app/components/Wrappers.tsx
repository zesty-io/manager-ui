import React from "react";
import Box from "@mui/material/Box";
import { Stack, Typography, Tooltip } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";

export const MainWrapper = ({
  fullWidth,
  disableGutters = false,
  height = "auto",
  rowGap = 2,
  columnGap = 0,
  children,
}: {
  fullWidth?: boolean;
  disableGutters?: boolean;
  height?: string | number;
  rowGap?: number | string;
  columnGap?: number | string;
  children: React.ReactNode;
}) => {
  return (
    <Box
      className="main-wrapper"
      px={disableGutters ? 0 : 4}
      sx={{
        width: "100%",
        height: "calc(100% - 84px)",
        overflowY: "auto",
        overflowX: "hidden",
        margin: "0",
        display: "block",
        maxHeight: "calc(100% - 84px)",
        position: "relative",
        boxSizing: "border-box",
      }}
    >
      <Box
        py={disableGutters ? 0 : 2}
        height={height}
        minWidth={fullWidth ? "100%" : "auto"}
        maxWidth={fullWidth ? "100%" : "640px"}
        display="flex"
        flexDirection="column"
        justifyContent="flex-start"
        sx={{
          minHeight: "100%",
          boxSizing: "border-box",
          rowGap: rowGap,
          columnGag: columnGap,
        }}
      >
        {children}
      </Box>
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
        // border: "1px solid red",
        rowGap: "4px",
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
        // border: "1px solid red",
        columnGap: "4px",
      }}
      {...other}
    >
      {children}
    </Box>
  );
};

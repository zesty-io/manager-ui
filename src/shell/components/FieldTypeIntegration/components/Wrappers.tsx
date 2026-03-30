import { Box, Paper, Tooltip, Typography } from "@mui/material";

import InfoIcon from "@mui/icons-material/Info";
import { ReactNode } from "react";

export type FieldWrapperProps = {
  name?: string;
  label?: string;
  description?: string;
  toolTip?: string;
  isRequired?: boolean;
  error?: string;
  children: React.ReactNode;
};

export type FormWrapperProps = {
  width: string | number;
  height: string | number;
  children: ReactNode;
};

export const FieldWrapper = ({
  name,
  label,
  description,
  toolTip,
  isRequired,
  error,
  children,
}: FieldWrapperProps) => {
  return (
    <Box
      className="fieldWrapper"
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
      {!!description && (
        <Typography
          variant="body2"
          color="text.primary"
          fontWeight={400}
          noWrap
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
          }}
        >
          {description}
        </Typography>
      )}
      {children}
      {!!error && (
        <Typography variant="body2" color="error.main" mt={0.5}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export const FormWrapper = ({ width, height, children }: FormWrapperProps) => {
  return (
    <Paper
      sx={{
        width: width,
        height: height,
        maxHeight: "calc(100vh - 40px)",
        borderRadius: 2,
        position: "relative",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "stretch",
      }}
    >
      {children}
    </Paper>
  );
};

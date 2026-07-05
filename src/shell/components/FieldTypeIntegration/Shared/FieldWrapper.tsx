import { Box, Tooltip, Typography } from "@mui/material";

import InfoIcon from "@mui/icons-material/Info";

export type FieldWrapperProps = {
  name?: string;
  label?: string;
  description?: string;
  toolTip?: string;
  isRequired?: boolean;
  error?: string;
  warning?: string;
  warningTestId?: string;
  children: React.ReactNode;
};

export const FieldWrapper = ({
  name,
  label,
  description,
  toolTip,
  isRequired,
  error,
  warning,
  warningTestId,
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
      {!error && !!warning && (
        <Typography
          data-cy={warningTestId}
          variant="body2"
          color="warning.dark"
          mt={0.5}
        >
          {warning}
        </Typography>
      )}
    </Box>
  );
};

import React, { FC } from "react";
import { ExtendButton, Tooltip, Box, Typography } from "@mui/material";
import {
  LoadingButton,
  LoadingButtonOwnProps,
  LoadingButtonProps,
  LoadingButtonTypeMap,
} from "@mui/lab";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import { CheckCircleRounded } from "@mui/icons-material";
import { ButtonProps } from "@mui/base";

export type ActionButtonProps = Omit<
  LoadingButtonProps,
  "endIcon" | "disabled" | "loading" | "onClick"
> & {
  tooltip?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
  label?: string;
  isActive?: boolean;
  inActiveColor?: string;
  onClick?: () => void;
};

export const ActionButton: FC<ActionButtonProps> = ({
  tooltip,
  isLoading,
  isDisabled,
  label,
  isActive,
  inActiveColor = "grey.400",
  onClick,
  ...props
}) => {
  return (
    <Tooltip
      enterDelay={500}
      enterNextDelay={500}
      title={!!isDisabled ? "" : tooltip}
      placement="bottom"
      componentsProps={{
        popper: {
          sx: {
            "& .MuiTooltip-tooltip": {
              bgcolor: "grey.800",
              whiteSpace: "pre-line",
            },
          },
        },
      }}
    >
      {isActive && !isDisabled ? (
        <span>
          <LoadingButton {...props} onClick={onClick} loading={isLoading}>
            {label}
          </LoadingButton>
        </span>
      ) : (
        <Box display="flex" alignItems="center" columnGap={1} px={1}>
          <CheckCircleRounded fontSize="small" sx={{ color: inActiveColor }} />
          <Typography
            variant="body2"
            component="span"
            sx={{ color: inActiveColor }}
          >
            {label}
          </Typography>
        </Box>
      )}
    </Tooltip>
  );
};

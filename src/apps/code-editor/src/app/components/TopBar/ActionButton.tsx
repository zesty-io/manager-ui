import { FC } from "react";
import { Tooltip, Box, Typography, Button } from "@mui/material";
import { LoadingButtonProps } from "@mui/lab";
import { CheckCircleRounded } from "@mui/icons-material";

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
          <Button
            {...props}
            onClick={onClick}
            loading={isLoading}
            sx={{ whiteSpace: "nowrap", textTransform: "capitalize" }}
          >
            {label}
          </Button>
        </span>
      ) : (
        <Box display="flex" alignItems="center" columnGap={1} px={1}>
          <CheckCircleRounded fontSize="small" sx={{ color: inActiveColor }} />
          <Typography
            variant="body2"
            component="span"
            sx={{ color: inActiveColor, textTransform: "capitalize" }}
          >
            {label}
          </Typography>
        </Box>
      )}
    </Tooltip>
  );
};

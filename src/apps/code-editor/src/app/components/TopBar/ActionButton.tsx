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
  "data-cy"?: string;
};

export const ActionButton: FC<ActionButtonProps> = ({
  tooltip,
  isLoading,
  isDisabled,
  label,
  isActive,
  inActiveColor = "grey.400",
  onClick,
  "data-cy": dataCy,
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
            data-cy={dataCy}
            onClick={onClick}
            loading={isLoading}
            sx={{ whiteSpace: "nowrap" }}
          >
            {label}
          </Button>
        </span>
      ) : (
        <Box
          data-cy={dataCy}
          display="flex"
          alignItems="center"
          columnGap={1}
          px={1}
        >
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

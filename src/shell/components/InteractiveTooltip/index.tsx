import { TooltipProps, Tooltip, Box, Paper } from "@mui/material";
type Slots = {
  title: JSX.Element;
  body: JSX.Element;
};
type InteractiveTooltipProps = {
  slots: Slots;
  TooltipProps?: TooltipProps;
};

export const InteractiveTooltip = ({
  slots,
  TooltipProps,
}: InteractiveTooltipProps) => {
  return (
    <Tooltip
      enterDelay={800}
      enterNextDelay={800}
      title={<Paper>{slots.body}</Paper>}
      components={{ Tooltip: Box }}
      {...TooltipProps}
    >
      {slots.title}
    </Tooltip>
  );
};

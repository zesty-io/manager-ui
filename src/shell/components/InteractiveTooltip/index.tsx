import { TooltipProps, PaperProps, Tooltip, Box, Paper } from "@mui/material";

// Stable reference — prevents MUI Tooltip from treating components as changed
// on every parent re-render, which would trigger internal state updates.
const TOOLTIP_COMPONENTS = { Tooltip: Box };

type Slots = {
  title: JSX.Element;
  body: JSX.Element;
};
type InteractiveTooltipProps = {
  slots: Slots;
  TooltipProps?: Partial<TooltipProps>;
  PaperProps?: Partial<PaperProps>;
};

export const InteractiveTooltip = ({
  slots,
  TooltipProps,
  PaperProps,
}: InteractiveTooltipProps) => {
  return (
    <Tooltip
      enterDelay={800}
      enterNextDelay={800}
      title={
        <Paper
          elevation={2}
          sx={{
            p: 1.5,
            mb: 1.25,
            borderRadius: 1,
          }}
          {...PaperProps}
        >
          {slots.body}
        </Paper>
      }
      components={TOOLTIP_COMPONENTS}
      {...TooltipProps}
    >
      {slots.title}
    </Tooltip>
  );
};

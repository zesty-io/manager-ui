import {
  TooltipProps,
  PaperProps,
  Tooltip,
  Box,
  Paper,
  ThemeProvider,
} from "@mui/material";
import { theme } from "@zesty-io/material";

type Slots = {
  title: JSX.Element;
  body: JSX.Element;
};
type InteractiveTooltipProps = {
  slots: Slots;
  TooltipProps?: TooltipProps;
  PaperProps?: PaperProps;
};

export const InteractiveTooltip = ({
  slots,
  TooltipProps,
  PaperProps,
}: InteractiveTooltipProps) => {
  return (
    <ThemeProvider theme={theme}>
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
        components={{ Tooltip: Box }}
        {...TooltipProps}
      >
        {slots.title}
      </Tooltip>
    </ThemeProvider>
  );
};

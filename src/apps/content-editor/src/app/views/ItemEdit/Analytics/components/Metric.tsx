//@ts-nocheck
import { Box, Paper, Typography, Tooltip } from "@mui/material";
import { numberFormatter } from "../../../../../../../../utility/numberFormatter";
import { calculatePercentageDifference } from "../utils";
type Props = {
  title: string;
  value: number;
  priorValue: number;
  description: string;
  formatter?: (value: number) => string;
  inverse?: boolean;
};

export const Metric = ({
  title,
  value = 0,
  priorValue = 0,
  description,
  formatter,
  inverse,
}: Props) => {
  return (
    <Tooltip
      title={
        <TooltipBody
          title={title}
          value={formatter ? formatter(value) : value?.toLocaleString()}
          description={description}
        />
      }
      followCursor
      components={{ Tooltip: Box }}
    >
      <Box py={0.5}>
        <Typography variant="body1" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h2" fontWeight={600} sx={{ mb: 1 }}>
          {formatter ? formatter(value) : numberFormatter.format(value)}
        </Typography>
        <Typography variant="body3" color="text.disabled">
          {formatter
            ? formatter(priorValue)
            : numberFormatter.format(priorValue)}{" "}
          <Typography
            variant="body3"
            color={
              calculatePercentageDifference(priorValue, value).startsWith("-")
                ? inverse
                  ? "success.main"
                  : "error.main"
                : inverse
                ? "error.main"
                : "success.main"
            }
          >
            {calculatePercentageDifference(priorValue, value)}
          </Typography>
        </Typography>
      </Box>
    </Tooltip>
  );
};

const TooltipBody = ({ title, value, description }: any) => {
  return (
    <Paper sx={{ width: 200, p: 2 }}>
      <Typography variant="body3" fontWeight={600} color="text.secondary">
        {title}
      </Typography>
      <Typography variant="h4" fontWeight={600} sx={{ mt: 0.25 }}>
        {value}
      </Typography>
      <Typography
        fontWeight={500}
        color="text.secondary"
        sx={{ mt: 1, fontSize: "10px", lineHeight: "14px" }}
      >
        {description}
      </Typography>
    </Paper>
  );
};

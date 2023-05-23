import { Box, Typography } from "@mui/material";
import { numberFormatter } from "../../../../../../../../utility/numberFormatter";
import { calculatePercentageDifference } from "../utils";
export const Metric = ({
  title,
  value = 0,
  priorValue = 0,
  formatter,
  inverse,
}: any) => {
  return (
    <Box py={0.5}>
      <Typography variant="body1" color="text.secondary">
        {title}
      </Typography>
      <Typography variant="h2" fontWeight={600} sx={{ mb: 1 }}>
        {formatter ? formatter(value) : numberFormatter.format(value)}
      </Typography>
      <Typography variant="body3" color="text.disabled">
        {formatter ? formatter(priorValue) : numberFormatter.format(priorValue)}{" "}
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
  );
};

//@ts-nocheck
import { Box, Paper, Typography, Tooltip, Skeleton } from "@mui/material";
import { numberFormatter } from "../../../../../../../utility/numberFormatter";
import { calculatePercentageDifference } from "../utils";
type Props = {
  title: string;
  value: number;
  priorValue: number;
  description: string;
  formatter?: (value: number) => string;
  inverse?: boolean;
  loading?: boolean;
};

export const Metric = ({
  title,
  value = 0,
  priorValue = 0,
  description,
  formatter,
  inverse,
  loading = false,
}: Props) => {
  return (
    <Tooltip
      title={
        !loading ? (
          <TooltipBody
            title={title}
            value={formatter ? formatter(value) : value?.toLocaleString()}
            description={description}
          />
        ) : (
          ""
        )
      }
      followCursor
      components={{ Tooltip: Box }}
    >
      <Box width="100%">
        {loading ? (
          <Skeleton
            variant="rectangular"
            width="80%"
            height={18}
            sx={{ bgcolor: "grey.200" }}
          />
        ) : (
          <Typography variant="body3" color="text.secondary" fontWeight={600}>
            {title}
          </Typography>
        )}
        {loading ? (
          <Skeleton variant="rectangular" width="100%" height={32} />
        ) : (
          <Typography variant="h4" fontWeight={600} sx={{ mb: 0.5 }}>
            {formatter ? formatter(value) : numberFormatter.format(value)}
          </Typography>
        )}
        {loading ? (
          <Skeleton
            variant="rectangular"
            width="100%"
            height={18}
            sx={{ mt: 1 }}
          />
        ) : (
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
        )}
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

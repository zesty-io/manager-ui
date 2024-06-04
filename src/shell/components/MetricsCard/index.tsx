import { Box, Skeleton, Typography, Tooltip } from "@mui/material";
import { isNaN, isNil } from "lodash";
import { ReactNode } from "react";
import { numberFormatter } from "../../../utility/numberFormatter";
import { GrowthIndicator } from "./GrowthIndicator";
interface Props {
  title: string;
  value: number;
  icon: ReactNode;
  delta?: number;
  deltaLabel?: string;
  symbol?: string;
  loading?: boolean;
}

export const MetricCard = ({
  title,
  value,
  icon,
  delta,
  deltaLabel,
  symbol,
  loading,
}: Props) => {
  return (
    <Box
      sx={{
        width: 200,
        backgroundColor: "common.white",
        border: (theme) => `1px solid ${theme.palette.border}`,
        borderRadius: "8px",
        padding: 2,
      }}
    >
      <Box display="flex" justifyContent="space-between">
        <Box flex={1}>
          <Typography variant="body2" fontWeight={600} color="text.secondary">
            {loading ? <Skeleton /> : title}
          </Typography>
          <Tooltip title={`${value?.toLocaleString()} ${title}`}>
            <Typography variant="h3" marginTop={0.5} fontWeight={600}>
              {loading ? (
                <Skeleton />
              ) : (
                <>
                  {numberFormatter.format(value || 0)} {symbol}
                </>
              )}
            </Typography>
          </Tooltip>
        </Box>
        {loading ? (
          <Skeleton variant="circular" width="32px" height="32px" />
        ) : (
          icon
        )}
      </Box>
      {loading ? (
        <Skeleton height="22px" />
      ) : (
        <>
          {!isNil(delta) ? (
            <Box marginTop={0.5} display="flex" gap={1}>
              <GrowthIndicator delta={isNaN(delta) ? 0 : delta} />
              <Typography
                variant="body3"
                color="text.disabled"
                fontWeight={600}
                sx={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {deltaLabel}
              </Typography>
            </Box>
          ) : null}
        </>
      )}
    </Box>
  );
};

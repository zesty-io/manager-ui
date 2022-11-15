import { Box, Card, CardContent, Typography, Tooltip } from "@mui/material";
import { isNil } from "lodash";
import { ReactNode } from "react";
import { numberFormatter } from "../../../utility/numberFormatter";
import { GrowthIndicator } from "./GrowthIndicator";
import { numberWithCommas } from "../../../utility/numberWithCommas";
interface Props {
  title: string;
  value: number;
  icon: ReactNode;
  delta?: number;
  deltaLabel?: string;
  symbol?: string;
}

export const MetricCard = ({
  title,
  value,
  icon,
  delta,
  deltaLabel,
  symbol,
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
        <Box>
          <Typography fontWeight={600} color="text.secondary">
            {title}
          </Typography>
          <Tooltip title={numberWithCommas(value)}>
            <Typography variant="h3" marginTop={0.5} fontWeight={600}>
              {numberFormatter.format(value)} {symbol}
            </Typography>
          </Tooltip>
        </Box>
        {icon}
      </Box>
      {!isNil(delta) ? (
        <Box marginTop={0.5} display="flex" gap={1}>
          <GrowthIndicator delta={delta} />
          <Typography
            // @ts-ignore
            variant="body3"
            color="text.disabled"
            fontWeight={600}
            sx={{ fontSize: "10px" }}
          >
            {deltaLabel}
          </Typography>
        </Box>
      ) : null}
    </Box>
  );
};

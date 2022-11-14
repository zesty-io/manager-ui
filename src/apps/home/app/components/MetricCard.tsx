import { Box, Card, CardContent, Typography } from "@mui/material";
import { ReactNode } from "react";
import { numberFormatter } from "../../../../utility/numberFormatter";
import { GrowthIndicator } from "./GrowthIndicator";

interface Props {
  title: string;
  value: number;
  icon: ReactNode;
  delta?: number;
}

export const MetricCard = ({ title, value, icon, delta }: Props) => {
  return (
    <Card sx={{ width: 200 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between">
          <Box>
            <Typography fontWeight={600} color="text.secondary">
              {title}
            </Typography>
            <Typography variant="h3" marginTop={0.5} fontWeight={600}>
              {numberFormatter.format(value)}
            </Typography>
          </Box>
          {icon}
        </Box>
        {delta ? (
          <Box marginTop={0.5} display="flex" gap={1}>
            <GrowthIndicator delta={0.5} />
            {/* @ts-ignore */}
            <Typography variant="body3" color="text.disabled" fontWeight={600}>
              VS PREV. 30 DAYS
            </Typography>
          </Box>
        ) : null}
      </CardContent>
    </Card>
  );
};

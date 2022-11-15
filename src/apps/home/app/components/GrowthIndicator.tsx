import { Box, Card, CardContent, Typography } from "@mui/material";
import { ReactNode } from "react";
import { numberFormatter } from "../../../../utility/numberFormatter";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";

interface Props {
  delta: number;
}

export const GrowthIndicator = ({ delta }: Props) => {
  const isPositive = delta >= 0;
  const icon = isPositive ? (
    <TrendingUpRoundedIcon
      color="success"
      sx={{ width: "16px", height: "16px" }}
    />
  ) : (
    <TrendingDownRoundedIcon
      color="error"
      sx={{ width: "16px", height: "16px" }}
    />
  );

  return (
    <Box
      sx={{
        color: isPositive ? "success.main" : "error.main",
        display: "flex",
        alignItems: "center",
      }}
    >
      {icon}
      {/* @ts-ignore */}
      <Typography variant="body3" fontWeight={600} marginLeft={0.5}>
        {delta * 100}%
      </Typography>
    </Box>
  );
};

import { Box, Card, CardContent, Typography, Chip } from "@mui/material";
import { ReactNode } from "react";
import { numberFormatter } from "../../../utility/numberFormatter";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";

interface Props {
  delta: number;
  isInMedia?: boolean;
}

export const GrowthIndicator = ({ delta, isInMedia }: Props) => {
  const isPositive = delta >= 0;

  const PositiveIcon = () => {
    return (
      <>
        {isInMedia ? (
          <Chip
            label={
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {/* @ts-ignore */}
                <Typography variant="body3">
                  +{Math.floor(delta * 100)}%
                </Typography>
              </Box>
            }
            sx={{
              backgroundColor: "success.light",
              borderRadius: "20px",
              color: "success.dark",
              height: "22px",
            }}
          />
        ) : (
          <>
            <TrendingUpRoundedIcon
              color="success"
              sx={{ width: "16px", height: "16px" }}
            />
            {/* @ts-ignore */}
            <Typography variant="body3" fontWeight={600} marginLeft={0.5}>
              {Math.floor(delta * 100)}%
            </Typography>
          </>
        )}
      </>
    );
  };

  const NegativeIcon = () => {
    return (
      <>
        {isInMedia ? (
          <Chip
            label={
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography
                  // @ts-ignore
                  variant="body3"
                >
                  {Math.floor(delta * 100)}%
                </Typography>
              </Box>
            }
            sx={{
              backgroundColor: "error.light",
              borderRadius: "20px",
              color: "error.dark",
              height: "22px",
            }}
          />
        ) : (
          <>
            <TrendingDownRoundedIcon
              color="error"
              sx={{ width: "16px", height: "16px" }}
            />
            {/* @ts-ignore */}
            <Typography variant="body3" fontWeight={600} marginLeft={0.5}>
              {Math.floor(delta * 100)}%
            </Typography>
          </>
        )}
      </>
    );
  };

  const icon = isPositive ? <PositiveIcon /> : <NegativeIcon />;

  return (
    <Box
      sx={{
        color: isPositive ? "success.main" : "error.main",
        display: "flex",
        alignItems: "center",
      }}
    >
      {icon}
    </Box>
  );
};

import { Box } from "@mui/material";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import RemoveRedEyeRoundedIcon from "@mui/icons-material/RemoveRedEyeRounded";
import { MetricCard } from "./MetricCard";

const iconStyles = {
  height: "32px",
  borderRadius: "16px",
  padding: 1,
};

export const MetricCards = () => {
  return (
    <Box display="flex" gap={2} marginTop={-7.5} marginLeft={3}>
      <MetricCard
        title="Web Requests"
        value={10000}
        icon={
          <Box
            sx={{
              ...iconStyles,
              backgroundColor: "blue.50",
            }}
          >
            <LanguageRoundedIcon
              color="info"
              sx={{ width: "16px", height: "16px" }}
            />
          </Box>
        }
      />
      <MetricCard
        title="Media Requests"
        value={10000}
        icon={
          <Box
            sx={{
              ...iconStyles,
              backgroundColor: "deepOrange.50",
            }}
          >
            <ImageRoundedIcon
              color="primary"
              sx={{ width: "16px", height: "16px" }}
            />
          </Box>
        }
      />
      <MetricCard
        title="Items Scheduled"
        value={10000}
        icon={
          <Box
            sx={{
              ...iconStyles,
              backgroundColor: "purple.50",
            }}
          >
            <ScheduleRoundedIcon
              sx={{ width: "16px", height: "16px", color: "purple.500" }}
            />
          </Box>
        }
      />
      <MetricCard
        title="Items Published"
        value={10000}
        icon={
          <Box
            sx={{
              ...iconStyles,
              backgroundColor: "green.50",
            }}
          >
            <RemoveRedEyeRoundedIcon
              color="success"
              sx={{ width: "16px", height: "16px" }}
            />
          </Box>
        }
      />
    </Box>
  );
};

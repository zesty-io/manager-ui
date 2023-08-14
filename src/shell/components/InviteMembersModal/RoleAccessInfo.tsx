import { Box, Typography } from "@mui/material";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import { Database } from "@zesty-io/material";
import CodeRoundedIcon from "@mui/icons-material/CodeRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import RecentActorsRoundedIcon from "@mui/icons-material/RecentActorsRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import MonitorHeartRoundedIcon from "@mui/icons-material/MonitorHeartRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";

const roleAccess = [
  [
    "content",
    "schema",
    "code",
    "media",
    "leads",
    "activity log",
    "health",
    "settings",
  ],
  [
    "content",
    "schema",
    "code",
    "media",
    "leads",
    "activity log",
    "health",
    "settings",
  ],
  ["content", "schema", "code", "media", "leads", "health", "settings"],
  ["content", "media", "leads", "health"],
  ["content", "media", "leads"],
  ["content"],
];

const iconStyles = {
  width: "16px",
  height: "16px",
};

const accessIcon = {
  content: <EditRoundedIcon color="action" sx={iconStyles} />,
  schema: <Database color="action" sx={iconStyles} />,
  code: <CodeRoundedIcon color="action" sx={iconStyles} />,
  media: <ImageRoundedIcon color="action" sx={iconStyles} />,
  leads: <RecentActorsRoundedIcon color="action" sx={iconStyles} />,
  "activity log": <HistoryRoundedIcon color="action" sx={iconStyles} />,
  health: <MonitorHeartRoundedIcon color="action" sx={iconStyles} />,
  settings: <SettingsRoundedIcon color="action" sx={iconStyles} />,
};

interface Props {
  role: number;
}

export const RoleAccessInfo = ({ role }: Props) => {
  return (
    <Box
      component="ul"
      sx={{
        listStylePosition: "inside",
        li: {
          marginTop: 2,
        },
      }}
    >
      <Typography component="li" variant="body2" sx={{ marginBottom: 2 }}>
        Has access to:
      </Typography>
      <Box display="flex" flexWrap="wrap" gap={2} ml={2}>
        {roleAccess[role].map((access) => (
          <Box display="flex" width={120} alignItems="center">
            {accessIcon[access as keyof typeof accessIcon]}
            <Typography
              sx={{ ml: 1, textTransform: "capitalize" }}
              variant="body3"
            >
              {access === "code" ? "Code (Zesty IDE)" : access}
            </Typography>
          </Box>
        ))}
      </Box>
      {role === 5 ? (
        <>
          <Typography component="li" variant="body2">
            Can only create and edit content
          </Typography>
          <Typography component="li" variant="body2">
            Cannot publish content. To publish new content, contributors must
            submit a workflow request to a user with publishing access.
          </Typography>
          <Typography component="li" variant="body2">
            Can access media and add files, but they cannot delete files.
          </Typography>
        </>
      ) : null}
      {role !== 0 ? (
        <Typography component="li" variant="body2">
          Cannot delete other users
        </Typography>
      ) : null}
    </Box>
  );
};

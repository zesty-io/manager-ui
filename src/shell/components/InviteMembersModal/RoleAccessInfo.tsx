import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import { Database } from "@zesty-io/material";
import CodeRoundedIcon from "@mui/icons-material/CodeRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import RecentActorsRoundedIcon from "@mui/icons-material/RecentActorsRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import ShuffleRoundedIcon from "@mui/icons-material/ShuffleRounded";

const roleAccess = [
  [
    "content",
    "schema",
    "code",
    "media",
    "leads",
    "activity log",
    "redirects",
    "settings",
  ],
  [
    "content",
    "schema",
    "code",
    "media",
    "leads",
    "activity log",
    "redirects",
    "settings",
  ],
  ["content", "schema", "code", "media", "leads", "redirects", "settings"],
  ["content", "media", "leads", "redirects"],
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
  redirects: <ShuffleRoundedIcon color="action" sx={iconStyles} />,
  settings: <SettingsRoundedIcon color="action" sx={iconStyles} />,
};

interface Props {
  role: number;
}

export const RoleAccessInfo = ({ role }: Props) => {
  const { t } = useTranslation();

  // Translated display labels for each access area, keyed by the raw access
  // string (which is also the accessIcon lookup key — left untranslated so the
  // icon mapping keeps working). Reuses the shell nav labels for product areas.
  const accessLabels: Record<string, string> = {
    content: t("shell.navContent"),
    schema: t("shell.navSchema"),
    code: t("shell.roleAccessCode"),
    media: t("shell.navMedia"),
    leads: t("shell.navLeads"),
    "activity log": t("shell.roleAccessActivityLog"),
    redirects: t("shell.navRedirects"),
    settings: t("shell.navSettings"),
  };

  return (
    <Box
      component="ul"
      sx={{
        pl: 2,
        li: {
          marginTop: 2,
        },
      }}
    >
      <Typography component="li" variant="body2" sx={{ marginBottom: 2 }}>
        {t("shell.hasAccessTo")}
      </Typography>
      <Box display="flex" flexWrap="wrap" gap={2}>
        {roleAccess[role].map((access) => (
          <Box key={access} display="flex" width={120} alignItems="center">
            {accessIcon[access as keyof typeof accessIcon]}
            <Typography sx={{ ml: 1 }} variant="body3">
              {accessLabels[access] ?? access}
            </Typography>
          </Box>
        ))}
      </Box>
      {role === 5 ? (
        <>
          <Typography component="li" variant="body2">
            {t("shell.roleCanOnlyCreateEdit")}
          </Typography>
          <Typography component="li" variant="body2">
            {t("shell.roleCannotPublish")}
          </Typography>
          <Typography component="li" variant="body2">
            {t("shell.roleCanAccessMedia")}
          </Typography>
        </>
      ) : null}
      {role !== 0 ? (
        <Typography component="li" variant="body2">
          {t("shell.roleCannotDeleteUsers")}
        </Typography>
      ) : null}
    </Box>
  );
};

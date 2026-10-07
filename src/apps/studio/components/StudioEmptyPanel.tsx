import { Box, Drawer, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

type StudioEmptyPanelProps = {
  title: string;
  message: string;
  drawerWidth: number;
  logoSrc: string;
};

// The right panel the layout grammar shows when the Inspector has nothing to
// edit — no selection, or an element with no editable properties. It exists so
// the panel is always mounted there: unmounting it hands its width to the
// preview, and a responsive site reflows on every selection change (#4374).
// Deliberately no close button, since closing would bring that back.
export const StudioEmptyPanel = ({
  title,
  message,
  drawerWidth,
  logoSrc,
}: StudioEmptyPanelProps) => {
  const { t } = useTranslation();

  return (
    <Drawer
      data-cy="StudioEmptyPanel"
      variant="permanent"
      anchor="right"
      PaperProps={{
        sx: {
          overflow: "hidden",
          position: "relative",
          width: drawerWidth,
          boxSizing: "border-box",
          borderLeft: (theme) => `1px solid ${theme.palette.border}`,
          backgroundColor: (theme) => theme.palette.grey[50],
        },
      }}
    >
      <Box height="100%" display="flex" flexDirection="column" p={3} gap={2}>
        <Typography
          data-cy="StudioEmptyPanelTitle"
          variant="subtitle1"
          fontWeight="600"
        >
          {title}
        </Typography>
        <Typography
          data-cy="StudioEmptyPanelMessage"
          variant="body2"
          color="text.secondary"
        >
          {message}
        </Typography>

        <Box
          mt="auto"
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap={1}
        >
          <Box
            component="img"
            src={logoSrc}
            alt="Content One"
            sx={{ height: 24 }}
          />
          <Typography variant="body3" color="text.secondary" textAlign="center">
            {t("content.footerTagline")}
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};

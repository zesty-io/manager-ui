import { Box, Drawer } from "@mui/material";
import { useTranslation } from "react-i18next";
import { AIChat } from "shell/components/AIChat";

type StudioAIPanelProps = {
  onClose: () => void;
  pageModelZUID: string;
  pageItemZUID: string;
  drawerWidth: number;
};

// Takes the inspector's column. Every page shares the /studio pathname, so
// the transcript is keyed by the page item instead.
export const StudioAIPanel = ({
  onClose,
  pageModelZUID,
  pageItemZUID,
  drawerWidth,
}: StudioAIPanelProps) => {
  const { t } = useTranslation();

  return (
    <Drawer
      data-cy="StudioAIPanel"
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
      <Box height="100%" display="flex" flexDirection="column" px={2} pt={2}>
        <AIChat
          key={pageItemZUID}
          onClose={onClose}
          historyKey={`studio-${pageItemZUID}`}
          modelZUID={pageModelZUID}
          itemZUID={pageItemZUID}
          placeholder={t("content.studioAiPlaceholder")}
          forceAutoApply
          summarizeCodeEdits
        />
      </Box>
    </Drawer>
  );
};

import { Paper, Typography } from "@mui/material";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import { AIChat, AIChatHeader } from "../../components/AIChat";

export type AIDrawerProps = {
  onClose: () => void;
};

export const AIDrawer: FC<AIDrawerProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const isInContentApp = /^\/content\/[^/]+\/[^/]+$/.test(pathname);
  const isInContentMeta = /^\/content\/[^/]+\/[^/]+\/meta$/.test(pathname);
  const isInBlocks = /^\/blocks\/[^/]+\/[^/]+\/?$/.test(pathname);
  const isInCodeApp = /^\/code\/file\/.+/.test(pathname);

  const zuidMatch = pathname.match(
    /^\/content\/([^/]+)\/([^/]+)(?:\/(meta|seo))?$/
  );
  const { modelZUID, itemZUID } = zuidMatch
    ? { modelZUID: zuidMatch[1], itemZUID: zuidMatch[2] }
    : { modelZUID: undefined, itemZUID: undefined };

  return (
    <Paper
      elevation={16}
      sx={{
        display: "flex",
        flexDirection: "column",
        minWidth: 300,
        maxWidth: 300,
        px: 2,
        pt: 2,
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
        marginTop: -5,
        bgcolor: "background.paper",
        zIndex: (theme) => theme.zIndex.speedDial + 1,
      }}
    >
      {isInContentApp || isInContentMeta || isInBlocks || isInCodeApp ? (
        <AIChat
          onClose={onClose}
          historyKey={pathname}
          modelZUID={modelZUID}
          itemZUID={itemZUID}
          placeholder={t("shell.aiDrawerPlaceholder")}
          animateValues={!isInCodeApp}
        />
      ) : (
        <>
          <AIChatHeader onClose={onClose} />
          <Typography variant="body1">
            {t("shell.aiOnlyInContentApp")}
          </Typography>
        </>
      )}
    </Paper>
  );
};

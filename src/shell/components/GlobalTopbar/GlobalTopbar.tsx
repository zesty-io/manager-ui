import { GlobalSearch } from "../GlobalSearch";
import GlobalTabs from "../global-tabs";
import { GlobalNotifications } from "../global-notifications";

import { Brain } from "@zesty-io/material";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import { memo } from "react";

import { DomainSwitcher } from "./DomainSwitcher";
import { IconButton } from "@mui/material";
import { useSelector } from "react-redux";
import { AppState } from "../../store/types";
import { User } from "../../services/types";
import { isZestyEmail } from "../../../utility/isZestyEmail";
import { useLocation } from "react-router";

type Props = {
  onShowAiDrawerToggle: () => void;
};

export const GlobalTopbar = memo(({ onShowAiDrawerToggle }: Props) => {
  const user: User = useSelector((state: AppState) => state.user);
  const { pathname } = useLocation();
  const isInContentApp = /^\/content\/[^/]+\/[^/]+$/.test(pathname);
  const isInContentMeta = /^\/content\/[^/]+\/[^/]+\/meta$/.test(pathname);
  const isInBlocks = /^\/blocks\/[^/]+\/[^/]+\/?$/.test(pathname);
  const isInCodeApp = /^\/code\/file\/.+/.test(pathname);
  const hasAISupport =
    isInContentApp || isInContentMeta || isInBlocks || isInCodeApp;

  return (
    <Stack
      direction="row"
      justifyContent="flex-start"
      alignItems="flex-end"
      sx={{
        backgroundColor: "grey.100",
        height: "40px",
      }}
    >
      <Box
        sx={{
          width: 288,
          minWidth: 288,
        }}
      >
        <GlobalSearch />
      </Box>
      <Box
        sx={{
          flexGrow: 1,
        }}
      >
        <GlobalTabs />
      </Box>
      <Stack direction="row" flexBasis={72} alignItems="baseline" gap={1}>
        {hasAISupport && (
          <IconButton
            data-cy="AIDrawerToggle"
            onClick={() => {
              onShowAiDrawerToggle();
            }}
            size="small"
          >
            <Brain fontSize="inherit" />
          </IconButton>
        )}
        <DomainSwitcher />
        <GlobalNotifications />
      </Stack>
    </Stack>
  );
});

GlobalTopbar.displayName = "GlobalTopbar";

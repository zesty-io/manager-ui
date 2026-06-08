import { GlobalSearch } from "../GlobalSearch";
import GlobalTabs from "../global-tabs";
import { GlobalNotifications } from "../global-notifications";

import { Brain } from "@zesty-io/material";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import { memo } from "react";

import { DomainSwitcher } from "./DomainSwitcher";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { IconButton } from "@mui/material";
import { useSelector } from "react-redux";
import { AppState } from "../../store/types";
import { User } from "../../services/types";
import { isZestyEmail } from "../../../utility/isZestyEmail";

type Props = {
  onShowAiDrawerToggle: () => void;
};

export const GlobalTopbar = memo(({ onShowAiDrawerToggle }: Props) => {
  const user: User = useSelector((state: AppState) => state.user);
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
      <Stack direction="row" alignItems="center" gap={1} pr={1}>
        <LocaleSwitcher />
        <IconButton
          onClick={() => {
            onShowAiDrawerToggle();
          }}
          size="small"
        >
          <Brain fontSize="inherit" />
        </IconButton>
        <DomainSwitcher />
        <GlobalNotifications />
      </Stack>
    </Stack>
  );
});

GlobalTopbar.displayName = "GlobalTopbar";

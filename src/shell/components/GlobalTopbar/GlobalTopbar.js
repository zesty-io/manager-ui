import GlobalSearch from "shell/components/global-search";
import GlobalTabs from "shell/components/global-tabs";
import { GlobalNotifications } from "shell/components/global-notifications";

import { theme } from "@zesty-io/material";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";

export function GlobalTopbar() {
  return (
    <Stack
      container
      direction="row"
      justifyContent="flex-start"
      alignItems="center"
      sx={{
        backgroundColor: theme.palette.grey[100],
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
      <Box mr={1} ml={1}>
        <GlobalNotifications />
      </Box>
    </Stack>
  );
}

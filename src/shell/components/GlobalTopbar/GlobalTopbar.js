import GlobalSearch from "shell/components/global-search";
import GlobalTabs from "shell/components/global-tabs";
import { GlobalNotifications } from "shell/components/global-notifications";

import { theme, legacyTheme } from "@zesty-io/material";
import { ThemeProvider } from "@mui/material/styles";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";

export function GlobalTopbar() {
  return (
    <ThemeProvider theme={theme}>
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
          <ThemeProvider theme={legacyTheme}>
            <GlobalSearch />
          </ThemeProvider>
        </Box>
        <Box
          sx={{
            flexGrow: 1,
          }}
        >
          <GlobalTabs />
        </Box>
        <Box display="flex" flexBasis={60}>
          <GlobalNotifications />
        </Box>
      </Stack>
    </ThemeProvider>
  );
}

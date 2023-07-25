import { GlobalSearch } from "../GlobalSearch";
import GlobalTabs from "../global-tabs";
import { GlobalNotifications } from "../global-notifications";

import { theme, legacyTheme } from "@zesty-io/material";
import { ThemeProvider } from "@mui/material/styles";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";

import { DomainSwitcher } from "./DomainSwitcher";

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
          <DomainSwitcher />
          <GlobalNotifications />
        </Stack>
      </Stack>
    </ThemeProvider>
  );
}

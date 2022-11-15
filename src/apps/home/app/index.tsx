import { Box, ThemeProvider } from "@mui/material";
import { theme } from "@zesty-io/material";
import { Header } from "./components/Header";
import { MetricCards } from "./components/MetricCards";
import { ResourceTable } from "./components/ResourceTable";

export const HomeApp = () => {
  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          color: "text.primary",
          backgroundColor: "grey.50",
          height: "100%",
          "*": {
            boxSizing: "border-box",
          },
          "*::-webkit-scrollbar-track-piece": {
            backgroundColor: `${theme.palette.grey[100]} !important`,
          },
          "*::-webkit-scrollbar-thumb": {
            backgroundColor: `${theme.palette.grey[300]} !important`,
          },
        }}
      >
        <Header />
        <Box sx={{ mx: 3, mt: -7.5 }}>
          <MetricCards />
          <ResourceTable />
        </Box>
      </Box>
    </ThemeProvider>
  );
};

import { createRoot } from "react-dom/client";
import { Preview } from "./Preview";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "@zesty-io/material";
import getRuntimeEnv from "../../utility/getRuntimeEnv";

// interploated by webpack at build time
window.CONFIG = {
  ...__CONFIG__,
  ...getRuntimeEnv({ env: __CONFIG__.ENV, hostname: window.location.hostname }),
};

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <ThemeProvider theme={theme}>
    <Preview />
  </ThemeProvider>
);

import { createRoot } from "react-dom/client";
import { Preview } from "./Preview";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "@zesty-io/material";

// interploated by webpack at build time
window.CONFIG = __CONFIG__;

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <ThemeProvider theme={theme}>
    <Preview />
  </ThemeProvider>
);

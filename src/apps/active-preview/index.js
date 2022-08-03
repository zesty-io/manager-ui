import ReactDOM from "react-dom";
import { Preview } from "./Preview";
import { ThemeProvider } from "@mui/material/styles";
import { legacyTheme } from "@zesty-io/material";

// interploated by webpack at build time
window.CONFIG = __CONFIG__;

ReactDOM.render(
  <ThemeProvider theme={legacyTheme}>
    <Preview />
  </ThemeProvider>,
  document.getElementById("root")
);

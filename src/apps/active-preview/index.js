import ReactDOM from "react-dom";
import { Preview } from "./Preview";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "@zesty-io/material";

// interploated by webpack at build time
window.CONFIG = __CONFIG__;

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <Preview />
  </ThemeProvider>,
  document.getElementById("root")
);

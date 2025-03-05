import { useEffect } from "react";
import { connect } from "react-redux";
import { useRouteMatch } from "react-router-dom";
import {
  ThemeProvider,
  createTheme,
  Box,
  Grid,
  CssBaseline,
} from "@mui/material";
import { WithLoader } from "@zesty-io/core/WithLoader";
import { Workspace } from "../../components/Workspace/";
import { fetchFiles } from "../../../store/files";
import { theme } from "@zesty-io/material";
import SideBar from "../../components/SideBar";

const codeTheme = createTheme(theme, {
  palette: {
    success: {
      contrastText: "rgb(255, 255, 255)",
    },
    warning: {
      contrastText: "rgb(255, 255, 255)",
    },
    info: {
      contrastText: "rgb(255, 255, 255)",
    },
    divider: "rgba(255, 255, 255, 0.12)",
    background: {
      default: "rgb(30, 30, 30)",
      paper: "rgb(16, 24, 40)",
    },
    action: {
      disabled: "rgba(255, 255, 255, 0.3)",
      disabledBackground: "rgba(255, 255, 255, 0.12)",
      selected: "rgba(255, 93, 10, 0.08)",
    },
    text: {
      primary: "rgb(208, 213, 221)",
      secondary: "rgb(152, 162, 179)",
    },
  },
});

export default connect((state) => {
  return {
    files: state.files,
    navCode: state.navCode,
    status: "dev",
  };
})(function CodeEditor(props) {
  const match = useRouteMatch("/code/file/:fileType/:fileZUID");

  // On initial render load files: Templates, Stylesheets, Scripts
  useEffect(() => {
    props.dispatch(fetchFiles("views"));
    props.dispatch(fetchFiles("stylesheets"));
    props.dispatch(fetchFiles("scripts"));
  }, []);

  useEffect(() => {
    const handleEditorClose = (evt) => {
      if (props.files.find((f) => f.dirty)) {
        // Cancel the event
        evt.preventDefault(); // If you prevent default behavior in Mozilla Firefox prompt will always be shown
        // Chrome requires returnValue to be set
        evt.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleEditorClose);

    return () => {
      window.removeEventListener("beforeunload", handleEditorClose);
    };
  });

  return (
    <ThemeProvider theme={codeTheme}>
      <CssBaseline />
      <WithLoader
        condition={props?.files?.length}
        message="Starting Code Editor"
        width="100vw"
      >
        <Grid
          container
          spacing={0}
          columns={2}
          sx={{
            height: "calc(100vh - 40px)",
            bgcolor: "background.paper",
            position: "relative",
          }}
        >
          <Grid
            item
            xs={"auto"}
            sx={{
              position: "relative",
              height: "100%",
              borderRight: "1px solid",
              borderColor: "grey.800",
            }}
          >
            {/* <FilePanel {...props} /> */}
            <SideBar {...props} />
          </Grid>
          <Grid item xs>
            <Box position="relative" width="100%" height="100%">
              <Workspace
                dispatch={props.dispatch}
                files={props.files}
                status={props.status}
              />
            </Box>
          </Grid>
        </Grid>
      </WithLoader>
    </ThemeProvider>
  );
});

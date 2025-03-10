import { useEffect } from "react";
import { connect } from "react-redux";
import { useRouteMatch } from "react-router-dom";
import { Box, Grid } from "@mui/material";

import { WithLoader } from "@zesty-io/core/WithLoader";

import { Workspace } from "../../components/Workspace/";

import { fetchFiles } from "../../../store/files";
import SideBar from "../../components/SideBar";
import styles from "./CodeEditor.less";

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
          bgcolor: "grey.900",
          color: "grey.300",
          position: "relative",
        }}
      >
        <Grid
          item
          xs={"auto"}
          sx={{
            position: "relative",
            height: "100%",
            borderRight: "text.primary",
            bgcolor: "#101828",
          }}
        >
          <SideBar {...props} />
        </Grid>
        <Grid item xs sx={{ position: "relative", height: "100%" }}>
          <Box position="absolute" width="100%" height="100%">
            <Workspace
              dispatch={props.dispatch}
              files={props.files}
              status={props.status}
            />
          </Box>
        </Grid>
      </Grid>
    </WithLoader>
  );
});

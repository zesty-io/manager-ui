import { useEffect, useState, useCallback } from "react";
import { connect } from "react-redux";
import { Switch, useRouteMatch } from "react-router-dom";
import { Grid, Typography, Box } from "@mui/material";

import { WithLoader } from "@zesty-io/core/WithLoader";

import Workspace from "../../components/Workspace";

import { fetchFiles } from "../../../store/files";
import SideBar from "../../components/SideBar";
import { Route } from "react-router";
import { GettingStarted } from "../../components/Workspace/components/GettingStarted";
import { RecentFiles } from "../../components/RecentFiles";
import CreateFile from "../../components/CreateFile";

export default connect((state) => {
  return {
    files: state.files,
    navCode: state.navCode,
    status: "dev",
  };
})(function CodeEditor(props) {
  const match = useRouteMatch("/code/file/:fileType/:fileZUID");

  const [fileType, setFileType] = useState("");
  const [navType, setNavType] = useState(null);
  const [isCreateFileOpen, setIsCreateFileOpen] = useState(false);

  const openCreateFileDialog = (type, nav) => {
    setFileType(type);
    setNavType(nav);
    setIsCreateFileOpen(true);
  };

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
          bgcolor: "background.editor",
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
            borderRight: "1px solid",
            borderRightColor: "grey.800",
            bgcolor: "grey.900",
          }}
        >
          <SideBar {...props} openCreateFileDialog={openCreateFileDialog} />
        </Grid>
        <Grid
          item
          xs
          sx={{
            position: "relative",
            height: "100%",
            width: "100%",
            overflow: "hidden",
            bgcolor: "background.editor",
          }}
        >
          <Switch>
            <Route exact path="/code">
              {/* <GettingStarted files={props.files} /> */}
              <RecentFiles openCreateFileDialog={openCreateFileDialog} />
            </Route>
            <Route
              path="/code/file/:fileType/:fileZUID"
              render={(routeProps) => {
                return (
                  <Workspace
                    {...routeProps}
                    dispatch={props.dispatch}
                    status={props.status}
                    match={match}
                  />
                );
              }}
            />
            <Route path="*">
              <Box
                width="100%"
                height="100%"
                display="grid"
                placeContent="center"
              >
                <Typography variant="h1">File Not Found</Typography>
              </Box>
            </Route>
          </Switch>
        </Grid>
      </Grid>
      <CreateFile
        open={isCreateFileOpen}
        onClose={() => {
          setFileType(null);
          setNavType(null);
          setIsCreateFileOpen(false);
        }}
        defaultType={fileType}
        title={`Create ${navType}`}
      />
    </WithLoader>
  );
});

import { useEffect, useState, useCallback } from "react";
import { connect } from "react-redux";
import { Switch, useRouteMatch } from "react-router-dom";
import { Grid, Typography, Box } from "@mui/material";

import { WithLoader } from "shell/components/legacy/WithLoader";

import Workspace from "../../components/Workspace";

import { fetchFiles } from "../../../store/files";
import SideBar from "../../components/SideBar";
import { Route } from "react-router";
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
  const [isFetchingNav, setIsFetchingNav] = useState(true);

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
    Promise.allSettled([
      props.dispatch(fetchFiles("views")),
      props.dispatch(fetchFiles("stylesheets")),
      props.dispatch(fetchFiles("scripts")),
    ]).finally(() => {
      setIsFetchingNav(false);
    });
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
    <Box
      sx={{
        height: "calc(100vh - 40px)",
        width: "100%",
        bgcolor: "background.editor",
        color: "grey.300",
        position: "relative",
      }}
    >
      <WithLoader
        condition={!!props?.files?.length}
        message="Starting Code Editor"
        width="100%"
        style={{
          backgroundColor: "red",
        }}
      >
        <Grid
          container
          spacing={0}
          columns={2}
          sx={{
            height: "100%",
            width: "100%",
            position: "relative",
          }}
        >
          <Grid
            size="auto"
            sx={{
              position: "relative",
              height: "100%",
              borderRight: "1px solid",
              borderRightColor: "grey.800",
              bgcolor: "grey.900",
              "& > div": {
                height: "100%",
              },
            }}
          >
            <SideBar
              {...props}
              openCreateFileDialog={openCreateFileDialog}
              isLoading={isFetchingNav}
            />
          </Grid>
          <Grid
            size="grow"
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
                  sx={{ display: "grid", placeContent: "center" }}
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
    </Box>
  );
});

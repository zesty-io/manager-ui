import { Box, ThemeProvider } from "@mui/material";
import { theme } from "@zesty-io/material";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Redirect, Route, Switch, useHistory } from "react-router";
import {
  setLimitSelected,
  setIsSelectDialog,
  clearSelectedFiles,
  setShowHeaderActions,
} from "../../../../shell/store/media-revamp";

import { AllMedia } from "./views/AllMedia";
import { Media } from "./views/Media";
import { SearchMedia } from "./views/SearchMedia";

import { Sidebar } from "./components/Sidebar";
import { FileModal } from "./components/FileModal";
import { File } from "../../../../shell/services/types";
import { NotFoundState } from "./components/NotFoundState";

interface Props {
  limitSelected?: number;
  lockedToGroupId?: string;
  isSelectDialog?: boolean;
  showHeaderActions: boolean;
  addImagesCallback?: (selectedFiles: File[]) => void;
}

export const MediaApp = ({
  lockedToGroupId,
  isSelectDialog = true,
  showHeaderActions = true,
  addImagesCallback,
  limitSelected = null,
}: Props) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const [isFileModalError, setIsFileModalError] = useState<boolean>(false);
  const fileId = new URLSearchParams(location.search).get("fileId");

  useEffect(() => {
    console.log("showHeaderActions", showHeaderActions);
    if (lockedToGroupId) {
      history.push(`/media/${lockedToGroupId}`);
    }
    dispatch(setShowHeaderActions(showHeaderActions));
    dispatch(setIsSelectDialog(isSelectDialog));
    dispatch(setLimitSelected(limitSelected));
  }, [lockedToGroupId, isSelectDialog, showHeaderActions]);

  useEffect(() => {
    return () => {
      dispatch(clearSelectedFiles());
      dispatch(setLimitSelected(null));
    };
  }, []);

  useEffect(() => {
    if (!fileId) {
      setIsFileModalError(false);
    }
  }, [fileId]);

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          color: "text.primary",
          backgroundColor: "background.paper",
          height: "100%",
          display: "flex",
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
        <Sidebar
          isSelectDialog={isSelectDialog}
          lockedToGroupId={lockedToGroupId}
        />

        {/* If a fileId is present render preview modal */}
        <Route
          path="/media"
          render={({ location }) => {
            const fileId = new URLSearchParams(location.search).get("fileId");

            if (fileId) {
              return (
                <FileModal
                  fileId={fileId}
                  onSetIsFileModalError={setIsFileModalError}
                />
              );
            } else {
              return null;
            }
          }}
        />

        <Switch>
          <Route
            exact
            path="/media"
            render={() => {
              if (isFileModalError) {
                return (
                  <Box
                    component="main"
                    sx={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                    }}
                  >
                    <NotFoundState
                      title="File Not Found"
                      message="We’re sorry the file you requested could not be found. Please go back to the all media page."
                    />
                  </Box>
                );
              } else {
                return <AllMedia addImagesCallback={addImagesCallback} />;
              }
            }}
          />
          <Route
            path="/media/search"
            render={() => {
              if (isFileModalError) {
                return (
                  <Box
                    component="main"
                    sx={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                    }}
                  >
                    <NotFoundState
                      title="File Not Found"
                      message="We’re sorry the file you requested could not be found. Please go back to the all media page."
                    />
                  </Box>
                );
              } else {
                return (
                  <SearchMedia
                    lockedToGroupId={lockedToGroupId}
                    addImagesCallback={addImagesCallback}
                  />
                );
              }
            }}
          />
          <Route
            path="/media/:id"
            render={() => {
              if (isFileModalError) {
                return (
                  <Box
                    component="main"
                    sx={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                    }}
                  >
                    <NotFoundState
                      title="File Not Found"
                      message="We’re sorry the file you requested could not be found. Please go back to the all media page."
                    />
                  </Box>
                );
              } else {
                return <Media addImagesCallback={addImagesCallback} />;
              }
            }}
          />
          <Redirect to="/media" />
        </Switch>
      </Box>
    </ThemeProvider>
  );
};

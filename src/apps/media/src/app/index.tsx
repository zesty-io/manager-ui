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
  setIsReplace,
} from "../../../../shell/store/media-revamp";

import { AllMedia } from "./views/AllMedia";
import { Media } from "./views/Media";
import { SearchMedia } from "./views/SearchMedia";
import { InsightsMedia } from "./views/InsightsMedia";

import { Sidebar } from "./components/Sidebar";
import { FileModal } from "./components/FileModal";
import { File } from "../../../../shell/services/types";
import { NotFoundState } from "./components/NotFoundState";
import { ResizableContainer } from "../../../../shell/components/ResizeableContainer";
import { UploadModal } from "./components/UploadModal";

interface Props {
  limitSelected?: number;
  lockedToGroupId?: string;
  showHeaderActions?: boolean;
  isSelectDialog?: boolean;
  addImagesCallback?: (selectedFiles: File[]) => void;
  isReplace?: boolean;
}

export const MediaApp = ({
  lockedToGroupId,
  showHeaderActions = true,
  isSelectDialog = false,
  addImagesCallback,
  limitSelected,
  isReplace = false,
}: Props) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const [isFileModalError, setIsFileModalError] = useState<boolean>(false);
  const fileId = new URLSearchParams(location.search).get("fileId");
  const [currentFiles, setCurrentFiles] = useState([]);

  useEffect(() => {
    if (lockedToGroupId) {
      history.push(`/media/folder/${lockedToGroupId}`);
    }
    dispatch(setShowHeaderActions(showHeaderActions));
    dispatch(setIsSelectDialog(isSelectDialog));
    dispatch(setLimitSelected(limitSelected));
    dispatch(setIsReplace(isReplace));
  }, [lockedToGroupId, isSelectDialog, showHeaderActions]);

  useEffect(() => {
    return () => {
      dispatch(setIsSelectDialog(false));
      dispatch(clearSelectedFiles());
      dispatch(setLimitSelected(null));
      dispatch(setIsReplace(false));
    };
  }, []);

  useEffect(() => {
    if (!fileId) {
      setIsFileModalError(false);
    }
  }, [fileId]);

  return (
    <ThemeProvider theme={theme}>
      <UploadModal />
      <Box
        sx={{
          color: "text.primary",
          backgroundColor: "background.paper",
          height: "100%",
          display: "flex",
          "*": {
            boxSizing: "border-box",
          },
        }}
      >
        <ResizableContainer
          id="mediaNav"
          defaultWidth={220}
          minWidth={220}
          maxWidth={360}
        >
          <Sidebar
            isSelectDialog={isSelectDialog}
            lockedToGroupId={lockedToGroupId}
          />
        </ResizableContainer>

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
                  currentFiles={currentFiles.map((file) => file.id)}
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
                return (
                  <AllMedia
                    addImagesCallback={addImagesCallback}
                    setCurrentFilesCallback={(files) => setCurrentFiles(files)}
                  />
                );
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
                    setCurrentFilesCallback={(files) => setCurrentFiles(files)}
                  />
                );
              }
            }}
          />
          <Route
            path="/media/folder/:id"
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
                  <Media
                    addImagesCallback={addImagesCallback}
                    setCurrentFilesCallback={(files) => setCurrentFiles(files)}
                  />
                );
              }
            }}
          />
          <Route path="/media/insights" render={() => <InsightsMedia />} />
          <Redirect to="/media" />
        </Switch>
      </Box>
    </ThemeProvider>
  );
};

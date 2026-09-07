import { Box } from "@mui/material";
import { SubAppSkeleton } from "shell/components/SubAppSkeleton";
import { Suspense, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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

// Local Suspense boundary so lazy-loading the "media" namespace shows a
// fallback in the sub-app area only, instead of blanking the whole shell.
export const MediaApp = (props: Props) => {
  return (
    <Suspense fallback={<SubAppSkeleton />}>
      <MediaAppContent {...props} />
    </Suspense>
  );
};

const MediaAppContent = ({
  lockedToGroupId,
  showHeaderActions = true,
  isSelectDialog = false,
  addImagesCallback,
  limitSelected,
  isReplace = false,
}: Props) => {
  // Requesting the namespace here triggers its lazy load and suspends this
  // subtree until ready; child components use bare useTranslation() with
  // qualified keys (t("media.key")) once it's in the store.
  const { t } = useTranslation("media");
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
    <>
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
                      title={t("media.mediaAppFileNotFoundTitle")}
                      message={t("media.mediaAppFileNotFoundMessage")}
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
                      title={t("media.mediaAppFileNotFoundTitle")}
                      message={t("media.mediaAppFileNotFoundMessage")}
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
                      title={t("media.mediaAppFileNotFoundTitle")}
                      message={t("media.mediaAppFileNotFoundMessage")}
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
    </>
  );
};

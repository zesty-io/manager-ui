import { Box, ThemeProvider } from "@mui/material";
import { theme } from "@zesty-io/material";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Redirect, Route, Switch, useHistory } from "react-router";
import {
  setLimitSelected,
  setIsSelectDialog,
  clearSelectedFiles,
} from "../../../../shell/store/media-revamp";

import { AllMedia } from "./views/AllMedia";
import { Media } from "./views/Media";
import { SearchMedia } from "./views/SearchMedia";

import { Sidebar } from "./components/Sidebar";
import { FileModal } from "./components/FileModal";
import { File } from "../../../../shell/services/types";

interface Props {
  limitSelected?: number;
  lockedToGroupId?: string;
  isSelectDialog?: boolean;
  addImagesCallback?: (selectedFiles: File[]) => void;
}

export const MediaApp = ({
  lockedToGroupId,
  isSelectDialog = false,
  addImagesCallback,
  limitSelected = null,
}: Props) => {
  const history = useHistory();
  const dispatch = useDispatch();

  useEffect(() => {
    if (lockedToGroupId) {
      history.push(`/media/${lockedToGroupId}`);
    }
    dispatch(setIsSelectDialog(isSelectDialog));
    dispatch(setLimitSelected(limitSelected));
  }, [lockedToGroupId, isSelectDialog]);

  useEffect(() => {
    return () => {
      dispatch(setIsSelectDialog(false));
      dispatch(clearSelectedFiles());
      dispatch(setLimitSelected(null));
    };
  }, []);

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
              return <FileModal fileId={fileId} />;
            } else {
              return null;
            }
          }}
        />

        <Switch>
          <Route
            exact
            path="/media"
            render={() => <AllMedia addImagesCallback={addImagesCallback} />}
          />
          <Route
            path="/media/search"
            render={() => <SearchMedia lockedToGroupId={lockedToGroupId} />}
          />
          <Route
            path="/media/:id"
            render={() => <Media addImagesCallback={addImagesCallback} />}
          />
          <Redirect to="/media" />
        </Switch>
      </Box>
    </ThemeProvider>
  );
};

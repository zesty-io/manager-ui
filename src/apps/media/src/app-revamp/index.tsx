import { Box, ThemeProvider } from "@mui/material";
import { theme } from "@zesty-io/material";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Redirect, Route, Switch, useHistory, useHistory } from "react-router";
import {
  setLockedToGroupId,
  setIsSelectDialog,
  clearSelectedFiles,
} from "../../../../shell/store/media-revamp";
import {
  setLockedToGroupId,
  setIsSelectDialog,
  clearSelectedFiles,
} from "../../../../shell/store/media-revamp";
import { Sidebar } from "./components/Sidebar";
import { AllMedia } from "./views/AllMedia";
import { Media } from "./views/Media";
import { SearchMedia } from "./views/SearchMedia";

interface Props {
  limitSelected?: number;
  lockedToGroupId?: string;
  isSelectDialog?: boolean;
  addImagesCallback?: () => void;
}

export const MediaApp = ({
  lockedToGroupId,
  isSelectDialog = false,
}: Props) => {
  const history = useHistory();
  const dispatch = useDispatch();

  useEffect(() => {
    if (lockedToGroupId) {
      history.push(`/media/${lockedToGroupId}`);
      //set select limit to store
    }
    dispatch(setIsSelectDialog(isSelectDialog));
  }, [lockedToGroupId, isSelectDialog]);

  useEffect(() => {
    return () => {
      dispatch(setIsSelectDialog(false));
      dispatch(clearSelectedFiles());
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
        <Switch>
          <Route exact path="/media" component={AllMedia} />
          <Route
            path="/media/search"
            render={() => <SearchMedia lockedToGroupId={lockedToGroupId} />}
          />
          <Route exact path="/media/:id" component={Media} />
          <Redirect to="/media" />
        </Switch>
      </Box>
    </ThemeProvider>
  );
};

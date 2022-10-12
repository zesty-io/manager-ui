import { Box, ThemeProvider } from "@mui/material";
import { theme } from "@zesty-io/material";
import { useEffect } from "react";
import { Redirect, Route, Switch, useHistory } from "react-router";
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

export const MediaApp = ({ lockedToGroupId }: Props) => {
  const history = useHistory();

  useEffect(() => {
    if (lockedToGroupId) {
      history.push(`/media/${lockedToGroupId}`);
    }
  }, [lockedToGroupId]);

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
        }}
      >
        <Sidebar isSelectDialog lockedToGroupId={lockedToGroupId} />
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

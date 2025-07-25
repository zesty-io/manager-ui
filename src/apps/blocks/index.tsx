import { Box } from "@mui/material";
import { ResizableContainer } from "../../shell/components/ResizeableContainer";
import { Sidebar } from "./components/Sidebar";
import { Route, Switch } from "react-router";
import { AllBlocks } from "./views/AllBlocks";
import { BlockModel } from "./views/BlockModel";
import { BlockItem } from "./views/BlockItem";

export const BlocksApp = () => {
  return (
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
        id="blocksNav"
        defaultWidth={220}
        minWidth={220}
        maxWidth={360}
      >
        <Sidebar />
      </ResizableContainer>
      <Switch>
        <Route exact path="/blocks" render={() => <AllBlocks />} />
        <Route
          path="/blocks/:modelZUID/new"
          render={({ match }) => (
            <BlockItem isCreate key={match.params.modelZUID} />
          )}
        />
        <Route path="/blocks/:modelZUID/:itemZUID">
          <BlockItem />
        </Route>
        <Route
          path="/blocks/:modelZUID"
          render={({ match }) => <BlockModel key={match.params.modelZUID} />}
        />
      </Switch>
    </Box>
  );
};

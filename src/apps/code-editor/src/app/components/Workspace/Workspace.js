import React from "react";
import { Switch, Route } from "react-router";

import { GettingStarted } from "./components/GettingStarted";
import { FileViewer } from "./components/FileViewer";
import { NotFound } from "./components/NotFound";

export const Workspace = React.memo(function Workspace(props) {
  return (
    <div>
      <Switch>
        <Route exact path="/code">
          <GettingStarted files={props.files} />
        </Route>
        <Route
          path="/code/file/:fileType/:fileZUID"
          render={(routeProps) => {
            return (
              <FileViewer
                {...routeProps}
                dispatch={props.dispatch}
                status={props.status}
              />
            );
          }}
        />
        <Route path="*">
          <NotFound />
        </Route>
      </Switch>
    </div>
  );
});

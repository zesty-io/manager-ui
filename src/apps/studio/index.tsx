import { Route, Switch } from "react-router-dom";

import { StudioWrapper } from "../content-editor/src/app/views/ItemEdit/StudioWrapper";

export const StudioApp = () => {
  return (
    <Switch>
      <Route path="/studio" render={() => <StudioWrapper />} />
    </Switch>
  );
};

export default StudioApp;

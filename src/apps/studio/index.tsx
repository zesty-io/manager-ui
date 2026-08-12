import { Route, Switch } from "react-router-dom";

import { StudioWrapper } from "./StudioWrapper";

export const StudioApp = () => {
  return (
    <Switch>
      <Route path="/studio" render={() => <StudioWrapper />} />
    </Switch>
  );
};

export default StudioApp;

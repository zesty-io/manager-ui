import { Box } from "@mui/material";
import { Redirect, Route, Switch, useParams, useHistory } from "react-router";
import { useGetContentModelsQuery } from "../../../../../shell/services/instance";
import { FieldList } from "../components/FieldList";
import { ModelHeader } from "../components/ModelHeader";
import { AddFieldModal } from "../components/AddFieldModal";

export const Model = () => {
  const history = useHistory();

  return (
    <Box flex="1" display="flex" height="100%" flexDirection="column">
      <ModelHeader />
      <Switch>
        <Route exact path="/schema/:id/fields" render={() => <FieldList />} />
        <Route
          exact
          path="/schema/:id/fields/:fieldId"
          render={() => (
            <AddFieldModal
              mode="update_field"
              onModalClose={() => history.goBack()}
            />
          )}
        />
        <Route
          exact
          path="/schema/:id/info"
          render={() => <div>MODEL INFO</div>}
        />
        <Redirect to="/schema/:id/fields" />
      </Switch>
    </Box>
  );
};

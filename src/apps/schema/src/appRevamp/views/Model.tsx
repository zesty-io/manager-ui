import { useState } from "react";
import { Box } from "@mui/material";
import { Redirect, Route, Switch, useParams, useHistory } from "react-router";
import { FieldList } from "../components/FieldList";
import { ModelHeader } from "../components/ModelHeader";
import { AddFieldModal } from "../components/AddFieldModal";
import { ModelInfo } from "../components/ModelInfo";

type Params = {
  id: string;
};
export const Model = () => {
  const [isAddFieldModalOpen, setAddFieldModalOpen] = useState(false);
  const [sortIndex, setSortIndex] = useState<number | null>(null);
  const history = useHistory();
  const params = useParams<Params>();
  const { id } = params;

  const handleNewFieldModalClick = (sortIndex: number | null) => {
    setAddFieldModalOpen(true);
    setSortIndex(sortIndex);
  };

  const handleModalClosed = () => {
    setAddFieldModalOpen(false);
    setSortIndex(null);
  };

  return (
    <Box flex="1" display="flex" height="100%" flexDirection="column">
      <ModelHeader onNewFieldModalClick={handleNewFieldModalClick} />
      <Route
        path="/schema/:id/fields"
        render={({ location }) => {
          const fieldZuid = new URLSearchParams(location.search).get(
            "fieldZuid"
          );

          if (fieldZuid) {
            return (
              <AddFieldModal
                mode="update_field"
                onModalClose={() => history.push(`/schema/${id}/fields`)}
              />
            );
          }
        }}
      />
      <Switch>
        <Route
          exact
          path="/schema/:id/fields"
          render={() => (
            <FieldList onNewFieldModalClick={handleNewFieldModalClick} />
          )}
        />
        <Route exact path="/schema/:id/info" component={ModelInfo} />
        <Redirect to="/schema/:id/fields" />
      </Switch>
      {isAddFieldModalOpen && (
        <AddFieldModal
          mode="fields_list"
          onModalClose={handleModalClosed}
          sortIndex={sortIndex}
        />
      )}
    </Box>
  );
};

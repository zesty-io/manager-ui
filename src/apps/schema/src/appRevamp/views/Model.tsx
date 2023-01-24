import { useState } from "react";
import { Box } from "@mui/material";
import { Redirect, Route, Switch, useParams, useHistory } from "react-router";
import { useGetContentModelsQuery } from "../../../../../shell/services/instance";
import { FieldList } from "../components/FieldList";
import { ModelHeader } from "../components/ModelHeader";
import { AddFieldModal } from "../components/AddFieldModal";

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
      <Switch>
        <Route
          exact
          path="/schema/:id/fields"
          render={() => (
            <FieldList
              onNewFieldModalClick={handleNewFieldModalClick}
              isDeferFieldFetch={Boolean(sortIndex !== null)}
            />
          )}
        />
        <Route
          exact
          path="/schema/:id/fields/:fieldId"
          render={() => (
            <AddFieldModal
              mode="update_field"
              onModalClose={() => history.push(`/schema/${id}/fields`)}
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
      {isAddFieldModalOpen && (
        <AddFieldModal
          mode="fields_list"
          onModalClose={handleModalClosed}
          sortIndex={sortIndex}
          onBulkUpdateDone={() => setSortIndex(null)}
        />
      )}
    </Box>
  );
};

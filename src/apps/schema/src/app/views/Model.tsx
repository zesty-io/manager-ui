import { useState } from "react";
import { Box, Button } from "@mui/material";
import { Redirect, Route, Switch, useParams, useHistory } from "react-router";
import { FieldList } from "../components/FieldList";
import { ModelHeader } from "../components/ModelHeader";
import { AddFieldModal } from "../components/AddFieldModal";
import { ModelInfo } from "../components/ModelInfo";
import { useGetContentModelsQuery } from "../../../../../shell/services/instance";
import { NotFound } from "../../../../../shell/components/NotFound";
import SchemaRoundedIcon from "@mui/icons-material/SchemaRounded";
import { ModelActivityLog } from "../components/ModelActivityLog";
import { ModelApi } from "../components/ModelApi";

type Params = {
  id: string;
};
export const Model = () => {
  const [isAddFieldModalOpen, setAddFieldModalOpen] = useState(false);
  const [sortIndex, setSortIndex] = useState<number | null>(null);
  const history = useHistory();
  const params = useParams<Params>();
  const { id } = params;
  const { data: models, isFetching } = useGetContentModelsQuery();

  const handleNewFieldModalClick = (sortIndex: number | null) => {
    setAddFieldModalOpen(true);
    setSortIndex(sortIndex);
  };

  const handleModalClosed = () => {
    setAddFieldModalOpen(false);
    setSortIndex(null);
  };

  if (!isFetching && !models?.find((model) => model.ZUID === id)) {
    return (
      <NotFound
        title="Model Not Found"
        message="We're sorry the model you requested could not be found. Please go back to the All Models page."
        button={
          <Button
            startIcon={<SchemaRoundedIcon />}
            variant="contained"
            onClick={() => history.push("/schema")}
          >
            Go to All Models
          </Button>
        }
      />
    );
  }

  return (
    <Box
      flex="1"
      display="flex"
      height="100%"
      flexDirection="column"
      sx={{ backgroundColor: "grey.50" }}
    >
      <ModelHeader onNewFieldModalClick={handleNewFieldModalClick} />
      <Route
        path="/schema/:id/fields/:fieldId"
        render={() => {
          return (
            <AddFieldModal
              mode="update_field"
              onModalClose={() => history.push(`/schema/${id}/fields`)}
            />
          );
        }}
      />
      <Switch>
        <Route
          path="/schema/:id/fields"
          render={() => (
            <FieldList onNewFieldModalClick={handleNewFieldModalClick} />
          )}
        />
        <Route path="/schema/:id/api" component={ModelApi} />
        <Route exact path="/schema/:id/info" component={ModelInfo} />
        <Route
          exact
          path="/schema/:id/activity-log"
          component={ModelActivityLog}
        />
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

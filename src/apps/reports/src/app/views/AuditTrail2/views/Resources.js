import { useMemo } from "react";
import { Box } from "@mui/material";
import { uniqBy } from "lodash";
import { ResourceList } from "../components/ResourceList";
import { ActivityByResource } from "../components/ActivityByResource";
import { useParams } from "shell/hooks/useParams";
import { filterByParams } from "utility/filterByParams";
import { Filters } from "../components/Filters";

export const Resources = (props) => {
  const [params] = useParams();

  const filteredActions = useMemo(
    () => filterByParams(props.actions, params),
    [props.actions, params]
  );

  return (
    <Box sx={{ px: 3 }}>
      <Box sx={{ mt: 3, mb: 1.5 }}>
        <Filters
          filters={["happenedAt", "resourceType", "actionByUserZUID"]}
          actions={props.actions}
        />
      </Box>
      <Box sx={{ display: "flex", gap: 17 }}>
        <ResourceList resources={filteredActions} />
        <Box sx={{ px: 4, py: 2.5, minWidth: 298, boxSizing: "border-box" }}>
          <ActivityByResource resources={filteredActions} />
        </Box>
      </Box>
    </Box>
  );
};

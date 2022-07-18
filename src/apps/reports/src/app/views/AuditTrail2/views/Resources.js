import { useMemo } from "react";
import { Box } from "@mui/material";
import { useLocation } from "react-router-dom";
import moment from "moment";
import { instanceApi } from "../../../../../../../shell/services/instance";
import { ResourceListFilters } from "../components/ResourceListFilters";
import { ResourceList } from "../components/ResourceList";
import { ActivityByResource } from "../components/ActivityByResource";

export const Resources = () => {
  const location = useLocation();
  const params = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const { data: resources, isLoading } = instanceApi.useGetAuditsQuery({
    ...(params.get("from") && {
      start_date: moment(params.get("from")).format("L"),
    }),
    ...(params.get("to") && { end_date: moment(params.get("to")).format("L") }),
  });

  let filteredResources = resources ? [...resources] : [];

  for (const [key, value] of params.entries()) {
    if (key === "from" || key === "to") {
    } else if (key === "sortBy") {
      filteredResources = filteredResources.sort(
        (a, b) => new Date(a[value]) - new Date(b[value])
      );
    } else {
      filteredResources = filteredResources.filter(
        (resource) => resource?.[key] === value
      );
    }
  }

  if (isLoading) return <div>loading...</div>;

  return (
    <Box
      sx={{
        px: 3,
      }}
    >
      <ResourceListFilters resources={resources} />
      <Box sx={{ display: "flex", gap: "92px" }}>
        <ResourceList resources={filteredResources} />
        <Box sx={{ p: 4, minWidth: 298, boxSizing: "border-box" }}>
          <ActivityByResource resources={filteredResources} />
        </Box>
      </Box>
    </Box>
  );
};

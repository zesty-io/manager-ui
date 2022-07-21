import React from "react";
import { Box } from "@mui/material";
import { ResourceListFilters } from "../components/ResourceListFilters";
import { ResourceList } from "../components/ResourceList";
import { ActivityByResource } from "../components/ActivityByResource";
import { useParams } from "utility/useParams";

export const Resources = (props) => {
  const [params] = useParams();

  let filteredResources = props.resources;

  for (const [key, value] of params.entries()) {
    // from, to and sortBy params are ignored for filtering
    if (key !== "from" && key !== "to" && key !== "sortBy") {
      filteredResources = filteredResources.filter(
        (resource) => resource?.[key] === value
      );
    }
  }

  return (
    <Box
      sx={{
        px: 3,
      }}
    >
      <ResourceListFilters resources={props.resources} />
      <Box sx={{ display: "flex", gap: 17 }}>
        <ResourceList resources={filteredResources} />
        <Box sx={{ px: 4, py: 2.5, minWidth: 298, boxSizing: "border-box" }}>
          <ActivityByResource resources={filteredResources} />
        </Box>
      </Box>
    </Box>
  );
};

import { useState, useMemo } from "react";
import { Box, Select, MenuItem, FormControl, FormLabel } from "@mui/material";
import { useLocation, useHistory } from "react-router-dom";
import { instanceApi } from "../../../../../../../shell/services/instance";
import { ContentResourceListItem } from "./ContentResourceListItem";
import { ModelResourceListItem } from "./ModelResourceListItem";
import { FileResourceListItem } from "./FileResourceListItem";
import { SettingsResourceListItem } from "./SettingsResourceListItem";
import { uniqBy } from "lodash";
import { ResourceListFilters } from "./ResourceListFilters";

export const ResourceList = () => {
  const { data, isLoading } = instanceApi.useGetAuditsQuery();
  const location = useLocation();
  const params = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const uniqueResources = uniqBy(
    data?.map((resource) => {
      // Format data set to treat any model field change as a model change
      const clonedResource = { ...resource };
      if (resource.affectedZUID.startsWith("12")) {
        clonedResource.affectedZUID = resource.meta.uri.split("/")[4];
      }
      return clonedResource;
    }),
    "affectedZUID"
  );

  let filteredResources = [...uniqueResources];
  for (const [key, value] of params.entries()) {
    filteredResources = filteredResources.filter(
      (resource) => resource?.[key] === value
    );
  }

  return (
    <Box
      sx={{
        px: 3,
        display: "flex",
        flexDirection: "column",
        height: "calc(100% - 129px)",
      }}
    >
      <ResourceListFilters />
      <Box sx={{ overflowY: "scroll" }}>
        {filteredResources?.map((resource) => {
          if (resource.affectedZUID.startsWith("7")) {
            return (
              <ContentResourceListItem
                key={resource.ZUID}
                affectedZUID={resource.affectedZUID}
                updatedAt={resource.updatedAt}
              />
            );
          } else if (resource.affectedZUID.startsWith("6")) {
            return (
              <ModelResourceListItem
                key={resource.ZUID}
                affectedZUID={resource.affectedZUID}
                updatedAt={resource.updatedAt}
              />
            );
          } else if (
            resource.affectedZUID.startsWith("10") ||
            resource.affectedZUID.startsWith("11")
          ) {
            return (
              <FileResourceListItem
                key={resource.ZUID}
                affectedZUID={resource.affectedZUID}
                updatedAt={resource.updatedAt}
              />
            );
          } else {
            return (
              <SettingsResourceListItem
                key={resource.ZUID}
                affectedZUID={resource.affectedZUID}
                updatedAt={resource.updatedAt}
                message={resource.meta.message}
              />
            );
          }
        })}
      </Box>
    </Box>
  );
};

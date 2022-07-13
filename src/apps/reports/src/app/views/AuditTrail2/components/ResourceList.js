import React from "react";
import { Box } from "@mui/material";
import { uniqBy } from "lodash";
import { ContentResourceListItem } from "./ContentResourceListItem";
import { ModelResourceListItem } from "./ModelResourceListItem";
import { FileResourceListItem } from "./FileResourceListItem";
import { SettingsResourceListItem } from "./SettingsResourceListItem";

export const ResourceList = (props) => {
  const uniqueResources = uniqBy(
    props.resources?.map((resource) => {
      // Format data set to treat any model field change as a model change
      // TODO: move to transform response??
      const clonedResource = { ...resource };
      if (resource.affectedZUID.startsWith("12")) {
        clonedResource.affectedZUID = resource.meta.uri.split("/")[4];
      }
      return clonedResource;
    }),
    "affectedZUID"
  );

  return (
    <Box sx={{ overflowY: "scroll", flex: 1, height: "calc(100vh - 282px)" }}>
      {uniqueResources?.map((resource) => {
        if (resource.resourceType === "content") {
          return (
            <ContentResourceListItem
              key={resource.ZUID}
              affectedZUID={resource.affectedZUID}
              updatedAt={resource.updatedAt}
            />
          );
        } else if (resource.resourceType === "schema") {
          return (
            <ModelResourceListItem
              key={resource.ZUID}
              affectedZUID={resource.affectedZUID}
              updatedAt={resource.updatedAt}
            />
          );
        } else if (resource.resourceType === "code") {
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
  );
};

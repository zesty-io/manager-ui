import React from "react";
import { Box } from "@mui/material";
import { uniqBy } from "lodash";
import { FixedSizeList as List } from "react-window";
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

  const Row = ({ index, data, style }) => {
    const resource = data[index];
    if (resource.resourceType === "content") {
      return (
        <div style={style}>
          <ContentResourceListItem
            key={resource.ZUID}
            affectedZUID={resource.affectedZUID}
            updatedAt={resource.updatedAt}
          />
        </div>
      );
    } else if (resource.resourceType === "schema") {
      return (
        <div style={style}>
          <ModelResourceListItem
            key={resource.ZUID}
            affectedZUID={resource.affectedZUID}
            updatedAt={resource.updatedAt}
          />
        </div>
      );
    } else if (resource.resourceType === "code") {
      return (
        <div style={style}>
          <FileResourceListItem
            key={resource.ZUID}
            affectedZUID={resource.affectedZUID}
            updatedAt={resource.updatedAt}
          />
        </div>
      );
    } else {
      return (
        <div style={style}>
          <SettingsResourceListItem
            key={resource.ZUID}
            affectedZUID={resource.affectedZUID}
            updatedAt={resource.updatedAt}
            message={resource.meta.message}
          />
        </div>
      );
    }
  };

  return (
    <List
      // TODO: Listen to height changes and adjust
      height={window.innerHeight - 282}
      itemCount={uniqueResources.length}
      itemSize={94}
      width={"100%"}
      itemData={uniqueResources}
    >
      {Row}
    </List>
  );
};

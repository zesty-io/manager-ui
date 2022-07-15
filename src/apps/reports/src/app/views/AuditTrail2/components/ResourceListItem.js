import React from "react";
import { ContentResourceListItem } from "./ContentResourceListItem";
import { FileResourceListItem } from "./FileResourceListItem";
import { ModelResourceListItem } from "./ModelResourceListItem";
import { SettingsResourceListItem } from "./SettingsResourceListItem";

export const ResourceListItem = (props) => {
  if (props.resource.resourceType === "content") {
    return (
      <ContentResourceListItem
        key={props.resource.ZUID}
        affectedZUID={props.resource.affectedZUID}
        updatedAt={props.resource.updatedAt}
        size={props.size}
        divider={props.divider}
      />
    );
  } else if (props.resource.resourceType === "schema") {
    return (
      <ModelResourceListItem
        key={props.resource.ZUID}
        affectedZUID={props.resource.affectedZUID}
        updatedAt={props.resource.updatedAt}
        size={props.size}
        divider={props.divider}
      />
    );
  } else if (props.resource.resourceType === "code") {
    return (
      <FileResourceListItem
        key={props.resource.ZUID}
        affectedZUID={props.resource.affectedZUID}
        updatedAt={props.resource.updatedAt}
        size={props.size}
        divider={props.divider}
      />
    );
  } else {
    return (
      <SettingsResourceListItem
        key={props.resource.ZUID}
        affectedZUID={props.resource.affectedZUID}
        updatedAt={props.resource.updatedAt}
        message={props.resource.meta.message}
        size={props.size}
        divider={props.divider}
      />
    );
  }
};

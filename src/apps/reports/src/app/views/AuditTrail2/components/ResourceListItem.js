import React from "react";
import { ContentResourceListItem } from "./ContentResourceListItem";
import { FileResourceListItem } from "./FileResourceListItem";
import { ModelResourceListItem } from "./ModelResourceListItem";
import { SettingsResourceListItem } from "./SettingsResourceListItem";

export const ResourceListItem = (props) => {
  switch (props.resource.resourceType) {
    case "content":
      return (
        <ContentResourceListItem
          key={props.resource.ZUID}
          affectedZUID={props.resource.affectedZUID}
          updatedAt={props.resource.updatedAt}
          size={props.size}
          divider={props.divider}
          clickable={props.clickable}
        />
      );
    case "schema":
      return (
        <ModelResourceListItem
          key={props.resource.ZUID}
          affectedZUID={props.resource.affectedZUID}
          updatedAt={props.resource.updatedAt}
          size={props.size}
          divider={props.divider}
          clickable={props.clickable}
        />
      );
    case "code":
      return (
        <FileResourceListItem
          key={props.resource.ZUID}
          affectedZUID={props.resource.affectedZUID}
          updatedAt={props.resource.updatedAt}
          size={props.size}
          divider={props.divider}
          clickable={props.clickable}
        />
      );
    default:
      return (
        <SettingsResourceListItem
          key={props.resource.ZUID}
          affectedZUID={props.resource.affectedZUID}
          updatedAt={props.resource.updatedAt}
          message={props.resource?.meta?.message}
          size={props.size}
          divider={props.divider}
          clickable={props.clickable}
        />
      );
  }
};

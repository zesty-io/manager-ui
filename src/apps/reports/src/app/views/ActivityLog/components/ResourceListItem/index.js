import { ContentResourceListItem } from "./ContentResourceListItem";
import { FileResourceListItem } from "./FileResourceListItem";
import { ModelResourceListItem } from "./ModelResourceListItem";
import { SettingsResourceListItem } from "./SettingsResourceListItem";

export const ResourceListItem = (props) => {
  switch (props.resource.resourceType) {
    case "content":
      return (
        <ContentResourceListItem
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

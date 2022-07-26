import { ContentActionTimelineItem } from "./ContentActionTimelineItem";
import { FileActionTimelineItem } from "./FileActionTimelineItem";
import { ModelActionTimelineItem } from "./ModelActionTimelineItem";
import { SettingsActionTimelineItem } from "./SettingsActionTimelineItem";

export const ActionTimelineItem = (props) => {
  switch (props.action.resourceType) {
    case "content":
      return (
        <ContentActionTimelineItem
          action={props.action}
          renderConnector={props.renderConnector}
        />
      );
    case "schema":
      return (
        <ModelActionTimelineItem
          action={props.action}
          renderConnector={props.renderConnector}
        />
      );
    case "code":
      return (
        <FileActionTimelineItem
          action={props.action}
          renderConnector={props.renderConnector}
        />
      );
    default:
      return (
        <SettingsActionTimelineItem
          action={props.action}
          renderConnector={props.renderConnector}
        />
      );
  }
};

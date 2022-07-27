import { useMemo } from "react";
import { useSelector } from "react-redux";
import { TimelineItem } from "./TimelineItem";

export const SettingsActionTimelineItem = (props) => {
  const instanceSettings = useSelector((state) => state.settings.instance);

  const itemName = useMemo(() => {
    switch (props.action?.affectedZUID?.split("-")?.[0]) {
      case "29":
        return (
          instanceSettings?.find(
            (instanceSetting) =>
              instanceSetting.ZUID === props.action?.affectedZUID
          )?.keyFriendly || props.action?.message
        );
      case "21":
        return "Head Tag";
      default:
        // Remove verb from message to avoid duplication
        return props.action?.meta?.message.split(" ").slice(1);
    }
  }, [props.action?.affectedZUID, instanceSettings, props.action?.message]);

  return (
    <TimelineItem
      action={props.action}
      itemName={itemName}
      itemSubtext="Settings"
      renderConnector={props.renderConnector}
    />
  );
};

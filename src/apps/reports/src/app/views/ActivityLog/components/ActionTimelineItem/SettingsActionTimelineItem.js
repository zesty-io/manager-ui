import { useMemo } from "react";
import { useSelector } from "react-redux";
import { TimelineItem } from "./TimelineItem";

export const SettingsActionTimelineItem = (props) => {
  const settingsData = useSelector((state) =>
    state.settings.instance.find(
      (instanceSetting) => instanceSetting.ZUID === props.affectedZUID
    )
  );

  const itemName = useMemo(() => {
    switch (props.action?.affectedZUID?.split("-")?.[0]) {
      case "29":
        return (
          settingsData?.keyFriendly ||
          props.action?.meta?.message.split(" ").slice(1).join(" ")
        );
      case "21":
        return "Head Tag";
      default:
        return props.action?.meta?.message.split(" ").slice(1).join(" ");
    }
  }, [props.action, settingsData]);

  return (
    <TimelineItem
      action={props.action}
      itemName={itemName}
      itemSubtext="Settings"
      renderConnector={props.renderConnector}
    />
  );
};

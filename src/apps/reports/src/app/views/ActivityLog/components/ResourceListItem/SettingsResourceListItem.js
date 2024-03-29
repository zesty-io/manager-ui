import { useMemo } from "react";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import { useSelector } from "react-redux";
import { ListItem } from "./ListItem";

export const SettingsResourceListItem = (props) => {
  const settingsData = useSelector((state) =>
    state.settings.instance.find(
      (instanceSetting) => instanceSetting.ZUID === props.affectedZUID
    )
  );

  const primaryText = useMemo(() => {
    switch (props.affectedZUID?.split("-")?.[0]) {
      case "29":
        return settingsData?.keyFriendly || props.message;
      case "21":
        return "Head Tag";
      default:
        return props.message;
    }
  }, [props.affectedZUID, settingsData, props.message]);

  return (
    <ListItem
      divider={props.divider}
      size={props.size}
      clickable={props.clickable}
      affectedZUID={props.affectedZUID}
      icon={faCog}
      primary={primaryText}
      secondary={`Last action @ ${
        moment(props.updatedAt).isSame(new Date(), "year")
          ? moment(props.updatedAt).format("MMM D, h:mm A")
          : moment(props.updatedAt).format("ll, h:mm A")
      } • Settings`}
    />
  );
};

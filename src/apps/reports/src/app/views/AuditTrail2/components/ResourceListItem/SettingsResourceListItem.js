import { useMemo } from "react";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import { useSelector } from "react-redux";
import { ListItem } from "./ListItem";

export const SettingsResourceListItem = (props) => {
  const instanceSettings = useSelector((state) => state.settings.instance);

  const primaryText = useMemo(() => {
    switch (props.affectedZUID?.split("-")?.[0]) {
      case "29":
        return (
          instanceSettings?.find(
            (instanceSetting) => instanceSetting.ZUID === props.affectedZUID
          )?.keyFriendly || props.message
        );
      case "21":
        return "Head Tag";
      default:
        return props.message;
    }
  }, [props.affectedZUID, instanceSettings, props.message]);

  return (
    <ListItem
      divider={props.divider}
      size={props.size}
      clickable={props.clickable}
      affectedZUID={props.affectedZUID}
      icon={faCog}
      primary={primaryText}
      secondary={`Last action @ ${moment(props.updatedAt).format(
        "hh:mm A"
      )} • Settings`}
    />
  );
};

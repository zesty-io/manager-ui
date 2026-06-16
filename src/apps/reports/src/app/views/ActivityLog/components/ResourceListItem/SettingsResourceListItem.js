import { useMemo } from "react";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import { ListItem } from "./ListItem";
import { useGetWorkflowStatusLabelsQuery } from "../../../../../../../../shell/services/instance";
import { formatLocalized } from "shell/i18n/dates";
import { isValid, isSameYear } from "date-fns";

export const SettingsResourceListItem = (props) => {
  const { data: workflowStatusLabels } = useGetWorkflowStatusLabelsQuery({
    showDeleted: true,
  });
  const settingsData = useSelector((state) =>
    state.settings.instance.find(
      (instanceSetting) => instanceSetting.ZUID === props.affectedZUID
    )
  );

  const workflowStatusData = useMemo(() => {
    if (!workflowStatusLabels || !props.affectedZUID?.startsWith("36"))
      return null;

    return workflowStatusLabels.find(
      (label) => label.ZUID === props.affectedZUID
    );
  }, [workflowStatusLabels, props.affectedZUID]);

  const primaryText = useMemo(() => {
    switch (props.affectedZUID?.split("-")?.[0]) {
      case "29":
        return settingsData?.keyFriendly || props.message;
      case "21":
        return "Head Tag";
      case "36":
        if (workflowStatusData?.name) {
          return props.message?.replace(
            /`([^`]+)`/g,
            `${workflowStatusData?.name}`
          );
        }
        return props.message;
      default:
        return props.message;
    }
  }, [props.affectedZUID, settingsData, props.message]);

  const d = new Date(props.updatedAt);
  const lastAction =
    isValid(d) && isSameYear(d, new Date())
      ? formatLocalized(d, "MMM d, h:mm a")
      : isValid(d)
      ? formatLocalized(d, "MMM d, yyyy, h:mm a")
      : "";

  const secondary = `Last action @ ${lastAction} • Settings`;

  return (
    <ListItem
      divider={props.divider}
      size={props.size}
      clickable={props.clickable}
      affectedZUID={props.affectedZUID}
      icon={faCog}
      primary={primaryText}
      secondary={secondary}
    />
  );
};

import { faCode } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import { formatLocalized } from "shell/i18n/dates";
import { isValid, isSameYear } from "date-fns";
import { ListItem } from "./ListItem";

const fileTypeName = {
  templateset: "Single Page Model",
  pageset: "Multi Page Model",
  dataset: "Headless Data Model",
};

export const FileResourceListItem = (props) => {
  const fileData = useSelector((state) =>
    Object.values(state.files).find((item) => item.ZUID === props.affectedZUID)
  );

  const d = new Date(props.updatedAt);
  const lastAction = isValid(d)
    ? isSameYear(d, new Date())
      ? formatLocalized(d, "MMM d, h:mm a")
      : formatLocalized(d, "MMM d, yyyy, h:mm a")
    : "";

  const secondary = `Last action @ ${lastAction}${
    fileData ? ` • ${fileTypeName?.[fileData?.type] || fileData?.type}` : ""
  }`;

  return (
    <ListItem
      divider={props.divider}
      size={props.size}
      clickable={props.clickable}
      affectedZUID={props.affectedZUID}
      icon={faCode}
      primary={
        !fileData ? `${props.affectedZUID} (Deleted)` : fileData?.fileName
      }
      secondary={secondary}
    />
  );
};

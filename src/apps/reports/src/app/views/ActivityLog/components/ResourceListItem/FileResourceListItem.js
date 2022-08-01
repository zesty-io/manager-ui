import { faCode } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import moment from "moment";
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
      secondary={`Last action @ ${
        moment(props.updatedAt).isSame(new Date(), "year")
          ? moment(props.updatedAt).format("MMM D, h:mm A")
          : moment(props.updatedAt).format("ll, h:mm A")
      }${
        fileData ? ` • ${fileTypeName?.[fileData?.type] || fileData?.type}` : ""
      }`}
    />
  );
};

import { useTranslation } from "react-i18next";
import { faCode } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import { formatLocalized } from "shell/i18n/dates";
import { isValid, isSameYear } from "date-fns";
import { ListItem } from "./ListItem";

const getFileTypeName = (t) => ({
  templateset: t("reports.fileTypeTemplateset"),
  pageset: t("reports.fileTypePageset"),
  dataset: t("reports.fileTypeDataset"),
});

export const FileResourceListItem = (props) => {
  const { t } = useTranslation();
  const fileData = useSelector((state) =>
    Object.values(state.files).find((item) => item.ZUID === props.affectedZUID)
  );

  const d = new Date(props.updatedAt);
  const lastAction = isValid(d)
    ? isSameYear(d, new Date())
      ? formatLocalized(d, "MMM d, h:mm a")
      : formatLocalized(d, "MMM d, yyyy, h:mm a")
    : "";

  const fileTypeName = getFileTypeName(t);

  const secondary =
    t("reports.lastActionAt", { time: lastAction }) +
    (fileData ? ` • ${fileTypeName?.[fileData?.type] || fileData?.type}` : "");

  return (
    <ListItem
      divider={props.divider}
      size={props.size}
      clickable={props.clickable}
      affectedZUID={props.affectedZUID}
      icon={faCode}
      primary={
        !fileData
          ? t("reports.deletedZuid", { zuid: props.affectedZUID })
          : fileData?.fileName
      }
      secondary={secondary}
    />
  );
};

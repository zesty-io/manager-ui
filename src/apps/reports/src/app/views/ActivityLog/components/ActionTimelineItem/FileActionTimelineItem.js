import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { TimelineItem } from "./TimelineItem";

export const FileActionTimelineItem = (props) => {
  const { t } = useTranslation();
  const fileData = useSelector((state) =>
    Object.values(state.files).find(
      (item) => item.ZUID === props.action.affectedZUID
    )
  );

  return (
    <TimelineItem
      action={props.action}
      itemName={
        !fileData
          ? t("reports.deletedZuid", { zuid: props.action.affectedZUID })
          : fileData?.fileName
      }
      itemSubtext={t("common.code")}
      renderConnector={props.renderConnector}
    />
  );
};

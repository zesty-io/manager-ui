import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { formatLocalized } from "shell/i18n/dates";
import { isValid, isSameYear } from "date-fns";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { useSelector, useDispatch } from "react-redux";
import { searchItems } from "shell/store/content";
import { fetchModel } from "shell/store/models";
import { ListItem } from "./ListItem";
import { useGetLangsQuery } from "../../../../../../../../shell/services/instance";

const modelTypeNameKeys = {
  templateset: "reports.modelTypeSinglePageItem",
  pageset: "reports.modelTypeMultiPageItem",
  dataset: "reports.modelTypeHeadlessDataItem",
  block: "reports.modelTypeBlockVariant",
};

export const ContentResourceListItem = (props) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { data: langs } = useGetLangsQuery({ type: "all" });
  const [contentError, setContentError] = useState(false);
  const [modelError, setModelError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const contentData = useSelector((state) =>
    Object.values(state.content).find(
      (item) => item.meta.ZUID === props.affectedZUID
    )
  );

  const modelData = useSelector((state) =>
    Object.values(state.models).find(
      (item) => item.ZUID === contentData?.meta?.contentModelZUID
    )
  );

  useEffect(() => {
    if (!contentData && !contentError) {
      setIsLoading(true);
      dispatch(searchItems(props.affectedZUID))
        .then((res) => !res?.data?.length && setContentError(true))
        .finally(() => setIsLoading(false));
    }
  }, [contentData, contentError]);

  useEffect(() => {
    if (!modelData && contentData && !modelError) {
      setIsLoading(true);
      dispatch(fetchModel(contentData.meta.contentModelZUID))
        .catch(() => setModelError(true))
        .finally(() => setIsLoading(false));
    }
  }, [contentData, modelData, modelError]);

  const primaryText = useMemo(() => {
    if (contentError) {
      return t("reports.deletedZUID", { zuid: props.affectedZUID });
    } else if (contentData?.web?.metaTitle) {
      // There's no need to delineate the language when there's only one language
      if (langs?.length === 1) {
        return contentData?.web?.metaTitle;
      }

      const lang = langs?.find((lang) => lang.ID === contentData?.meta?.langID);

      return lang?.code
        ? `(${lang.code}) ${contentData?.web?.metaTitle}`
        : contentData?.web?.metaTitle;
    } else {
      return t("reports.missingMetaTitleZUID", { zuid: props.affectedZUID });
    }
  }, [contentData, langs, contentError, props.affectedZUID, t]);

  const secondaryText = useMemo(() => {
    const d = new Date(props.updatedAt);
    const lastAction = isValid(d)
      ? isSameYear(d, new Date())
        ? formatLocalized(d, "MMM d, h:mm a")
        : formatLocalized(d, "MMM d, yyyy, h:mm a")
      : "—";
    const chips = [t("reports.lastActionAt", { time: lastAction })];
    if (modelData) {
      chips.push(t(modelTypeNameKeys[modelData?.type]));
    }
    if (contentData?.web?.metaTitle !== modelData?.label) {
      chips.push(modelData?.label);
    }
    return chips.join(" • ");
  }, [contentData, modelData, t]);

  return (
    <ListItem
      divider={props.divider}
      size={props.size}
      clickable={props.clickable}
      affectedZUID={props.affectedZUID}
      icon={faEdit}
      primary={primaryText}
      secondary={secondaryText}
      showSkeletons={isLoading}
      isBlockItem={modelData?.type === "block"}
    />
  );
};

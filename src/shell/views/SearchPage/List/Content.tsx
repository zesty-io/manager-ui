import { FC, useMemo } from "react";
import { Create } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { isValid } from "date-fns";
import { useTranslation } from "react-i18next";

import { ContentItem } from "../../../services/types";
import {
  useGetAuditsQuery,
  useGetContentModelQuery,
  useGetContentItemQuery,
} from "../../../services/instance";
import { formatDistanceToNowLocalized } from "../../../i18n/dates";
import { SearchListItem } from "./SearchListItem";

interface Content {
  data: ContentItem;
  loading?: boolean;
  style: any;
}
export const Content: FC<Content> = ({
  data,
  style,
  loading: parentIsLoading = false,
}) => {
  const { t } = useTranslation();
  const affectedZUID = data?.meta?.ZUID;
  const { data: auditData, isLoading: auditLoading } = useGetAuditsQuery(
    { affectedZUID, limit: 1, dir: "desc", order: "created" },
    { skip: !affectedZUID }
  );
  const { data: contentData, isLoading: contentLoading } =
    useGetContentItemQuery(affectedZUID, {
      skip: !affectedZUID,
    });
  const { data: modelData, isLoading: modelLoading } = useGetContentModelQuery(
    contentData?.meta.contentModelZUID,
    { skip: !contentData?.meta.contentModelZUID }
  );

  // For logging / debugging purposes
  const auditRes = useGetAuditsQuery(
    { affectedZUID, limit: 1, dir: "desc", order: "created" },
    { skip: !affectedZUID }
  );
  const contentRes = useGetContentItemQuery(auditData?.[0]?.affectedZUID, {
    skip: !auditData?.[0]?.affectedZUID,
  });
  const modelRes = useGetContentModelQuery(contentData?.meta.contentModelZUID, {
    skip: !contentData?.meta.contentModelZUID,
  });

  // Title
  const languages = useSelector((state: any) => state.languages);

  const title = useMemo(() => {
    const langCode = languages.find(
      (lang: any) => lang.ID === data?.meta?.langID
    )?.code;
    const langDisplay = langCode ? `(${langCode}) ` : "";
    const hasSiblings =
      contentData &&
      contentData.siblings &&
      Object.keys(contentData.siblings).length > 0;

    return `${hasSiblings && langDisplay} ${
      data?.web?.metaTitle || t("shell.itemMissingMetaTitle")
    }`;
  }, [languages, contentData, data, t]);

  // Chips
  const titleChip =
    modelData?.metaTitle ||
    modelData?.label ||
    contentData?.meta.contentModelZUID;
  const appChip = t("common.content");

  const rel = (dt?: string) => {
    if (!dt) return "";
    const d = new Date(dt);
    return isValid(d)
      ? formatDistanceToNowLocalized(d, { addSuffix: true })
      : "";
  };

  const actionDate = auditData?.[0]?.happenedAt;
  const dateInfo = rel(actionDate);
  const firstName = auditData?.[0]?.firstName;
  const lastName = auditData?.[0]?.lastName;
  const userInfo =
    firstName || lastName ? `${firstName} ${lastName}` : t("shell.unknownUser");
  const userDateChip = auditData?.[0]
    ? `${dateInfo}${t("shell.searchPageByUser", { user: userInfo })}`
    : rel(data?.web?.createdAt);
  const chips = [titleChip, appChip, userDateChip].join(" • ");

  // Create url if meta data exists
  const url = contentData?.meta
    ? `/content/${contentData?.meta?.contentModelZUID}/${contentData?.meta?.ZUID}`
    : null;
  const loading =
    auditLoading || contentLoading || modelLoading || parentIsLoading;

  return (
    <SearchListItem
      title={title}
      url={url}
      chips={chips}
      icon={Create}
      style={style}
      loading={loading}
      path={contentData?.web?.path}
    />
  );
};

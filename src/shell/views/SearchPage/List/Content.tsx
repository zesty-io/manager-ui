import { FC, useMemo } from "react";
import { Create } from "@mui/icons-material";
import { useSelector } from "react-redux";
import moment from "moment-timezone";

import { ContentItem } from "../../../services/types";
import {
  useGetAuditsQuery,
  useGetContentModelQuery,
  useGetContentItemQuery,
} from "../../../services/instance";
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
      data?.web?.metaTitle || "Item missing meta title"
    }`;
  }, [languages, contentData, data]);

  // Chips
  const titleChip =
    modelData?.metaTitle ||
    modelData?.label ||
    contentData?.meta.contentModelZUID;
  const appChip = "Content";
  const actionDate = auditData?.[0]?.happenedAt;
  const dateInfo = moment(actionDate).fromNow();
  const firstName = auditData?.[0]?.firstName;
  const lastName = auditData?.[0]?.lastName;
  const userInfo =
    firstName || lastName ? `${firstName} ${lastName}` : "Unknown User";
  const userDateChip = auditData?.[0]
    ? `${dateInfo} by ${userInfo}`
    : "No actions found";
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
    />
  );
};

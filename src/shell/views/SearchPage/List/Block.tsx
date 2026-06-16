import { FC, useMemo } from "react";
import { Block as BlockIcon } from "@zesty-io/material";
import { SvgIconComponent } from "@mui/icons-material";
import { isValid } from "date-fns";
import { useTranslation } from "react-i18next";

import { ContentModel } from "../../../services/types";
import { formatDistanceToNowLocalized } from "../../../i18n/dates";
import { SearchListItem } from "./SearchListItem";

export type BlockModel = Partial<ContentModel> & {
  ZUID: string;
  label?: string;
  contentModelZUID?: string;
  contentModelLabel?: string;
  createdByUserZUID?: string;
  createdByUserName?: string;
  createdAt?: string;
  updatedAt?: string;
  lang?: string;
  langID?: number;
  title?: string;
};

type Block = {
  data: BlockModel;
  loading?: boolean;
  style: any;
};

export const Block: FC<Block> = ({
  data,
  style,
  loading: parentIsLoading = false,
}) => {
  const { t } = useTranslation();
  const isVariant = data?.type === "block" && !!data?.contentModelZUID;
  const createdRelative = useMemo(() => {
    if (!data?.createdAt) return "";
    const d = new Date(data.createdAt);
    return isValid(d)
      ? formatDistanceToNowLocalized(d, { addSuffix: true })
      : "";
  }, [data?.createdAt]);

  const chips = useMemo(() => {
    const preFix =
      !!isVariant && !!data?.contentModelLabel
        ? `${data?.contentModelLabel} • `
        : "";

    const createdText = t("shell.searchPageCreated", {
      date: createdRelative,
    });
    const userName = data?.createdByUserName
      ? t("shell.searchPageByUser", { user: data.createdByUserName })
      : "";
    return `${preFix}${t("shell.block")} • ${createdText}${userName}`;
  }, [createdRelative, data, isVariant, t]);

  const titlePrefix = !!data?.lang ? `(${data?.lang}) ` : "";
  const urlPath = isVariant
    ? `${data?.contentModelZUID}/${data?.ZUID}`
    : data?.ZUID;

  const loading = parentIsLoading;

  return (
    <SearchListItem
      title={`${titlePrefix}${data?.label}`}
      url={`/blocks/${urlPath}`}
      chips={chips}
      icon={BlockIcon as SvgIconComponent}
      style={style}
      loading={loading}
    />
  );
};

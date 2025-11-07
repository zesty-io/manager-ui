import { FC } from "react";
import { Block as BlockIcon } from "@zesty-io/material";
import { SvgIconComponent } from "@mui/icons-material";
import { isValid, formatDistanceToNow } from "date-fns";

import { ContentModel } from "../../../services/types";
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
  langID: number | null;
  title: string;
  chipText: string;
  url: string | null;
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
  const dateTimeRaw = new Date(data?.createdAt);
  const dateTime = isValid(dateTimeRaw)
    ? formatDistanceToNow(dateTimeRaw, { addSuffix: true })
    : "";
  const chips = `${data?.chipText} • ${dateTime} by ${
    data?.createdByUserName || "unknown"
  }`;

  const loading = parentIsLoading;

  return (
    <SearchListItem
      title={data?.title}
      url={data?.url}
      chips={chips}
      icon={BlockIcon as SvgIconComponent}
      style={style}
      loading={loading}
    />
  );
};

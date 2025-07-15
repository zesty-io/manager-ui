import { FC, useMemo } from "react";
import { Block as BlockIcon } from "@zesty-io/material";
import { SvgIconComponent } from "@mui/icons-material";
import moment from "moment-timezone";

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
  const isVariant = data?.type === "block" && !!data?.contentModelZUID;

  const chips = useMemo(() => {
    const preFix =
      !!isVariant && !!data?.contentModelLabel
        ? `${data?.contentModelLabel} • `
        : "";

    const userName = !data?.createdByUserName
      ? ""
      : ` by ${data?.createdByUserName}`;
    return `${preFix}Block • created ${moment(
      data?.createdAt
    )?.fromNow()}${userName}`;
  }, [data]);

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

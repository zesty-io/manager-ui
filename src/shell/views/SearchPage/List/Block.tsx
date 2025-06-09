import { FC, useMemo } from "react";
import { Block as BlockIcon } from "@zesty-io/material";
import { SvgIconComponent } from "@mui/icons-material";
import moment from "moment-timezone";

import { ContentModel } from "../../../services/types";
import { SearchListItem } from "./SearchListItem";
import { useGetAuditsQuery } from "../../../services/instance";

export type BlockModel = Partial<ContentModel> & {
  ZUID: string;
  label?: string;
  contentModelZUID?: string;
  contentModelLabel?: string;
  masterZUID?: string;
  parentZUID?: string;
  createdByUserZUID?: string;
  createdByUserName?: string;
  createdAt?: string;
  updatedAt?: string;
  lang?: string;
  langID?: number;
  isVariant?: boolean;
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
  const { data: modelAudit, isLoading: loadingModelAudit } = useGetAuditsQuery(
    { affectedZUID: data?.ZUID, limit: 1, dir: "desc", order: "created" },
    { skip: !data?.ZUID }
  );

  const chips = useMemo(() => {
    const preFix =
      !!data?.isVariant && !!data?.contentModelLabel
        ? `${data?.contentModelLabel} • `
        : "";

    const userName = !data?.createdByUserName
      ? ""
      : ` by ${data?.createdByUserName}`;
    return `${preFix}Block • created ${moment(
      data?.createdAt
    )?.fromNow()}${userName}`;
  }, [modelAudit]);

  const titlePrefix = !!data?.lang ? `(${data?.lang}) ` : "";
  const urlPath = data?.isVariant
    ? `${data?.contentModelZUID}/${data?.ZUID}`
    : data?.ZUID;

  const loading = loadingModelAudit || parentIsLoading;

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

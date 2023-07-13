import { FC, useMemo } from "react";
import { Database } from "@zesty-io/material";
import { SvgIconComponent } from "@mui/icons-material";
import moment from "moment-timezone";

import { ContentModel } from "../../../services/types";
import { SearchListItem } from "./SearchListItem";
import { useGetAuditsQuery } from "../../../services/instance";

interface Model {
  data: ContentModel;
  loading?: boolean;
  style: any;
}
export const Model: FC<Model> = ({
  data,
  style,
  loading: parentIsLoading = false,
}) => {
  const { data: modelAudit, isLoading: loadingModelAudit } = useGetAuditsQuery(
    { affectedZUID: data.ZUID, limit: 1, dir: "desc", order: "created" },
    { skip: !data.ZUID }
  );

  const chips = useMemo(() => {
    if (modelAudit?.length) {
      const audit = modelAudit[0];
      return `Schema • ${moment(audit?.happenedAt)?.fromNow()} by ${
        audit?.firstName
      } ${audit?.lastName}`;
    }

    return `Schema • ${moment(data?.createdAt)?.fromNow()}`;
  }, [modelAudit]);

  const loading = loadingModelAudit || parentIsLoading;

  return (
    <SearchListItem
      title={data.label}
      url={`/schema/${data.ZUID}`}
      chips={chips}
      icon={Database as SvgIconComponent}
      style={style}
      loading={loading}
    />
  );
};

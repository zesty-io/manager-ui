import { FC, useMemo } from "react";
import { Database } from "@zesty-io/material";
import { SvgIconComponent } from "@mui/icons-material";
import { isValid } from "date-fns";
import { useTranslation } from "react-i18next";

import { ContentModel } from "../../../services/types";
import { SearchListItem } from "./SearchListItem";
import { useGetAuditsQuery } from "../../../services/instance";
import { formatDistanceToNowLocalized } from "../../../i18n-dates";

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
  const { t } = useTranslation();
  const { data: modelAudit, isLoading: loadingModelAudit } = useGetAuditsQuery(
    { affectedZUID: data.ZUID, limit: 1, dir: "desc", order: "created" },
    { skip: !data.ZUID }
  );

  const chips = useMemo(() => {
    const rel = (dt?: string) => {
      if (!dt) return "";
      const d = new Date(dt); // switch to parseISO(dt) if you hit parsing issues
      return isValid(d)
        ? formatDistanceToNowLocalized(d, { addSuffix: true })
        : "";
    };

    if (modelAudit?.length) {
      const audit = modelAudit[0];
      const time = rel(audit?.happenedAt);
      const name = [audit?.firstName, audit?.lastName]
        .filter(Boolean)
        .join(" ");
      return `${t("shell.navSchema")} • ${time}${
        name ? t("shell.searchPageByUser", { user: name }) : ""
      }`;
    }

    return `${t("shell.navSchema")} • ${rel(data?.createdAt)}`;
  }, [modelAudit, data?.createdAt, t]);

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

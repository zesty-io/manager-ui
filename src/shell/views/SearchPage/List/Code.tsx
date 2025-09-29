import { FC, useMemo } from "react";
import { SvgIconComponent, CodeRounded } from "@mui/icons-material";
import { formatDistanceToNow, isValid } from "date-fns";

import { File } from "../../../hooks/useSearchCodeFilesByKeyword";
import { SearchListItem } from "./SearchListItem";
import { useGetAuditsQuery } from "../../../services/instance";

interface Code {
  data: File;
  loading?: boolean;
  style: any;
}

export const Code: FC<Code> = ({
  data,
  style,
  loading: parentIsLoading = false,
}) => {
  const { data: fileAudit, isLoading: loadingFileAudit } = useGetAuditsQuery(
    { affectedZUID: data.ZUID, limit: 1, dir: "desc", order: "created" },
    { skip: !data.ZUID }
  );

  const chips = useMemo(() => {
    const rel = (dt?: string) => {
      if (!dt) return "";
      const d = new Date(dt);
      return isValid(d) ? formatDistanceToNow(d, { addSuffix: true }) : "";
    };

    if (fileAudit?.length) {
      const audit = fileAudit[0];
      const time = rel(audit?.happenedAt);
      const name = `${audit?.firstName} ${audit?.lastName}`;
      return `Code File • ${time} by ${name}`;
    }

    return `Code File • ${rel(data?.createdAt)}`;
  }, [fileAudit, data?.createdAt]);

  const loading = loadingFileAudit || parentIsLoading;

  return (
    <SearchListItem
      title={data.fileName?.split("/").pop()}
      url={`/code/file/views/${data.ZUID}`}
      chips={chips}
      icon={CodeRounded}
      style={style}
      loading={loading}
    />
  );
};

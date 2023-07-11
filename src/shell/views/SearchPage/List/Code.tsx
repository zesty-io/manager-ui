import { FC, useMemo } from "react";
import { SvgIconComponent, CodeRounded } from "@mui/icons-material";
import moment from "moment-timezone";

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
    if (fileAudit?.length) {
      const audit = fileAudit[0];
      const time = moment(audit?.happenedAt)?.fromNow();
      const name = `${audit?.firstName} ${audit?.lastName}`;

      return `Code File • ${time} by ${name}`;
    }

    return `Code File • ${moment(data?.createdAt)?.fromNow()}`;
  }, [fileAudit]);

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

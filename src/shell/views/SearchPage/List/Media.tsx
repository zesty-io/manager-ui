import { FC, useMemo } from "react";
import { ImageRounded } from "@mui/icons-material";
import moment from "moment-timezone";

import { File } from "../../../services/types";
import { SearchListItem } from "./SearchListItem";

interface Media {
  data: File;
  loading?: boolean;
  style: any;
}
export const Media: FC<Media> = ({ data, style, loading = false }) => {
  const chips = `Media • ${moment(data.created_at)?.fromNow()}`;

  return (
    <SearchListItem
      title={data.filename}
      url={`/media?fileId=${data.id}`}
      chips={chips}
      icon={ImageRounded}
      style={style}
      loading={loading}
    />
  );
};

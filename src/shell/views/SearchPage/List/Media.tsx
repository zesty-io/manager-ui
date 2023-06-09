import { FC, useMemo } from "react";
import {
  ImageRounded,
  FolderRounded,
  SvgIconComponent,
} from "@mui/icons-material";
import moment from "moment-timezone";

import { File, Group } from "../../../services/types";
import { SearchListItem } from "./SearchListItem";

interface Media {
  data: File | Group;
  loading?: boolean;
  style: any;
  subType: "folder" | "item";
}
export const Media: FC<Media> = ({ data, style, loading = false, subType }) => {
  const config = useMemo(() => {
    let icon: SvgIconComponent;
    let url: string;
    let title: string;
    let chips: string;

    switch (subType) {
      case "item":
        const itemData = data as File;
        icon = ImageRounded;
        url = `/media?fileId=${itemData.id}`;
        title = itemData.filename;
        chips = `Media • ${moment(itemData.created_at)?.fromNow()}`;
        break;

      case "folder":
        const folderData = data as Group;
        icon = FolderRounded;
        url = `/media/folder/${folderData.id}`;
        title = folderData.name;
        chips = `Media`;
        break;

      default:
        break;
    }

    return { icon, url, title, chips };
  }, [subType, data]);

  return (
    <SearchListItem
      title={config.title}
      url={config.url}
      chips={config.chips}
      icon={config.icon}
      style={style}
      loading={loading}
    />
  );
};

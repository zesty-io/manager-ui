import { FC, useMemo } from "react";
import {
  ImageRounded,
  FolderRounded,
  SvgIconComponent,
} from "@mui/icons-material";
import { isValid } from "date-fns";
import { useTranslation } from "react-i18next";

import { File, Group } from "../../../services/types";
import { formatDistanceToNowLocalized } from "../../../i18n/dates";
import { SearchListItem } from "./SearchListItem";

interface Media {
  data: File | Group;
  loading?: boolean;
  style: any;
  subType: "folder" | "item";
}
export const Media: FC<Media> = ({ data, style, loading = false, subType }) => {
  const { t } = useTranslation();
  const config = useMemo(() => {
    let icon: SvgIconComponent;
    let url: string;
    let title: string;
    let chips: string;

    const rel = (dt?: string) => {
      if (!dt) return "";
      const d = new Date(dt); // switch to parseISO(dt) if you hit parsing issues
      return isValid(d)
        ? formatDistanceToNowLocalized(d, { addSuffix: true })
        : "";
    };

    switch (subType) {
      case "item": {
        const itemData = data as File;
        icon = ImageRounded;
        url = `/media?fileId=${itemData.id}`;
        title = itemData.filename;
        chips = `${t("shell.navMedia")} • ${rel(itemData.created_at)}`;
        break;
      }

      case "folder": {
        const folderData = data as Group;
        icon = FolderRounded;
        url = `/media/folder/${folderData.id}`;
        title = folderData.name;
        chips = t("shell.navMedia");
        break;
      }

      default:
        icon = ImageRounded;
        url = "";
        title = "";
        chips = "";
        break;
    }

    return { icon, url, title, chips };
  }, [subType, data, t]);

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

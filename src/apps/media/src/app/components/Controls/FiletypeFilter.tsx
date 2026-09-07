import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "../../../../../../shell/hooks/useParams";

import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import Typography from "@mui/material/Typography";
import ListItemIcon from "@mui/material/ListItemIcon";

import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CloseRounded from "@mui/icons-material/CloseRounded";
import AudiotrackRounded from "@mui/icons-material/AudiotrackRounded";
import PicutreasPdfRounded from "@mui/icons-material/PictureAsPdfRounded";
import DescriptionRounded from "@mui/icons-material/DescriptionRounded";
import SlideshowRounded from "@mui/icons-material/SlideshowRounded";
import BorderAllRounded from "@mui/icons-material/BorderAllRounded";
import CodeRounded from "@mui/icons-material/CodeRounded";
import FontDownloadRounded from "@mui/icons-material/FontDownloadRounded";
import FolderRounded from "@mui/icons-material/FolderRounded";
import FolderZipRounded from "@mui/icons-material/FolderZipRounded";
import CheckIcon from "@mui/icons-material/Check";

import { AppState } from "../../../../../../shell/store/types";
import { Filetype } from "../../../../../../shell/store/media-revamp";
import { ImageFilterRow } from "./ImageFilterRow";
import { VideoFilterRow } from "./VideoFilterRow";
import { FilterButton } from "../../../../../../shell/components/Filters";

// Localized label key per filetype *category* (matches the menu items). Specific
// format values (PNG, MP4, …) aren't here — they render as-is (raw value), since
// format identifiers aren't translated.
const FILETYPE_LABEL_KEYS: Partial<Record<Filetype, string>> = {
  Image: "media.filetypeFilterImages",
  Video: "media.filetypeFilterVideos",
  Audio: "media.filetypeFilterAudio",
  PDF: "media.filetypeFilterPdfs",
  Document: "media.filetypeFilterDocuments",
  Presentation: "media.filetypeFilterPresentations",
  Spreadsheet: "media.filetypeFilterSpreadsheets",
  Code: "common.code",
  Font: "media.filetypeFilterFonts",
  Folder: "media.filetypeFilterFolders",
  Archive: "media.filetypeFilterArchives",
};

export const FiletypeFilter: FC = () => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [params, setParams] = useParams();
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const activeFilter = params.get("filetype") as Filetype | null;
  const handleChange = (filetype: Filetype) => {
    setParams(filetype, "filetype");
    handleClose();
  };

  return (
    <>
      <FilterButton
        filterId="fileType"
        isFilterActive={!!activeFilter}
        buttonText={
          activeFilter
            ? FILETYPE_LABEL_KEYS[activeFilter]
              ? t(FILETYPE_LABEL_KEYS[activeFilter])
              : activeFilter
            : t("media.filetypeFilterButtonLabel")
        }
        onOpenMenu={handleClick}
        onRemoveFilter={() => handleChange(null)}
      />
      <Menu open={open} onClose={handleClose} anchorEl={anchorEl}>
        <ImageFilterRow onClose={handleClose} />
        <VideoFilterRow onClose={handleClose} />
        <MenuItem onClick={() => handleChange("Audio")}>
          <ListItemIcon>
            <AudiotrackRounded fontSize="small" />
          </ListItemIcon>
          <Typography variant="body1">
            {t("media.filetypeFilterAudio")}
          </Typography>
        </MenuItem>
        <MenuItem onClick={() => handleChange("PDF")}>
          <ListItemIcon>
            <PicutreasPdfRounded fontSize="small" />
          </ListItemIcon>
          <Typography variant="body1">
            {t("media.filetypeFilterPdfs")}
          </Typography>
        </MenuItem>
        <MenuItem onClick={() => handleChange("Document")}>
          <ListItemIcon>
            <DescriptionRounded fontSize="small" />
          </ListItemIcon>
          <Typography variant="body1">
            {t("media.filetypeFilterDocuments")}
          </Typography>
        </MenuItem>
        <MenuItem onClick={() => handleChange("Presentation")}>
          <ListItemIcon>
            <SlideshowRounded fontSize="small" />
          </ListItemIcon>
          <Typography variant="body1">
            {t("media.filetypeFilterPresentations")}
          </Typography>
        </MenuItem>
        <MenuItem onClick={() => handleChange("Spreadsheet")}>
          <ListItemIcon>
            <BorderAllRounded fontSize="small" />
          </ListItemIcon>
          <Typography variant="body1">
            {t("media.filetypeFilterSpreadsheets")}
          </Typography>
        </MenuItem>
        <MenuItem onClick={() => handleChange("Code")}>
          <ListItemIcon>
            <CodeRounded fontSize="small" />
          </ListItemIcon>
          <Typography variant="body1">{t("common.code")}</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleChange("Font")}>
          <ListItemIcon>
            <FontDownloadRounded fontSize="small" />
          </ListItemIcon>
          <Typography variant="body1">
            {t("media.filetypeFilterFonts")}
          </Typography>
        </MenuItem>
        <MenuItem onClick={() => handleChange("Folder")}>
          <ListItemIcon>
            <FolderRounded fontSize="small" />
          </ListItemIcon>
          <Typography variant="body1">
            {t("media.filetypeFilterFolders")}
          </Typography>
        </MenuItem>
        <MenuItem onClick={() => handleChange("Archive")}>
          <ListItemIcon>
            <FolderZipRounded fontSize="small" />
          </ListItemIcon>
          <Typography variant="body1">
            {t("media.filetypeFilterArchives")}
          </Typography>
        </MenuItem>
      </Menu>
    </>
  );
};

import { FC, useState, useRef } from "react";
import { CardMedia, Typography, Box } from "@mui/material";

import { fileExtension } from "../../utils/fileUtils";
import { ThumbnailFilename } from "./ThumbnailFilename";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import { useTheme } from "@mui/material/styles";

// file icons import
import wordImg from "../../../../../../../public/images/wordImg.png";
import excelImg from "../../../../../../../public/images/excelImg.png";
import pdfImg from "../../../../../../../public/images/pdfImg.png";
import pptImg from "../../../../../../../public/images/pptImg.png";
import mpImg from "../../../../../../../public/images/mpImg.png";
import csvImg from "../../../../../../../public/images/csvImg.png";
import zipImg from "../../../../../../../public/images/zipImg.png";
import numberImg from "../../../../../../../public/images/numberImg.png";
import defaultImg from "../../../../../../../public/images/defaultImg.png";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import ReportGmailerrorredIcon from "@mui/icons-material/ReportGmailerrorred";

import { File } from "../../../../../../shell/services/types";

import { ThumbnailDrag } from "./ThumbnailDrag";
import { ThumbnailHover } from "./ThumbnailHover";
import { ThumbnailSelect } from "./ThumbnailSelect";
import { ThumbnailExtensionChip } from "./ThumbnailExtensionChip";
import { ThumbnailBackground } from "./ThumbnailBackground";
import { ThumbnailImage } from "./ThumbnailImage";

interface ThumbnailProps {
  src?: string;
  isEditable?: boolean;
  showVideo?: boolean;
  file?: File;
  onFilenameChange?: (value: string) => void;
  onClick?: () => void;
}

export const Thumbnail: FC<ThumbnailProps> = ({
  src,
  isEditable = false,
  showVideo = true,
  file,
  onFilenameChange,
  onClick,
}) => {
  const ext = fileExtension(file.filename);

  const theme = useTheme();
  const imageEl = useRef<HTMLImageElement>();
  const [lazyLoading, setLazyLoading] = useState(true);
  const [imageOrientation, setImageOrientation] = useState<string>("");

  const styledCheckerBoard = {
    backgroundImage:
      ext === "png" &&
      `linear-gradient(45deg, ${theme.palette.grey[100]} 25%, transparent 25%), 
      linear-gradient(135deg, ${theme.palette.grey[100]} 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, ${theme.palette.grey[100]} 75%),
      linear-gradient(135deg, transparent 75%, ${theme.palette.grey[100]} 75%)`,
  };

  /**
   * @description Used to set vertical or horizontal image orientation
   * @note imageOrientation will be placed as a condition in the Image's parent component
   */
  const handleImageLoad = () => {
    setLazyLoading(false);
    const naturalHeight = imageEl.current.naturalHeight;
    const naturalWidth = imageEl.current.naturalWidth;
    if (naturalHeight > naturalWidth) {
      setImageOrientation("vertical");
    } else {
      setImageOrientation("horizontal");
    }
  };

  switch (ext) {
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "svg":
    case "webp":
      return (
        <ThumbnailDrag file={file} onClick={onClick}>
          <Box
            sx={{
              ...styledCheckerBoard,
              // py: imageOrientation === "horizontal" && 1,
              // px: imageOrientation === "vertical" && "auto",
              height: "160px",
              overflow: "hidden",
              backgroundColor: ext !== "png" && "grey.100",
              position: "relative",
              backgroundSize: `25px 25px`,
              backgroundPosition: `0 0, 12.5px 0, 12.5px -12.5px, 0px 12.5px`,
              "&:hover": {},
            }}
          >
            <ThumbnailHover />
            <ThumbnailSelect file={file} />
            <ThumbnailExtensionChip ext={ext} />
            <ThumbnailImage src={src} file={file} />
          </Box>
          <ThumbnailFilename
            filename={file.filename}
            onFilenameChange={onFilenameChange}
            isEditable={isEditable}
          />
        </ThumbnailDrag>
      );
    case "ots":
    case "xls":
    case "xlsx":
      return (
        <ThumbnailDrag file={file} onClick={onClick}>
          <ThumbnailBackground color="green">
            <ThumbnailHover />
            <ThumbnailSelect file={file} />
            <ThumbnailExtensionChip ext={ext} />
            <ThumbnailImage src={excelImg} file={file} document={true} />
          </ThumbnailBackground>
          <ThumbnailFilename
            filename={file.filename}
            onFilenameChange={onFilenameChange}
            isEditable={isEditable}
          />
        </ThumbnailDrag>
      );
    case "csv":
      return (
        <ThumbnailDrag file={file} onClick={onClick}>
          <ThumbnailBackground color="green">
            <ThumbnailHover />
            <ThumbnailSelect file={file} />
            <ThumbnailExtensionChip ext={ext} />
            <ThumbnailImage src={csvImg} file={file} document={true} />
          </ThumbnailBackground>
          <ThumbnailFilename
            filename={file.filename}
            onFilenameChange={onFilenameChange}
            isEditable={isEditable}
          />
        </ThumbnailDrag>
      );
    case "docx":
    case "doc":
    case "rtf":
      return (
        <ThumbnailDrag file={file} onClick={onClick}>
          <ThumbnailBackground color="blue">
            <ThumbnailHover />
            <ThumbnailSelect file={file} />
            <ThumbnailExtensionChip ext={ext} />
            <ThumbnailImage src={wordImg} file={file} document={true} />
          </ThumbnailBackground>
          <ThumbnailFilename
            filename={file.filename}
            onFilenameChange={onFilenameChange}
            isEditable={isEditable}
          />
        </ThumbnailDrag>
      );
    case "pdf":
      return (
        <ThumbnailDrag file={file} onClick={onClick}>
          <Box
            sx={{
              backgroundColor: "grey.200",
              boxSizing: "border-box",
              height: "160px",
              overflow: "hidden",
              display: "flex",
            }}
          >
            <ThumbnailHover />
            <ThumbnailSelect file={file} />
            <ThumbnailExtensionChip ext={ext} />
            <ThumbnailImage src={pdfImg} file={file} document={true} />
          </Box>
          <ThumbnailFilename
            filename={file.filename}
            onFilenameChange={onFilenameChange}
            isEditable={isEditable}
          />
        </ThumbnailDrag>
      );
    case "ppt":
    case "pptx":
    case "pptm":
      return (
        <ThumbnailDrag file={file} onClick={onClick}>
          <ThumbnailBackground color="red">
            <ThumbnailHover />
            <ThumbnailSelect file={file} />
            <ThumbnailExtensionChip ext={ext} />
            <ThumbnailImage src={pptImg} file={file} document={true} />
          </ThumbnailBackground>
          <ThumbnailFilename
            filename={file.filename}
            onFilenameChange={onFilenameChange}
            isEditable={isEditable}
          />
        </ThumbnailDrag>
      );
    case "aac":
    case "aiff":
    case "mid":
    case "mp3":
    case "wav":
      return (
        <ThumbnailDrag file={file} onClick={onClick}>
          <ThumbnailBackground color="red">
            <ThumbnailHover />
            <ThumbnailSelect file={file} />
            <ThumbnailExtensionChip ext={ext} />
            <ThumbnailImage src={mpImg} file={file} document={true} />
          </ThumbnailBackground>
          <ThumbnailFilename
            filename={file.filename}
            onFilenameChange={onFilenameChange}
            isEditable={isEditable}
          />
        </ThumbnailDrag>
      );
    case "mp4":
    case "mov":
    case "avi":
    case "wmv":
    case "mkv":
    case "webm":
    case "flv":
    case "f4v":
    case "swf":
    case "avchd":
    case "html5":
      return (
        <ThumbnailDrag file={file} onClick={onClick}>
          <ThumbnailBackground color="black">
            <ThumbnailHover />
            <ThumbnailSelect file={file} />
            <ThumbnailExtensionChip ext={ext} />
            {showVideo && (
              <CardMedia
                component="video"
                controls={false}
                src={src}
                sx={{
                  backgroundColor: "#000",
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  py: 1,
                }}
              />
            )}
            <PlayCircleIcon
              fontSize="large"
              sx={{
                top: 0,
                bottom: 0,
                right: 0,
                left: 0,
                m: "auto",
                color: "#FFF",
                position: "absolute",
                textAlign: "center",
              }}
            />
          </ThumbnailBackground>
          <ThumbnailFilename
            filename={file.filename}
            onFilenameChange={onFilenameChange}
            isEditable={isEditable}
          />
        </ThumbnailDrag>
      );
    case "iso":
    case "rar":
    case "tgz":
    case "zip":
      return (
        <ThumbnailDrag file={file} onClick={onClick}>
          <ThumbnailBackground>
            <ThumbnailHover />
            <ThumbnailSelect file={file} />
            <ThumbnailExtensionChip ext={ext} />
            <ThumbnailImage src={zipImg} file={file} document={true} />
          </ThumbnailBackground>
          <ThumbnailFilename
            filename={file.filename}
            onFilenameChange={onFilenameChange}
            isEditable={isEditable}
          />
        </ThumbnailDrag>
      );
    case "ai":
    case "bmp":
    case "eps":
    case "psd":
    case "tiff":
    case "tif":
      return (
        <ThumbnailDrag file={file} onClick={onClick}>
          <ThumbnailBackground>
            <ThumbnailHover />
            <ThumbnailSelect file={file} />
            <ThumbnailExtensionChip ext={ext} />
            <ThumbnailImage src={defaultImg} file={file} document={true} />
          </ThumbnailBackground>
          <ThumbnailFilename
            filename={file.filename}
            onFilenameChange={onFilenameChange}
            isEditable={isEditable}
          />
        </ThumbnailDrag>
      );
    case "numbers":
      return (
        <ThumbnailDrag file={file} onClick={onClick}>
          <ThumbnailBackground color="green">
            <ThumbnailHover />
            <ThumbnailSelect file={file} />
            <ThumbnailExtensionChip ext={ext} />
            <ThumbnailImage src={numberImg} file={file} document={true} />
          </ThumbnailBackground>
          <ThumbnailFilename
            filename={file.filename}
            onFilenameChange={onFilenameChange}
            isEditable={isEditable}
          />
        </ThumbnailDrag>
      );
    case "No Extension":
      return (
        <ThumbnailDrag file={file} onClick={onClick}>
          <ThumbnailBackground color="red">
            <ThumbnailHover />
            <ThumbnailSelect file={file} />
            <ThumbnailExtensionChip ext={ext} />
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
                width: "100%",
                my: "auto",
              }}
            >
              <ReportGmailerrorredIcon
                fontSize="large"
                sx={{ color: "red.600" }}
              />
            </Box>
          </ThumbnailBackground>
          <ThumbnailFilename
            filename={file.filename}
            onFilenameChange={onFilenameChange}
            isEditable={isEditable}
          />
        </ThumbnailDrag>
      );
    default:
      return (
        <ThumbnailDrag file={file} onClick={onClick}>
          <ThumbnailBackground>
            <ThumbnailHover />
            <ThumbnailSelect file={file} />
            <ThumbnailExtensionChip ext={ext} />
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
                width: "100%",
                my: "auto",
              }}
            >
              <WarningAmberRoundedIcon
                fontSize="large"
                sx={{ color: "grey.500" }}
              />
              <Typography
                variant="body2"
                sx={{ textAlign: "center", color: "grey.500" }}
              >
                File type not recognized
              </Typography>
            </Box>
          </ThumbnailBackground>
          <ThumbnailFilename
            filename={file.filename}
            onFilenameChange={onFilenameChange}
            isEditable={isEditable}
          />
        </ThumbnailDrag>
      );
  }
};

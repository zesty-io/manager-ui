import { FC, useState, useRef, DragEvent } from "react";
import { CardMedia, Typography, Card, Box } from "@mui/material";
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

import { ThumbnailHover } from "./ThumbnailHover";
import { ThumbnailSelect } from "./ThumbnailSelect";
import { ThumbnailExtensionChip } from "./ThumbnailExtensionChip";
import { ThumbnailBackground } from "./ThumbnailBackground";

interface ThumbnailProps {
  src?: string;
  filename?: string;
  isEditable?: boolean;
  showVideo?: boolean;
  id?: string;
  group_id?: string;
  bin_id?: string;
  file?: File;
  onFilenameChange?: (value: string) => void;
  onClick?: () => void;
}

export const Thumbnail: FC<ThumbnailProps> = ({
  src,
  filename,
  isEditable,
  showVideo,
  id,
  group_id,
  bin_id,
  file,
  onFilenameChange,
  onClick,
}) => {
  const ext = fileExtension(filename);

  const theme = useTheme();
  const imageEl = useRef<HTMLImageElement>();
  const [imageOrientation, setImageOrientation] = useState<string>("");

  const onDragStart = (event: DragEvent) => {
    event.dataTransfer.setData(
      "text/plain",
      JSON.stringify({ id, filename, group_id, bin_id })
    );
    event.dataTransfer.effectAllowed = "move";
  };

  const styledCard = {
    width: "100%",
    height: "100%",
    borderWidth: "1px",
    borderColor: "grey.100",
    borderStyle: "solid",
    borderRadius: "6px",
    cursor: onClick ? "pointer" : "default",
  };

  const styledDocfileThumbnail = {
    overflow: "hidden",
    width: "34.41px",
    height: "32px",
    m: "auto",
    display: "table-cell",
    verticalAlign: "bottom",
  };

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
        <Card
          sx={styledCard}
          elevation={0}
          onClick={onClick}
          draggable
          onDragStart={(evt) => onDragStart(evt)}
        >
          <Box
            sx={{
              ...styledCheckerBoard,
              py: imageOrientation === "horizontal" && 1,
              px: imageOrientation === "vertical" && "auto",
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
            <CardMedia
              component="img"
              ref={imageEl}
              onLoad={handleImageLoad}
              data-src={src}
              image={src}
              loading="lazy"
              sx={{
                objectFit: "contain",
                overflow: "hidden",
                height: "100%",
                display: "table-cell",
                verticalAlign: "bottom",
              }}
            />
          </Box>
          <ThumbnailFilename
            filename={filename}
            onFilenameChange={onFilenameChange}
            isEditable={isEditable}
          />
        </Card>
      );
    case "ots":
    case "xls":
    case "xlsx":
      return (
        <Card sx={styledCard} elevation={0} onClick={onClick}>
          <ThumbnailBackground color="green">
            <ThumbnailHover />
            <ThumbnailSelect file={file} />
            <ThumbnailExtensionChip ext={ext} />
            <CardMedia
              component="img"
              data-src={excelImg}
              image={excelImg}
              loading="lazy"
              sx={styledDocfileThumbnail}
            />
          </ThumbnailBackground>
          <ThumbnailFilename
            filename={filename}
            onFilenameChange={onFilenameChange}
            isEditable={isEditable}
          />
        </Card>
      );
    case "csv":
      return (
        <Card sx={styledCard} elevation={0} onClick={onClick}>
          <ThumbnailBackground color="green">
            <ThumbnailHover />
            <ThumbnailSelect file={file} />
            <ThumbnailExtensionChip ext={ext} />
            <CardMedia
              component="img"
              data-src={csvImg}
              image={csvImg}
              loading="lazy"
              sx={styledDocfileThumbnail}
            />
          </ThumbnailBackground>
          <ThumbnailFilename
            filename={filename}
            onFilenameChange={onFilenameChange}
            isEditable={isEditable}
          />
        </Card>
      );
    case "docx":
    case "doc":
    case "rtf":
      return (
        <Card sx={styledCard} elevation={0} onClick={onClick}>
          <ThumbnailBackground color="blue">
            <ThumbnailHover />
            <ThumbnailSelect file={file} />
            <ThumbnailExtensionChip ext={ext} />
            <CardMedia
              component="img"
              data-src={wordImg}
              image={wordImg}
              loading="lazy"
              sx={styledDocfileThumbnail}
            />
          </ThumbnailBackground>
          <ThumbnailFilename
            filename={filename}
            onFilenameChange={onFilenameChange}
            isEditable={isEditable}
          />
        </Card>
      );
    case "pdf":
      return (
        <Card sx={styledCard} elevation={0} onClick={onClick}>
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
            <CardMedia
              component="img"
              data-src={pdfImg}
              image={pdfImg}
              loading="lazy"
              sx={styledDocfileThumbnail}
            />
          </Box>
          <ThumbnailFilename
            filename={filename}
            onFilenameChange={onFilenameChange}
            isEditable={isEditable}
          />
        </Card>
      );
    case "ppt":
    case "pptx":
    case "pptm":
      return (
        <Card sx={styledCard} elevation={0} onClick={onClick}>
          <ThumbnailBackground color="red">
            <ThumbnailHover />
            <ThumbnailSelect file={file} />
            <ThumbnailExtensionChip ext={ext} />
            <CardMedia
              component="img"
              data-src={pptImg}
              image={pptImg}
              loading="lazy"
              sx={styledDocfileThumbnail}
            />
          </ThumbnailBackground>
          <ThumbnailFilename
            filename={filename}
            onFilenameChange={onFilenameChange}
            isEditable={isEditable}
          />
        </Card>
      );
    case "aac":
    case "aiff":
    case "mid":
    case "mp3":
    case "wav":
      return (
        <Card sx={styledCard} elevation={0} onClick={onClick}>
          <ThumbnailBackground color="red">
            <ThumbnailHover />
            <ThumbnailSelect file={file} />
            <ThumbnailExtensionChip ext={ext} />
            <CardMedia
              component="img"
              data-src={mpImg}
              image={mpImg}
              loading="lazy"
              sx={styledDocfileThumbnail}
            />
          </ThumbnailBackground>
          <ThumbnailFilename
            filename={filename}
            onFilenameChange={onFilenameChange}
            isEditable={isEditable}
          />
        </Card>
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
        <Card sx={styledCard} elevation={0} onClick={onClick}>
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
            filename={filename}
            onFilenameChange={onFilenameChange}
            isEditable={isEditable}
          />
        </Card>
      );
    case "iso":
    case "rar":
    case "tgz":
    case "zip":
      return (
        <Card sx={styledCard} elevation={0} onClick={onClick}>
          <ThumbnailBackground>
            <ThumbnailHover />
            <ThumbnailSelect file={file} />
            <ThumbnailExtensionChip ext={ext} />
            <CardMedia
              component="img"
              data-src={zipImg}
              image={zipImg}
              loading="lazy"
              sx={styledDocfileThumbnail}
            />
          </ThumbnailBackground>
          <ThumbnailFilename
            filename={filename}
            onFilenameChange={onFilenameChange}
            isEditable={isEditable}
          />
        </Card>
      );
    case "ai":
    case "bmp":
    case "eps":
    case "psd":
    case "tiff":
    case "tif":
      return (
        <Card sx={styledCard} elevation={0} onClick={onClick}>
          <ThumbnailBackground>
            <ThumbnailHover />
            <ThumbnailSelect file={file} />
            <ThumbnailExtensionChip ext={ext} />
            <CardMedia
              component="img"
              data-src={defaultImg}
              image={defaultImg}
              loading="lazy"
              sx={styledDocfileThumbnail}
            />
          </ThumbnailBackground>
          <ThumbnailFilename
            filename={filename}
            onFilenameChange={onFilenameChange}
            isEditable={isEditable}
          />
        </Card>
      );
    case "numbers":
      return (
        <Card sx={styledCard} elevation={0} onClick={onClick}>
          <ThumbnailBackground color="green">
            <ThumbnailHover />
            <ThumbnailSelect file={file} />
            <ThumbnailExtensionChip ext={ext} />
            <CardMedia
              component="img"
              data-src={numberImg}
              image={numberImg}
              loading="lazy"
              sx={styledDocfileThumbnail}
            />
          </ThumbnailBackground>
          <ThumbnailFilename
            filename={filename}
            onFilenameChange={onFilenameChange}
            isEditable={isEditable}
          />
        </Card>
      );
    case "No Extension":
      return (
        <Card sx={styledCard} elevation={0} onClick={onClick}>
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
            filename={filename}
            onFilenameChange={onFilenameChange}
            isEditable={isEditable}
          />
        </Card>
      );
    default:
      return (
        <Card sx={styledCard} elevation={0} onClick={onClick}>
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
            filename={filename}
            onFilenameChange={onFilenameChange}
            isEditable={isEditable}
          />
        </Card>
      );
  }
};

Thumbnail.defaultProps = {
  isEditable: false,
  showVideo: true,
};

// const ThumbnailWorkspace = () => {
//   return ( <Card
//     sx={styledCard}
//     elevation={0}
//     onClick={onClick}
//     draggable
//     onDragStart={(evt) => onDragStart(evt)}
//   >
//     <Box
//       sx={{
//         ...styledCheckerBoard,
//         py: imageOrientation === "horizontal" && 1,
//         px: imageOrientation === "vertical" && "auto",
//         height: "160px",
//         overflow: "hidden",
//         backgroundColor: fileExtension(filename) !== "png" && "grey.100",
//         position: "relative",
//         backgroundSize: `25px 25px`,
//         backgroundPosition: `0 0, 12.5px 0, 12.5px -12.5px, 0px 12.5px`,
//         "&:hover": {},
//       }}
//     >

//     </Box>
//     <ThumbnailFilename
//       filename={filename}
//       onFilenameChange={onFilenameChange}
//       isEditable={isEditable}
//     />
//   </Card>)
// }

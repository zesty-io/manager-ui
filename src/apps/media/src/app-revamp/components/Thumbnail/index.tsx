import {
  FC,
  useState,
  useRef,
  useEffect,
  DragEvent,
  ChangeEventHandler,
} from "react";
import { CardMedia, Card, Box, Checkbox as MuiCheckbox } from "@mui/material";
import { fileExtension } from "../../utils/fileUtils";
import { ThumbnailContent } from "./ThumbnailContent";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
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
import { File } from "../../../../../../shell/services/types";
import { useDispatch, useSelector } from "react-redux";
import {
  deselectFile,
  selectFile,
  State,
} from "../../../../../../shell/store/media-revamp";

interface ThumbnailProps {
  src?: string;
  filename?: string;
  isEditable?: boolean;
  showVideo?: boolean;
  id?: string;
  group_id?: string;
  bin_id?: string;
  file?: File;
  file?: File;
  onRemove?: () => void;
  onFilenameChange?: (value: string) => void;
  onClick?: () => void;
}

export const Thumbnail: FC<ThumbnailProps> = ({
  src,
  filename,
  isEditable,
  showVideo,
  onRemove,
  onFilenameChange,
  onClick,
  id,
  group_id,
  bin_id,
  file,
}) => {
  const theme = useTheme();
  const imageEl = useRef<HTMLImageElement>();
  const [imageOrientation, setImageOrientation] = useState<string>("");
  const thumbnailRef = useRef<HTMLDivElement>();
  const selectedFiles = useSelector(
    (state: { mediaRevamp: State }) => state.mediaRevamp.selectedFiles
  );
  const dispatch = useDispatch();
  const isSelectDialog = useSelector(
    (state: { mediaRevamp: State }) => state.mediaRevamp.isSelectDialog
  );

  const onDragStart = (event: DragEvent) => {
    event.dataTransfer.setData(
      "text/plain",
      JSON.stringify({ id, filename, group_id, bin_id })
    );
    event.dataTransfer.effectAllowed = "move";
  };

  const RemoveIcon = () => {
    return (
      <>
        {onRemove && (
          <Box
            onClick={onRemove}
            sx={{
              right: 9,
              top: 8,
              position: "absolute",
              backgroundColor: "grey.100",
              width: "24px",
              height: "24px",
              borderRadius: "100%",
              cursor: "pointer",
              textAlign: "center",
            }}
          >
            <CloseRoundedIcon
              fontSize="small"
              sx={{
                mt: 0.3,
                color: "grey.400",
              }}
            />
          </Box>
        )}
      </>
    );
  };

  const Checkbox = () => {
    const checked = selectedFiles.some((file) => file.id === id);
    return (
      <MuiCheckbox
        sx={{
          display: checked ? "block" : "none",
          position: "absolute",
          top: 8,
          right: 8,
          padding: 0,
        }}
        checked={checked}
        icon={<CheckCircleIcon sx={{ color: "common.white" }} />}
        checkedIcon={<CheckCircleIcon color="primary" />}
        onChange={(evt, checked) => {
          if (checked) {
            dispatch(selectFile(file));
          } else {
            dispatch(deselectFile(file));
          }
        }}
        onClick={(evt) => evt.stopPropagation()}
      />
    );
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
      fileExtension(filename) === "png" &&
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

  /**
   * @description Main Thumbnail component display
   */
  switch (fileExtension(filename)) {
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "svg":
    case "webp":
      return (
        <Card
          ref={thumbnailRef}
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
              backgroundColor: fileExtension(filename) !== "png" && "grey.100",
              position: "relative",
              backgroundSize: `25px 25px`,
              backgroundPosition: `0 0, 12.5px 0, 12.5px -12.5px, 0px 12.5px`,
              "&:hover": {
                "& .MuiCheckbox-root": {
                  display: "block",
                },
              },
            }}
          >
            <Box
              sx={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                "&:hover": {
                  background: `linear-gradient(180deg, ${theme.palette.grey[900]} 0%, rgba(29, 41, 57, 0) 24.17%)`,
                },
              }}
            >
              <RemoveIcon />
              {isSelectDialog && <Checkbox />}
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
          </Box>
          <ThumbnailContent
            extension={fileExtension(filename)}
            filename={filename}
            onFilenameChange={onFilenameChange}
            isEditable={isEditable}
            backgroundColor="blue.100"
            color="blue.600"
          />
        </Card>
      );
    case "ots":
    case "xls":
    case "xlsx":
      return (
        <Card sx={styledCard} elevation={0} onClick={onClick}>
          <Box
            sx={{
              backgroundColor: "green.100",
              boxSizing: "border-box",
              height: "160px",
              overflow: "hidden",
              display: "flex",
            }}
          >
            <RemoveIcon />
            {isSelectDialog && <Checkbox />}
            <CardMedia
              component="img"
              data-src={excelImg}
              image={excelImg}
              loading="lazy"
              sx={styledDocfileThumbnail}
            />
          </Box>
          <ThumbnailContent
            extension={fileExtension(filename)}
            filename={filename}
            onFilenameChange={onFilenameChange}
            isEditable={isEditable}
            backgroundColor="green.50"
            color="green.600"
          />
        </Card>
      );
    case "csv":
      return (
        <Card sx={styledCard} elevation={0} onClick={onClick}>
          <Box
            sx={{
              backgroundColor: "green.100",
              boxSizing: "border-box",
              height: "160px",
              overflow: "hidden",
              display: "flex",
            }}
          >
            <RemoveIcon />
            {isSelectDialog && <Checkbox />}
            <CardMedia
              component="img"
              data-src={csvImg}
              image={csvImg}
              loading="lazy"
              sx={styledDocfileThumbnail}
            />
          </Box>
          <ThumbnailContent
            extension={fileExtension(filename)}
            filename={filename}
            onFilenameChange={onFilenameChange}
            isEditable={isEditable}
            backgroundColor="green.50"
            color="green.600"
          />
        </Card>
      );
    case "docx":
    case "doc":
    case "rtf":
      return (
        <Card sx={styledCard} elevation={0} onClick={onClick}>
          <Box
            sx={{
              backgroundColor: "blue.50",
              boxSizing: "border-box",
              height: "160px",
              overflow: "hidden",
              display: "flex",
            }}
          >
            <RemoveIcon />
            {isSelectDialog && <Checkbox />}
            <CardMedia
              component="img"
              data-src={wordImg}
              image={wordImg}
              loading="lazy"
              sx={styledDocfileThumbnail}
            />
          </Box>
          <ThumbnailContent
            extension={fileExtension(filename)}
            filename={filename}
            onFilenameChange={onFilenameChange}
            isEditable={isEditable}
            backgroundColor="blue.100"
            color="blue.600"
          />
        </Card>
      );
    case "pdf":
      return (
        <Card sx={styledCard} elevation={0} onClick={onClick}>
          <Box
            sx={{
              backgroundColor: "red.50",
              boxSizing: "border-box",
              height: "160px",
              overflow: "hidden",
              display: "flex",
            }}
          >
            <RemoveIcon />
            {isSelectDialog && <Checkbox />}
            <CardMedia
              component="img"
              data-src={pdfImg}
              image={pdfImg}
              loading="lazy"
              sx={styledDocfileThumbnail}
            />
          </Box>
          <ThumbnailContent
            extension={fileExtension(filename)}
            filename={filename}
            onFilenameChange={onFilenameChange}
            isEditable={isEditable}
            backgroundColor="red.100"
            color="red.600"
          />
        </Card>
      );
    case "ppt":
    case "pptx":
    case "pptm":
      return (
        <Card sx={styledCard} elevation={0} onClick={onClick}>
          <Box
            sx={{
              backgroundColor: "red.50",
              boxSizing: "border-box",
              height: "160px",
              overflow: "hidden",
              display: "flex",
            }}
          >
            <RemoveIcon />
            {isSelectDialog && <Checkbox />}
            <CardMedia
              component="img"
              data-src={pptImg}
              image={pptImg}
              loading="lazy"
              sx={styledDocfileThumbnail}
            />
          </Box>
          <ThumbnailContent
            extension={fileExtension(filename)}
            filename={filename}
            onFilenameChange={onFilenameChange}
            isEditable={isEditable}
            backgroundColor="red.100"
            color="red.600"
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
          <Box
            sx={{
              backgroundColor: "purple.100",
              boxSizing: "border-box",
              height: "160px",
              overflow: "hidden",
              display: "flex",
            }}
          >
            <RemoveIcon />
            {isSelectDialog && <Checkbox />}
            <CardMedia
              component="img"
              data-src={mpImg}
              image={mpImg}
              loading="lazy"
              sx={styledDocfileThumbnail}
            />
          </Box>
          <ThumbnailContent
            extension={fileExtension(filename)}
            filename={filename}
            onFilenameChange={onFilenameChange}
            isEditable={isEditable}
            backgroundColor="purple.50"
            color="purple.900"
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
          <Box
            sx={{
              boxSizing: "border-box",
              height: "160px",
              overflow: "hidden",
              position: "relative",
              display: "flex",
              backgroundColor: "#000",
            }}
          >
            <RemoveIcon />
            {isSelectDialog && <Checkbox />}
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
          </Box>
          <ThumbnailContent
            extension={fileExtension(filename)}
            filename={filename}
            onFilenameChange={onFilenameChange}
            isEditable={isEditable}
            backgroundColor="purple.50"
            color="purple.900"
          />
        </Card>
      );
    case "iso":
    case "rar":
    case "tgz":
    case "zip":
      return (
        <Card sx={styledCard} elevation={0} onClick={onClick}>
          <Box
            sx={{
              backgroundColor: "grey.100",
              boxSizing: "border-box",
              height: "160px",
              overflow: "hidden",
              display: "flex",
            }}
          >
            <RemoveIcon />
            {isSelectDialog && <Checkbox />}
            <CardMedia
              component="img"
              data-src={zipImg}
              image={zipImg}
              loading="lazy"
              sx={styledDocfileThumbnail}
            />
          </Box>
          <ThumbnailContent
            extension={fileExtension(filename)}
            filename={filename}
            onFilenameChange={onFilenameChange}
            isEditable={isEditable}
            backgroundColor="grey.50"
            color="grey.900"
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
          <Box
            sx={{
              backgroundColor: "grey.100",
              boxSizing: "border-box",
              height: "160px",
              overflow: "hidden",
              display: "flex",
            }}
          >
            <RemoveIcon />
            {isSelectDialog && <Checkbox />}
            <CardMedia
              component="img"
              data-src={defaultImg}
              image={defaultImg}
              loading="lazy"
              sx={styledDocfileThumbnail}
            />
          </Box>
          <ThumbnailContent
            extension={fileExtension(filename)}
            filename={filename}
            onFilenameChange={onFilenameChange}
            isEditable={isEditable}
            backgroundColor="grey.50"
            color="grey.900"
          />
        </Card>
      );
    case "numbers":
      return (
        <Card sx={styledCard} elevation={0} onClick={onClick}>
          <Box
            sx={{
              backgroundColor: "green.100",
              boxSizing: "border-box",
              height: "160px",
              overflow: "hidden",
              display: "flex",
            }}
          >
            <RemoveIcon />
            {isSelectDialog && <Checkbox />}
            <CardMedia
              component="img"
              data-src={numberImg}
              image={numberImg}
              loading="lazy"
              sx={styledDocfileThumbnail}
            />
          </Box>
          <ThumbnailContent
            extension={fileExtension(filename)}
            filename={filename}
            onFilenameChange={onFilenameChange}
            isEditable={isEditable}
            backgroundColor="green.50"
            color="green.600"
          />
        </Card>
      );
    default:
      return (
        <Card sx={styledCard} elevation={0} onClick={onClick}>
          <Box
            sx={{
              backgroundColor: "grey.100",
              boxSizing: "border-box",
              height: "160px",
              overflow: "hidden",
              display: "flex",
            }}
          >
            <RemoveIcon />
            {isSelectDialog && <Checkbox />}
            <CardMedia
              component="img"
              data-src={defaultImg}
              image={defaultImg}
              loading="lazy"
              sx={styledDocfileThumbnail}
            />
          </Box>
          <ThumbnailContent
            extension={fileExtension(filename)}
            filename={filename}
            onFilenameChange={onFilenameChange}
            isEditable={isEditable}
            backgroundColor="grey.50"
            color="grey.600"
          />
        </Card>
      );
  }
};

Thumbnail.defaultProps = {
  isEditable: false,
  showVideo: true,
};

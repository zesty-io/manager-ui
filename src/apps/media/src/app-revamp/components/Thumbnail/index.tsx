import { FC, useState, useRef, useEffect, DragEvent } from "react";
import {
  CardMedia,
  Typography,
  Card,
  Button,
  Box,
  Checkbox as MuiCheckbox,
  Skeleton,
  Chip,
} from "@mui/material";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import { fileExtension, fileTypeToColor } from "../../utils/fileUtils";
import { ThumbnailContent } from "./ThumbnailContent";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FontDownloadRoundedIcon from "@mui/icons-material/FontDownloadRounded";
import { useTheme } from "@mui/material/styles";
import styles from "./Loading.less";
import cx from "classnames";
import CheckIcon from "@mui/icons-material/Check";

import fileBroken from "../../../../../../../public/images/fileBroken.jpg";

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
import jsIcon from "../../../../../../../public/images/jsIcon.svg";
import htmlIcon from "../../../../../../../public/images/htmlIcon.svg";
import cssIcon from "../../../../../../../public/images/cssIcon.svg";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import ReportGmailerrorredIcon from "@mui/icons-material/ReportGmailerrorred";
import RemoveRedEyeRoundedIcon from "@mui/icons-material/RemoveRedEyeRounded";
import { isImage } from "../../utils/fileUtils";

import { File } from "../../../../../../shell/services/types";
import { useDispatch, useSelector } from "react-redux";
import {
  deselectFile,
  selectFile,
  State,
} from "../../../../../../shell/store/media-revamp";

interface ThumbnailProps {
  src?: string;
  url?: string;
  filename?: string;
  isEditable?: boolean;
  showVideo?: boolean;
  id?: string;
  group_id?: string;
  bin_id?: string;
  file?: File;
  imageHeight?: string;
  selectable?: boolean;
  onRemove?: () => void;
  onFilenameChange?: (value: string) => void;
  onTitleChange?: (value: string) => void;
  onClick?: () => void;
}

export const Thumbnail: FC<ThumbnailProps> = ({
  src,
  url,
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
  onTitleChange,
  imageHeight,
  selectable,
}) => {
  const theme = useTheme();
  const imageEl = useRef<HTMLImageElement>();
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [lazyLoading, setLazyLoading] = useState(true);
  const [imageOrientation, setImageOrientation] = useState<string>("");
  const thumbnailRef = useRef<HTMLDivElement>();
  const [isLoadingImage, setIsLoadingImage] = useState<boolean>(true);
  const [isImageError, setIsImageError] = useState(false);
  const selectedFiles = useSelector(
    (state: { mediaRevamp: State }) => state.mediaRevamp.selectedFiles
  );
  const isSelectDialog = useSelector(
    (state: { mediaRevamp: State }) => state.mediaRevamp.isSelectDialog
  );
  const dispatch = useDispatch();
  const isSelecting = isSelectDialog || selectedFiles?.length;

  const onDragStart = (event: DragEvent) => {
    event.dataTransfer.setData(
      "text/plain",
      JSON.stringify({ id, filename, group_id, bin_id })
    );
    event.dataTransfer.effectAllowed = "move";
  };

  const handleSelect = () => {
    if (selectedFiles.some((file) => file.id === id)) {
      dispatch(deselectFile(file));
    } else {
      dispatch(selectFile(file));
    }
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
        checkedIcon={
          <CheckCircleIcon
            sx={{ backgroundColor: "common.white", borderRadius: "100%" }}
            color="primary"
          />
        }
        // onChange={(evt, checked) => {}
        onClick={(evt) => {
          evt.stopPropagation();
          handleSelect();
        }}
      />
    );
  };

  const CopyUrlChip = () => {
    if (!url) return null;
    return (
      <Chip
        label={
          // @ts-ignore
          <Typography variant="body3" color="text.secondary">
            {isCopied ? "Copied" : "Copy URL"}
          </Typography>
        }
        color="default"
        sx={{
          width: "fit-content",
          display: "none",
          top: 8,
          left: 8,
        }}
        size="small"
        onClick={(evt: any) => {
          evt.stopPropagation();
          handleCopyClick(url);
        }}
        icon={
          <>
            {isCopied ? (
              <CheckIcon sx={{ color: "grey.400" }} />
            ) : (
              <LinkRoundedIcon sx={{ color: "grey.400" }} />
            )}
          </>
        }
      />
    );
  };

  const PreviewChip = () => {
    if (!onClick) return null;
    return (
      <Chip
        label={
          // @ts-ignore
          <Typography variant="body3" color="text.secondary">
            Preview
          </Typography>
        }
        color="default"
        sx={{
          width: "fit-content",
          display: "none",
          top: 8,
          left: 8,
        }}
        size="small"
        onClick={(event) => {
          event.stopPropagation();
          onClick();
        }}
        icon={
          <RemoveRedEyeRoundedIcon
            sx={{ color: (theme) => `${theme.palette.grey[400]} !important` }}
          />
        }
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

  const handleCopyClick = (data: string) => {
    navigator?.clipboard
      ?.writeText(data)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 1500);
      })
      .catch((err) => {
        console.error(err);
      });
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

  const handleImageError = () => {
    setLazyLoading(false);
    setIsImageError(true);
  };

  /**
   * @description Main Thumbnail component display
   */
  switch (fileExtension(filename)) {
    case "jpg":
    case "jpeg":
    case "gif":
    case "webp":
      return (
        <Card
          ref={thumbnailRef}
          sx={styledCard}
          elevation={0}
          onClick={isSelecting ? handleSelect : onClick}
          draggable={!isEditable}
          onDragStart={(evt) => onDragStart(evt)}
          data-cy={id}
        >
          <Box
            sx={{
              ...styledCheckerBoard,
              // py: imageOrientation === "horizontal" && 1,
              // px: imageOrientation === "vertical" && "auto",
              height: imageHeight || "160px",
              overflow: "hidden",
              backgroundColor: fileExtension(filename) !== "png" && "grey.100",
              position: "relative",
              backgroundSize: `25px 25px`,
              backgroundPosition: `0 0, 12.5px 0, 12.5px -12.5px, 0px 12.5px`,
              "&:hover": {},
              boxSizing: "border-box",
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
                  backgroundImage: `linear-gradient(to bottom,rgba(16,24,40,.26),transparent 56px,transparent)`,
                  "& .MuiCheckbox-root": {
                    display: "block",
                  },
                  "& .MuiChip-root": {
                    display: "flex",
                  },
                },
              }}
            >
              {isSelecting ? <PreviewChip /> : <CopyUrlChip />}
              {selectable && <Checkbox />}
              <RemoveIcon />
            </Box>
            <CardMedia
              component="img"
              ref={imageEl}
              onLoad={handleImageLoad}
              onError={handleImageError}
              data-src={src}
              image={isImageError ? fileBroken : src}
              loading="lazy"
              sx={{
                objectFit: "contain",
                overflow: "hidden",
                height: "100%",
                verticalAlign: "bottom",
              }}
            />

            {file && isImage(file) && lazyLoading ? (
              <div className={cx(styles.Load, styles.Loading)}></div>
            ) : null}
            <Chip
              label={fileExtension(filename)}
              sx={{
                position: "absolute",
                right: "8px",
                bottom: "8px",
                textTransform: "uppercase",
                backgroundColor: `${fileTypeToColor(
                  fileExtension(filename)
                )}.100`,
                color: `${fileTypeToColor(fileExtension(filename))}.600`,
              }}
              size="small"
            />
          </Box>
          <ThumbnailContent
            filename={filename}
            onFilenameChange={onFilenameChange}
            onTitleChange={onTitleChange}
            isEditable={isEditable}
            isSelected={selectedFiles.some((file) => file.id === id)}
          />
        </Card>
      );

    case "png":
    case "svg":
      return (
        <Card
          ref={thumbnailRef}
          sx={styledCard}
          elevation={0}
          onClick={isSelecting ? handleSelect : onClick}
          draggable={!isEditable}
          data-cy={id}
          onDragStart={(evt) => onDragStart(evt)}
        >
          <Box
            sx={{
              ...styledCheckerBoard,
              p: 1,
              height: imageHeight || "160px",
              overflow: "hidden",
              backgroundColor: fileExtension(filename) !== "png" && "grey.100",
              position: "relative",
              backgroundSize: `25px 25px`,
              backgroundPosition: `0 0, 12.5px 0, 12.5px -12.5px, 0px 12.5px`,
              "&:hover": {},
              boxSizing: "border-box",
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
                  backgroundImage: `linear-gradient(to bottom,rgba(16,24,40,.26),transparent 56px,transparent)`,
                  "& .MuiCheckbox-root": {
                    display: "block",
                  },
                  "& .MuiChip-root": {
                    display: "flex",
                  },
                },
              }}
            >
              {isSelecting ? <PreviewChip /> : <CopyUrlChip />}
              {selectable && <Checkbox />}
              <RemoveIcon />
            </Box>
            <CardMedia
              component="img"
              ref={imageEl}
              onLoad={handleImageLoad}
              onError={handleImageError}
              data-src={src}
              image={isImageError ? fileBroken : src}
              loading="lazy"
              sx={{
                objectFit: "contain",
                overflow: "hidden",
                height: "100%",
                verticalAlign: "bottom",
              }}
            />

            {file && isImage(file) && lazyLoading ? (
              <div className={cx(styles.Load, styles.Loading)}></div>
            ) : null}
            <Chip
              label={fileExtension(filename)}
              sx={{
                position: "absolute",
                right: "8px",
                bottom: "8px",
                textTransform: "uppercase",
                backgroundColor: `${fileTypeToColor(
                  fileExtension(filename)
                )}.100`,
                color: `${fileTypeToColor(fileExtension(filename))}.600`,
              }}
              size="small"
            />
          </Box>
          <ThumbnailContent
            filename={filename}
            onFilenameChange={onFilenameChange}
            onTitleChange={onTitleChange}
            isEditable={isEditable}
            isSelected={selectedFiles.some((file) => file.id === id)}
          />
        </Card>
      );
    case "ots":
    case "xls":
    case "xlsx":
      return (
        <Card
          sx={styledCard}
          elevation={0}
          onClick={isSelecting ? handleSelect : onClick}
          draggable={!isEditable}
          onDragStart={(evt) => onDragStart(evt)}
        >
          <Box
            sx={{
              backgroundColor: "green.100",
              boxSizing: "border-box",
              height: imageHeight || "160px",
              overflow: "hidden",
              display: "flex",
              position: "relative",
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
                  backgroundImage: `linear-gradient(to bottom,rgba(16,24,40,.26),transparent 56px,transparent)`,
                  "& .MuiCheckbox-root": {
                    display: "block",
                  },
                  "& .MuiChip-root": {
                    display: "flex",
                  },
                },
              }}
            >
              {isSelecting ? <PreviewChip /> : <CopyUrlChip />}
              {selectable && <Checkbox />}
              <RemoveIcon />
            </Box>
            <CardMedia
              component="img"
              data-src={excelImg}
              image={excelImg}
              loading="lazy"
              sx={styledDocfileThumbnail}
            />
            <Chip
              label={fileExtension(filename)}
              sx={{
                position: "absolute",
                right: "8px",
                bottom: "8px",
                textTransform: "uppercase",
                backgroundColor: `${fileTypeToColor(
                  fileExtension(filename)
                )}.50`,
                color: `${fileTypeToColor(fileExtension(filename))}.600`,
              }}
              size="small"
            />
          </Box>
          <ThumbnailContent
            filename={filename}
            onFilenameChange={onFilenameChange}
            onTitleChange={onTitleChange}
            isEditable={isEditable}
            isSelected={selectedFiles.some((file) => file.id === id)}
          />
        </Card>
      );
    case "csv":
      return (
        <Card
          sx={styledCard}
          elevation={0}
          onClick={isSelecting ? handleSelect : onClick}
          draggable={!isEditable}
          onDragStart={(evt) => onDragStart(evt)}
        >
          <Box
            sx={{
              backgroundColor: "green.100",
              boxSizing: "border-box",
              height: imageHeight || "160px",
              overflow: "hidden",
              display: "flex",
              position: "relative",
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
                  backgroundImage: `linear-gradient(to bottom,rgba(16,24,40,.26),transparent 56px,transparent)`,
                  "& .MuiCheckbox-root": {
                    display: "block",
                  },
                  "& .MuiChip-root": {
                    display: "flex",
                  },
                },
              }}
            >
              {isSelecting ? <PreviewChip /> : <CopyUrlChip />}
              {selectable && <Checkbox />}
              <RemoveIcon />
            </Box>
            <CardMedia
              component="img"
              data-src={csvImg}
              image={csvImg}
              loading="lazy"
              sx={styledDocfileThumbnail}
            />
            <Chip
              label={fileExtension(filename)}
              sx={{
                position: "absolute",
                right: "8px",
                bottom: "8px",
                textTransform: "uppercase",
                backgroundColor: `${fileTypeToColor(
                  fileExtension(filename)
                )}.50`,
                color: `${fileTypeToColor(fileExtension(filename))}.600`,
              }}
              size="small"
            />
          </Box>
          <ThumbnailContent
            filename={filename}
            onFilenameChange={onFilenameChange}
            onTitleChange={onTitleChange}
            isEditable={isEditable}
            isSelected={selectedFiles.some((file) => file.id === id)}
          />
        </Card>
      );
    case "docx":
    case "doc":
    case "rtf":
      return (
        <Card
          sx={styledCard}
          elevation={0}
          onClick={isSelecting ? handleSelect : onClick}
          data-cy={id}
          draggable={!isEditable}
          onDragStart={(evt) => onDragStart(evt)}
        >
          <Box
            sx={{
              backgroundColor: "blue.50",
              boxSizing: "border-box",
              height: imageHeight || "160px",
              overflow: "hidden",
              display: "flex",
              position: "relative",
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
                  backgroundImage: `linear-gradient(to bottom,rgba(16,24,40,.26),transparent 56px,transparent)`,
                  "& .MuiCheckbox-root": {
                    display: "block",
                  },
                  "& .MuiChip-root": {
                    display: "flex",
                  },
                },
              }}
            >
              {isSelecting ? <PreviewChip /> : <CopyUrlChip />}
              {selectable && <Checkbox />}
              <RemoveIcon />
            </Box>
            <CardMedia
              component="img"
              data-src={wordImg}
              image={wordImg}
              loading="lazy"
              sx={styledDocfileThumbnail}
            />
            <Chip
              label={fileExtension(filename)}
              sx={{
                position: "absolute",
                right: "8px",
                bottom: "8px",
                textTransform: "uppercase",
                backgroundColor: `${fileTypeToColor(
                  fileExtension(filename)
                )}.100`,
                color: `${fileTypeToColor(fileExtension(filename))}.600`,
              }}
              size="small"
            />
          </Box>

          <ThumbnailContent
            filename={filename}
            onFilenameChange={onFilenameChange}
            onTitleChange={onTitleChange}
            isEditable={isEditable}
            isSelected={selectedFiles.some((file) => file.id === id)}
          />
        </Card>
      );
    case "pdf":
      return (
        <Card
          sx={styledCard}
          elevation={0}
          onClick={isSelecting ? handleSelect : onClick}
          data-cy={id}
          draggable={!isEditable}
          onDragStart={(evt) => onDragStart(evt)}
        >
          <Box
            sx={{
              backgroundColor: "blue.50",
              boxSizing: "border-box",
              height: imageHeight || "160px",
              overflow: "hidden",
              display: "flex",
              position: "relative",
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
                  backgroundImage: `linear-gradient(to bottom,rgba(16,24,40,.26),transparent 56px,transparent)`,
                  "& .MuiCheckbox-root": {
                    display: "block",
                  },
                  "& .MuiChip-root": {
                    display: "flex",
                  },
                },
              }}
            >
              {isSelecting ? <PreviewChip /> : <CopyUrlChip />}
              {selectable && <Checkbox />}
              <RemoveIcon />
            </Box>
            <CardMedia
              component="img"
              data-src={pdfImg}
              image={pdfImg}
              loading="lazy"
              sx={styledDocfileThumbnail}
            />
            <Chip
              label={fileExtension(filename)}
              sx={{
                position: "absolute",
                right: "8px",
                bottom: "8px",
                textTransform: "uppercase",
                backgroundColor: `${fileTypeToColor(
                  fileExtension(filename)
                )}.100`,
                color: `${fileTypeToColor(fileExtension(filename))}.600`,
              }}
              size="small"
            />
          </Box>
          <ThumbnailContent
            filename={filename}
            onFilenameChange={onFilenameChange}
            onTitleChange={onTitleChange}
            isEditable={isEditable}
            isSelected={selectedFiles.some((file) => file.id === id)}
          />
        </Card>
      );
    case "ppt":
    case "pptx":
    case "pptm":
      return (
        <Card
          sx={styledCard}
          elevation={0}
          onClick={isSelecting ? handleSelect : onClick}
          data-cy={id}
          draggable={!isEditable}
          onDragStart={(evt) => onDragStart(evt)}
        >
          <Box
            sx={{
              backgroundColor: "red.50",
              boxSizing: "border-box",
              height: imageHeight || "160px",
              overflow: "hidden",
              display: "flex",
              position: "relative",
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
                  backgroundImage: `linear-gradient(to bottom,rgba(16,24,40,.26),transparent 56px,transparent)`,
                  "& .MuiCheckbox-root": {
                    display: "block",
                  },
                  "& .MuiChip-root": {
                    display: "flex",
                  },
                },
              }}
            >
              {isSelecting ? <PreviewChip /> : <CopyUrlChip />}
              {selectable && <Checkbox />}
              <RemoveIcon />
            </Box>
            <CardMedia
              component="img"
              data-src={pptImg}
              image={pptImg}
              loading="lazy"
              sx={styledDocfileThumbnail}
            />
            <Chip
              label={fileExtension(filename)}
              sx={{
                position: "absolute",
                right: "8px",
                bottom: "8px",
                textTransform: "uppercase",
                backgroundColor: `${fileTypeToColor(
                  fileExtension(filename)
                )}.100`,
                color: `${fileTypeToColor(fileExtension(filename))}.600`,
              }}
              size="small"
            />
          </Box>
          <ThumbnailContent
            filename={filename}
            onFilenameChange={onFilenameChange}
            onTitleChange={onTitleChange}
            isEditable={isEditable}
            isSelected={selectedFiles.some((file) => file.id === id)}
          />
        </Card>
      );
    case "aac":
    case "aiff":
    case "mid":
    case "mp3":
    case "wav":
      return (
        <Card
          sx={styledCard}
          elevation={0}
          onClick={isSelecting ? handleSelect : onClick}
          data-cy={id}
          draggable={!isEditable}
          onDragStart={(evt) => onDragStart(evt)}
        >
          <Box
            sx={{
              backgroundColor: "purple.100",
              boxSizing: "border-box",
              height: imageHeight || "160px",
              overflow: "hidden",
              display: "flex",
              position: "relative",
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
                  backgroundImage: `linear-gradient(to bottom,rgba(16,24,40,.26),transparent 56px,transparent)`,
                  "& .MuiCheckbox-root": {
                    display: "block",
                  },
                  "& .MuiChip-root": {
                    display: "flex",
                  },
                },
              }}
            >
              {isSelecting ? <PreviewChip /> : <CopyUrlChip />}
              {selectable && <Checkbox />}
              <RemoveIcon />
            </Box>
            <CardMedia
              component="img"
              data-src={mpImg}
              image={mpImg}
              loading="lazy"
              sx={styledDocfileThumbnail}
            />
            <Chip
              label={fileExtension(filename)}
              sx={{
                position: "absolute",
                right: "8px",
                bottom: "8px",
                textTransform: "uppercase",
                backgroundColor: `${fileTypeToColor(
                  fileExtension(filename)
                )}.50`,
                color: `${fileTypeToColor(fileExtension(filename))}.900`,
              }}
              size="small"
            />
          </Box>
          <ThumbnailContent
            filename={filename}
            onFilenameChange={onFilenameChange}
            onTitleChange={onTitleChange}
            isEditable={isEditable}
            isSelected={selectedFiles.some((file) => file.id === id)}
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
        <Card
          sx={styledCard}
          elevation={0}
          data-cy={id}
          onClick={isSelecting ? handleSelect : onClick}
          draggable={!isEditable}
          onDragStart={(evt) => onDragStart(evt)}
        >
          <Box
            sx={{
              boxSizing: "border-box",
              height: imageHeight || "160px",
              overflow: "hidden",
              position: "relative",
              display: "flex",
              backgroundColor: "#000",
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
                  backgroundImage: `linear-gradient(to bottom,rgba(16,24,40,.26),transparent 56px,transparent)`,
                  "& .MuiCheckbox-root": {
                    display: "block",
                  },
                  "& .MuiChip-root": {
                    display: "flex",
                  },
                },
              }}
            >
              {isSelecting ? <PreviewChip /> : <CopyUrlChip />}
              {selectable && <Checkbox />}
              <RemoveIcon />
            </Box>
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
            <Chip
              label={fileExtension(filename)}
              sx={{
                position: "absolute",
                right: "8px",
                bottom: "8px",
                textTransform: "uppercase",
                backgroundColor: `${fileTypeToColor(
                  fileExtension(filename)
                )}.50`,
                color: `${fileTypeToColor(fileExtension(filename))}.900`,
              }}
              size="small"
            />
          </Box>
          <ThumbnailContent
            filename={filename}
            onFilenameChange={onFilenameChange}
            onTitleChange={onTitleChange}
            isEditable={isEditable}
            isSelected={selectedFiles.some((file) => file.id === id)}
          />
        </Card>
      );
    case "iso":
    case "rar":
    case "tgz":
    case "zip":
      return (
        <Card
          sx={styledCard}
          elevation={0}
          data-cy={id}
          onClick={isSelecting ? handleSelect : onClick}
          draggable={!isEditable}
          onDragStart={(evt) => onDragStart(evt)}
        >
          <Box
            sx={{
              backgroundColor: "grey.100",
              boxSizing: "border-box",
              height: imageHeight || "160px",
              overflow: "hidden",
              display: "flex",
              position: "relative",
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
                  backgroundImage: `linear-gradient(to bottom,rgba(16,24,40,.26),transparent 56px,transparent)`,
                  "& .MuiCheckbox-root": {
                    display: "block",
                  },
                  "& .MuiChip-root": {
                    display: "flex",
                  },
                },
              }}
            >
              {isSelecting ? <PreviewChip /> : <CopyUrlChip />}
              {selectable && <Checkbox />}
              <RemoveIcon />
            </Box>
            <CardMedia
              component="img"
              data-src={zipImg}
              image={zipImg}
              loading="lazy"
              sx={styledDocfileThumbnail}
            />
            <Chip
              label={fileExtension(filename)}
              sx={{
                position: "absolute",
                right: "8px",
                bottom: "8px",
                textTransform: "uppercase",
                backgroundColor: `${fileTypeToColor(
                  fileExtension(filename)
                )}.50`,
                color: `${fileTypeToColor(fileExtension(filename))}.900`,
              }}
              size="small"
            />
          </Box>
          <ThumbnailContent
            filename={filename}
            onFilenameChange={onFilenameChange}
            onTitleChange={onTitleChange}
            isEditable={isEditable}
            isSelected={selectedFiles.some((file) => file.id === id)}
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
        <Card
          sx={styledCard}
          elevation={0}
          onClick={isSelecting ? handleSelect : onClick}
          data-cy={id}
          draggable={!isEditable}
          onDragStart={(evt) => onDragStart(evt)}
        >
          <Box
            sx={{
              backgroundColor: "grey.100",
              boxSizing: "border-box",
              height: imageHeight || "160px",
              overflow: "hidden",
              display: "flex",
              position: "relative",
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
                  backgroundImage: `linear-gradient(to bottom,rgba(16,24,40,.26),transparent 56px,transparent)`,
                  "& .MuiCheckbox-root": {
                    display: "block",
                  },
                  "& .MuiChip-root": {
                    display: "flex",
                  },
                },
              }}
            >
              {isSelecting ? <PreviewChip /> : <CopyUrlChip />}
              {selectable && <Checkbox />}
              <RemoveIcon />
            </Box>
            <CardMedia
              component="img"
              data-src={defaultImg}
              image={defaultImg}
              loading="lazy"
              sx={styledDocfileThumbnail}
            />
            <Chip
              label={fileExtension(filename)}
              sx={{
                position: "absolute",
                right: "8px",
                bottom: "8px",
                textTransform: "uppercase",
                backgroundColor: `${fileTypeToColor(
                  fileExtension(filename)
                )}.50`,
                color: `${fileTypeToColor(fileExtension(filename))}.900`,
              }}
              size="small"
            />
          </Box>
          <ThumbnailContent
            filename={filename}
            onFilenameChange={onFilenameChange}
            onTitleChange={onTitleChange}
            isEditable={isEditable}
            isSelected={selectedFiles.some((file) => file.id === id)}
          />
        </Card>
      );
    case "numbers":
      return (
        <Card
          sx={styledCard}
          elevation={0}
          onClick={isSelecting ? handleSelect : onClick}
          data-cy={id}
          draggable={!isEditable}
          onDragStart={(evt) => onDragStart(evt)}
        >
          <Box
            sx={{
              backgroundColor: "green.100",
              boxSizing: "border-box",
              height: imageHeight || "160px",
              overflow: "hidden",
              display: "flex",
              position: "relative",
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
                  backgroundImage: `linear-gradient(to bottom,rgba(16,24,40,.26),transparent 56px,transparent)`,
                  "& .MuiCheckbox-root": {
                    display: "block",
                  },
                  "& .MuiChip-root": {
                    display: "flex",
                  },
                },
              }}
            >
              {isSelecting ? <PreviewChip /> : <CopyUrlChip />}
              {selectable && <Checkbox />}
              <RemoveIcon />
            </Box>
            <CardMedia
              component="img"
              data-src={numberImg}
              image={numberImg}
              loading="lazy"
              sx={styledDocfileThumbnail}
            />
            <Chip
              label={fileExtension(filename)}
              sx={{
                position: "absolute",
                right: "8px",
                bottom: "8px",
                textTransform: "uppercase",
                backgroundColor: `${fileTypeToColor(
                  fileExtension(filename)
                )}.50`,
                color: `${fileTypeToColor(fileExtension(filename))}.600`,
              }}
              size="small"
            />
          </Box>
          <ThumbnailContent
            filename={filename}
            onFilenameChange={onFilenameChange}
            onTitleChange={onTitleChange}
            isEditable={isEditable}
            isSelected={selectedFiles.some((file) => file.id === id)}
          />
        </Card>
      );
    case "js":
      return (
        <Card
          sx={styledCard}
          elevation={0}
          onClick={isSelecting ? handleSelect : onClick}
          data-cy={id}
          draggable={!isEditable}
          onDragStart={(evt) => onDragStart(evt)}
        >
          <Box
            sx={{
              backgroundColor: "blue.50",
              boxSizing: "border-box",
              height: imageHeight || "160px",
              overflow: "hidden",
              display: "flex",
              position: "relative",
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
                  backgroundImage: `linear-gradient(to bottom,rgba(16,24,40,.26),transparent 56px,transparent)`,
                  "& .MuiCheckbox-root": {
                    display: "block",
                  },
                  "& .MuiChip-root": {
                    display: "flex",
                  },
                },
              }}
            >
              {isSelecting ? <PreviewChip /> : <CopyUrlChip />}
              {selectable && <Checkbox />}
              <RemoveIcon />
            </Box>
            <CardMedia
              component="img"
              data-src={jsIcon}
              image={jsIcon}
              loading="lazy"
              sx={styledDocfileThumbnail}
            />
            <Chip
              label={fileExtension(filename)}
              sx={{
                position: "absolute",
                right: "8px",
                bottom: "8px",
                textTransform: "uppercase",
                backgroundColor: `${fileTypeToColor(
                  fileExtension(filename)
                )}.100`,
                color: `${fileTypeToColor(fileExtension(filename))}.600`,
              }}
              size="small"
            />
          </Box>
          <ThumbnailContent
            filename={filename}
            onFilenameChange={onFilenameChange}
            onTitleChange={onTitleChange}
            isEditable={isEditable}
            isSelected={selectedFiles.some((file) => file.id === id)}
          />
        </Card>
      );
    case "css":
      return (
        <Card
          sx={styledCard}
          elevation={0}
          data-cy={id}
          onClick={isSelecting ? handleSelect : onClick}
          draggable={!isEditable}
          onDragStart={(evt) => onDragStart(evt)}
        >
          <Box
            sx={{
              backgroundColor: "blue.50",
              boxSizing: "border-box",
              height: imageHeight || "160px",
              overflow: "hidden",
              display: "flex",
              position: "relative",
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
                  backgroundImage: `linear-gradient(to bottom,rgba(16,24,40,.26),transparent 56px,transparent)`,
                  "& .MuiCheckbox-root": {
                    display: "block",
                  },
                  "& .MuiChip-root": {
                    display: "flex",
                  },
                },
              }}
            >
              {isSelecting ? <PreviewChip /> : <CopyUrlChip />}
              {selectable && <Checkbox />}
              <RemoveIcon />
            </Box>
            <CardMedia
              component="img"
              data-src={cssIcon}
              image={cssIcon}
              loading="lazy"
              sx={{ ...styledDocfileThumbnail, height: "46px" }}
            />
            <Chip
              label={fileExtension(filename)}
              sx={{
                position: "absolute",
                right: "8px",
                bottom: "8px",
                textTransform: "uppercase",
                backgroundColor: `${fileTypeToColor(
                  fileExtension(filename)
                )}.100`,
                color: `${fileTypeToColor(fileExtension(filename))}.600`,
              }}
              size="small"
            />
          </Box>
          <ThumbnailContent
            filename={filename}
            onFilenameChange={onFilenameChange}
            onTitleChange={onTitleChange}
            isEditable={isEditable}
            isSelected={selectedFiles.some((file) => file.id === id)}
          />
        </Card>
      );
    case "html":
      return (
        <Card
          sx={styledCard}
          elevation={0}
          data-cy={id}
          onClick={isSelecting ? handleSelect : onClick}
          draggable={!isEditable}
          onDragStart={(evt) => onDragStart(evt)}
        >
          <Box
            sx={{
              backgroundColor: "blue.50",
              boxSizing: "border-box",
              height: imageHeight || "160px",
              overflow: "hidden",
              display: "flex",
              position: "relative",
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
                  backgroundImage: `linear-gradient(to bottom,rgba(16,24,40,.26),transparent 56px,transparent)`,
                  "& .MuiCheckbox-root": {
                    display: "block",
                  },
                  "& .MuiChip-root": {
                    display: "flex",
                  },
                },
              }}
            >
              {isSelecting ? <PreviewChip /> : <CopyUrlChip />}
              {selectable && <Checkbox />}
              <RemoveIcon />
            </Box>
            <CardMedia
              component="img"
              data-src={htmlIcon}
              image={htmlIcon}
              loading="lazy"
              sx={{ ...styledDocfileThumbnail, height: "36px" }}
            />
            <Chip
              label={fileExtension(filename)}
              sx={{
                position: "absolute",
                right: "8px",
                bottom: "8px",
                textTransform: "uppercase",
                backgroundColor: `${fileTypeToColor(
                  fileExtension(filename)
                )}.100`,
                color: `${fileTypeToColor(fileExtension(filename))}.600`,
              }}
              size="small"
            />
          </Box>
          <ThumbnailContent
            filename={filename}
            onFilenameChange={onFilenameChange}
            onTitleChange={onTitleChange}
            isEditable={isEditable}
            isSelected={selectedFiles.some((file) => file.id === id)}
          />
        </Card>
      );
    case "otf":
    case "ttf":
    case "woff":
    case "woff2":
      return (
        <Card
          sx={styledCard}
          elevation={0}
          data-cy={id}
          onClick={isSelecting ? handleSelect : onClick}
          draggable={!isEditable}
          onDragStart={(evt) => onDragStart(evt)}
        >
          <Box
            sx={{
              backgroundColor: "grey.100",
              boxSizing: "border-box",
              height: imageHeight || "160px",
              overflow: "hidden",
              display: "flex",
              position: "relative",
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
                  backgroundImage: `linear-gradient(to bottom,rgba(16,24,40,.26),transparent 56px,transparent)`,
                  "& .MuiCheckbox-root": {
                    display: "block",
                  },
                  "& .MuiChip-root": {
                    display: "flex",
                  },
                },
              }}
            >
              {isSelecting ? <PreviewChip /> : <CopyUrlChip />}
              {selectable && <Checkbox />}
              <RemoveIcon />
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
                width: "100%",
                my: "auto",
              }}
            >
              <FontDownloadRoundedIcon
                fontSize="large"
                sx={{ color: "grey.600" }}
              />
            </Box>
            <Chip
              label={fileExtension(filename)}
              sx={{
                position: "absolute",
                right: "8px",
                bottom: "8px",
                textTransform: "uppercase",
                backgroundColor: `${fileTypeToColor(
                  fileExtension(filename)
                )}.50`,
                color: `${fileTypeToColor(fileExtension(filename))}.900`,
              }}
              size="small"
            />
          </Box>
          <ThumbnailContent
            filename={filename}
            onFilenameChange={onFilenameChange}
            onTitleChange={onTitleChange}
            isEditable={isEditable}
            isSelected={selectedFiles.some((file) => file.id === id)}
          />
        </Card>
      );
    case "No Extension":
      return (
        <Card
          sx={styledCard}
          elevation={0}
          onClick={isSelecting ? handleSelect : onClick}
          data-cy={id}
          draggable={!isEditable}
          onDragStart={(evt) => onDragStart(evt)}
        >
          <Box
            sx={{
              backgroundColor: "red.50",
              boxSizing: "border-box",
              height: imageHeight || "160px",
              overflow: "hidden",
              display: "flex",
              position: "relative",
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
                  backgroundImage: `linear-gradient(to bottom,rgba(16,24,40,.26),transparent 56px,transparent)`,
                  "& .MuiCheckbox-root": {
                    display: "block",
                  },
                  "& .MuiChip-root": {
                    display: "flex",
                  },
                },
              }}
            >
              {isSelecting ? <PreviewChip /> : <CopyUrlChip />}
              {selectable && <Checkbox />}
              <RemoveIcon />
            </Box>
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
            <Chip
              label={fileExtension(filename)}
              sx={{
                position: "absolute",
                right: "8px",
                bottom: "8px",
                textTransform: "uppercase",
                backgroundColor: `${fileTypeToColor(
                  fileExtension(filename)
                )}.100`,
                color: `${fileTypeToColor(fileExtension(filename))}.600`,
              }}
              size="small"
            />
          </Box>
          <ThumbnailContent
            filename={filename}
            onFilenameChange={onFilenameChange}
            onTitleChange={onTitleChange}
            isEditable={isEditable}
            isSelected={selectedFiles.some((file) => file.id === id)}
          />
        </Card>
      );
    default:
      return (
        <Card
          sx={styledCard}
          elevation={0}
          onClick={isSelecting ? handleSelect : onClick}
          data-cy={id}
          draggable={!isEditable}
          onDragStart={(evt) => onDragStart(evt)}
        >
          <Box
            sx={{
              backgroundColor: "grey.100",
              boxSizing: "border-box",
              height: imageHeight || "160px",
              overflow: "hidden",
              display: "flex",
              position: "relative",
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
                  backgroundImage: `linear-gradient(to bottom,rgba(16,24,40,.26),transparent 56px,transparent)`,
                  "& .MuiCheckbox-root": {
                    display: "block",
                  },
                  "& .MuiChip-root": {
                    display: "flex",
                  },
                },
              }}
            >
              {isSelecting ? <PreviewChip /> : <CopyUrlChip />}
              {selectable && <Checkbox />}
              <RemoveIcon />
            </Box>
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
            <Chip
              label={fileExtension(filename)}
              sx={{
                position: "absolute",
                right: "8px",
                bottom: "8px",
                textTransform: "uppercase",
                backgroundColor: `${fileTypeToColor(
                  fileExtension(filename)
                )}.200`,
                color: `${fileTypeToColor(fileExtension(filename))}.600`,
              }}
              size="small"
            />
          </Box>
          <ThumbnailContent
            filename={filename}
            onFilenameChange={onFilenameChange}
            onTitleChange={onTitleChange}
            isEditable={isEditable}
            isSelected={selectedFiles.some((file) => file.id === id)}
          />
        </Card>
      );
  }
};

Thumbnail.defaultProps = {
  isEditable: false,
  showVideo: true,
};

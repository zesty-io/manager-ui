import { FC, useState, useRef } from "react";
import { CardMedia, Card, Box } from "@mui/material";
import { fileExtension } from "../../utils/fileUtils";
import { ThumbnailContent } from "./ThumbnailContent";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";

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

interface ThumbnailProps {
  src?: string;
  filename?: string;
  isEditable?: boolean;
  onFilenameChange?: (value: string) => void;
  onClick?: () => void;
}

export const Thumbnail: FC<ThumbnailProps> = ({
  src,
  filename,
  isEditable,
  onFilenameChange,
  onClick,
}) => {
  const imageEl = useRef<HTMLImageElement>();
  const [imageOrientation, setImageOrientation] = useState<string>("");

  const styledCard = {
    width: "100%",
    height: "100%",
    borderWidth: "1px",
    borderColor: "grey.100",
    borderStyle: "solid",
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
        <Card sx={styledCard} elevation={0} onClick={onClick}>
          <Box
            sx={{
              py: imageOrientation === "horizontal" && 1,
              px: imageOrientation === "vertical" && "auto",
              boxSizing: "border-box",
              height: "160px",
              overflow: "hidden",
            }}
          >
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
                height: "inherit",
                display: "table-cell",
                verticalAlign: "bottom",
              }}
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
              py: imageOrientation === "horizontal" && 1,
              px: imageOrientation === "vertical" && "auto",
              height: "160px",
            }}
          >
            <CardMedia
              component="div"
              sx={{
                backgroundImage: `url("https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/1200px-Image_created_with_a_mobile_phone.png")`,
                backgroundPosition: "center",
                backgroundSize: "100%",
                height: "100%",
                backgroundRepeat: "no-repeat",
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <PlayCircleIcon
                fontSize="large"
                sx={{
                  margin: "auto",
                  color: "#FFF",
                }}
              />
            </CardMedia>
          </Box>
          <ThumbnailContent
            extension={fileExtension("qwrqwrqwr.mp4")}
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
};

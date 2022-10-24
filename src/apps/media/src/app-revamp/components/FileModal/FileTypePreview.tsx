import { FC, useState, useEffect } from "react";
import { fileExtension } from "../../utils/fileUtils";
import { Box, CardMedia, Typography, CircularProgress } from "@mui/material";
import { useTheme } from "@mui/material/styles";

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
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import ReportGmailerrorredIcon from "@mui/icons-material/ReportGmailerrorred";

interface Props {
  src: string;
  filename: string;
  imageSettings?: any;
}

export const FileTypePreview: FC<Props> = ({
  src,
  filename,
  imageSettings,
}) => {
  const theme = useTheme();

  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isImageError, setIsImageError] = useState(false);

  useEffect(() => {
    setIsImageLoading(true);
  }, [src, imageSettings]);

  const styledCheckerBoard = {
    backgroundImage:
      (fileExtension(filename) === "png" ||
        fileExtension(filename) === "svg") &&
      `linear-gradient(45deg, ${theme.palette.grey[100]} 25%, transparent 25%), 
      linear-gradient(135deg, ${theme.palette.grey[100]} 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, ${theme.palette.grey[100]} 75%),
      linear-gradient(135deg, transparent 75%, ${theme.palette.grey[100]} 75%)`,
  };

  const styledDocfileThumbnail = {
    overflow: "hidden",
    width: "60px",
    height: "60px",
    m: "auto",
    display: "table-cell",
    verticalAlign: "bottom",
  };

  const styledBox = {
    height: "100%",
    margin: "auto",
    boxSizing: "border-box",
    overflow: "hidden",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  const genImageURL = () => {
    if (imageSettings) {
      const params = `${Object.keys(imageSettings)
        .filter(
          (key: any) => imageSettings[key] && imageSettings[key] !== "none"
        )
        .map((key: any) => `${key}=${imageSettings[key]}`)
        .join("&")}`;
      return `${src}?${params}`;
    }

    return src;
  };

  const handleImageError = () => {
    setIsImageError(true);
    setIsImageLoading(false);
  };

  switch (fileExtension(filename)) {
    case "jpg":
    case "jpeg":
    case "gif":
    case "webp":
      return (
        <Box
          className="img-box"
          sx={{
            ...styledCheckerBoard,
            // py: imageOrientation === "horizontal" && 1,
            // px: imageOrientation === "vertical" && "auto",
            overflow: "hidden",
            backgroundColor:
              fileExtension(filename) !== "png" &&
              fileExtension(filename) !== "svg" &&
              "grey.100",
            height: "100%",
            m: "auto",
            backgroundSize: `25px 25px`,
            display: "flex",
            alignItems: "center",
            backgroundPosition: `0 0, 12.5px 0, 12.5px -12.5px, 0px 12.5px`,
            position: "relative",
          }}
        >
          {isImageLoading ? (
            <CircularProgress
              color="primary"
              sx={{ position: "absolute", left: "50%" }}
            />
          ) : null}
          <CardMedia
            component="img"
            data-src={`${genImageURL()}`}
            image={isImageError ? fileBroken : `${genImageURL()}`}
            loading="lazy"
            onLoad={() => setIsImageLoading(false)}
            onError={handleImageError}
            sx={{
              objectFit: "contain",
              m: "auto",
              width: "inherit",
              maxHeight: "100%", // used to avoid displaying full size of extra large images
              maxWidth: "100%", // used to avoid displaying full size of extra large images
            }}
          />
        </Box>
      );
    case "png":
    case "svg":
      return (
        <Box
          className="img-box"
          sx={{
            ...styledCheckerBoard,
            p: 1,
            overflow: "hidden",
            backgroundColor:
              fileExtension(filename) !== "png" &&
              fileExtension(filename) !== "svg" &&
              "grey.100",
            height: "100%",
            m: "auto",
            backgroundSize: `25px 25px`,
            display: "flex",
            alignItems: "center",
            backgroundPosition: `0 0, 12.5px 0, 12.5px -12.5px, 0px 12.5px`,
            position: "relative",
          }}
        >
          {isImageLoading ? (
            <CircularProgress
              color="primary"
              sx={{ position: "absolute", left: "50%" }}
            />
          ) : null}
          <CardMedia
            component="img"
            data-src={`${genImageURL()}`}
            image={isImageError ? fileBroken : `${genImageURL()}`}
            loading="lazy"
            onError={handleImageError}
            onLoad={() => setIsImageLoading(false)}
            sx={{
              objectFit: "contain",
              m: "auto",
              width: "inherit",
              maxHeight: "100%", // used to avoid displaying full size of extra large images
              maxWidth: "100%", // used to avoid displaying full size of extra large images
            }}
          />
        </Box>
      );
    case "ots":
    case "xls":
    case "xlsx":
      return (
        <Box
          sx={{
            backgroundColor: "green.200",
            height: "100%",
            margin: "auto",
            boxSizing: "border-box",
            overflow: "hidden",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
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
      );
    case "csv":
      return (
        <Box
          sx={{
            backgroundColor: "green.200",
            height: "100%",
            margin: "auto",
            boxSizing: "border-box",
            overflow: "hidden",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
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
      );
    case "docx":
    case "doc":
    case "rtf":
      return (
        <Box
          sx={{
            backgroundColor: "blue.50",
            ...styledBox,
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
      );
    case "pdf":
      return (
        <Box
          sx={{
            backgroundColor: "blue.50",
            ...styledBox,
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
      );
    case "ppt":
    case "pptx":
    case "pptm":
      return (
        <Box
          sx={{
            backgroundColor: "red.50",
            ...styledBox,
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
      );
    case "aac":
    case "aiff":
    case "mid":
    case "mp3":
    case "wav":
      return (
        <Box
          sx={{
            backgroundColor: "purple.100",
            ...styledBox,
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
        <Box
          sx={{
            backgroundColor: "#000",
            ...styledBox,
          }}
        >
          <CardMedia
            component="video"
            controls={true}
            src={src}
            sx={{
              backgroundColor: "#000",
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              py: 1,
            }}
          />
        </Box>
      );
    case "iso":
    case "rar":
    case "tgz":
    case "zip":
      return (
        <Box
          sx={{
            backgroundColor: "grey.100",
            ...styledBox,
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
      );
    case "ai":
    case "bmp":
    case "eps":
    case "psd":
    case "tiff":
    case "tif":
      return (
        <Box
          sx={{
            backgroundColor: "grey.100",
            ...styledBox,
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
      );
    case "numbers":
      return (
        <Box
          sx={{
            backgroundColor: "green.100",
            ...styledBox,
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
      );
    case "No Extension":
      return (
        <Box
          sx={{
            backgroundColor: "red.50",
            ...styledBox,
          }}
        >
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
        </Box>
      );
    default:
      return (
        <Box
          sx={{
            backgroundColor: "grey.100",
            ...styledBox,
          }}
        >
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
        </Box>
      );
  }
};

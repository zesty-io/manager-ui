import { FC, useState } from "react";
import { fileExtension } from "../../utils/fileUtils";
import { Box, CardMedia } from "@mui/material";
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

interface Props {
  src: string;
  filename: string;
}

export const FileTypePreview: FC<Props> = ({ src, filename }) => {
  const theme = useTheme();
  const [imageOrientation, setImageOrientation] = useState<string>("");

  const styledCheckerBoard = {
    backgroundImage:
      fileExtension(filename) === "png" &&
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

  switch (fileExtension(filename)) {
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "svg":
    case "webp":
      return (
        <Box
          sx={{
            ...styledCheckerBoard,
            py: imageOrientation === "horizontal" && 1,
            px: imageOrientation === "vertical" && "auto",
            overflow: "hidden",
            backgroundColor: fileExtension(filename) !== "png" && "grey.100",
            position: "relative",
            width: "600px",
            height: "700px",
            backgroundSize: `25px 25px`,
            m: "auto",
            backgroundPosition: `0 0, 12.5px 0, 12.5px -12.5px, 0px 12.5px`,
          }}
        >
          <CardMedia
            component="img"
            data-src={src}
            image={src}
            loading="lazy"
            sx={{
              objectFit: "contain",
              overflow: "hidden",
              height: "100%",
              display: "table-cell",
              verticalAlign: "bottom",
              backgroundColor: fileExtension(filename) !== "png" && "grey.100",
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
            data-src={csvImg}
            image={csvImg}
            loading="lazy"
            sx={styledDocfileThumbnail}
          />
        </Box>
      );
    case "csv":
      return (
        <Box
          sx={{
            backgroundColor: "grey.100",
            ...styledBox,
          }}
        >
          <CardMedia
            component="img"
            data-src={src}
            image={src}
            loading="lazy"
            sx={{
              objectFit: "contain",
              overflow: "hidden",
              height: "100%",
              m: "auto",
            }}
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
    default:
      return (
        <Box
          sx={{
            backgroundColor: "grey.200",
            ...styledBox,
          }}
        >
          <CardMedia
            component="img"
            data-src={defaultImg}
            image={defaultImg}
            loading="lazy"
            sx={{
              objectFit: "contain",
              overflow: "hidden",
              height: "100%",
              m: "auto",
            }}
          />
        </Box>
      );
  }
};

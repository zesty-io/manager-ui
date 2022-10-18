import { Box } from "@mui/material";

const base = {
  px: 1,
  py: 0.4,
  borderRadius: "4px",
  textTransform: "uppercase",
  position: "absolute",
  bottom: "-26px",
  right: 0,
  transform: "translateY(-120%)",
  backgroundColor: "grey.200",
  color: "black.600",
};
const blue = {
  ...base,
  backgroundColor: "blue.100",
  color: "blue.600",
};
const green = {
  ...base,
  backgroundColor: "green.50",
  color: "green.600",
};
const red = {
  ...base,
  backgroundColor: "red.100",
  color: "red.600",
};
const purple = {
  ...base,
  backgroundColor: "purple.50",
  color: "purple.900",
};
const grey = {
  ...base,
  backgroundColor: "grey.50",
  color: "grey.900",
};

export function ThumbnailExtensionChip({ ext }: { ext: string }) {
  switch (ext) {
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "svg":
    case "webp":
    case "docx":
    case "doc":
    case "rtf":
      return <Box sx={blue}>{ext}</Box>;
    case "ots":
    case "xls":
    case "xlsx":
    case "csv":
    case "numbers":
      return <Box sx={green}>{ext}</Box>;
    case "pdf":
    case "ppt":
    case "pptx":
    case "pptm":
    case "No Extension":
      return <Box sx={red}>{ext}</Box>;
    case "aac":
    case "aiff":
    case "mid":
    case "mp3":
    case "wav":
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
      return <Box sx={purple}>{ext}</Box>;
    case "iso":
    case "rar":
    case "tgz":
    case "zip":
    case "ai":
    case "bmp":
    case "eps":
    case "psd":
    case "tiff":
    case "tif":
      return <Box sx={grey}>{ext}</Box>;
    default:
      return <Box sx={base}>{ext}</Box>;
  }
}

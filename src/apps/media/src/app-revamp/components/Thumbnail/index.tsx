import { FC } from "react";
import {
  CardMedia,
  Card,
  TextField,
  Box,
  Typography,
  CardContent,
} from "@mui/material";
import { fileExtension } from "./FileUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile } from "@fortawesome/free-solid-svg-icons";
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
  const CardStyle = {
    maxWidth: "100%",
    maxHeight: "100%",
    borderWidth: "1px",
    borderColor: "grey.100",
    borderStyle: "solid",
    cursor: onClick ? "pointer" : "default",
  };

  const CardContentStyle = {
    px: 1,
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  };

  const ImageBadgeStyle = {
    px: 1,
    py: 0.4,
    backgroundColor: "blue.100",
    color: "blue.600",
    borderRadius: "4px",
    textTransform: "uppercase",
    position: "absolute",
    right: 15,
    transform: "translateY(-120%)",
  };

  const Filename = () => {
    return (
      <>
        {isEditable ? (
          <TextField
            value={filename}
            size="small"
            variant="outlined"
            color="primary"
            InputProps={{ sx: { flex: 1 } }}
            fullWidth
            onChange={(e) => onFilenameChange(e.target.value)}
          />
        ) : (
          <Typography variant="caption">{filename}</Typography>
        )}
      </>
    );
  };

  switch (fileExtension(filename)) {
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "svg":
    case "webp":
      return (
        <Card sx={CardStyle} elevation={0} onClick={onClick}>
          <CardMedia
            component="img"
            data-src={src}
            image={src}
            loading="lazy"
            sx={{
              objectFit: "fit",
              display: "table-cell",
              verticalAlign: "bottom",
            }}
          />
          <Box sx={ImageBadgeStyle}>{fileExtension(filename)}</Box>
          <CardContent sx={CardContentStyle}>
            <Filename />
          </CardContent>
        </Card>
      );
    default:
      return (
        <Card sx={CardStyle} elevation={0} onClick={onClick}>
          <FontAwesomeIcon icon={faFile} />
          <CardContent sx={CardContentStyle}>
            <Filename />
          </CardContent>
        </Card>
      );
  }
};

Thumbnail.defaultProps = {
  isEditable: false,
};

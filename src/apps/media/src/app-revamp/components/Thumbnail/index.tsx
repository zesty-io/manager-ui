import { FC } from "react";
import { CardMedia, Card, Typography, CardContent } from "@mui/material";
import { fileExtension } from "../../utils/FileUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile } from "@fortawesome/free-solid-svg-icons";

interface ThumbnailProps {
  src?: string;
  file: any;
  width?: number;
  height?: number;
}

export const Thumbnail: FC<ThumbnailProps> = ({ src, file, width, height }) => {
  const CardStyle = {
    maxWidth: width,
    maxHeight: height,
    borderWidth: "1px",
    borderColor: "grey.100",
    borderStyle: "solid",
  };

  const CardContentStyle = {
    px: 1,
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  };

  switch (fileExtension(file.url)) {
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "svg":
    case "webp":
      return (
        <Card sx={CardStyle} elevation={0}>
          <CardMedia
            component="img"
            data-src={src}
            image={src}
            loading="lazy"
            sx={{
              objectFit: "fit",
            }}
          />
          <CardContent sx={CardContentStyle}>
            <Typography variant="caption">{file.url}</Typography>
          </CardContent>
        </Card>
      );
    default:
      return (
        <Card sx={CardStyle} elevation={0}>
          <FontAwesomeIcon icon={faFile} />
          <CardContent sx={CardContentStyle}>
            <Typography variant="caption">{file.url}</Typography>
          </CardContent>
        </Card>
      );
  }
};

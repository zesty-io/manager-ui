import { CardMedia } from "@mui/material";
import { Box } from "@mui/material";
import { IntegrationTypes } from "../../../services/types";
import AddPhotoAlternateRoundedIcon from "@mui/icons-material/AddPhotoAlternateRounded";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import VideoCallRoundedIcon from "@mui/icons-material/VideoCallRounded";
import { useState } from "react";

const MediaThumbnail = ({
  url,
  type,
  isPreview = false,
  showPlayIcon = false,
}: {
  url: string;
  type: IntegrationTypes;
  isPreview?: boolean;
  showPlayIcon?: boolean;
}) => {
  const isVideo = ["video", "mux", "youtube"].includes(type);
  const [imageSourceError, setImageSourceError] = useState(false);

  const mediaIcon =
    showPlayIcon && isVideo ? (
      <PlayCircleIcon
        className="media-thumbnail-icon"
        fontSize="large"
        sx={{ color: "common.white" }}
      />
    ) : type === "image" ? (
      <AddPhotoAlternateRoundedIcon
        className="media-thumbnail-icon"
        sx={{ color: "grey.400" }}
      />
    ) : (
      <VideoCallRoundedIcon
        className="media-thumbnail-icon"
        sx={{ color: "grey.400" }}
      />
    );

  return (
    <Box
      className="media-thumbnail"
      height="80px"
      bgcolor="grey.100"
      width={isVideo ? "142px" : "80px"}
      sx={{
        overflow: "hidden",
        boxSizing: "border-box",
        position: "relative",
        display: "flex",
        placeContent: "center",
        alignItems: "center",
        "& .media-thumbnail-icon": {
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        },
      }}
    >
      {!!url && !imageSourceError && (
        <Box
          component="img"
          src={url}
          loading="lazy"
          sx={{
            height: "100%",
            backgroundRepeat: "no-repeat",
          }}
          onError={() => setImageSourceError(true)}
        />
      )}
      {(!url || !!imageSourceError || (!!showPlayIcon && !!isVideo)) &&
        mediaIcon}
    </Box>
  );
};

export default MediaThumbnail;

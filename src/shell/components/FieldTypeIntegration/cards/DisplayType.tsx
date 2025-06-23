import { useState, FC } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CardActionArea from "@mui/material/CardActionArea";
import DragIndicatorRoundedIcon from "@mui/icons-material/DragIndicatorRounded";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { IconButton } from "@zesty-io/material";
import { CardMedia, Avatar } from "@mui/material";
import { IntegrationTypes, IntegrationDisplay } from "../configs";

import moment from "moment-timezone";
import { getObjectValue } from "../utils";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import AddPhotoAlternateRoundedIcon from "@mui/icons-material/AddPhotoAlternateRounded";
import VideoCallRoundedIcon from "@mui/icons-material/VideoCallRounded";

const VIDEO_CONFIG = {
  type: "video",
  aspectRatio: "16/9",
  icon: PlayCircleIcon,
  defaultSource: "/images/media-sample-image.png",
};
const IMAGE_CONFIG = {
  type: "image",
  aspectRatio: "1/1",
  icon: AddPhotoAlternateRoundedIcon,
};

const MEDIA_PREVIEW_CONFIG = {
  image: {
    type: "image",
    aspectRatio: "1/1",
    icon: AddPhotoAlternateRoundedIcon,
    defaultSource: "/images/media-sample-image.png",
  },
  video: {
    type: "video",
    aspectRatio: "16/9",
    icon: PlayCircleIcon,
    defaultSurce: "/images/${type}Icon.svg",
  },
};

type DetailsProps = Record<string, string | number>;

const Details = ({ paths, data }: { paths: string[]; data: any }) => {
  if (!paths?.length) return null;
  return (
    <Box
      width="100%"
      display="flex"
      flexDirection="column"
      justifyContent="flex-start"
      alignItems="space-between"
    >
      {paths.map((path, i) => {
        const itemValue = getObjectValue(data, path);
        return (
          <Box
            key={i}
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            width="100%"
            overflow="hidden"
            whiteSpace="nowrap"
          >
            <Typography
              variant="body2"
              color="text.primary"
              flexGrow={1}
              flexShrink={1}
              textOverflow="ellipsis"
              overflow="hidden"
              noWrap
              maxWidth="60%"
            >
              {path || `+ Add Detail`}
            </Typography>
            {!!itemValue && (
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="right"
                textOverflow="ellipsis"
                overflow="hidden"
                noWrap
                maxWidth="40%"
                flexGrow={0}
                flexShrink={0}
              >
                {itemValue}
              </Typography>
            )}
          </Box>
        );
      })}
    </Box>
  );
};
const DisplayType: FC<IntegrationDisplay> = ({
  ZUID,
  type,
  heading = "Add Heading",
  subHeading = "Add Sub-heading",
  preview,
  detail = "Add Detail",
  details,
  data,
}) => {
  const [selectedCard, setSelectedCard] = useState(0);

  const withCardMedia = [
    "image",
    "video",
    "shopify",
    "youtube",
    "mux",
  ].includes(type);

  const withsourceIcon = ["shopify", "youtube", "mux", "classy"].includes(type);

  const mediaIcon =
    type === "image" ? AddPhotoAlternateRoundedIcon : VideoCallRoundedIcon;

  return (
    <Grid container width="100%" height="100%">
      <Grid
        width="142px"
        height="100%"
        position="relative"
        boxSizing="border-box"
      >
        <Box
          sx={{
            height: "100%",
            width: "100%",
            boxSizing: "border-box",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <CardMedia
            component="img"
            height="100%"
            width="100%"
            sx={{
              position: "relative",
              borderRadius: 2,
              flexGrow: 0,
              bgcolor: "grey.100",
            }}
            image="/images/media-sample-image.png"
            alt="Live from space album cover"
          />
          <PlayCircleIcon
            fontSize="large"
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 2,
              color: "common.white",
            }}
          />
        </Box>
      </Grid>
      <Grid size="grow" height="100%">
        <Stack
          spacing="4px"
          direction="column"
          justifyContent="center"
          width="100%"
          height="100%"
          p={2}
        >
          <Typography
            variant="body2"
            fontWeight={700}
            color="text.primary"
            noWrap
            textOverflow="ellipsis"
            width="100%"
          >
            Chugging through Sri Lanka's tea plantations Chugging through Sri
            Lanka's tea plantations Chugging through Sri Lanka's tea plantations
          </Typography>
          <Typography
            variant="body2"
            fontWeight={400}
            color="text.secondary"
            noWrap
            textOverflow="ellipsis"
            width="100%"
          >
            13:10 • 1 month ago Chugging through Sri Lanka's tea plantations
            Chugging through Sri Lanka's tea plantations
          </Typography>
        </Stack>
      </Grid>
      {!!withsourceIcon && (
        <Grid
          size={1}
          height="100%"
          sx={{
            height: "100%",
            display: "grid",
            placeContent: "center",
          }}
        >
          <Avatar
            src={`/images/${type}Icon.svg`}
            variant="square"
            sizes="small"
            sx={{
              width: "32px",
              height: "auto",
              objectFit: "contain",
            }}
          />
        </Grid>
      )}
    </Grid>
  );
};

export default DisplayType;

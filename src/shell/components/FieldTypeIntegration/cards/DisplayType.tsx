import { useState, FC, useEffect } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CardActionArea from "@mui/material/CardActionArea";
import DragIndicatorRoundedIcon from "@mui/icons-material/DragIndicatorRounded";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { IconButton } from "@zesty-io/material";
import { CardMedia, Avatar } from "@mui/material";
import { IntegrationDisplay } from "../configs";

import moment from "moment-timezone";
import { getObjectValue } from "../utils";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import AddPhotoAlternateRoundedIcon from "@mui/icons-material/AddPhotoAlternateRounded";
import VideoCallRoundedIcon from "@mui/icons-material/VideoCallRounded";
import {
  IntegrationPropertyPaths,
  IntegrationFieldTypes,
} from "../../../services/types";

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

export const MEDIA_TYPE_MAP = {
  youtube: "video",
  mux: "video",
  classy: "image",
  image: "image",
  video: "video",
} as const;

type DetailsProps = {
  items: {
    label: string;
    path: string;
  }[];
  data: any[];
};

const Details: FC<DetailsProps> = ({ items, data }) => {
  console.debug("Details:", { items, data });
  if (!items?.length) return null;
  return (
    <Box
      width="100%"
      display="flex"
      flexDirection="column"
      justifyContent="flex-start"
      alignItems="space-between"
    >
      {items.map((item, i) => {
        const itemValue = getObjectValue(data, item?.path);
        console.debug("itemValue", { itemValue, item });
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
              maxWidth="70%"
            >
              {item?.label || `+ Add Detail`}
            </Typography>
            {!!itemValue && (
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="right"
                textOverflow="ellipsis"
                overflow="hidden"
                noWrap
                maxWidth="30%"
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

const MediaThumbnail = ({
  url,
  type,
  isPreview = false,
}: {
  url: string;
  type: IntegrationFieldTypes;
  isPreview?: boolean;
}) => {
  const [noImage, setNoImage] = useState(false);
  const isVideo = ["video", "mux", "youtube"].includes(type);
  const mediaIcon =
    type === "image"
      ? AddPhotoAlternateRoundedIcon
      : isPreview
      ? VideoCallRoundedIcon
      : PlayCircleIcon;

  const handleUrlError = () => {
    console.debug("MediaThumbnail: url error");
  };

  return (
    <Box
      height="80px"
      boxSizing="border-box"
      position="relative"
      bgcolor="grey.50"
      width={isVideo ? "142px" : "80px"}
      sx={{
        display: "grid",
        placeContent: "center",
      }}
    >
      {/* {!!isPreview ? (
      <Box
        component={mediaIcon}
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 0,
          color: "grey.400",
          "& svg": {
            fontSize: "small",
            fill: "grey.400",
          },
        }}
      />

    ) : (
      <CardMedia
        component="img"
        image={url}
        sx={{
          flexGrow: 0,
          // height: "100%",
          // width: "100%",
          minHeight: "100%",
          minWidth: "100%",
          objectFit: "contain",
        }}
      />
    )} */}

      {!noImage && (
        <CardMedia
          component={"img"}
          image={url}
          sx={{
            objectFit: "contain",
            bgcolor: "transparent",
            ...(isVideo
              ? { minHeight: "100%", minWidth: "100%" }
              : { height: "100%", width: "100%" }),
          }}
          loading="lazy"
          onError={() => setNoImage(true)}
        />
      )}
      {(!!isPreview && !!noImage) ||
        (!url && (
          <Box
            component={mediaIcon}
            sx={{
              zIndex: 0,
              color: "grey.400",
              "& svg": {
                fontSize: "small",
                fill: "grey.400",
              },
            }}
          />
        ))}
    </Box>
  );
};

const DisplayType: FC<
  IntegrationPropertyPaths & {
    type: IntegrationFieldTypes;
    isPreview?: boolean;
    data?: any[];
  }
> = ({
  type,
  rootPath,
  heading = "Add Heading",
  subHeading = "Add Sub-heading",
  thumbnail,
  detail = "Add Detail",
  details,
  isPreview = false,
  data = [],
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

  const mediaType =
    withCardMedia && type in MEDIA_TYPE_MAP
      ? MEDIA_TYPE_MAP[type as keyof typeof MEDIA_TYPE_MAP]
      : "image";

  const isVideo = mediaType === "video";

  console.debug("type", {
    type,
    heading,
    subHeading,
    thumbnail,
    rootPath,
    details,
    data,
    withCardMedia,
  });

  return (
    <Grid container width="100%" height="100%">
      {!!withCardMedia && (
        <Grid
          width={isVideo ? "142px" : "80px"}
          height="100%"
          position="relative"
          boxSizing="border-box"
        >
          <MediaThumbnail
            type={mediaType}
            url={thumbnail}
            isPreview={isPreview}
          />
        </Grid>
      )}
      <Grid size="grow" height="100%">
        <Stack
          spacing="4px"
          direction="column"
          justifyContent="center"
          width="100%"
          height="100%"
          p={2}
          position="relative"
        >
          <Stack direction="row" justifyContent="space-between" width="100%">
            <Typography
              variant="body2"
              fontWeight={700}
              color="text.primary"
              noWrap
              textOverflow="ellipsis"
              flexGrow={1}
            >
              {heading || "Add Heading"}
            </Typography>
            {type === "shopify" && (
              <Typography
                variant="body2"
                fontWeight={400}
                color="text.secondary"
                noWrap
                textOverflow="ellipsis"
                flexGrow={0}
              >
                {detail || "Add Detail"}
              </Typography>
            )}
          </Stack>
          {type === "simple" ? null : type === "details" ? (
            <Details items={details} data={data} />
          ) : (
            <Typography
              variant="body2"
              fontWeight={400}
              color="text.secondary"
              noWrap
              textOverflow="ellipsis"
              width="100%"
            >
              {subHeading || "Add Sub-heading"}
            </Typography>
          )}
        </Stack>
      </Grid>
      {!!withsourceIcon && (
        <Grid
          width="40px"
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

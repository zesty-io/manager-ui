import { FC, useState } from "react";
import Typography from "@mui/material/Typography";
import { Avatar, Box } from "@mui/material";

import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import { IntegrationKeyPaths, IntegrationTypes } from "../../../services/types";
import { getKeyValue } from "../utils";
import Skeleton from "@mui/material/Skeleton";

import AddPhotoAlternateRoundedIcon from "@mui/icons-material/AddPhotoAlternateRounded";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import VideoCallRoundedIcon from "@mui/icons-material/VideoCallRounded";

export const MEDIA_TYPE_MAP = {
  youtube: "video",
  mux: "video",
  classy: "image",
  image: "image",
  video: "video",
} as const;

type DetailsProps = {
  subHeading?: string;
  data?: any[];
  listItems?: string[];
  loading: boolean;
  type: IntegrationTypes;
};

const Details = ({
  subHeading,
  data,
  listItems,
  loading = false,
  type = "details",
}: DetailsProps) => {
  if (loading) return <DetailsSkeleton type={type} />;
  if (type === "simple") return null;
  if (type !== "details") {
    return (
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
    );
  }
  if (!listItems?.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        + Add Detail
      </Typography>
    );
  }
  return (
    <Box
      width="100%"
      display="flex"
      flexDirection="column"
      justifyContent="flex-start"
      alignItems="space-between"
    >
      {listItems.map((item, i) => {
        const itemValue = getKeyValue(data, item);

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
              {item || `+ Add Detail`}
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

const DisplayCard: FC<
  IntegrationKeyPaths & {
    type: IntegrationTypes;
    data?: any[];
    showPlayIcon?: boolean;
    loading?: boolean;
    isDraggable?: boolean;
  }
> = ({
  type,
  heading = "Add Heading",
  subHeading = "Add Sub-heading",
  thumbnail,
  detail = "Add Detail",
  details,
  data = [],
  showPlayIcon = false,
  loading = false,
  isDraggable = false,
}) => {
  const [imageSourceError, setImageSourceError] = useState(false);
  const withCardMedia = [
    "image",
    "video",
    "shopify",
    "youtube",
    "mux",
  ].includes(type);

  const withSourceIcon = ["shopify", "youtube", "mux", "classy"].includes(type);

  const mediaType =
    withCardMedia && type in MEDIA_TYPE_MAP
      ? MEDIA_TYPE_MAP[type as keyof typeof MEDIA_TYPE_MAP]
      : "image";

  const isVideo = ["video", "mux", "youtube"].includes(mediaType);

  let mediaIcon;

  if (showPlayIcon && isVideo) {
    mediaIcon = (
      <PlayCircleIcon fontSize="large" sx={{ color: "common.white" }} />
    );
  } else if (type === "image") {
    mediaIcon = <AddPhotoAlternateRoundedIcon sx={{ color: "grey.400" }} />;
  } else {
    mediaIcon = <VideoCallRoundedIcon sx={{ color: "grey.400" }} />;
  }

  return (
    <Grid
      container
      width="100%"
      height="100%"
      alignItems="center"
      sx={{ pr: 2 }}
    >
      {!!withCardMedia && (
        <Grid
          width={isVideo ? "142px" : "80px"}
          height="100%"
          position="relative"
          boxSizing="border-box"
        >
          {loading ? (
            <Skeleton
              animation="wave"
              variant={isDraggable ? "rectangular" : "rounded"}
              height="80px"
              width="100%"
            />
          ) : (
            <Box
              className="media-thumbnail"
              height="80px"
              bgcolor="grey.100"
              width="100%"
              sx={{
                overflow: "hidden",
                boxSizing: "border-box",
                position: "relative",
                display: "flex",
                placeContent: "center",
                alignItems: "center",
              }}
            >
              {!!thumbnail && !imageSourceError && (
                <Box
                  component="img"
                  src={thumbnail}
                  loading="lazy"
                  sx={{
                    height: "100%",
                    backgroundRepeat: "no-repeat",
                  }}
                  onError={() => setImageSourceError(true)}
                />
              )}

              <Box
                sx={{
                  height: "100%",
                  width: "100%",
                  position: "absolute",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {(!thumbnail ||
                  !!imageSourceError ||
                  (!!showPlayIcon && !!isVideo)) &&
                  mediaIcon}
              </Box>
            </Box>
          )}
        </Grid>
      )}
      <Grid size="grow" height="100%">
        <Stack
          spacing="4px"
          direction="column"
          justifyContent="center"
          width="100%"
          height="100%"
          px={2}
          py={1.75}
          position="relative"
        >
          <Stack direction="row" justifyContent="space-between" width="100%">
            {loading ? (
              <Skeleton animation="wave" height="26px" width="50%" />
            ) : (
              <>
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
              </>
            )}
          </Stack>
          <Details
            subHeading={subHeading}
            listItems={details}
            data={data}
            loading={loading}
            type={type}
          />
        </Stack>
      </Grid>
      {!!withSourceIcon && (
        <Grid
          width="40px"
          sx={{
            display: "grid",
            placeContent: "center",
          }}
        >
          {loading ? (
            <Skeleton
              variant="rounded"
              animation="wave"
              height="32px"
              width="32px"
            />
          ) : (
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
          )}
        </Grid>
      )}
    </Grid>
  );
};

export const DetailsSkeleton = ({ type }: { type: IntegrationTypes }) => {
  if (type !== "details") {
    return <Skeleton animation="wave" height="20px" width="90%" />;
  }

  return (
    <>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        my={0.5}
      >
        <Skeleton
          variant="rounded"
          animation="wave"
          height="10px"
          width="75%"
        />
        <Skeleton
          variant="rounded"
          animation="wave"
          height="10px"
          width="50px"
        />
      </Stack>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        my={0.5}
      >
        <Skeleton
          variant="rounded"
          animation="wave"
          height="10px"
          width="75%"
        />
        <Skeleton
          variant="rounded"
          animation="wave"
          height="10px"
          width="50px"
        />
      </Stack>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        my={0.5}
      >
        <Skeleton
          variant="rounded"
          animation="wave"
          height="10px"
          width="75%"
        />
        <Skeleton
          variant="rounded"
          animation="wave"
          height="10px"
          width="50px"
        />
      </Stack>
    </>
  );
};

export default DisplayCard;

import { useState, FC } from "react";
import Typography from "@mui/material/Typography";
import { Avatar } from "@mui/material";

import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import { IntegrationKeyPaths, IntegrationTypes } from "../../../services/types";
import MediaThumbnail from "./MediaThumbnail";
import Details from "./Details";
import Skeleton from "@mui/material/Skeleton";

export const MEDIA_TYPE_MAP = {
  youtube: "video",
  mux: "video",
  classy: "image",
  image: "image",
  video: "video",
} as const;

const DisplayCard: FC<
  IntegrationKeyPaths & {
    type: IntegrationTypes;
    data?: any[];
    showPlayIcon?: boolean;
    loading?: boolean;
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
}) => {
  const withCardMedia = [
    "image",
    "video",
    "shopify",
    "youtube",
    "mux",
  ].includes(type);

  const withsourceIcon = ["shopify", "youtube", "mux", "classy"].includes(type);

  const mediaType =
    withCardMedia && type in MEDIA_TYPE_MAP
      ? MEDIA_TYPE_MAP[type as keyof typeof MEDIA_TYPE_MAP]
      : "image";

  const isVideo = mediaType === "video";

  return (
    <Grid container width="100%" height="100%" alignItems="center">
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
              variant="rounded"
              height="80px"
              width="100%"
            />
          ) : (
            <MediaThumbnail
              type={mediaType}
              url={thumbnail}
              showPlayIcon={showPlayIcon}
            />
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
          py={1.5}
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

          {type === "simple" ? null : type === "details" ? (
            <Details listItems={details} data={data} loading={loading} />
          ) : loading ? (
            <Skeleton animation="wave" height="20px" width="90%" />
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

export default DisplayCard;

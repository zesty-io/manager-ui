import { useState } from "react";
import {
  Avatar,
  Box,
  Card,
  CardMedia,
  Skeleton,
  Typography,
} from "@mui/material";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import AddPhotoAlternateRoundedIcon from "@mui/icons-material/AddPhotoAlternateRounded";
import VideoCallRoundedIcon from "@mui/icons-material/VideoCallRounded";
import { IntegrationTypes } from "../../../services/types";
import { useTranslation } from "react-i18next";
import { validateUrl } from "utility/validateUrl";

export type DisplayCardProps = {
  type: IntegrationTypes;
  heading: string | undefined;
  subHeading?: string | undefined;
  thumbnail?: string | undefined;
  rootPath?: string | undefined;
  detail?: string | undefined;
  details?: Record<string, unknown>[];
  mediaVariant?: "rounded" | "square";
  showPlayIcon?: boolean;
  showPlaceholders?: boolean;
  loading?: boolean;
};

function renderValue(value: unknown): string {
  if (value === undefined) return "";
  if (Array.isArray(value)) {
    return `[${value.map((v) => renderValue(v)).join(", ")}]`;
  }
  if (typeof value === "object" && value !== null) {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

const DisplayCard = ({
  type,
  heading,
  subHeading,
  thumbnail,
  detail,
  details = [],
  mediaVariant = "square",
  showPlayIcon = false,
  showPlaceholders = false,
  loading,
}: DisplayCardProps) => {
  const { t } = useTranslation();
  const [mediaError, setMediaError] = useState(false);
  const isVideoType = ["video", "youtube", "mux"].includes(type);
  const isSpecialType = ["shopify", "youtube", "mux", "classy"].includes(type);
  const withCardMedia = !["classy", "text", "simple", "details"].includes(type);

  const headingValue = loading ? (
    <Skeleton width={type === "simple" ? "90%" : "55%"} height="26px" />
  ) : (
    renderValue(heading)
  );
  const subHeadingValue = loading ? (
    <Skeleton width="90%" />
  ) : (
    renderValue(subHeading)
  );
  const thumbnailValue =
    typeof thumbnail === "string" && validateUrl(thumbnail) ? thumbnail : null;
  const detailValue = loading ? <Skeleton width="70px" /> : renderValue(detail);

  const noImage = !thumbnailValue || mediaError;

  const renderIcon = () => {
    if (noImage) {
      return isVideoType ? (
        <VideoCallRoundedIcon sx={{ color: "action.active" }} />
      ) : (
        <AddPhotoAlternateRoundedIcon
          fontSize="small"
          sx={{ color: "action.active" }}
        />
      );
    }

    if (showPlayIcon && isVideoType) {
      return <PlayCircleIcon fontSize="large" sx={{ color: "common.white" }} />;
    }

    return null;
  };

  const renderCard = () => {
    if (type === "simple") {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
            width: "100%",
            px: 1.5,
            py: 2,
            rowGap: 0.5,
          }}
        >
          <Typography
            variant="body2"
            width="100%"
            sx={{ fontWeight: 600, color: "text.primary" }}
          >
            {headingValue}
          </Typography>
        </Box>
      );
    }

    if (type === "details") {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            width: "100%",
            px: 1.5,
            py: 1.5,
            rowGap: 0.25,
          }}
        >
          <Typography
            variant="body1"
            color="text.primary"
            width="100%"
            fontWeight={700}
          >
            {headingValue}
          </Typography>

          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="flex-start"
            sx={{ width: "100%" }}
          >
            {details?.map((item: Record<string, unknown>, index: number) => {
              const itemKey =
                showPlaceholders && !item?.key
                  ? t("shell.integrationAddDetailWithPlus")
                  : item?.key;
              const itemValue =
                showPlaceholders && !item?.key ? "" : renderValue(item?.value);
              return (
                <Box
                  width="100%"
                  display="flex"
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                  key={`${item?.key}-${index}`}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontWeight={400}
                    flexGrow={1}
                  >
                    {loading ? <Skeleton sx={{ width: "95%" }} /> : itemKey}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontWeight={400}
                  >
                    {loading ? (
                      <Skeleton
                        sx={{
                          width: "100px",
                          height: "16px",
                        }}
                      />
                    ) : (
                      itemValue
                    )}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      );
    }

    return (
      <>
        {withCardMedia && (
          <Box
            sx={{
              borderRadius: mediaVariant === "rounded" ? 2 : 0,
              height: "80px",
              width: isVideoType ? "142px" : "80px",
              maxHeight: "80px",
              position: "relative",
              bgcolor: "#F2F4F7",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden",
              flexShrink: 0,
              "& .MuiSvgIcon-root": {
                position: "absolute",
              },
            }}
          >
            {loading ? (
              <Skeleton variant="rectangular" width="100%" height="100%" />
            ) : (
              <>
                {!!thumbnailValue && (
                  <CardMedia
                    loading="lazy"
                    component="img"
                    sx={{
                      width: "auto",
                      height: "100%",
                      display: noImage ? "none" : "block",
                    }}
                    image={thumbnailValue}
                    onError={() => setMediaError(true)}
                    onLoad={() => setMediaError(false)}
                  />
                )}

                {renderIcon()}
              </>
            )}
          </Box>
        )}
        <Box
          sx={{
            py: 2,
            px: 1.5,
            flex: "1 0 auto",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            rowGap: 0.25,
            flexShrink: 1,
            flexGrow: 1,
            overflow: "hidden",
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            width="100%"
            overflow="hidden"
            whiteSpace="no-wrap"
            columnGap={3}
          >
            <Typography
              variant="body2"
              noWrap
              width="100%"
              sx={{ fontWeight: 600 }}
            >
              {headingValue}
            </Typography>
            {type === "shopify" && (
              <Typography
                variant="body2"
                noWrap
                width="100px"
                sx={{
                  fontWeight: 400,
                  direction: "rtl",
                }}
              >
                {detailValue}
              </Typography>
            )}
          </Box>

          <Typography
            variant="body2"
            noWrap
            width="100%"
            sx={{ fontWeight: 400, color: "text.secondary" }}
          >
            {subHeadingValue}
          </Typography>
        </Box>
        {isSpecialType && (
          <Box
            width="32px"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              flexShrink: 0,
            }}
          >
            {loading ? (
              <Skeleton
                animation="wave"
                variant="rounded"
                width="30px"
                height="30px"
              />
            ) : (
              <Avatar
                variant="rounded"
                src={`/images/${type}Icon.svg`}
                sx={{ width: "100%", height: "auto" }}
              >
                {type.substring(0, 1).toUpperCase()}
              </Avatar>
            )}
          </Box>
        )}
      </>
    );
  };

  return (
    <Card
      className="displayCard"
      elevation={0}
      sx={{
        p: 0,
        columnGap: 0,
        borderRadius: 0,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "stretch",
        width: "100%",
        position: "relative",
        boxSizing: "border-box",
        bgcolor: "transparent",
      }}
    >
      {renderCard()}
    </Card>
  );
};

export default DisplayCard;

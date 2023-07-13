import { Box, SvgIcon, Typography, Skeleton } from "@mui/material";
import { useHistory } from "react-router";
import {
  InboxRounded,
  LanguageRounded,
  SearchRounded,
  Instagram,
  Facebook,
  Twitter,
  YouTube,
  OpenInNewRounded,
  WarningRounded,
} from "@mui/icons-material";
import moment from "moment-timezone";
import {
  useGetAllPublishingsQuery,
  useGetContentModelQuery,
  useSearchContentQuery,
} from "../../../../../../../../../shell/services/instance";
import { useGetUsersQuery } from "../../../../../../../../../shell/services/accounts";
import { startCase } from "lodash";
import { useState } from "react";

const SOURCE_DETAIL_MAP = {
  "(direct)": {
    color: "info.dark",
    bgcolor: "blue.100",
    icon: InboxRounded,
  },
  google: {
    color: "error.dark",
    bgcolor: "red.100",
    icon: SearchRounded,
  },
  bing: {
    color: "error.dark",
    bgcolor: "red.100",
    icon: SearchRounded,
  },
  instagram: {
    color: "#6727BB",
    bgcolor: "#EBE9FE",
    icon: Instagram,
  },
  facebook: {
    color: "#1574EA",
    bgcolor: "#E0F2FE",
    icon: Facebook,
  },
  twitter: {
    color: "#1DA0F0",
    bgcolor: "#E0F2FE",
    icon: Twitter,
  },
  youtube: {
    color: "#FE0000",
    bgcolor: "#FEE4E2",
    icon: YouTube,
  },
} as const;

export const NameCell = ({
  path,
  screenPageViews,
  topSource,
  topSourceValue,
  externalLink,
}: {
  path?: string;
  screenPageViews?: number;
  topSource: keyof typeof SOURCE_DETAIL_MAP;
  topSourceValue: number;
  externalLink?: string;
}) => {
  const history = useHistory();
  const { data: item, isFetching: isItemFetching } = useSearchContentQuery({
    query: path,
    limit: 1,
  });
  const foundItem = item?.[0]?.web?.path === path ? item?.[0] : null;
  const { data: publishings, isFetching: isPublishingFetching } =
    useGetAllPublishingsQuery();
  const foundPublishing = publishings?.find(
    (publishing) => publishing.itemZUID === foundItem?.meta?.ZUID
  );
  const { data: users, isFetching: isUsersFetching } = useGetUsersQuery();
  const foundUser = users?.find(
    (user) => user.ZUID === foundPublishing?.publishedByUserZUID
  );
  const { data: model, isFetching: isModelsFetching } = useGetContentModelQuery(
    foundItem?.meta?.contentModelZUID,
    {
      skip: !foundItem?.meta?.contentModelZUID,
    }
  );

  const isFetching =
    isItemFetching ||
    isPublishingFetching ||
    isUsersFetching ||
    isModelsFetching;

  const getImage = () => {
    const ogImage = Object.keys(foundItem?.data)?.find(
      (value) =>
        value === "ogimage" ||
        value === "ogImage" ||
        value === "og_image" ||
        value === "og:image"
    );
    if (ogImage) {
      return foundItem?.data?.[ogImage];
    } else {
      return Object.values(foundItem?.data)?.find(
        (value) => typeof value === "string" && value.startsWith("3-")
      );
    }
  };

  if (isFetching || !path) {
    return (
      <Box
        display="flex"
        height="40px"
        width="100%"
        alignItems="center"
        gap={1}
      >
        <Skeleton
          variant="rectangular"
          width="40px"
          height="40px"
          sx={{ minWidth: "40px" }}
        />
        <Box width="100%">
          <Skeleton
            variant="rectangular"
            width="100%"
            height="12px"
            sx={{
              bgcolor: "grey.200",
              mb: 1,
            }}
          />
          <Skeleton variant="rectangular" width="80%" height="12px" />
        </Box>
      </Box>
    );
  } else {
    return (
      <Box
        display="flex"
        height="40px"
        width="100%"
        alignItems="center"
        gap={1}
        onClick={() => {
          if (foundItem) {
            history.push(
              `/content/${foundItem?.meta?.contentModelZUID}/${foundItem?.meta?.ZUID}`
            );
          } else {
            window.open(externalLink);
          }
        }}
      >
        <Box height="40px" width="40px" bgcolor="info.main" borderRadius="4px">
          {Object.values(foundItem?.data || {})?.some(
            (value) => typeof value === "string" && value.startsWith("3-")
          ) && (
            <img
              width="100%"
              height="100%"
              style={{
                objectFit: "cover",
                minWidth: "40px",
                borderRadius: "4px",
              }}
              src={`${
                // @ts-ignore
                CONFIG.SERVICE_MEDIA_RESOLVER
              }/resolve/${getImage()}/getimage/?w=${200}&h=${200}&type=fit`}
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          )}
        </Box>
        <Box>
          <Box display="flex" gap={0.5} alignItems="center">
            <Typography
              variant="body2"
              fontWeight={600}
              mb={0.25}
              noWrap
              maxWidth="420px"
            >
              {foundItem?.web?.metaTitle ||
                foundItem?.web?.metaLinkText ||
                path}
            </Typography>
            <OpenInNewRounded
              onClick={(e) => {
                e.stopPropagation();
                window.open(externalLink);
              }}
              color="action"
              sx={{
                width: "16px",
                height: "16px",
              }}
            />
          </Box>
          {foundItem ? (
            <Box display="flex" gap={1.5}>
              <Typography
                variant="body3"
                fontWeight={600}
                color="text.secondary"
              >
                {moment(foundPublishing?.publishAt).format("MMM D")}
              </Typography>
              <Typography
                variant="body3"
                fontWeight={600}
                color="text.secondary"
              >
                {foundUser
                  ? `${foundUser.firstName} ${foundUser.lastName}`
                  : "Unknown User"}
              </Typography>
              <Typography
                variant="body3"
                fontWeight={600}
                color="text.secondary"
              >
                {model?.label}
              </Typography>
              {topSource && (
                <Box display="flex" alignItems="center">
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={0.25}
                    px={0.5}
                    py={0.25}
                    bgcolor={
                      SOURCE_DETAIL_MAP[topSource]?.bgcolor || "yellow.50"
                    }
                    sx={{
                      borderRadius: "4px 0 0 4px",
                    }}
                  >
                    <SvgIcon
                      component={
                        SOURCE_DETAIL_MAP[topSource]?.icon || LanguageRounded
                      }
                      sx={{
                        width: "8px",
                        height: "8px",
                        color:
                          SOURCE_DETAIL_MAP[topSource]?.color || "warning.main",
                      }}
                    />
                    <Typography
                      fontSize="10px"
                      fontWeight={600}
                      lineHeight="12px"
                      color={
                        SOURCE_DETAIL_MAP[topSource]?.color || "warning.main"
                      }
                    >
                      {startCase(topSource)}
                    </Typography>
                  </Box>
                  <Box
                    px={0.5}
                    py={0.25}
                    bgcolor={
                      SOURCE_DETAIL_MAP[topSource]?.color || "warning.main"
                    }
                    sx={{
                      borderRadius: "0 4px 4px 0",
                    }}
                  >
                    <Typography
                      fontSize="8px"
                      fontWeight={600}
                      lineHeight="12px"
                      color="common.white"
                    >
                      {isNaN(
                        Math.floor((topSourceValue / screenPageViews) * 100)
                      )
                        ? 0
                        : Math.floor((topSourceValue / screenPageViews) * 100)}
                      %
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          ) : (
            <Box display="flex" gap={0.5} alignItems="center">
              <WarningRounded sx={{ width: 12, height: 12 }} color="warning" />
              <Typography
                variant="body3"
                fontWeight={600}
                color="text.secondary"
              >
                This item does not exist in your instance
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    );
  }
};

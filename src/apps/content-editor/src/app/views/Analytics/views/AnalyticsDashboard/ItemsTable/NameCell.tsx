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
} from "@mui/icons-material";
import moment from "moment-timezone";
import {
  useGetAllPublishingsQuery,
  useGetContentModelQuery,
  useSearchContentQuery,
} from "../../../../../../../../../shell/services/instance";
import { useGetUsersQuery } from "../../../../../../../../../shell/services/accounts";
import { startCase } from "lodash";
import { ContentItem } from "../../../../../../../../../shell/services/types";

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
  item,
  screenPageViews,
  topSource,
  topSourceValue,
  externalLink,
}: {
  item: ContentItem;
  screenPageViews?: number;
  topSource: keyof typeof SOURCE_DETAIL_MAP;
  topSourceValue: number;
  externalLink?: string;
}) => {
  const history = useHistory();
  const { data: publishings, isFetching: isPublishingFetching } =
    useGetAllPublishingsQuery();
  const foundPublishing = publishings?.find(
    (publishing) => publishing.itemZUID === item?.meta?.ZUID
  );
  const { data: users, isFetching: isUsersFetching } = useGetUsersQuery();
  const foundUser = users?.find(
    (user) => user.ZUID === foundPublishing?.publishedByUserZUID
  );
  const { data: model, isFetching: isModelsFetching } = useGetContentModelQuery(
    item?.meta?.contentModelZUID,
    {
      skip: !item?.meta?.contentModelZUID,
    }
  );

  const getImage = () => {
    const ogImage = Object.keys(item.data)?.find(
      (value) =>
        value === "ogimage" ||
        value === "ogImage" ||
        value === "og_image" ||
        value === "og:image"
    );
    if (ogImage) {
      return item?.data?.[ogImage];
    } else {
      return Object.values(item.data)?.find(
        (value) => typeof value === "string" && value.startsWith("3-")
      );
    }
  };

  if (!item || isPublishingFetching || isUsersFetching || isModelsFetching) {
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
  } else if (item) {
    return (
      <Box
        display="flex"
        height="40px"
        width="100%"
        alignItems="center"
        gap={1}
        onClick={() =>
          history.push(
            `/content/${item.meta.contentModelZUID}/${item.meta.ZUID}`
          )
        }
      >
        <Box
          height="40px"
          width="40px"
          bgcolor={
            Object.values(item.data)?.some(
              (value) => typeof value === "string" && value.startsWith("3-")
            )
              ? "transparent"
              : "info.main"
          }
          borderRadius="4px"
        >
          {Object.values(item.data)?.some(
            (value) => typeof value === "string" && value.startsWith("3-")
          ) && (
            <img
              width="100%"
              height="100%"
              style={{
                objectFit: "contain",
                minWidth: "40px",
              }}
              src={`${
                // @ts-ignore
                CONFIG.SERVICE_MEDIA_RESOLVER
              }/resolve/${getImage()}/getimage/?w=${40}&h=${40}&type=fit`}
              alt=""
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
              {item.web.metaTitle || item.web.metaLinkText}
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
          <Box display="flex" gap={1.5}>
            <Typography variant="body3" fontWeight={600} color="text.secondary">
              {moment(foundPublishing?.publishAt).format("MMM D")}
            </Typography>
            <Typography variant="body3" fontWeight={600} color="text.secondary">
              {foundUser
                ? `${foundUser.firstName} ${foundUser.lastName}`
                : "Unknown User"}
            </Typography>
            <Typography variant="body3" fontWeight={600} color="text.secondary">
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
                  bgcolor={SOURCE_DETAIL_MAP[topSource]?.bgcolor || "yellow.50"}
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
                    {isNaN(Math.floor((topSourceValue / screenPageViews) * 100))
                      ? 0
                      : Math.floor((topSourceValue / screenPageViews) * 100)}
                    %
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    );
  } else {
    return null;
  }
};

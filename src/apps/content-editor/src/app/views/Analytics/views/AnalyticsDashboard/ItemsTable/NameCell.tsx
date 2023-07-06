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
  useGetContentModelQuery,
  useSearchContentQuery,
} from "../../../../../../../../../shell/services/instance";
import { useGetUsersQuery } from "../../../../../../../../../shell/services/accounts";
import { startCase } from "lodash";

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
  const { data: item, isFetching } = useSearchContentQuery({
    query: path,
    limit: 1,
  });
  const foundItem = item?.[0]?.web?.path === path ? item?.[0] : null;
  const { data: users } = useGetUsersQuery();
  const foundUser = users?.find(
    (user) => user.ZUID === foundItem?.web?.createdByUserZUID
  );
  const { data: model } = useGetContentModelQuery(
    foundItem?.meta?.contentModelZUID,
    {
      skip: !foundItem?.meta?.contentModelZUID,
    }
  );

  if (isFetching || !path) {
    return <Skeleton width="100%" />;
  } else if (foundItem) {
    return (
      <Box
        display="flex"
        height="40px"
        width="100%"
        alignItems="center"
        gap={1}
        onClick={() =>
          history.push(
            `/content/${foundItem.meta.contentModelZUID}/${foundItem.meta.ZUID}`
          )
        }
      >
        <Box height="40px" width="40px" bgcolor="info.main" borderRadius="4px">
          {Object.values(foundItem.data)?.some(
            (value) => typeof value === "string" && value.startsWith("3-")
          ) && (
            <img
              // @ts-ignore
              src={`${CONFIG.SERVICE_MEDIA_RESOLVER}/resolve/${Object.values(
                foundItem.data
              )?.find(
                (value) => typeof value === "string" && value.startsWith("3-")
              )}/getimage/?w=${40}&h=${40}&type=fit`}
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
              {foundItem.web.metaTitle || foundItem.web.metaLinkText}
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
              {moment(foundItem.meta.createdAt).format("MMM D")}
            </Typography>
            <Typography variant="body3" fontWeight={600} color="text.secondary">
              {foundUser
                ? `${foundUser.firstName} ${foundUser.lastName}`
                : "Unknown User"}
            </Typography>
            <Typography variant="body3" fontWeight={600} color="text.secondary">
              {model?.label}
            </Typography>
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
                  color={SOURCE_DETAIL_MAP[topSource]?.color || "warning.main"}
                >
                  {startCase(topSource)}
                </Typography>
              </Box>
              <Box
                px={0.5}
                py={0.25}
                bgcolor={SOURCE_DETAIL_MAP[topSource]?.color || "warning.main"}
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
          </Box>
        </Box>
      </Box>
    );
  } else {
    return null;
  }
};

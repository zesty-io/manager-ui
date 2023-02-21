import { FC } from "react";
import { ContentItem } from "../../services/types";
import { LinksContainer } from "./LinksContainer";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Link } from "react-router-dom";
import {
  useGetAuditsQuery,
  useGetContentModelQuery,
  useGetContentItemQuery,
} from "../../services/instance";
import moment from "moment-timezone";

import PencilIcon from "@mui/icons-material/Create";
import { useSelector } from "react-redux";
type ContentListItem = {
  result: ContentItem;
  loading?: boolean;
  style: any;
};

export const ContentListItem: FC<ContentListItem> = ({
  result,
  style,
  loading: parentIsLoading = false,
}) => {
  const affectedZUID = result?.meta?.ZUID;
  const { data: auditData, isLoading: auditLoading } = useGetAuditsQuery(
    { affectedZUID, limit: 1, dir: "desc", order: "created" },
    { skip: !affectedZUID }
  );
  const { data: contentData, isLoading: contentLoading } =
    useGetContentItemQuery(affectedZUID, {
      skip: !affectedZUID,
    });
  const { data: modelData, isLoading: modelLoading } = useGetContentModelQuery(
    contentData?.meta.contentModelZUID,
    { skip: !contentData?.meta.contentModelZUID }
  );
  // For logging / debugging purposes
  const auditRes = useGetAuditsQuery(
    { affectedZUID, limit: 1, dir: "desc", order: "created" },
    { skip: !affectedZUID }
  );
  const contentRes = useGetContentItemQuery(auditData?.[0]?.affectedZUID, {
    skip: !auditData?.[0]?.affectedZUID,
  });
  const modelRes = useGetContentModelQuery(contentData?.meta.contentModelZUID, {
    skip: !contentData?.meta.contentModelZUID,
  });

  const languages = useSelector((state: any) => state.languages);
  const langCode = languages.find(
    (lang: any) => lang.ID === result?.meta?.langID
  )?.code;
  const langDisplay = langCode ? `(${langCode}) ` : null;
  // Chips
  const titleChip =
    modelData?.metaTitle ||
    modelData?.label ||
    contentData?.meta.contentModelZUID;
  const appChip = "Content";
  const actionDate = auditData?.[0]?.happenedAt;
  const dateInfo = moment(actionDate).fromNow();
  const firstName = auditData?.[0]?.firstName;
  const lastName = auditData?.[0]?.lastName;
  const userInfo =
    firstName || lastName ? `${firstName} ${lastName}` : "Unknown User";
  const userDateChip = auditData?.[0]
    ? `${dateInfo} by ${userInfo}`
    : "No actions found";
  const chips = [titleChip, appChip, userDateChip].join(" • ");
  // create url if meta data exists
  const url = contentData?.meta
    ? `/content/${contentData?.meta?.contentModelZUID}/${contentData?.meta?.ZUID}`
    : null;
  const loading =
    auditLoading || contentLoading || modelLoading || parentIsLoading;
  // Search Result List Item
  return (
    <Box
      component={Link}
      // we will get a console warning when the item is loading and we don't have the url yet
      to={url || "#"}
      style={style}
      sx={{
        boxSizing: "border-box",
        alignItems: "flex-start",
        display: "flex",
        flex: 1,
        padding: 2,
        gap: 2,
        backgroundColor: "background.paper",
        borderColor: "grey.100",
        borderWidth: "0px 1px 1px 1px",
        borderStyle: "solid",
        height: 9,
        color: "inherit",
        textDecoration: "none",
        "&:hover": {
          backgroundColor: "action.hover",
        },
        "&:hover button": {
          visibility: "visible",
        },
        "&:hover a": {
          visibility: "visible",
        },
        "&:first-of-type": {
          borderRadius: "8px 8px 0 0",
          borderWidth: "1px",
        },
      }}
    >
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          gap: 2,
        }}
        width="100%"
      >
        {loading ? (
          <Skeleton variant="circular" width={20} height={20} />
        ) : (
          <PencilIcon
            sx={{ width: "16px", height: "16px", color: "action.active" }}
            fontSize="small"
          />
        )}
        {/* Text Container */}
        <Stack
          direction="column"
          sx={{
            alignItems: "flex-start",
          }}
          width="100%"
        >
          <Typography variant="body2" color="text.primary">
            {loading ? (
              <Skeleton
                variant="rectangular"
                height={16}
                width={555}
                sx={{ mb: 1 }}
              />
            ) : (
              <>
                {contentData &&
                  contentData.siblings &&
                  Object.keys(contentData.siblings).length > 0 &&
                  langDisplay}
                {result?.web?.metaTitle || "Item missing meta title"}
              </>
            )}
          </Typography>
          {/* @ts-ignore */}
          <Typography variant="body3" color="text.secondary">
            {loading ? (
              <Skeleton
                variant="rectangular"
                height={14}
                width={425}
                sx={{ mb: 0.75 }}
              />
            ) : (
              chips
            )}
          </Typography>
        </Stack>
        <LinksContainer url={url} />
      </Stack>
    </Box>
  );
};

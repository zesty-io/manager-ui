import { FC } from "react";
import { ContentItem } from "../../services/types";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  useGetAuditsQuery,
  useGetContentModelQuery,
  useGetContentItemQuery,
} from "../../services/instance";
import moment from "moment-timezone";

import PencilIcon from "@mui/icons-material/Create";
type ContentListItem = {
  result: ContentItem;
};

export const ContentListItem: FC<ContentListItem> = ({ result }) => {
  const affectedZUID = result?.meta?.ZUID;
  const auditRes = useGetAuditsQuery(
    { affectedZUID, limit: 1, dir: "desc", order: "created" },
    { skip: !affectedZUID }
  );
  const { data: contentData } = useGetContentItemQuery(
    auditRes.data?.[0]?.affectedZUID,
    {
      skip: !auditRes.data?.[0]?.affectedZUID,
    }
  );
  const { data: modelData } = useGetContentModelQuery(
    contentData?.meta.contentModelZUID,
    { skip: !contentData?.meta.contentModelZUID }
  );
  const modelRes = useGetContentModelQuery(contentData?.meta.contentModelZUID, {
    skip: !contentData?.meta.contentModelZUID,
  });
  console.log({ affectedZUID, auditRes, contentData, modelData, modelRes });

  // Chips
  const titleChip = modelData?.metaTitle || contentData?.meta.contentModelZUID;
  const appChip = "Content";
  const actionDate = auditRes?.data?.[0]?.happenedAt;
  const dateInfo = moment(actionDate).fromNow();
  const firstName = auditRes?.data?.[0]?.firstName;
  const lastName = auditRes?.data?.[0]?.lastName;
  const userInfo =
    firstName || lastName ? `${firstName} ${lastName}` : "Unknown User";
  const userDateChip = auditRes?.data?.[0]
    ? `${dateInfo} by ${userInfo}`
    : "No actions found";
  const chips = [titleChip, appChip, userDateChip].join(" • ");
  // Search Result List Item
  return (
    <Box
      sx={{
        boxSizing: "border-box",
        alignItems: "flex-start",
        display: "flex",
        flex: 1,
        padding: 2,
        gap: 2,
        backgroundColor: "background.paper",
        border: (theme) => `1px solid ${theme.palette.grey[100]}`,
      }}
    >
      {/* Left Container */}
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          gap: 2,
        }}
      >
        <PencilIcon fontSize="small" />
        {/* Text Container */}
        <Stack
          direction="column"
          sx={{
            alignItems: "flex-start",
          }}
        >
          <Typography variant="body2" color="text.primary">
            {result.web.metaTitle || "Item missing meta title"}
          </Typography>
          {/* @ts-ignore */}
          <Typography variant="body3" color="text.secondary">
            {chips}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
};

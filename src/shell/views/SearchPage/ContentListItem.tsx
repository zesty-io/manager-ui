import { FC } from "react";
import { ContentItem } from "../../services/types";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { theme } from "@zesty-io/material";
import {
  useGetAuditsQuery,
  useGetContentModelQuery,
  useGetContentItemQuery,
} from "../../services/instance";
import moment from "moment-timezone";

import PencilIcon from "@mui/icons-material/Create";
type ContentListItem = {
  result: ContentItem;
  style: any;
};

export const ContentListItem: FC<ContentListItem> = ({ result, style }) => {
  const affectedZUID = result?.meta?.ZUID;
  const auditRes = useGetAuditsQuery(
    { affectedZUID, limit: 1, dir: "desc", order: "created" },
    { skip: !affectedZUID }
  );
  const contentRes = useGetContentItemQuery(auditRes.data?.[0]?.affectedZUID, {
    skip: !auditRes.data?.[0]?.affectedZUID,
  });
  const modelRes = useGetContentModelQuery(
    contentRes.data?.meta.contentModelZUID,
    { skip: !contentRes.data?.meta?.contentModelZUID }
  );
  console.log({ affectedZUID, auditRes, contentRes, modelRes });

  // Chips
  const titleChip = contentRes?.data?.web?.metaTitle || "Unknown Content Type";
  const appChip = "Content";
  const actionDate = auditRes?.data?.[0]?.happenedAt;
  const dateInfo = moment(actionDate).isSame(new Date(), "year")
    ? moment(actionDate).format("MMM D, h:mm A")
    : moment(actionDate).format("ll, h:mm A");
  const firstName = auditRes?.data?.[0]?.firstName;
  const lastName = auditRes?.data?.[0]?.lastName;
  const userInfo =
    firstName || lastName ? `${firstName} ${lastName}` : "Unknown User";
  const userDateChip = `${dateInfo} by ${userInfo}`;
  const chips = auditRes?.data?.[0]
    ? [titleChip, appChip, userDateChip].join(" • ")
    : "No actions found";
  // Search Result List Item
  return (
    <Box
      style={style}
      sx={{
        boxSizing: "border-box",
        alignItems: "flex-start",
        display: "flex",
        flex: 1,
        padding: "16px",
        gap: "17px",
        backgroundColor: "background.paper",
        border: `1px solid ${theme.palette.grey[100]}`,
        height: 9,
      }}
    >
      {/* Left Container */}
      <Stack
        direction="row"
        sx={{
          // doublecheck
          alignItems: "center",
          padding: 0,
          gap: "16px",
        }}
      >
        <PencilIcon fontSize="small" />
        {/* Text Container */}
        <Stack
          direction="column"
          sx={{
            alignItems: "flex-start",
            padding: 0,
          }}
        >
          <Typography variant="body2" color="text.primary">
            {result.web.metaTitle /* TODO is this correct? */}
          </Typography>
          <Typography variant="body2" lineHeight="18px" color="text.secondary">
            {chips}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
};

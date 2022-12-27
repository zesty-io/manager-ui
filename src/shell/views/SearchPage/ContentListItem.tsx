import { FC } from "react";
import { ContentItem } from "../../services/types";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { theme } from "@zesty-io/material";

import PencilIcon from "@mui/icons-material/Create";
type ContentListItem = {
  result: ContentItem;
};

export const ContentListItem: FC<ContentListItem> = ({ result }) => {
  // Search Result List Item
  return (
    <Box
      sx={{
        boxSizing: "border-box",
        alignItems: "flex-start",
        display: "flex",
        flex: 1,
        padding: "16px",
        gap: "17px",
        backgroundColor: "background.paper",
        border: `1px solid ${theme.palette.grey[100]}`,
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
            {result.meta.contentModelName || "unknown"} • Content • 5 secs ago
            by Andres Galindo
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
};

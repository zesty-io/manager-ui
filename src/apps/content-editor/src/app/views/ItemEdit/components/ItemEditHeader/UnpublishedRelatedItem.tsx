import { memo } from "react";
import {
  ListItem,
  ListItemButton,
  ListItemText,
  Box,
  Checkbox,
} from "@mui/material";
import { ContentItemWithDirtyAndPublishing } from "../../../../../../../../shell/services/types";

type UnpublishedRelatedItemProps = {
  contentItem: ContentItemWithDirtyAndPublishing;
};
export const UnpublishedRelatedItem = memo(
  ({ contentItem }: UnpublishedRelatedItemProps) => {
    return (
      <ListItem>
        <ListItemButton>
          <Checkbox />
          <ListItemText
            primary={contentItem.web.metaTitle}
            secondary={contentItem?.web?.metaDescription}
          />
        </ListItemButton>
      </ListItem>
    );
  }
);

UnpublishedRelatedItem.displayName = "UnpublishedRelatedItem";

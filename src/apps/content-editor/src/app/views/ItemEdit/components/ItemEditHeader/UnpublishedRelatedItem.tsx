import { memo } from "react";
import {
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Box,
  Checkbox,
} from "@mui/material";
import { ContentItemWithDirtyAndPublishing } from "../../../../../../../../shell/services/types";
import { useGetContentModelFieldsQuery } from "../../../../../../../../shell/services/instance";

type UnpublishedRelatedItemProps = {
  contentItem: ContentItemWithDirtyAndPublishing & {
    relatedModelZUID: string;
    relatedFieldZUID: string;
  };
  divider?: boolean;
};
export const UnpublishedRelatedItem = ({
  contentItem,
  divider,
}: UnpublishedRelatedItemProps) => {
  const { data: modelFields } = useGetContentModelFieldsQuery(
    contentItem.relatedModelZUID,
    {
      skip: !contentItem.relatedModelZUID,
    }
  );
  console.log(
    contentItem.relatedModelZUID,
    contentItem.relatedFieldZUID,
    modelFields?.find((field) => field.ZUID === contentItem.relatedFieldZUID)
      ?.name
  );
  const value =
    contentItem?.data[
      modelFields?.find((field) => field.ZUID === contentItem.relatedFieldZUID)
        ?.name
    ];

  return (
    <ListItem disablePadding divider={divider}>
      <ListItemButton>
        <ListItemIcon>
          <Checkbox />
        </ListItemIcon>
        <ListItemText
          primary={
            value ||
            contentItem?.web?.metaTitle ||
            contentItem?.web?.metaLinkText
          }
          secondary={contentItem?.web?.metaDescription}
        />
      </ListItemButton>
    </ListItem>
  );
};

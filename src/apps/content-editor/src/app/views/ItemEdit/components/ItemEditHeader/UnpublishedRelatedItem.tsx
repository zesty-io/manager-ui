import { useMemo, useState } from "react";
import {
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Box,
  Checkbox,
  Stack,
} from "@mui/material";
import { ImageRounded } from "@mui/icons-material";
import {
  ContentItem,
  ContentItemWithDirtyAndPublishing,
} from "../../../../../../../../shell/services/types";
import { useGetContentModelFieldsQuery } from "../../../../../../../../shell/services/instance";

export type ContentItemWithRelatedZUIDs = ContentItemWithDirtyAndPublishing & {
  relatedModelZUID: string;
  relatedFieldZUID: string;
};
type UnpublishedRelatedItemProps = {
  contentItem: ContentItemWithRelatedZUIDs;
  onChange: (payload: {
    action: "add" | "remove";
    contentItem: ContentItemWithDirtyAndPublishing;
  }) => void;
  selected: boolean;
  divider?: boolean;
};
export const UnpublishedRelatedItem = ({
  contentItem,
  onChange,
  selected,
  divider,
}: UnpublishedRelatedItemProps) => {
  const [imageError, setImageError] = useState(false);
  const { data: modelFields } = useGetContentModelFieldsQuery(
    contentItem.relatedModelZUID,
    {
      skip: !contentItem.relatedModelZUID,
    }
  );

  const imageFieldName = useMemo(() => {
    if (!modelFields?.length) return null;

    const imageFields = modelFields.filter(
      (field) => !field.deletedAt && field.datatype === "images"
    );

    return imageFields?.[0]?.name || null;
  }, [modelFields]);

  const imageURL = useMemo(() => {
    if (!contentItem?.data || !imageFieldName) return null;

    if (!!contentItem.data[imageFieldName]) {
      const value = String(contentItem.data[imageFieldName]).split(",")?.[0];

      if (value.startsWith("3-")) {
        return `${
          // @ts-ignore
          CONFIG.SERVICE_MEDIA_RESOLVER
        }/resolve/${value}/getimage/?w=64&h=64&type=crop`;
      } else {
        return value;
      }
    }

    return null;
  }, [contentItem, imageFieldName]);

  const fieldValue =
    contentItem?.data[
      modelFields?.find((field) => field.ZUID === contentItem.relatedFieldZUID)
        ?.name
    ];

  return (
    <ListItem disableGutters dense divider={divider}>
      <ListItemIcon
        sx={{
          minWidth: 0,
        }}
      >
        <Checkbox
          checked={selected}
          disableRipple
          onChange={(evt) =>
            onChange({
              contentItem,
              action: evt.target.checked ? "add" : "remove",
            })
          }
          sx={{
            pl: 0,
            pr: 2,
            "&:hover": {
              bgcolor: "transparent",
            },
          }}
        />
      </ListItemIcon>
      {!!imageFieldName &&
        (!!imageURL && !imageError ? (
          <Box
            component="img"
            width={40}
            height={40}
            src={imageURL}
            sx={{
              flexShrink: 0,
              bgcolor: "grey.100",
              objectFit: "contain",
              overflow: "hidden",
              mr: 2,
              borderRadius: 1,
            }}
            onError={() => setImageError(true)}
          />
        ) : (
          <Stack
            sx={{
              flexShrink: 0,
              bgcolor: "grey.100",
              width: 40,
              height: 40,
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              mr: 2,
              borderRadius: 1,
            }}
          >
            <ImageRounded color="action" />
          </Stack>
        ))}
      <ListItemText
        primary={
          fieldValue ||
          contentItem?.web?.metaTitle ||
          contentItem?.web?.metaLinkText ||
          contentItem?.meta?.ZUID
        }
        secondary={contentItem?.web?.metaDescription}
        primaryTypographyProps={{
          variant: "body2",
          fontWeight: 600,
          color: "text.primary",
          sx: {
            display: "-webkit-box",
            WebkitLineClamp: "1",
            WebkitBoxOrient: "vertical",
            wordBreak: "break-word",
            wordWrap: "break-word",
            hyphens: "auto",
            overflow: "hidden",
            textOverflow: "ellipsis",
          },
        }}
        secondaryTypographyProps={{
          variant: "body2",
          color: "text.secondary",
          sx: {
            display: "-webkit-box",
            WebkitLineClamp: "1",
            WebkitBoxOrient: "vertical",
            wordBreak: "break-word",
            wordWrap: "break-word",
            hyphens: "auto",
            overflow: "hidden",
            textOverflow: "ellipsis",
          },
        }}
      />
    </ListItem>
  );
};

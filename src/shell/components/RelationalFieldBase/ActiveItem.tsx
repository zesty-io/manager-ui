import { memo } from "react";
import { Typography, Stack, Box, Skeleton, IconButton } from "@mui/material";
import { DragIndicatorRounded } from "@mui/icons-material";

import { useGetContentItemQuery } from "../../services/instance";
import { ContentModel, ContentModelField } from "../../services/types";

type ActiveItemProps = {
  itemZUID: string;
  relatedFieldData: ContentModelField;
  relatedModelData: ContentModel;
  draggable?: boolean;
};
export const ActiveItem = memo(
  ({
    itemZUID,
    relatedFieldData,
    relatedModelData,
    draggable,
  }: ActiveItemProps) => {
    const { data: contentItem, isLoading } = useGetContentItemQuery(itemZUID, {
      skip: !itemZUID,
    });

    const itemTitle =
      contentItem?.data[relatedFieldData?.name] ||
      contentItem?.web?.metaTitle ||
      contentItem?.web?.metaLinkText;

    return (
      <Stack
        direction="row"
        sx={{
          bgcolor: "background.paper",
          height: 64,
          width: "100%",
          border: 1,
          borderColor: "border",
          borderRadius: 2,
          alignItems: "center",
        }}
      >
        {draggable && (
          <IconButton size="xsmall" sx={{ cursor: "grab", mx: 0.5 }}>
            <DragIndicatorRounded fontSize="small" />
          </IconButton>
        )}
        <Stack gap={0.5} justifyContent="center" flexGrow={1}>
          {isLoading ? (
            <>
              <Skeleton
                variant="text"
                sx={{ fontSize: 14, width: "100%", maxWidth: 180 }}
              />
              <Skeleton
                variant="text"
                sx={{ fontSize: 14, width: "100%", maxWidth: 400 }}
              />
            </>
          ) : (
            <>
              <Typography color="text.primary" fontWeight={600} variant="body2">
                {itemTitle}
              </Typography>
              {contentItem?.web?.metaDescription && (
                <Typography color="text.secondary" variant="body2">
                  {contentItem?.web?.metaDescription}
                </Typography>
              )}
            </>
          )}
        </Stack>
      </Stack>
    );
  }
);

ActiveItem.displayName = "ActiveItem";

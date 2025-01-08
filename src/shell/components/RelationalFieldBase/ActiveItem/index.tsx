import { memo, useState, useMemo } from "react";
import { Typography, Stack, Box, Skeleton, IconButton } from "@mui/material";
import { DragIndicatorRounded, Edit, MoreHoriz } from "@mui/icons-material";

import {
  useGetContentItemQuery,
  useGetContentModelFieldsQuery,
} from "../../../services/instance";
import { ContentModel, ContentModelField } from "../../../services/types";
import { useLazyGetFileQuery } from "../../../services/mediaManager";
import { fileExtension } from "../../../../apps/media/src/app/utils/fileUtils";
import { ActiveItemLoading } from "./ActiveItemLoading";

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
    const { data: contentItem, isLoading: isLoadingContentItem } =
      useGetContentItemQuery(itemZUID, {
        skip: !itemZUID,
      });
    const { data: relatedModelFields, isLoading: isLoadingRelatedModel } =
      useGetContentModelFieldsQuery(relatedModelData?.ZUID, {
        skip: !relatedModelData?.ZUID,
      });
    const [getFile, { isLoading: isLoadingImage }] = useLazyGetFileQuery();

    const itemTitle =
      contentItem?.data[relatedFieldData?.name] ||
      contentItem?.web?.metaTitle ||
      contentItem?.web?.metaLinkText;

    const isLoading =
      isLoadingContentItem || isLoadingRelatedModel || isLoadingImage;

    const imageFields = useMemo(() => {
      if (!relatedModelFields?.length) return [];

      return relatedModelFields.filter(
        (field) => !field.deletedAt && field.datatype === "images"
      );
    }, [relatedModelFields]);

    const imageURL = useMemo(() => {
      if (!imageFields?.length || !contentItem) return null;

      let images: string[] = [];

      imageFields.forEach((field) => {
        if (!!contentItem?.data?.[field.name]) {
          const value = String(contentItem?.data?.[field.name]);

          if (value.startsWith("3-")) {
            getFile(value)
              .unwrap()
              .then((res) => {
                if (
                  ["png", "jpg", "jpeg", "svg", "gif", "tif", "webp"].includes(
                    fileExtension(res.url)
                  )
                ) {
                  images = [...images, res.url];
                }
              });
          } else {
            images = [...images, value];
          }
        }
      });

      return images?.[0];
    }, [imageFields, contentItem]);

    if (isLoading) {
      return <ActiveItemLoading draggable={draggable} />;
    }

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
        {/* <Box component="img" loading="lazy" /> */}
        <Stack gap={0.5} justifyContent="center" flexGrow={1}>
          <Typography
            color="text.primary"
            fontWeight={600}
            variant="body2"
            sx={{
              display: "-webkit-box",
              "-webkit-line-clamp": "1",
              "-webkit-box-orient": "vertical",
              wordBreak: "break-word",
              wordWrap: "break-word",
              hyphens: "auto",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {itemTitle}
          </Typography>
          {contentItem?.web?.metaDescription && (
            <Typography
              color="text.secondary"
              variant="body2"
              sx={{
                display: "-webkit-box",
                "-webkit-line-clamp": "1",
                "-webkit-box-orient": "vertical",
                wordBreak: "break-word",
                wordWrap: "break-word",
                hyphens: "auto",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {contentItem?.web?.metaDescription}
            </Typography>
          )}
        </Stack>
      </Stack>
    );
  }
);

ActiveItem.displayName = "ActiveItem";

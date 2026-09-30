import { Box, Stack } from "@mui/material";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ImageRounded } from "@mui/icons-material";

import { useGetContentItemQuery } from "../../../services/instance";

type ImageCellProps = {
  imageFieldName: string;
  itemZUID: string;
};
export const ImageCell = ({ imageFieldName, itemZUID }: ImageCellProps) => {
  const { t } = useTranslation();
  const [imageError, setImageError] = useState(false);
  const { data: contentItem, isLoading: isLoadingContentItem } =
    useGetContentItemQuery(itemZUID, {
      skip: !itemZUID,
    });

  const imageURL = useMemo(() => {
    if (!contentItem?.data || !imageFieldName) return null;

    if (!!contentItem.data[imageFieldName]) {
      const value = String(contentItem.data[imageFieldName]).split(",")?.[0];

      if (value.startsWith("3-")) {
        return `${CONFIG.SERVICE_MEDIA_RESOLVER}/resolve/${value}/getimage/?w=40&h=40&type=crop`;
      } else {
        return value;
      }
    }

    return null;
  }, [contentItem, imageFieldName]);

  if (!imageURL || imageError) {
    return (
      <Box height="100%" display="flex" alignItems="center">
        <Stack
          width={40}
          height={40}
          borderRadius={1}
          bgcolor="grey.200"
          alignItems="center"
          justifyContent="center"
        >
          <ImageRounded color="action" fontSize="small" />
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      component="img"
      src={imageURL}
      alt={t("shell.relationalImageAlt", { name: imageFieldName })}
      loading="lazy"
      width={40}
      height={40}
      borderRadius={1}
      bgcolor="grey.100"
      sx={{
        objectFit: "contain",
      }}
      onError={() => setImageError(true)}
    />
  );
};

import { Box } from "@mui/material";
import { useMemo } from "react";

import { useGetContentItemQuery } from "../../../services/instance";

type ImageCellProps = {
  imageFieldName: string;
  itemZUID: string;
};
export const ImageCell = ({ imageFieldName, itemZUID }: ImageCellProps) => {
  const { data: contentItem, isLoading: isLoadingContentItem } =
    useGetContentItemQuery(itemZUID, {
      skip: !itemZUID,
    });

  const imageURL = useMemo(() => {
    if (!contentItem?.data || !imageFieldName) return null;

    if (!!contentItem.data[imageFieldName]) {
      const value = String(contentItem.data[imageFieldName]).split(",")?.[0];

      if (value.startsWith("3-")) {
        return `${
          // @ts-ignore
          CONFIG.SERVICE_MEDIA_RESOLVER
        }/resolve/${value}/getimage/?w=${40}&h=${40}&type=crop`;
      } else {
        return value;
      }
    }

    return null;
  }, [contentItem, imageFieldName]);

  if (!imageURL) {
    return <Box width={40} height={40} borderRadius={1} bgcolor="grey.200" />;
  }

  return (
    <Box
      component="img"
      src={imageURL}
      alt={`${imageFieldName} image`}
      loading="lazy"
      width={40}
      height={40}
      borderRadius={1}
      bgcolor="grey.100"
      sx={{
        objectFit: "contain",
      }}
    />
  );
};

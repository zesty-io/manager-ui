import { useEffect } from "react";
import { Typography, Box, Stack } from "@mui/material";
import { ImageRounded } from "@mui/icons-material";
import { useParams } from "react-router";
import { useSelector } from "react-redux";

import { useDomain } from "../../../../../../../../shell/hooks/use-domain";
import { AppState } from "../../../../../../../../shell/store/types";
import { useImageURL } from "./useImageURL";

type FacebookPreviewProps = {};
export const FacebookPreview = ({}: FacebookPreviewProps) => {
  const [imageURL, setImageDimensions] = useImageURL();
  const { itemZUID } = useParams<{
    itemZUID: string;
  }>();
  const domain = useDomain();
  const item = useSelector((state: AppState) => state.content[itemZUID]);

  useEffect(() => {
    setImageDimensions({ height: 290 });
  }, []);

  return (
    <Stack bgcolor="grey.100">
      {!!imageURL ? (
        <Box
          component="img"
          sx={{
            backgroundColor: (theme) => theme.palette.grey[100],
            objectFit: "contain",
            alignSelf: "center",
          }}
          height={290}
          src={imageURL}
          flexShrink={0}
        />
      ) : (
        <Stack
          height={290}
          bgcolor="grey.100"
          justifyContent="center"
          alignItems="center"
          flexShrink={0}
        >
          <ImageRounded color="action" fontSize="large" />
        </Stack>
      )}
      <Stack p={1.5}>
        <Typography textTransform="uppercase" color="text.secondary">
          {domain.replace(/http:\/\/|https:\/\//gm, "")}
        </Typography>
        <Typography
          variant="h6"
          fontWeight={600}
          color={item?.web?.metaTitle ? "text.primary" : "grey.500"}
          sx={{
            display: "-webkit-box",
            "-webkit-line-clamp": "2",
            "-webkit-box-orient": "vertical",
            wordBreak: "break-word",
            wordWrap: "break-word",
            hyphens: "auto",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {item?.web?.metaTitle || "Meta Title"}
        </Typography>
      </Stack>
    </Stack>
  );
};

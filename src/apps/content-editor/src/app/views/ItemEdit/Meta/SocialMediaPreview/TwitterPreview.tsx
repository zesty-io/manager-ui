import { Typography, Box, Stack } from "@mui/material";
import { ImageRounded } from "@mui/icons-material";
import { useParams } from "react-router";
import { useSelector } from "react-redux";

import { useDomain } from "../../../../../../../../shell/hooks/use-domain";
import { AppState } from "../../../../../../../../shell/store/types";
import { useImageURL } from "./useImageURL";

type TwitterPreviewProps = {};
export const TwitterPreview = ({}: TwitterPreviewProps) => {
  const imageURL = useImageURL();
  const { itemZUID } = useParams<{
    itemZUID: string;
  }>();
  const domain = useDomain();
  const item = useSelector((state: AppState) => state.content[itemZUID]);

  return (
    <Stack
      direction="row"
      bgcolor="common.white"
      borderRadius={2}
      border={1}
      borderColor="border"
    >
      {!!imageURL ? (
        <Box
          component="img"
          sx={{
            backgroundColor: (theme) => theme.palette.grey[100],
            objectFit: "contain",
          }}
          width={128}
          height={128}
          src={imageURL}
          flexShrink={0}
        />
      ) : (
        <Stack
          width={128}
          height={128}
          bgcolor="grey.100"
          justifyContent="center"
          alignItems="center"
          flexShrink={0}
        >
          <ImageRounded color="action" fontSize="large" />
        </Stack>
      )}
      <Stack gap={0.2} p={1} justifyContent="center">
        <Typography
          variant="body2"
          color="text.secondary"
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
          {domain.replace(/http:\/\/|https:\/\//gm, "")}
        </Typography>
        <Typography
          variant="body2"
          color={!!item?.web?.metaTitle ? "text.primary" : "grey.500"}
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
          {item?.web?.metaTitle || "Meta Title"}
        </Typography>
        <Typography
          variant="body2"
          color={!!item?.web?.metaDescription ? "text.secondary" : "grey.500"}
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
          {item?.web?.metaDescription || "Meta Description"}
        </Typography>
      </Stack>
    </Stack>
  );
};

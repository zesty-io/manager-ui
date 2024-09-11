import { Typography, Box, Stack } from "@mui/material";
import { ImageRounded } from "@mui/icons-material";
import { useLocation, useParams } from "react-router";
import { useSelector } from "react-redux";

import { useDomain } from "../../../../../../../../shell/hooks/use-domain";
import { AppState } from "../../../../../../../../shell/store/types";

type FacebookPreviewProps = {
  imageURL: string;
};
export const FacebookPreview = ({ imageURL }: FacebookPreviewProps) => {
  const { itemZUID, modelZUID } = useParams<{
    itemZUID: string;
    modelZUID: string;
  }>();
  const domain = useDomain();
  const location = useLocation();
  const isCreateItemPage = location?.pathname?.split("/")?.pop() === "new";
  const item = useSelector(
    (state: AppState) =>
      state.content[isCreateItemPage ? `new:${modelZUID}` : itemZUID]
  );

  return (
    <Stack bgcolor="grey.100">
      {!!imageURL ? (
        <Box
          component="img"
          sx={{
            backgroundColor: (theme) => theme.palette.grey[100],
            objectFit: "cover",
            alignSelf: "center",
          }}
          height={290}
          width="100%"
          src={`${imageURL}?width=500&height=290&fit=cover`}
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
          color={
            !!item?.data?.og_title || !!item?.web?.metaTitle
              ? "text.primary"
              : "grey.500"
          }
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
          {item?.data?.og_title || item?.web?.metaTitle || "Meta Title"}
        </Typography>
      </Stack>
    </Stack>
  );
};

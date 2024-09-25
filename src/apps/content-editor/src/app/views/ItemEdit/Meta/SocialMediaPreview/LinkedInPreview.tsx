import { Typography, Box, Stack } from "@mui/material";
import { ImageRounded } from "@mui/icons-material";
import { useLocation, useParams } from "react-router";
import { useSelector } from "react-redux";

import { useDomain } from "../../../../../../../../shell/hooks/use-domain";
import { AppState } from "../../../../../../../../shell/store/types";

type LinkedInPreviewProps = {
  imageURL: string;
};
export const LinkedInPreview = ({ imageURL }: LinkedInPreviewProps) => {
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
    <Stack
      py={1.5}
      px={2}
      bgcolor="background.paper"
      direction="row"
      gap={1.5}
      borderRadius={2}
      border={1}
      borderColor="border"
    >
      {!!imageURL ? (
        <Box
          component="img"
          sx={{
            backgroundColor: (theme) => theme.palette.grey[100],
            objectFit: "cover",
            alignSelf: "center",
            borderRadius: 2,
          }}
          height={72}
          width={128}
          src={`${imageURL}?width=128&height=72&fit=cover`}
          flexShrink={0}
        />
      ) : (
        <Stack
          height={72}
          width={128}
          bgcolor="grey.100"
          justifyContent="center"
          alignItems="center"
          flexShrink={0}
          borderRadius={2}
        >
          <ImageRounded color="action" fontSize="large" />
        </Stack>
      )}
      <Stack justifyContent="center">
        <Typography
          variant="body2"
          fontWeight={700}
          color={
            !!item?.data?.og_title || !!item?.web?.metaTitle
              ? "text.primary"
              : "grey.500"
          }
          sx={{
            display: "-webkit-box",
            "-webkit-line-clamp": "1",
            "-webkit-box-orient": "vertical",
            wordBreak: "break-word",
            wordWrap: "break-word",
            hyphens: "auto",
            overflow: "hidden",
            textOverflow: "ellipsis",
            mb: 0.75,
          }}
        >
          {item?.data?.og_title || item?.web?.metaTitle || "Meta Title"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {domain.replace(/http:\/\/|https:\/\//gm, "")}
        </Typography>
      </Stack>
    </Stack>
  );
};

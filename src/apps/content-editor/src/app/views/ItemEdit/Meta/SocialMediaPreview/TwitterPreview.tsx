import { useEffect, useState } from "react";
import { Typography, Box, Stack } from "@mui/material";
import { ImageRounded } from "@mui/icons-material";
import { useLocation, useParams } from "react-router";
import { useSelector } from "react-redux";

import { useDomain } from "../../../../../../../../shell/hooks/use-domain";
import { AppState } from "../../../../../../../../shell/store/types";

type TwitterPreviewProps = {
  imageURL: string;
};
export const TwitterPreview = ({ imageURL }: TwitterPreviewProps) => {
  const { itemZUID, modelZUID } = useParams<{
    itemZUID: string;
    modelZUID: string;
  }>();
  const domain = useDomain();
  const location = useLocation();
  const [tcImageURL, setTcImageURL] = useState<string>(null);
  const isCreateItemPage = location?.pathname?.split("/")?.pop() === "new";
  const item = useSelector(
    (state: AppState) =>
      state.content[isCreateItemPage ? `new:${modelZUID}` : itemZUID]
  );

  useEffect(() => {
    if (!!item?.data?.tc_image) {
      const tcImage = String(item?.data?.tc_image)
        ?.split(",")
        ?.filter((el: string) => el)?.[0];

      if (tcImage.startsWith("3-")) {
        setTcImageURL(
          `${
            // @ts-ignore
            CONFIG.SERVICE_MEDIA_RESOLVER
          }/resolve/${
            item?.data?.tc_image
          }/getimage/?w=${128}&h=${128}&type=fit`
        );
      } else {
        setTcImageURL(tcImage);
      }
    } else {
      setTcImageURL(
        !!imageURL ? `${imageURL}?width=128&height=128&fit=cover` : null
      );
    }
  }, [item?.data?.tc_image]);

  return (
    <Stack
      direction="row"
      bgcolor="common.white"
      borderRadius={2}
      border={1}
      borderColor="border"
    >
      {!!tcImageURL ? (
        <Box
          data-cy="TwitterCardImage"
          component="img"
          sx={{
            backgroundColor: (theme) => theme.palette.grey[100],
            objectFit: "cover",
          }}
          width={128}
          height={128}
          src={tcImageURL}
          flexShrink={0}
          borderRadius="8px 0 0 8px"
          onError={(evt: any) => {
            if (!!imageURL) {
              evt.currentTarget.src = `${imageURL}?width=128&height=128&fit=cover`;
            } else {
              setTcImageURL(null);
            }
          }}
        />
      ) : (
        <Stack
          width={128}
          height={128}
          bgcolor="grey.100"
          justifyContent="center"
          alignItems="center"
          flexShrink={0}
          borderRadius="8px 0 0 8px"
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
            WebkitLineClamp: "1",
            WebkitBoxOrient: "vertical",
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
          data-cy="TwitterCardTitle"
          variant="body2"
          color={
            !!item?.data?.tc_title || !!item?.web?.metaTitle
              ? "text.primary"
              : "grey.500"
          }
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: "1",
            WebkitBoxOrient: "vertical",
            wordBreak: "break-word",
            wordWrap: "break-word",
            hyphens: "auto",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {item?.data?.tc_title || item?.web?.metaTitle || "Meta Title"}
        </Typography>
        <Typography
          data-cy="TwitterCardDescription"
          variant="body2"
          color={
            !!item?.data?.tc_title || !!item?.web?.metaDescription
              ? "text.secondary"
              : "grey.500"
          }
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: "2",
            WebkitBoxOrient: "vertical",
            wordBreak: "break-word",
            wordWrap: "break-word",
            hyphens: "auto",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {item?.data?.tc_description ||
            item?.web?.metaDescription ||
            "Meta Description"}
        </Typography>
      </Stack>
    </Stack>
  );
};

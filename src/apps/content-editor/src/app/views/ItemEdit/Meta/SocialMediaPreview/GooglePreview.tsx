import { Fragment, useMemo } from "react";
import { Box, Stack, Typography, Breadcrumbs } from "@mui/material";
import {
  MoreVertRounded,
  ArrowForwardIosRounded,
  ImageRounded,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { useParams } from "react-router";

import { useGetInstanceQuery } from "../../../../../../../../shell/services/accounts";
import { InstanceAvatar } from "../../../../../../../../shell/components/global-sidebar/components/InstanceAvatar";
import { useDomain } from "../../../../../../../../shell/hooks/use-domain";
import { AppState } from "../../../../../../../../shell/store/types";
import { useGetContentModelFieldsQuery } from "../../../../../../../../shell/services/instance";

type GooglePreviewProps = {};
export const GooglePreview = ({}: GooglePreviewProps) => {
  const { modelZUID, itemZUID } = useParams<{
    modelZUID: string;
    itemZUID: string;
  }>();
  const { data: instance, isLoading: isLoadingInstance } =
    useGetInstanceQuery();
  const domain = useDomain();
  const { data: modelFields } = useGetContentModelFieldsQuery(modelZUID);
  const items = useSelector((state: AppState) => state.content);
  const item = items[itemZUID];
  const parent = items[item?.web?.parentZUID];

  const imageURL = useMemo(() => {
    if (!item?.data || !modelFields?.length) return;

    let matchedURL: string | null = null;

    if ("og_image" in item?.data) {
      matchedURL = !!item?.data?.["og_image"]
        ? (item?.data?.["og_image"] as string)
        : null;
    } else {
      // Find possible image fields that can be used
      const matchedFields = modelFields.filter(
        (field) =>
          !field.deletedAt &&
          field.datatype === "images" &&
          field?.name !== "og_image" &&
          (field.label.toLowerCase().includes("image") ||
            field.name.toLocaleLowerCase().includes("image"))
      );

      if (matchedFields?.length) {
        // Find the first matched field that already stores an image and make sure
        // to find the first valid image in that field
        matchedFields.forEach((field) => {
          if (!matchedURL && !!item?.data?.[field.name]) {
            matchedURL = String(item?.data?.[field.name])?.split(",")?.[0];
          }
        });
      }
    }

    if (matchedURL?.startsWith("3-")) {
      return `${
        // @ts-ignore
        CONFIG.SERVICE_MEDIA_RESOLVER
      }/resolve/${matchedURL}/getimage/?w=${85}&h=${85}&type=fit`;
    } else {
      return matchedURL;
    }
  }, [item?.data, modelFields]);

  const fullPathArray = useMemo(() => {
    let path: string[] = [domain];

    if (parent) {
      path = [
        ...path,
        ...(parent.web?.path?.split("/") || []),
        item?.web?.pathPart,
      ];
    } else {
      path = [...path, item?.web?.pathPart];
    }

    // Remove empty strings
    return path.filter((i) => !!i);
  }, [domain, parent, item?.web]);

  return (
    <Stack
      direction="row"
      gap={2}
      p={2}
      bgcolor="common.white"
      borderRadius={2}
      border={1}
      borderColor="border"
    >
      <Box flex={1}>
        <Stack direction="row" gap={1.5} alignItems="center">
          <InstanceAvatar canUpdateAvatar={false} />
          <Box>
            <Typography variant="body2" color="text.primary" fontWeight={600}>
              {instance?.name}
            </Typography>
            <Stack direction="row" gap={1.5} alignItems="center">
              <Stack
                direction="row"
                gap={0.2}
                alignItems="center"
                flexWrap="wrap"
              >
                {fullPathArray.map((path, index) => (
                  <Fragment key={index}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      fontWeight={600}
                    >
                      {path}
                    </Typography>
                    {index < fullPathArray?.length - 1 && (
                      <ArrowForwardIosRounded
                        color="action"
                        sx={{ fontSize: "10px" }}
                      />
                    )}
                  </Fragment>
                ))}
              </Stack>
              <MoreVertRounded
                sx={{
                  fontSize: "16px",
                  fill: (theme) => theme.palette.text.secondary,
                }}
              />
            </Stack>
          </Box>
        </Stack>
        <Typography
          variant="h5"
          color={!!item?.web?.metaTitle ? "#131CA4" : "grey.500"}
          mt={1}
          mb={1.5}
          fontWeight={600}
        >
          {item?.web?.metaTitle || "Meta Title"}
        </Typography>
        <Typography
          variant="body2"
          color="grey.500"
          fontWeight={500}
          minHeight={39}
        >
          {item?.web?.metaDescription || "Meta Description"}
        </Typography>
      </Box>
      {!!imageURL ? (
        <Box
          component="img"
          sx={{
            backgroundColor: (theme) => theme.palette.grey[100],
            objectFit: "contain",
          }}
          width={82}
          height={82}
          src={imageURL}
          flexShrink={0}
          borderRadius={2}
        />
      ) : (
        <Stack
          width={82}
          height={82}
          borderRadius={2}
          bgcolor="grey.100"
          justifyContent="center"
          alignItems="center"
          flexShrink={0}
        >
          <ImageRounded color="action" fontSize="large" />
        </Stack>
      )}
    </Stack>
  );
};

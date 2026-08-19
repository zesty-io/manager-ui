import { useMemo, useState } from "react";
import { Box, Stack, Typography, IconButton, Skeleton } from "@mui/material";
import {
  ModeEditRounded,
  LinkRounded,
  OpenInNewRounded,
  CheckRounded,
} from "@mui/icons-material";
import { ContentItem } from "shell/services/types";
import { useHistory } from "react-router";
import { useGetContentModelQuery } from "shell/services/instance";
import { useSelector } from "react-redux";
import { AppState } from "shell/store/types";
import blockPlaceholder from "../../../../../../../public/images/blockPlaceholder.png";

type BlockFieldVariantPreviewProps = {
  variantData: ContentItem;
};
export const BlockPreview = ({
  variantData,
}: BlockFieldVariantPreviewProps) => {
  const history = useHistory();
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [isImageBroken, setIsImageBroken] = useState(false);
  const { data: blockModelData, isLoading: isLoadingBlockModel } =
    useGetContentModelQuery(variantData?.meta?.contentModelZUID, {
      skip: !variantData?.meta?.contentModelZUID,
    });
  const instance = useSelector((state: AppState) => state.instance);

  const url = useMemo(() => {
    if (!variantData || !blockModelData || !instance) return "";

    const domain = `${CONFIG.URL_PREVIEW_PROTOCOL}${instance?.randomHashID}${CONFIG.URL_PREVIEW}`;
    const path = `/-/block/${blockModelData.name}.html`;
    const url = new URL(`${domain}${path}`);
    const params: Record<string, string> = {
      variant: variantData.meta.ZUID,
      version: String(variantData.meta.version),
    };

    Object.keys(params).forEach((key) => {
      url.searchParams.append(key, params[key]);
    });

    return url.href;
  }, [variantData, blockModelData]);

  const handleCopyLinkClick = (data: string) => {
    navigator?.clipboard
      ?.writeText(data)
      .then(() => {
        setIsLinkCopied(true);
        setTimeout(() => {
          setIsLinkCopied(false);
        }, 3000);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <Box data-cy="UsedBlockPreview">
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        px={1}
        py={1.5}
        bgcolor="grey.100"
        border={1}
        borderColor="border"
        borderRadius="8px 8px 0px 0px"
      >
        <Stack direction="row" gap={0.5} minWidth={0}>
          {isLoadingBlockModel ? (
            <Skeleton variant="text" width={80} sx={{ fontSize: "14px" }} />
          ) : (
            <Typography
              variant="body2"
              fontWeight={700}
              color="text.primary"
              noWrap
              flexShrink={0}
            >
              {blockModelData?.label || ""}
            </Typography>
          )}
          <Typography variant="body2" color="text.primary">
            /
          </Typography>
          <Typography
            variant="body2"
            fontWeight={600}
            color="text.secondary"
            noWrap
          >
            {variantData?.web?.metaTitle || ""}
          </Typography>
        </Stack>
        <Stack direction="row" gap={0.5}>
          <IconButton
            data-cy="EditBlock"
            size="small"
            disabled={isLoadingBlockModel}
            onClick={() =>
              history.push(
                `/blocks/${variantData?.meta?.contentModelZUID}/${variantData?.meta?.ZUID}`
              )
            }
          >
            <ModeEditRounded fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            disabled={isLoadingBlockModel}
            onClick={() => handleCopyLinkClick(url)}
          >
            {isLinkCopied ? (
              <CheckRounded fontSize="small" />
            ) : (
              <LinkRounded fontSize="small" />
            )}
          </IconButton>
          <IconButton
            size="small"
            disabled={isLoadingBlockModel}
            onClick={() =>
              window.open(url, "_blank", "noopener=true,noreferrer=true")
            }
          >
            <OpenInNewRounded fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>
      <Box
        component="img"
        width="100%"
        src={
          isImageBroken
            ? blockPlaceholder
            : String(variantData?.data?.og_image) || blockPlaceholder
        }
        onError={() => setIsImageBroken(true)}
        loading="lazy"
        borderRadius="0px 0px 8px 8px"
        borderRight={1}
        borderLeft={1}
        borderBottom={1}
        borderColor="border"
        boxSizing="border-box"
        sx={{
          objectFit: "contain",
          display: "block",
        }}
      />
    </Box>
  );
};

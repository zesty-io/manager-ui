import { useEffect, useMemo, useState, useRef, useReducer } from "react";
import {
  Typography,
  Autocomplete,
  TextField,
  Stack,
  Box,
  IconButton,
} from "@mui/material";
import {
  KeyboardArrowDownRounded,
  ModeEditRounded,
  LinkRounded,
  OpenInNewRounded,
  CheckRounded,
} from "@mui/icons-material";
import { useHistory } from "react-router";
import { useSelector } from "react-redux";

import {
  useGetContentModelsQuery,
  useLazyGetContentModelItemsQuery,
} from "../../services/instance";
import { VariantSelector } from "./VariantSelector";
import { AppState } from "../../store/types";
import blockPlaceholder from "../../../../public/images/blockPlaceholder.png";

type BlockValue = {
  model: {
    label: string;
    value: string;
  } | null;
  variant: string;
};
type FieldTypeBlockSelectorProps = {
  value: string;
  onChange: (value: string) => void;
  requiredError: boolean;
  missingVariantError: boolean;
};
export const FieldTypeBlockSelector = ({
  value,
  onChange,
  requiredError,
  missingVariantError,
}: FieldTypeBlockSelectorProps) => {
  const history = useHistory();
  const instance = useSelector((state: AppState) => state.instance);
  const previewLock = useSelector((state: AppState) =>
    state.settings?.instance?.find(
      (setting: any) => setting.key === "preview_lock_password" && setting.value
    )
  );
  const { data: models, isLoading: isLoadingModels } =
    useGetContentModelsQuery();
  const [getContentModelItems, { data: variants }] =
    useLazyGetContentModelItemsQuery();
  const [isVariantSelectorOpen, setIsVariantSelectorOpen] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const variantSelectorRef = useRef<HTMLDivElement>(null);

  const [blockValue, updateBlockValue] = useReducer(
    (state: BlockValue, action: Partial<BlockValue>) => {
      return {
        ...state,
        ...action,
      };
    },
    { model: null, variant: null }
  );
  const blockModelData = models?.find(
    (model) => model.name === blockValue.model?.value
  );
  const selectedVariantData = variants?.find(
    (variant) => variant.meta?.ZUID === blockValue.variant
  );

  const blockModelOptions = useMemo(() => {
    if (!models?.length) return [];

    return models
      .filter((model) => model.type === "block")
      .map((model) => ({
        label: model.label,
        value: model.name,
      }));
  }, [models]);

  const url = useMemo(() => {
    if (!blockValue || !variants?.length || !instance || !selectedVariantData)
      return "";

    // @ts-expect-error config not typed
    const domain = `${CONFIG.URL_PREVIEW_PROTOCOL}${instance?.randomHashID}${CONFIG.URL_PREVIEW}`;
    let path = `/-/block/${blockValue.model?.value}.html?variant=${selectedVariantData?.meta?.ZUID}&_bypassError=true`;

    if (previewLock) {
      path = `${path}&zpw=${previewLock.value}`;
    }

    return `${domain}${path}`;
  }, [blockValue, variants, instance, selectedVariantData]);

  useEffect(() => {
    if (!blockModelData) return;

    getContentModelItems({ modelZUID: blockModelData.ZUID });
  }, [blockValue.model, blockModelData]);

  useEffect(() => {
    if (!value) {
      updateBlockValue({
        model: null,
        variant: null,
      });
    } else {
      const blockModelName = value.split("/")?.[3]?.split(".")?.[0];
      const blockVariantZUID = value.split("variant=")?.[1];

      updateBlockValue({
        model: {
          label:
            models?.find((model) => model.name === blockModelName)?.label || "",
          value: blockModelName || "",
        },
        variant: blockVariantZUID,
      });
    }
  }, [value, models]);

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
    <>
      <Stack direction="row" gap={0.5}>
        <Autocomplete
          data-cy="BlockSelectorModelField"
          loading={isLoadingModels}
          renderInput={(params) => (
            <TextField
              {...params}
              error={requiredError}
              placeholder="Model"
              sx={{ width: 200 }}
            />
          )}
          options={blockModelOptions}
          value={blockValue?.model}
          onChange={(_, value) => {
            if (!value) {
              onChange(null);
            } else {
              onChange(`/-/block/${value?.value}.html?variant=`);
            }
          }}
        />

        <Stack
          data-cy="BlockSelectorVariantField"
          ref={variantSelectorRef}
          direction="row"
          height={40}
          bgcolor="background.paper"
          width="100%"
          justifyContent="space-between"
          alignItems="center"
          px={1}
          borderRadius={2}
          border={1}
          borderColor={
            requiredError || missingVariantError ? "error.main" : "border"
          }
          boxSizing="border-box"
          sx={{
            cursor: "pointer",
          }}
          onClick={() => {
            if (!blockValue?.model || !blockValue?.model?.value) return;

            setIsVariantSelectorOpen(true);
          }}
        >
          <Typography
            variant="body2"
            color={!!blockValue?.variant ? "text.primary" : "text.disabled"}
          >
            {!!blockValue?.variant
              ? variants?.find(
                  (variant) => variant?.meta?.ZUID === blockValue.variant
                )?.web?.metaTitle
              : "Variant"}
          </Typography>
          <KeyboardArrowDownRounded color="action" />
        </Stack>
        {!!isVariantSelectorOpen && (
          <VariantSelector
            anchorEl={variantSelectorRef?.current}
            onClose={() => setIsVariantSelectorOpen(false)}
            variants={blockValue?.model?.value ? variants : []}
            blockModelName={blockValue?.model?.label}
            blockModelZUID={blockModelData?.ZUID}
            onVariantSelected={(ZUID) => {
              onChange(
                `/-/block/${blockValue?.model?.value}.html?variant=${ZUID}`
              );
              setIsVariantSelectorOpen(false);
            }}
          />
        )}
      </Stack>
      {!!blockValue?.model && !!blockValue?.variant && (
        <Box data-cy="BlockFieldVariantPreview">
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
            mt={1}
          >
            <Typography variant="body2" fontWeight={600} color="text.primary">
              {variants?.find(
                (variant) => variant?.meta?.ZUID === blockValue.variant
              )?.web?.metaTitle || ""}
            </Typography>
            <Stack direction="row" gap={0.5}>
              <IconButton
                size="small"
                onClick={() =>
                  history.push(
                    `/blocks/${blockModelData?.ZUID}/${blockValue?.variant}`
                  )
                }
              >
                <ModeEditRounded fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => handleCopyLinkClick(url)}>
                {isLinkCopied ? (
                  <CheckRounded fontSize="small" />
                ) : (
                  <LinkRounded fontSize="small" />
                )}
              </IconButton>
              <IconButton
                size="small"
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
            height={384}
            src={
              (selectedVariantData?.data?.og_image as string) ||
              blockPlaceholder
            }
            loading="lazy"
            borderRadius="0px 0px 8px 8px"
            borderRight={1}
            borderLeft={1}
            borderBottom={1}
            borderColor="border"
            boxSizing="border-box"
          ></Box>
        </Box>
      )}
    </>
  );
};

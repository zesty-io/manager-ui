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
} from "@mui/icons-material";
import { useHistory } from "react-router";

import {
  useGetContentModelsQuery,
  useLazyGetContentModelItemsQuery,
} from "../../services/instance";
import { VariantSelector } from "./VariantSelector";

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
  const { data: models, isLoading: isLoadingModels } =
    useGetContentModelsQuery();
  const [getContentModelItems, { data: variants }] =
    useLazyGetContentModelItemsQuery();
  const [isVariantSelectorOpen, setIsVariantSelectorOpen] = useState(false);
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

  const blockModelOptions = useMemo(() => {
    if (!models?.length) return [];

    return models
      .filter((model) => model.type === "block")
      .map((model) => ({
        label: model.label,
        value: model.ZUID,
      }));
  }, [models]);

  useEffect(() => {
    if (!blockValue.model?.value) return;

    getContentModelItems({ modelZUID: blockValue.model?.value });
  }, [blockValue.model]);

  useEffect(() => {
    if (!value) {
      updateBlockValue({
        model: null,
        variant: null,
      });
    } else {
      const blockModelZUID = value.split("/")?.[3]?.split(".")?.[0];
      const blockVariantZUID = value.split("variant=")?.[1];

      updateBlockValue({
        model: {
          label:
            models?.find((model) => model.ZUID === blockModelZUID)?.label || "",
          value: blockModelZUID || "",
        },
        variant: blockVariantZUID,
      });
    }
  }, [value, models]);

  return (
    <>
      <Stack direction="row" gap={0.5}>
        <Autocomplete
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
            blockModelZUID={blockValue?.model?.value}
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
        <Box>
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
                    `/blocks/${blockValue?.model?.value}/${blockValue?.variant}`
                  )
                }
              >
                <ModeEditRounded fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => console.log("copy variant link")}
              >
                <LinkRounded fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => console.log("open variant preview")}
              >
                <OpenInNewRounded fontSize="small" />
              </IconButton>
            </Stack>
          </Stack>
          <Box
            component="img"
            width="100%"
            height={384}
            src="https://via.placeholder.com/640x384"
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

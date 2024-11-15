import { useEffect, useMemo, useState, useRef } from "react";
import { Typography, Autocomplete, TextField, Stack } from "@mui/material";
import { KeyboardArrowDownRounded } from "@mui/icons-material";

import {
  useGetContentModelsQuery,
  useLazyGetContentModelItemsQuery,
} from "../../services/instance";
import { VariantSelector } from "./VariantSelector";

type FieldTypeBlockSelectorProps = {};
export const FieldTypeBlockSelector = ({}: FieldTypeBlockSelectorProps) => {
  const { data: models, isLoading: isLoadingModels } =
    useGetContentModelsQuery();
  const [getContentModelItems, { data: variants }] =
    useLazyGetContentModelItemsQuery();
  const [selectedModel, setSelectedModel] = useState<{
    label: string;
    value: string;
  }>(null);
  const [isVariantSelectorOpen, setIsVariantSelectorOpen] = useState(false);
  const variantSelectorRef = useRef<HTMLDivElement>(null);

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
    if (!selectedModel?.value) return;

    getContentModelItems({ modelZUID: selectedModel.value });
  }, [selectedModel]);

  return (
    <Stack direction="row" gap={0.5}>
      <Autocomplete
        loading={isLoadingModels}
        renderInput={(params) => (
          <TextField {...params} placeholder="Model" sx={{ width: 200 }} />
        )}
        options={blockModelOptions}
        value={selectedModel}
        onChange={(_, value) => setSelectedModel(value)}
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
        borderColor="border"
        boxSizing="border-box"
        sx={{
          cursor: "pointer",
        }}
        onClick={() => {
          if (!selectedModel || !selectedModel?.value) return;

          setIsVariantSelectorOpen(true);
        }}
      >
        <Typography variant="body2" color="text.disabled">
          Variant
        </Typography>
        <KeyboardArrowDownRounded color="action" />
      </Stack>
      {!!isVariantSelectorOpen && (
        <VariantSelector
          anchorEl={variantSelectorRef?.current}
          onClose={() => setIsVariantSelectorOpen(false)}
          variants={selectedModel?.value ? variants : []}
          blockModelName={selectedModel?.label}
          blockModelZUID={selectedModel?.value}
        />
      )}
    </Stack>
  );
};

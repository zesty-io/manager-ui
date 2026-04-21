import { Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import {
  instanceApi,
  useGetContentItemQuery,
  useGetContentModelsQuery,
  useGetWebViewsQuery,
} from "shell/services/instance";
import { ContentItem, Data } from "shell/services/types";
import { extractBlockReferences } from "./extractBlockReferences";

export const UsedBlocks = () => {
  // Get code file and pvl file
  const { modelZUID, itemZUID } = useParams<{
    modelZUID: string;
    itemZUID: string;
  }>();
  const { data: views } = useGetWebViewsQuery({ status: "dev" });
  const { data: models, isLoading: isLoadingModels } =
    useGetContentModelsQuery();
  const { data: contentItemData } = useGetContentItemQuery(itemZUID);
  // Using dispatch + initiate instead of lazy query hooks to support parallel fetching.
  // Lazy query hooks only track the last dispatched query, so calling them in a loop
  // causes earlier results to be overwritten.
  const dispatch = useDispatch<any>();

  const blockModels = useMemo(() => {
    if (!models) return [];

    return models.filter((model) => model.type === "block");
  }, [models]);

  const templateFiles = useMemo(() => {
    if (!views || !modelZUID) return null;

    return views?.reduce(
      (acc, view) => {
        if (view.contentModelZUID === modelZUID) {
          acc.code = view;
        }

        if (view.fileName === `/z/pvl/${itemZUID}.zhtml`) {
          acc.freestyle = view;
        }
        return acc;
      },
      {
        code: null,
        freestyle: null,
      }
    );
  }, [views, modelZUID, itemZUID]);

  const [blockReferences, setBlockReferences] = useState<ContentItem[]>([]);

  useEffect(() => {
    const run = async () => {
      if (!templateFiles) return;

      const allBlockReferences = [
        ...(templateFiles.code?.code
          ? extractBlockReferences(templateFiles.code.code)
          : []),
        ...(templateFiles.freestyle?.code
          ? extractBlockReferences(templateFiles.freestyle.code)
          : []),
      ];

      // Deduplicate block references so if a block is referenced multiple times it only appears
      // once, unless there's a different variant and/or version specified
      const seen = new Set<string>();
      const uniqueBlockReferences = allBlockReferences.filter((ref) => {
        const key = `${ref.blockName}|${ref.field}|${ref.variant}|${ref.version}`;
        if (seen.has(key)) return false;

        seen.add(key);

        return true;
      });

      if (!uniqueBlockReferences) return;

      const blockZUIDs = new Set<string>();
      const variantZUIDs = new Set<string>();
      const variants: ContentItem[] = [];

      uniqueBlockReferences.forEach((ref) => {
        // Block selector block(this.blockselector)
        if (ref.field) {
          const fieldValue =
            contentItemData?.data?.[ref.field.replace("this.", "")];

          const extractedBlockRef = extractBlockReferences(
            `{{ block(${fieldValue}) }}`
          );

          if (extractedBlockRef.length > 0 && extractedBlockRef[0].variant) {
            variantZUIDs.add(extractedBlockRef[0].variant);
          }
        } else if (ref.variant) {
          variantZUIDs.add(ref.variant);
        } else if (ref.blockName) {
          // Non block selector: block('/-/block/name.html') or block(https://instance.preview.zesty.io/-/block/name.html)
          const blockModel = blockModels?.find(
            (block) => block.name === ref.blockName.replace(".html", "")
          );

          if (blockModel) {
            blockZUIDs.add(blockModel.ZUID);
          }
        }
      });

      // Fetch all items for each block model in parallel. Each block model's items
      // represent the available variants — we need them to find the base (earliest) variant.
      // allSettled is used so a single failed fetch doesn't abort the rest — failed/empty
      // results are filtered out and omitted from the final list.
      const allVariantData: ContentItem[][] = (
        await Promise.allSettled(
          Array.from(blockZUIDs).map((blockId) =>
            dispatch(
              instanceApi.endpoints.getContentModelItems.initiate({
                modelZUID: blockId,
              })
            ).unwrap()
          )
        )
      )
        .filter(
          (result): result is PromiseFulfilledResult<ContentItem[]> =>
            result.status === "fulfilled" && !!result.value?.length
        )
        .map((result) => result.value);

      // For each block model's items, find the earliest-created item — that's the base
      // variant. If it's already in variantZUIDs (referenced directly), remove it to
      // avoid fetching it again below.
      allVariantData.forEach((items) => {
        if (!items?.length) return;
        const earliest = items.reduce((a, b) =>
          a.meta.createdAt < b.meta.createdAt ? a : b
        );

        if (variantZUIDs.has(earliest.meta.ZUID)) {
          variantZUIDs.delete(earliest.meta.ZUID);
        }

        variants.push(earliest);
      });

      // Fetch any remaining directly-referenced variants in parallel (these are variant
      // ZUIDs from block() calls that weren't already resolved via a block model lookup).
      // Same allSettled pattern — failed/empty fetches are omitted.
      const directVariants: ContentItem[] = (
        await Promise.allSettled(
          Array.from(variantZUIDs).map((variantZUID) =>
            dispatch(
              instanceApi.endpoints.getContentItem.initiate(variantZUID)
            ).unwrap()
          )
        )
      )
        .filter(
          (result): result is PromiseFulfilledResult<ContentItem> =>
            result.status === "fulfilled" && !!result.value
        )
        .map((result) => result.value);
      variants.push(...directVariants);

      setBlockReferences(variants);
    };

    run();
  }, [templateFiles, blockModels, contentItemData]);

  // Get block references from both files
  // Display the block references

  return (
    <Typography variant="body2" fontWeight={600} color="text.primary">
      Blocks Referenced in Code or Freestyle
    </Typography>
  );
};

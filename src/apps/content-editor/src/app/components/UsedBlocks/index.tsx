import { Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  useGetContentItemQuery,
  useGetContentModelsQuery,
  useGetWebViewsQuery,
  useLazyGetContentModelItemsQuery,
  useLazyGetContentItemQuery,
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
  const [getContentModelItems] = useLazyGetContentModelItemsQuery();
  const [getContentItem] = useLazyGetContentItemQuery();

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

      const allVariantData: ContentItem[][] = [];
      for (const blockId of blockZUIDs) {
        const data: ContentItem[] = await getContentModelItems({
          modelZUID: blockId,
        }).unwrap();
        allVariantData.push(data);
      }

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

      for (const variantZUID of variantZUIDs) {
        const data: ContentItem = await getContentItem(variantZUID).unwrap();
        variants.push(data);
      }

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

import { Typography, Stack, Skeleton } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import {
  instanceApi,
  useGetContentModelsQuery,
  useGetWebViewsQuery,
} from "shell/services/instance";
import { ContentItem } from "shell/services/types";
import { BlockPreview } from "./BlockPreview";
import {
  BlockReference,
  extractBlockReferences,
} from "./extractBlockReferences";

export const UsedBlocks = () => {
  const dispatch = useDispatch<any>();
  const { modelZUID, itemZUID } = useParams<{
    modelZUID: string;
    itemZUID: string;
  }>();
  const { data: views } = useGetWebViewsQuery({ status: "dev" });
  const { data: models } = useGetContentModelsQuery();
  const [blockReferences, setBlockReferences] = useState<ContentItem[]>([]);
  const [isBuildingReferences, setIsBuildingReferences] = useState(false);

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

  useEffect(() => {
    const run = async () => {
      if (!templateFiles) return;

      setIsBuildingReferences(true);

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
        const key = `${ref.blockName}|${ref.variant}|${ref.version}`;
        if (seen.has(key)) return false;

        seen.add(key);

        return true;
      });

      if (!uniqueBlockReferences.length) {
        setIsBuildingReferences(false);
        setBlockReferences([]);
        return;
      }

      // blockZUIDs: models we need to fetch items for (to find the base/earliest variant)
      // directVariantZUIDs: variant ZUIDs to fetch directly (variant, no version)
      // versionedRefs: refs needing getContentItemVersions (blockName+version or variant+version)
      const blockZUIDs = new Set<string>();
      const directVariantZUIDs = new Set<string>();
      const versionedRefs: Array<{
        ref: BlockReference;
        modelZUID: string;
        itemZUID: string;
      }> = [];

      uniqueBlockReferences.forEach((ref) => {
        if (ref.variant) {
          if (ref.version) {
            // variant + version: modelZUID comes from blockName, itemZUID is the variant itself
            const blockModel = blockModels?.find(
              (block) => block.name === ref.blockName?.replace(".html", "")
            );

            if (blockModel) {
              versionedRefs.push({
                ref,
                modelZUID: blockModel.ZUID,
                itemZUID: ref.variant,
              });
            }
          } else {
            directVariantZUIDs.add(ref.variant);
          }
        } else if (ref.blockName) {
          const blockModel = blockModels?.find(
            (block) => block.name === ref.blockName.replace(".html", "")
          );

          if (blockModel) {
            blockZUIDs.add(blockModel.ZUID);
          }
        }
      });

      // Fetch all items for each block model in parallel, preserving the (blockId → items)
      // association so multiple refs to the same model (e.g. different versions) each resolve
      // independently. allSettled so a single failure doesn't abort the rest.
      const blockZUIDToBaseItem = new Map<string, ContentItem>();
      (
        await Promise.allSettled(
          // Using dispatch + initiate instead of lazy query hooks to support parallel fetching.
          // Lazy query hooks only track the last dispatched query, so calling them in a loop
          // causes earlier results to be overwritten.
          Array.from(blockZUIDs).map(async (blockId) => {
            const items = await dispatch(
              instanceApi.endpoints.getContentModelItems.initiate({
                modelZUID: blockId,
              })
            ).unwrap();

            return [blockId, items] as [string, ContentItem[]];
          })
        )
      )
        .filter(
          (
            result
          ): result is PromiseFulfilledResult<[string, ContentItem[]]> => {
            return result.status === "fulfilled" && !!result.value?.[1]?.length;
          }
        )
        .forEach(({ value: [blockId, items] }) => {
          const earliest = items.reduce((a, b) =>
            a.meta.createdAt < b.meta.createdAt ? a : b
          );

          blockZUIDToBaseItem.set(blockId, earliest);
        });

      // Build lookup: blockModelName → { modelZUID, baseItem }
      const blockNameToInfo = new Map<
        string,
        { modelZUID: string; baseItem: ContentItem }
      >();
      blockModels?.forEach((model) => {
        const baseItem = blockZUIDToBaseItem.get(model.ZUID);

        if (baseItem) {
          blockNameToInfo.set(model.name, { modelZUID: model.ZUID, baseItem });
        }
      });

      // Resolve each blockName ref (no variant). Iterating uniqueBlockReferences rather
      // than blockZUIDs ensures multiple refs to the same model with different versions
      // each produce their own result. Versioned ones are deferred to the batch below.
      const variants: ContentItem[] = [];
      uniqueBlockReferences.forEach((ref) => {
        if (ref.variant || !ref.blockName) return;

        const info = blockNameToInfo.get(ref.blockName.replace(".html", ""));

        if (!info) return;

        if (ref.version) {
          versionedRefs.push({
            ref,
            modelZUID: info.modelZUID,
            itemZUID: info.baseItem.meta.ZUID,
          });
        } else {
          variants.push(info.baseItem);
        }
      });

      // Resolve all versioned refs (blockName+version and variant+version) in parallel.
      // Both cases share the same getContentItemVersions call — they only differ in itemZUID.
      if (versionedRefs.length) {
        (
          await Promise.allSettled(
            versionedRefs.map(async ({ ref, modelZUID, itemZUID }) => {
              const versions = await dispatch(
                instanceApi.endpoints.getContentItemVersions.initiate({
                  modelZUID,
                  itemZUID,
                })
              ).unwrap();
              return (
                versions?.find(
                  (version: ContentItem) =>
                    version.meta.version === Number(ref.version)
                ) ?? null
              );
            })
          )
        )
          .filter(
            (result): result is PromiseFulfilledResult<ContentItem> =>
              result.status === "fulfilled" && !!result.value
          )
          .forEach(({ value }) => variants.push(value));
      }

      // Fetch direct variant refs (variant with no version) in parallel.
      const directVariants: ContentItem[] = (
        await Promise.allSettled(
          Array.from(directVariantZUIDs).map((variantZUID) =>
            dispatch(
              instanceApi.endpoints.getContentItem.initiate(variantZUID)
            ).unwrap()
          )
        )
      )
        .filter((result): result is PromiseFulfilledResult<ContentItem> => {
          return result.status === "fulfilled" && !!result.value;
        })
        .map((result) => result.value);
      variants.push(...directVariants);

      setBlockReferences(variants);
      setIsBuildingReferences(false);
    };

    run();
  }, [templateFiles, blockModels]);

  if (isBuildingReferences) {
    return (
      <Stack py={1.5} gap={1}>
        <Typography variant="body2" fontWeight={600} color="text.primary">
          Blocks Referenced in Code or Freestyle
        </Typography>
        <Skeleton variant="rounded" height={392} width="100%" />
      </Stack>
    );
  }

  if (!blockReferences.length) {
    return <></>;
  }

  return (
    <Stack py={1.5} gap={1} data-cy="UsedBlocks">
      <Typography variant="body2" fontWeight={600} color="text.primary">
        Blocks Referenced in Code or Freestyle
      </Typography>
      {blockReferences.map((ref) => (
        <BlockPreview key={ref.meta.ZUID} variantData={ref} />
      ))}
    </Stack>
  );
};

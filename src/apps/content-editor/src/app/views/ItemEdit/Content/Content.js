import { Editor } from "../../../components/Editor";
import { PreviewMode } from "../../../components/Editor/PreviewMode";
import {
  Box,
  Stack,
  IconButton,
  Tooltip,
  useMediaQuery,
  Skeleton,
  Container,
} from "@mui/material";
import { theme } from "@zesty-io/material";
import { StartRounded, DesktopMacRounded } from "@mui/icons-material";
import { Actions } from "./Actions";
import { useLocalStorage } from "react-use";
import { useContext, useEffect, useMemo, useState } from "react";
import { DuoModeContext } from "../../../../../../../shell/contexts/duoModeContext";
import { FieldError } from "../../../components/Editor/FieldError";
import { BlockTabs } from "../components/BlockTabs";
import {
  useGetContentModelFieldsQuery,
  useGetContentModelsQuery,
  useGetWebViewsQuery,
} from "../../../../../../../shell/services/instance";
import {
  fetchItems,
  searchItems,
} from "../../../../../../../shell/store/content";
import { fetchVersions } from "../../../../../../../shell/store/contentVersions";
import { useDispatch, useSelector, useStore } from "react-redux";
import { NoFields } from "../../../components/NoFields";
import { UsedBlocks } from "../../../components/UsedBlocks";
import { extractBlockReferences } from "../../../components/UsedBlocks/extractBlockReferences";

export default function Content(props) {
  const dispatch = useDispatch();
  const store = useStore();
  const { data: views } = useGetWebViewsQuery({ status: "dev" });
  const { data: models } = useGetContentModelsQuery();
  const [blockReferences, setBlockReferences] = useState([]);
  const [isBuildingReferences, setIsBuildingReferences] = useState(false);
  const contentItems = useSelector((state) => state.content);
  const contentVersions = useSelector((state) => state.contentVersions);
  const [showSidebar, setShowSidebar] = useLocalStorage(
    "zesty:content:sidebarOpen",
    false
  );
  const { data: fields, isFetching: isFetchingFields } =
    useGetContentModelFieldsQuery(
      { modelZUID: props.modelZUID },
      {
        skip: !props.modelZUID,
      }
    );

  const hasFields = useMemo(() => {
    if (!fields) return false;

    const validFields = fields.filter(
      (field) =>
        !field.deletedAt &&
        ![
          "og_image",
          "og_title",
          "og_description",
          "tc_title",
          "tc_description",
          "tc_image",
        ].includes(field.name)
    );

    return !!validFields.length;
  }, [fields]);

  const {
    value: showDuoModeContextValue,
    setValue: setShowDuoMode,
    isDisabled,
  } = useContext(DuoModeContext);

  const xLarge = useMediaQuery((theme) => theme.breakpoints.up("xl"));

  const showDuoMode = props?.model?.type === "block" || showDuoModeContextValue;

  const isFocusMode = !showDuoMode && !showSidebar;

  const isLoadingItem =
    props.loading &&
    (!props.item ||
      !Object.keys(props.item?.web).length ||
      !Object.keys(props.item?.meta).length);

  const blockModels = useMemo(() => {
    if (!models) return [];
    return models.filter((model) => model.type === "block");
  }, [models]);

  const templateFiles = useMemo(() => {
    if (!views || !props.modelZUID) return null;
    return views?.reduce(
      (acc, view) => {
        if (view.contentModelZUID === props.modelZUID) {
          acc.code = view;
        }
        if (view.fileName === `/z/pvl/${props.itemZUID}.zhtml`) {
          acc.freestyle = view;
        }
        return acc;
      },
      { code: null, freestyle: null }
    );
  }, [views, props.modelZUID, props.itemZUID]);

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

      const seen = new Set();
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

      const blockZUIDs = new Set();
      const directVariantZUIDs = new Set();
      const versionedRefs = [];

      uniqueBlockReferences.forEach((ref) => {
        if (ref.variant) {
          if (ref.version) {
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

      const blockZUIDToBaseItem = new Map();
      (
        await Promise.allSettled(
          Array.from(blockZUIDs).map(async (blockId) => {
            const storeItems = Object.values(contentItems).filter(
              (item) => item?.meta?.contentModelZUID === blockId
            );
            const items =
              storeItems.length > 0
                ? storeItems
                : (await dispatch(fetchItems(blockId, { limit: 100 })))?.data ??
                  [];
            return [blockId, items];
          })
        )
      )
        .filter(
          (result) =>
            result.status === "fulfilled" && !!result.value?.[1]?.length
        )
        .forEach(({ value: [blockId, items] }) => {
          const earliest = items.reduce((a, b) =>
            a.meta.createdAt < b.meta.createdAt ? a : b
          );
          blockZUIDToBaseItem.set(blockId, earliest);
        });

      const blockNameToInfo = new Map();
      blockModels?.forEach((model) => {
        const baseItem = blockZUIDToBaseItem.get(model.ZUID);
        if (baseItem) {
          blockNameToInfo.set(model.name, { modelZUID: model.ZUID, baseItem });
        }
      });

      const variants = [];
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

      if (versionedRefs.length) {
        (
          await Promise.allSettled(
            versionedRefs.map(async ({ ref, modelZUID, itemZUID }) => {
              const storeVersions = contentVersions?.[itemZUID];
              const storeVersion = Array.isArray(storeVersions)
                ? storeVersions.find(
                    (v) => v.meta.version === Number(ref.version)
                  )
                : null;

              if (storeVersion) return storeVersion;

              await dispatch(fetchVersions(modelZUID, itemZUID));

              const freshVersions =
                store.getState().contentVersions?.[itemZUID];
              return (
                freshVersions?.find(
                  (v) => v.meta.version === Number(ref.version)
                ) ?? null
              );
            })
          )
        )
          .filter((result) => result.status === "fulfilled" && !!result.value)
          .forEach(({ value }) => variants.push(value));
      }

      const directVariants = (
        await Promise.allSettled(
          Array.from(directVariantZUIDs).map(async (variantZUID) => {
            if (!contentItems[variantZUID]) {
              await dispatch(searchItems(variantZUID));
            }
            return store.getState().content[variantZUID] ?? null;
          })
        )
      )
        .filter((result) => result.status === "fulfilled" && !!result.value)
        .map((result) => result.value);
      variants.push(...directVariants);

      setBlockReferences(variants);
      setIsBuildingReferences(false);
    };

    run();
  }, [templateFiles, blockModels]);

  if (
    !hasFields &&
    !isFetchingFields &&
    !isBuildingReferences &&
    !blockReferences.length
  ) {
    return (
      <Container disableGutters maxWidth="lg" sx={{ height: "100%" }}>
        <Stack p={4} height="100%" justifyContent="center">
          <NoFields />
        </Stack>
      </Container>
    );
  }

  return (
    <Box
      bgcolor="grey.50"
      height="100%"
      overflow="hidden"
      pt={2.5}
      pr={4}
      display="flex"
      justifyContent="space-between"
      sx={{
        "*": {
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        },
      }}
    >
      <Box
        height="100%"
        sx={{
          display: "flex",
          flex: showDuoMode ? "unset" : 1,
          justifyContent:
            (!showDuoMode && !showSidebar) || xLarge ? "center" : "flex-start",
          overflowY: "scroll",
          maxWidth: showDuoMode ? 640 : "unset",
          width: showDuoMode ? "100%" : "unset",
        }}
        pr={3}
        pl={4}
      >
        <Box width={isFocusMode ? "75%" : "100%"} height="100%" flex="0 1 auto">
          <Box width="100%">
            {props.saveClicked && props.hasErrors && (
              <Box mb={3}>
                <FieldError
                  ref={props.fieldErrorRef}
                  errors={props.fieldErrors}
                  fields={props.activeFields}
                />
              </Box>
            )}
            <Editor
              // active={this.state.makeActive}
              // scrolled={() => this.setState({ makeActive: "" })}
              key={`${props.modelZUID}-${props.itemZUID}`}
              model={props.model}
              itemZUID={props.itemZUID}
              item={props.item}
              dispatch={props.dispatch}
              isDirty={props.item?.dirty}
              onSave={props.onSave}
              modelZUID={props.modelZUID}
              saveClicked={props.saveClicked}
              fieldErrors={props.fieldErrors}
              onUpdateFieldErrors={props.onUpdateFieldErrors}
              hasErrors={props.hasErrors}
              isLoadingItem={isLoadingItem}
            />
            {props.model.type !== "block" && (
              <UsedBlocks
                blockReferences={blockReferences}
                isBuildingReferences={isBuildingReferences}
              />
            )}
          </Box>
        </Box>
      </Box>
      {!showDuoMode ? (
        <Box display="flex" gap={1}>
          <Stack
            gap={1.5}
            sx={{
              ...(!showSidebar && {
                position: "relative",
                right: "24px",
              }),
            }}
          >
            {isLoadingItem ? (
              <Skeleton variant="circular" width={16} height={16} />
            ) : (
              <Tooltip
                title={showSidebar ? "Close Info Bar" : "Open Info Bar"}
                placement="left"
              >
                <IconButton
                  size="small"
                  onClick={() => setShowSidebar(!showSidebar)}
                  data-cy="ContentSidebarToggle"
                >
                  <StartRounded
                    fontSize="small"
                    sx={{
                      transform: showSidebar
                        ? "rotate(0deg)"
                        : "rotate(180deg)",
                    }}
                  />
                </IconButton>
              </Tooltip>
            )}

            {isLoadingItem ? (
              <Skeleton variant="circular" width={16} height={16} />
            ) : isDisabled ? (
              <></>
            ) : (
              <Tooltip title="Open DUO Mode" placement="left">
                <IconButton
                  size="small"
                  onClick={() => {
                    setShowDuoMode(true);
                  }}
                >
                  <DesktopMacRounded fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>

          {showSidebar && (
            <Box
              maxWidth={320}
              pl={4}
              sx={{
                borderLeft: (theme) => `1px solid ${theme.palette.grey[200]}`,
                overflowY: "auto",
                boxSizing: "border-box",
              }}
              data-cy="ContentSidebar"
            >
              <Actions
                {...props}
                site={{}}
                set={{
                  type: props.model?.type,
                }}
                isLoadingItem={isLoadingItem}
              />
            </Box>
          )}
        </Box>
      ) : (
        <Box
          height="100%"
          flex="1 1 auto"
          minWidth={300}
          display="flex"
          flexDirection="column"
          gap={2}
        >
          <Box flex={1}>
            <PreviewMode
              dirty={props.item?.dirty}
              version={props.item?.meta?.version}
              onClose={() => setShowDuoMode(false)}
              onSave={() => props.onSave()}
              hasErrors={props.hasErrors}
              model={props.model}
              itemZUID={props?.itemZUID}
            />
          </Box>
          {props?.model?.type === "block" && (
            <Box
              flex="1"
              sx={{
                overflowY: "auto",
              }}
            >
              <BlockTabs {...props} />
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}

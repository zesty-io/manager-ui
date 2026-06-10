import { useCallback } from "react";
import { useStore } from "react-redux";
import { chunk } from "lodash";
import { AppState } from "../../../../../../../shell/store/types";
import { ContentItemWithDirtyAndPublishing } from "../../../../../../../shell/services/types";
import {
  fetchAllModelPublishings,
  fetchItem,
  saveItem,
} from "../../../../../../../shell/store/content";
import { notify } from "../../../../../../../shell/store/notifications";
import { useCreateItemPublishingMutation } from "../../../../../../../shell/services/instance";

// Number of items published per batch. Mirrors the chunk size used by the
// release publish flow (shell/store/releases.js) so we don't hammer the API
// when committing many staged content edits at once.
const PUBLISH_BATCH_SIZE = 15;

// The shell store is a legacy JS thunk store whose AppState is almost entirely
// `any` (see the TODO in shell/store/types.ts), so dispatch must accept thunks
// and items typed as `any`. Typing it precisely would require typing the whole
// store; `any` here is the established interface to that untyped layer.
type DispatchFn = (action: any) => any;

export type StudioDirtyContentItem = {
  itemZUID: string;
  modelZUID: string;
  label: string;
};

type SavedContentItem = StudioDirtyContentItem;

type SaveAllResult = {
  saved: SavedContentItem[];
  failedCount: number;
  total: number;
};

// Run an array of items through `fn` in fixed-size batches, settling each batch
// before starting the next. Same shape as `asyncBatch` in shell/store/releases.js.
function asyncBatch<T>(
  items: T[],
  size: number,
  fn: (item: T) => Promise<any>
): Promise<PromiseSettledResult<any>[][]> {
  return chunk(items, size).reduce<Promise<PromiseSettledResult<any>[][]>>(
    (promise, batch) =>
      promise.then((results) =>
        Promise.allSettled(batch.map(fn)).then((data) => {
          results.push(data);
          return results;
        })
      ),
    Promise.resolve([])
  );
}

const buildLabel = (item: ContentItemWithDirtyAndPublishing): string =>
  item?.web?.metaTitle ||
  item?.web?.metaLinkText ||
  item?.meta?.ZUID ||
  "Untitled";

export const collectDirtyContentItems = (
  content: AppState["content"]
): StudioDirtyContentItem[] => {
  if (!content || typeof content !== "object") return [];
  return Object.keys(content)
    .map((zuid) => content[zuid])
    .filter(
      (item) => item?.dirty && item?.meta?.ZUID && item?.meta?.contentModelZUID
    )
    .map((item) => ({
      itemZUID: item.meta.ZUID,
      modelZUID: item.meta.contentModelZUID,
      label: buildLabel(item),
    }));
};

type UseStudioContentSaveArgs = {
  dispatch: DispatchFn;
  refreshPreviewFrame: (onReloadComplete?: () => void) => void;
  // Maps a saveItem() response's validation/server errors into the shared
  // fieldErrors UI state. Reused from StudioWrapper's single-item save path.
  // `res` is the untyped saveItem() thunk return (legacy JS store, see above).
  // `applyFieldErrors: false` skips the field-panel write (which is scoped to
  // the selected item) so a non-selected item's failure only toasts.
  applyItemSaveErrors: (
    res: any,
    itemLabel: string,
    options?: { applyFieldErrors?: boolean }
  ) => void;
  setStudioSaving: (saving: boolean) => void;
};

export const useStudioContentSave = ({
  dispatch,
  refreshPreviewFrame,
  applyItemSaveErrors,
  setStudioSaving,
}: UseStudioContentSaveArgs) => {
  const store = useStore<AppState>();
  const [createItemPublishing] = useCreateItemPublishingMutation();

  // Read the live set of dirty items from the store at call time so we always
  // act on the freshest edits/versions, not a stale render closure.
  const getDirtyContentItems = useCallback(
    () => collectDirtyContentItems(store.getState().content),
    [store]
  );

  // Saves every dirty item sequentially. Does NOT notify or refresh — callers
  // compose those so a save-and-publish run emits a single combined result.
  const runSaveAll = useCallback(async (): Promise<SaveAllResult> => {
    const items = getDirtyContentItems();
    const saved: SavedContentItem[] = [];
    let failedCount = 0;

    for (const item of items) {
      const res = (await dispatch(
        saveItem({
          itemZUID: item.itemZUID,
          skipContentItemValidation: false,
        })
      )) as any;

      if (res?.status === 200) {
        saved.push(item);
      } else {
        failedCount += 1;
        // Batch saves cover items the user isn't actively editing, so don't
        // write field errors into the selected item's panel — toast only.
        applyItemSaveErrors(res, item.label, { applyFieldErrors: false });
      }
    }

    const modelZUIDs = Array.from(new Set(saved.map((item) => item.modelZUID)));
    await Promise.all(
      modelZUIDs.map((modelZUID) =>
        dispatch(fetchAllModelPublishings({ modelZUID }))
      )
    );

    return { saved, failedCount, total: items.length };
  }, [applyItemSaveErrors, dispatch, getDirtyContentItems]);

  const saveAllContent = useCallback(async (): Promise<SaveAllResult> => {
    setStudioSaving(true);
    try {
      const result = await runSaveAll();

      if (result.saved.length) {
        dispatch(
          notify({
            kind: "success",
            message:
              result.saved.length === 1
                ? `Item Saved: ${result.saved[0].label}`
                : `Saved ${result.saved.length} items`,
          })
        );
        refreshPreviewFrame();
      }

      return result;
    } finally {
      setStudioSaving(false);
    }
  }, [dispatch, refreshPreviewFrame, runSaveAll, setStudioSaving]);

  const saveAndPublishAllContent =
    useCallback(async (): Promise<SaveAllResult> => {
      setStudioSaving(true);
      try {
        const result = await runSaveAll();

        if (!result.saved.length) return result;

        // Versions were bumped by saveItem (which refetches each item), so read
        // them fresh from the store before publishing.
        const content = store.getState().content;
        const settledBatches = await asyncBatch(
          result.saved,
          PUBLISH_BATCH_SIZE,
          (item) =>
            createItemPublishing({
              modelZUID: item.modelZUID,
              itemZUID: item.itemZUID,
              body: {
                version: content[item.itemZUID]?.meta?.version,
                publishAt: "now",
                unpublishAt: "never",
              },
            })
        );

        const publishResults = settledBatches.flat();
        const publishFailures = publishResults.filter(
          (entry) =>
            entry.status === "rejected" ||
            (entry.status === "fulfilled" && entry.value?.error)
        ).length;

        if (publishFailures) {
          dispatch(
            notify({
              kind: "error",
              message: `Published ${result.saved.length - publishFailures} of ${
                result.saved.length
              } items — ${publishFailures} failed`,
            })
          );
        } else {
          dispatch(
            notify({
              kind: "success",
              message:
                result.saved.length === 1
                  ? `Published: ${result.saved[0].label}`
                  : `Saved & published ${result.saved.length} items`,
            })
          );
        }

        refreshPreviewFrame();
        return result;
      } finally {
        setStudioSaving(false);
      }
    }, [
      createItemPublishing,
      dispatch,
      refreshPreviewFrame,
      runSaveAll,
      setStudioSaving,
      store,
    ]);

  // Reverts every staged item to its last-saved state by clearing the dirty
  // flag and refetching from the API, then refreshing the preview.
  const discardAllContent = useCallback(async () => {
    const items = getDirtyContentItems();
    if (!items.length) return;

    dispatch({
      type: "UNMARK_ITEMS_DIRTY",
      items: items.map((item) => item.itemZUID),
    });

    await Promise.all(
      items.map((item) => dispatch(fetchItem(item.modelZUID, item.itemZUID)))
    );

    refreshPreviewFrame();
  }, [dispatch, getDirtyContentItems, refreshPreviewFrame]);

  return {
    saveAllContent,
    saveAndPublishAllContent,
    discardAllContent,
  };
};

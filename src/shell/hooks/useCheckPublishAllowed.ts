import { useCallback } from "react";
import { useDispatch } from "react-redux";
import type { ThunkDispatch, AnyAction } from "@reduxjs/toolkit";
import { chunk } from "lodash";
import {
  instanceApi,
  useGetWorkflowStatusLabelsQuery,
} from "../services/instance";
import { ItemWorkflowStatus, WorkflowStatusLabel } from "../services/types";
import { isPublishAllowedByWorkflowStatus } from "../../utility/workflowStatus";

// Cap on simultaneous getItemWorkflowStatus requests -- bulk-publish from the
// multipage list can pass dozens/hundreds of items, and firing them all at
// once in one Promise.all can overwhelm the browser's connection pool.
const CONCURRENCY = 15;

export type PublishCandidate = {
  modelZUID: string;
  itemZUID: string;
  itemVersion: number;
};

/**
 * Returns an async function that partitions a list of items into those whose
 * current workflow status allows publishing and those that are blocked.
 *
 * Fetches each item's `ItemWorkflowStatus` in parallel (imperatively, via
 * `instanceApi.endpoints.getItemWorkflowStatus.initiate`) and checks it
 * against the instance-wide `allowPublish` status labels using the shared
 * `isPublishAllowedByWorkflowStatus` helper -- the same primitive the
 * single-item publish flow (`ItemEditHeaderActions`) uses for its own
 * `allowPublish` check.
 */
export function useCheckPublishAllowed() {
  // No app-wide `AppDispatch` type is exported from the store (see
  // src/shell/store/index.js), so the store's state/action types can't be
  // threaded through here -- typed just enough for RTK Query's `.initiate()`
  // thunks (dispatching one returns a `QueryActionCreatorResult`, which is
  // what gives us `.unwrap()` below).
  const dispatch = useDispatch<ThunkDispatch<any, any, AnyAction>>();
  // Keeps the labels query subscribed/warm for any other consumer on screen.
  useGetWorkflowStatusLabelsQuery();

  return useCallback(
    async <T extends PublishCandidate>(
      items: T[]
    ): Promise<{ allowed: T[]; blocked: T[] }> => {
      if (!items?.length) {
        return { allowed: [], blocked: [] };
      }

      // IMPORTANT: these two `.initiate()` calls must NOT pass
      // `{ subscribe: false }`. RTK Query only writes a query's result into
      // the cache slice that `.unwrap()` reads from when *something* is
      // subscribed to that cache key (see `buildSlice.ts`'s `pending`/
      // `fulfilled` cases guarding on `arg.subscribe`) -- a brand new,
      // never-before-fetched cache key dispatched with `subscribe: false`
      // still fires the real network request, but its result is discarded
      // rather than written to state, so `.unwrap()` resolves with
      // `undefined` even though the fetch succeeded. That silently made
      // every item "blocked" (no workflow status found) regardless of its
      // real status. Subscribing normally (the default) and explicitly
      // unsubscribing once we've read the result avoids that trap while
      // still not leaving a lingering subscription behind.
      const labelsResult = dispatch(
        instanceApi.endpoints.getWorkflowStatusLabels.initiate(undefined)
      );
      const statusLabels: WorkflowStatusLabel[] = await labelsResult
        .unwrap()
        .catch(() => [] as WorkflowStatusLabel[]);
      labelsResult.unsubscribe();

      const workflowStatuses: ItemWorkflowStatus[][] = [];
      for (const batch of chunk(items, CONCURRENCY)) {
        const batchResults = await Promise.all(
          batch.map(async (item) => {
            const result = dispatch(
              instanceApi.endpoints.getItemWorkflowStatus.initiate({
                modelZUID: item.modelZUID,
                itemZUID: item.itemZUID,
              })
            );
            const data = await result
              .unwrap()
              .catch(() => [] as ItemWorkflowStatus[]);
            result.unsubscribe();
            return data;
          })
        );
        workflowStatuses.push(...batchResults);
      }

      const allowed: T[] = [];
      const blocked: T[] = [];

      items.forEach((item, index) => {
        if (
          isPublishAllowedByWorkflowStatus(
            statusLabels,
            workflowStatuses[index],
            item.itemVersion
          )
        ) {
          allowed.push(item);
        } else {
          blocked.push(item);
        }
      });

      return { allowed, blocked };
    },
    [dispatch]
  );
}

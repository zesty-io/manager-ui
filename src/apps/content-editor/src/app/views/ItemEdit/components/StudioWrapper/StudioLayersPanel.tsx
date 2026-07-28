import { DragEvent, useCallback, useEffect, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import { StudioLayersTreeItem } from "./StudioLayersTreeItem";
import { LayersFlatRow } from "../../hooks/useStudioLayersTree";
import { LayersDropPosition, LayersTreeNode } from "../../hooks/studioTypes";

// Mirrors the canvas drag behavior: the outer bands of a row mean
// before/after, the middle means drop inside.
const EDGE_RATIO = 0.35;

type StudioLayersPanelProps = {
  hasTree: boolean;
  flatRows: LayersFlatRow[];
  selectedNodeId: string | null;
  onToggle: (nodeId: string) => void;
  onSelect: (node: LayersTreeNode) => void;
  canDrop: (
    sourceId: string,
    targetId: string,
    position: LayersDropPosition
  ) => boolean;
  onDrop: (
    sourceId: string,
    targetId: string,
    position: LayersDropPosition
  ) => void;
};

export const StudioLayersPanel = ({
  hasTree,
  flatRows,
  selectedNodeId,
  onToggle,
  onSelect,
  canDrop,
  onDrop,
}: StudioLayersPanelProps) => {
  const listRef = useRef<HTMLDivElement | null>(null);
  const dragSourceIdRef = useRef<string | null>(null);
  const [dropIntent, setDropIntent] = useState<{
    targetId: string;
    position: LayersDropPosition;
  } | null>(null);

  // Keep the canvas selection visible in the tree. Depends on flatRows too so
  // it retries once the selected row is actually rendered.
  useEffect(() => {
    if (!selectedNodeId || !listRef.current) return;
    const rowEl = listRef.current.querySelector(
      `[data-node-id="${CSS.escape(selectedNodeId)}"]`
    );
    rowEl?.scrollIntoView({ block: "nearest" });
  }, [selectedNodeId, flatRows]);

  const handleRowDragStart = useCallback(
    (nodeId: string, evt: DragEvent<HTMLElement>) => {
      dragSourceIdRef.current = nodeId;
      evt.stopPropagation();
      if (evt.dataTransfer) {
        evt.dataTransfer.effectAllowed = "move";
        evt.dataTransfer.setData("text/plain", nodeId);
      }
    },
    []
  );

  const handleRowDragOver = useCallback(
    (nodeId: string, evt: DragEvent<HTMLElement>) => {
      const sourceId = dragSourceIdRef.current;
      if (!sourceId) return;

      const rect = evt.currentTarget.getBoundingClientRect();
      const topBand = rect.top + rect.height * EDGE_RATIO;
      const bottomBand = rect.bottom - rect.height * EDGE_RATIO;
      const position: LayersDropPosition =
        evt.clientY < topBand
          ? "before"
          : evt.clientY > bottomBand
          ? "after"
          : "inside";

      if (!canDrop(sourceId, nodeId, position)) {
        setDropIntent((prev) => (prev?.targetId === nodeId ? null : prev));
        return;
      }

      evt.preventDefault();
      evt.stopPropagation();
      setDropIntent((prev) =>
        prev?.targetId === nodeId && prev.position === position
          ? prev
          : { targetId: nodeId, position }
      );
    },
    [canDrop]
  );

  const handleRowDragLeave = useCallback(
    (nodeId: string, evt: DragEvent<HTMLElement>) => {
      // dragleave also fires when the pointer crosses onto a child element of
      // the row; ignore those so the drop indicator doesn't flicker — only
      // clear when actually leaving the row.
      if (evt.currentTarget.contains(evt.relatedTarget as Node)) return;
      setDropIntent((prev) => (prev?.targetId === nodeId ? null : prev));
    },
    []
  );

  const handleRowDrop = useCallback(
    (nodeId: string, evt: DragEvent<HTMLElement>) => {
      const sourceId = dragSourceIdRef.current;
      dragSourceIdRef.current = null;
      setDropIntent(null);
      if (!sourceId) return;

      const rect = evt.currentTarget.getBoundingClientRect();
      const topBand = rect.top + rect.height * EDGE_RATIO;
      const bottomBand = rect.bottom - rect.height * EDGE_RATIO;
      const position: LayersDropPosition =
        evt.clientY < topBand
          ? "before"
          : evt.clientY > bottomBand
          ? "after"
          : "inside";

      if (!canDrop(sourceId, nodeId, position)) return;
      evt.preventDefault();
      onDrop(sourceId, nodeId, position);
    },
    [canDrop, onDrop]
  );

  const handleRowDragEnd = useCallback(() => {
    dragSourceIdRef.current = null;
    setDropIntent(null);
  }, []);

  return (
    <Box
      data-cy="StudioLayersPanel"
      width="100%"
      height="100%"
      display="flex"
      flexDirection="column"
      gap={1.25}
      boxShadow={2}
      zIndex={1}
      sx={{
        bgcolor: "grey.50",
        pt: 1.5,
        pb: 1.5,
        pl: 1.5,
        pr: 0.5,
      }}
    >
      <Typography fontWeight={600} fontSize={16} lineHeight="22px">
        Layers
      </Typography>
      <Box
        ref={listRef}
        flex={1}
        minHeight={0}
        display="flex"
        flexDirection="column"
        gap="1px"
        sx={{ overflowY: "auto", overflowX: "hidden" }}
      >
        {/* Render nothing until the first tree arrives so the panel doesn't
            swap a loading placeholder for the list (avoids layout shift). */}
        {hasTree && !flatRows.length ? (
          <Typography fontSize={13} color="text.secondary">
            No layers found
          </Typography>
        ) : (
          flatRows.map((row) => (
            <StudioLayersTreeItem
              key={row.node.id}
              row={row}
              dropIntent={
                dropIntent?.targetId === row.node.id
                  ? dropIntent.position
                  : null
              }
              onToggle={onToggle}
              onSelect={onSelect}
              onRowDragStart={handleRowDragStart}
              onRowDragOver={handleRowDragOver}
              onRowDragLeave={handleRowDragLeave}
              onRowDrop={handleRowDrop}
              onRowDragEnd={handleRowDragEnd}
            />
          ))
        )}
      </Box>
    </Box>
  );
};

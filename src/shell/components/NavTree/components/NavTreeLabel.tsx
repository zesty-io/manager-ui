import { Stack, Box, Tooltip, Typography } from "@mui/material";
import { UseTreeItem2LabelSlotOwnProps } from "@mui/x-tree-view";
import { memo } from "react";

type NavTreeLabelProps = UseTreeItem2LabelSlotOwnProps & {
  labelName: string;
  labelIcon?: any;
  nodeId: string;
  // nestedItems?: TreeItemType[];
  actions?: React.ReactNode[];
  depth?: number;
  isHiddenTree?: boolean;
  nodeData?: any;
  // onItemDrop?: (draggedItem: any, targetItem: any) => void;
  // dragAndDrop?: boolean;
  selected?: string;
};
export const NavTreeLabel = memo(
  ({
    children: labelName,
    labelIcon,
    nodeData,
    actions,
    ...props
  }: NavTreeLabelProps) => {
    return (
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        position="relative"
        {...props}
        // sx={{
        //   "& .treeActions": {
        //     display: "flex",
        //     position: "absolute",
        //     right: 0,
        //     zIndex: nodeData?.navSource == "code" ? 2 : -1,
        //   },
        //   "&:hover .treeActions": {
        //     zIndex: 2,
        //   },
        //   // HACK: Makes sure that the label width is adjusted when the overlay buttons are rendered
        //   "& .treeSpacer": {
        //     display: nodeData?.navSource == "code" ? "block" : "none",
        //   },
        //   "&:hover .treeSpacer": {
        //     display: "block",
        //   },
        // }}
      >
        {!labelIcon && nodeData?.navSource == "code" ? null : (
          <Box component={labelIcon} sx={{ fontSize: 16, mr: 1 }} />
        )}
        <Tooltip title={labelName} enterDelay={1000} enterNextDelay={1000}>
          <Typography variant="body2" noWrap width="100%">
            {labelName}
          </Typography>
        </Tooltip>
        {/* HACK: Used to force the label width to shrink when actions overlay is shown */}
        <Box
          className="treeSpacer"
          minWidth={
            // calculate width based on number of actions + padding between each action
            !isNaN(actions?.length)
              ? actions?.length * 20 + (actions?.length - 1) * 4
              : 0
          }
        />
        <Stack
          direction="row"
          alignItems="center"
          gap={0.5}
          className="treeActions"
        >
          {actions?.map((action) => {
            return action;
          })}
        </Stack>
      </Stack>
    );
  }
);
NavTreeLabel.displayName = "NavTreeLabel";

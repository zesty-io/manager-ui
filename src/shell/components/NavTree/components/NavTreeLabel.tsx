import { Stack, Box, Tooltip, Typography } from "@mui/material";
import {
  UseTreeItem2LabelSlotOwnProps,
  UseTreeItem2Status,
} from "@mui/x-tree-view";

type NavTreeLabelProps = UseTreeItem2LabelSlotOwnProps & {
  labelName: string;
  labelIcon?: any;
  nodeId: string;
  actions?: React.ReactNode[];
  depth?: number;
  nodeData?: any;
  status: UseTreeItem2Status;
};
export const NavTreeLabel = ({
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
      width="100%"
      overflow="hidden"
      {...props}
      sx={{
        "& .treeActions": {
          display: "flex",
          position: "absolute",
          right: 0,
          zIndex: nodeData?.navSource == "code" ? 2 : -1,
        },
        // HACK: Makes sure that the label width is adjusted when the overlay buttons are rendered
        "& .treeSpacer": {
          display: nodeData?.navSource == "code" ? "block" : "none",
        },
      }}
    >
      {!labelIcon && nodeData?.navSource == "code" ? null : (
        <Box
          className="treeIcon"
          component={labelIcon}
          sx={{ fontSize: 16, mr: 1 }}
        />
      )}
      <Tooltip
        title={labelName}
        enterDelay={1000}
        enterNextDelay={1000}
        disableInteractive
      >
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
};
NavTreeLabel.displayName = "NavTreeLabel";

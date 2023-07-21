import { FC, useMemo } from "react";
import { TreeItem, TreeItemProps } from "@mui/lab";
import {
  Stack,
  Box,
  Typography,
  IconButton,
  SvgIcon,
  Button,
} from "@mui/material";
import { SvgIconComponent } from "@mui/icons-material";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import HomeIcon from "@mui/icons-material/Home";

import { TreeItem as TreeItemType } from "../index";

interface Props {
  labelName: string;
  labelIcon?: any;
  onHideItem: (path: string) => void;
  onAddContent: (path: string) => void;
  nodeId: string;
  nestedItems?: TreeItemType[];
}
export const NavTreeItem: FC<Readonly<Props>> = ({
  labelName,
  onHideItem,
  onAddContent,
  labelIcon,
  nodeId,
  nestedItems,
}) => {
  return (
    <TreeItem
      nodeId={nodeId}
      label={
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            "& .treeActions": {
              display: "none",
            },
            "&:hover .treeActions": {
              display: "flex",
            },
          }}
        >
          <Stack direction="row" alignItems="center" gap={1}>
            <Box component={labelIcon} sx={{ fontSize: 16 }} />
            {/* {labelIcon} */}
            <Typography variant="body2">{labelName}</Typography>
          </Stack>
          <Stack
            direction="row"
            alignItems="center"
            gap={0.5}
            className="treeActions"
          >
            <IconButton
              data-cy="tree-item-hide"
              sx={{
                borderRadius: 0.5,
              }}
              size="xSmall"
              onClick={(e) => {
                e.stopPropagation();
                onHideItem(nodeId);
              }}
            >
              <VisibilityRoundedIcon sx={{ fontSize: 16 }} />
            </IconButton>
            <IconButton
              data-cy="tree-item-add-new-content"
              sx={{
                borderRadius: 0.5,
                backgroundColor: "primary.dark",
                "&:hover": {
                  backgroundColor: "primary.dark",
                },
                "& svg.MuiSvgIcon-root": {
                  color: "common.white",
                },
              }}
              size="xSmall"
              onClick={(e) => {
                e.stopPropagation();
                onAddContent(nodeId);
              }}
            >
              <AddRoundedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Stack>
        </Stack>
      }
      sx={{
        "& .MuiTreeItem-content": {
          py: 0.5,
          pl: 1,
          borderRadius: 0,

          ".MuiTreeItem-iconContainer": {
            width: 20,
            height: 20,
            svg: {
              fontSize: 20,
            },
          },
        },
        "& .MuiTreeItem-content.Mui-selected": {
          borderLeft: "2px solid",
          borderColor: "primary.main",
          pl: 0.75,

          ".MuiTreeItem-iconContainer svg": {
            color: "primary.main",
          },

          ".MuiTreeItem-label .treeActions [data-cy='tree-item-hide'] svg": {
            // Makes sure that the hide icon color does not change when tree item is selected
            color: "action.active",
          },

          ".MuiTreeItem-label .treeActions [data-cy='tree-item-add-new-content'] svg":
            {
              // Makes sure that the add new content icon color does not change when tree item is selected
              color: "common.white",
            },
        },
      }}
    >
      {!!nestedItems?.length &&
        nestedItems?.map((item) => {
          return (
            <NavTreeItem
              key={item.ZUID}
              labelName={item.label}
              nodeId={item.ZUID}
              labelIcon={item.icon}
              onHideItem={() => {}}
              onAddContent={() => {}}
              nestedItems={item.children}
            />
          );
        })}
    </TreeItem>
  );
};

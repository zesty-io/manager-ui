import { FC } from "react";
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

interface Props {
  name: string;
  icon: SvgIconComponent;
  onHideItem: (path: string) => void;
  onAddContent: (path: string) => void;
}
export const NavTreeItem: FC<Readonly<Props & TreeItemProps>> = ({
  name,
  onHideItem,
  onAddContent,
  icon,
  ...other
}) => {
  return (
    <TreeItem
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
            {!!icon && <SvgIcon component={icon} sx={{ fontSize: 16 }} />}
            <Typography variant="body2">{name}</Typography>
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
                onHideItem(other.nodeId);
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
                onAddContent(other.nodeId);
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
        },
        "& .MuiTreeItem-content.Mui-selected": {
          borderLeft: "2px solid",
          borderColor: "primary.main",
          pl: 0.75,
        },
        "& .MuiTreeItem-content.Mui-selected .MuiTreeItem-label .treeActions [data-cy='tree-item-hide'] svg":
          {
            // Makes sure that the hide icon color does not change when tree item is selected
            color: "action.active",
          },
        "& .MuiTreeItem-content.Mui-selected .MuiTreeItem-label .treeActions [data-cy='tree-item-add-new-content'] svg":
          {
            // Makes sure that the add new content icon color does not change when tree item is selected
            color: "common.white",
          },
        "& .MuiTreeItem-content .MuiTreeItem-iconContainer": {
          width: 20,
          height: 20,
          svg: {
            fontSize: 20,
          },
        },
      }}
      {...other}
    />
  );
};

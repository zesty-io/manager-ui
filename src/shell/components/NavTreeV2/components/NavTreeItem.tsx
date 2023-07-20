import { FC } from "react";
import { TreeItem, TreeItemProps } from "@mui/lab";
import { Stack, Box, Typography, IconButton, SvgIcon } from "@mui/material";
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
              display: "block",
            },
          }}
        >
          <Stack direction="row">
            {!!icon && <SvgIcon component={icon} />}
            <Typography>{name}</Typography>
          </Stack>
          <Box className="treeActions">
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onHideItem(other.nodeId);
              }}
            >
              <VisibilityRoundedIcon />
            </IconButton>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onAddContent(other.nodeId);
              }}
            >
              <AddRoundedIcon />
            </IconButton>
          </Box>
        </Stack>
      }
      {...other}
    />
  );
};

import { MouseEvent, useState } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import { RenameFolderDialog } from "./RenameFolderDialog";
import { NewFolderDialog } from "./NewFolderDialog";
import { DeleteFolderDialog } from "./DeleteFolderDialog";

interface Props {
  title: string;
  id?: string;
  binId?: string;
  groupId?: string;
  hideUpload?: boolean;
}
type Dialogs = "delete" | "rename" | "new" | null;

export const Header = ({ title, id, binId, groupId, hideUpload }: Props) => {
  const [openDialog, setOpenDialog] = useState<Dialogs>(null);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const openMenu = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const closeMenu = () => {
    setAnchorEl(null);
  };
  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          py: 2,
          px: 3,
          borderStyle: "solid",
          borderWidth: "1px",
          borderColor: "grey.100",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", gap: "2px", alignItems: "center" }}>
          <Typography variant="h4" fontWeight={600}>
            {title}
          </Typography>
          {id ? (
            <IconButton
              size="small"
              onClick={openMenu}
              sx={{ height: "fit-content" }}
            >
              <ArrowDropDownIcon fontSize="small" />
            </IconButton>
          ) : null}
          <Menu anchorEl={anchorEl} open={open} onClose={closeMenu}>
            <MenuItem
              divider
              onClick={() => {
                closeMenu();
                setOpenDialog("new");
              }}
            >
              <ListItemIcon>
                <CreateNewFolderIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>New Folder</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => {
                closeMenu();
                setOpenDialog("rename");
              }}
            >
              <ListItemIcon>
                <DriveFileRenameOutlineIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Rename</ListItemText>
            </MenuItem>
            {groupId ? (
              <MenuItem
                onClick={() => {
                  closeMenu();
                  setOpenDialog("delete");
                }}
              >
                <ListItemIcon>
                  <DeleteIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Delete</ListItemText>
              </MenuItem>
            ) : null}
          </Menu>
        </Box>
        {hideUpload ? null : (
          <Button startIcon={<FileUploadIcon />} variant="contained">
            Upload
          </Button>
        )}
      </Box>
      <RenameFolderDialog
        open={openDialog === "rename"}
        onClose={() => {
          setOpenDialog(null);
        }}
        id={id}
        name={title}
        groupId={groupId}
      />
      <NewFolderDialog
        open={openDialog === "new"}
        onClose={() => {
          setOpenDialog(null);
        }}
        binId={binId}
        id={id}
      />
      <DeleteFolderDialog
        open={openDialog === "delete"}
        onClose={() => {
          setOpenDialog(null);
        }}
        id={id}
        groupId={groupId}
      />
    </>
  );
};

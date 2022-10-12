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
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import { RenameFolderDialog } from "./RenameFolderDialog";
import { NewFolderDialog } from "./NewFolderDialog";
import { DeleteFolderDialog } from "./DeleteFolderDialog";
import { useLocalStorage } from "react-use";
import { UploadButton } from "./UploadButton";

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
  const [hiddenGroups, setHiddenGroups] = useLocalStorage(
    "zesty:navMedia:hidden",
    []
  );
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
          borderWidth: "0px",
          borderBottomWidth: "1px",
          borderColor: "border",
          mb: 2,
          // Height specified to make border inset
          height: "64px",
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
            {id ? (
              <MenuItem
                onClick={() => {
                  closeMenu();
                  if (hiddenGroups.includes(id)) {
                    setHiddenGroups(
                      hiddenGroups.filter((group) => group !== id)
                    );
                  } else {
                    setHiddenGroups([...(hiddenGroups as String[]), id]);
                  }
                  // dispatches storage event for components to listen to
                  window.dispatchEvent(new StorageEvent("storage"));
                }}
              >
                <ListItemIcon>
                  {hiddenGroups.includes(id) ? (
                    <VisibilityIcon fontSize="small" />
                  ) : (
                    <VisibilityOffIcon fontSize="small" />
                  )}
                </ListItemIcon>
                <ListItemText>
                  {hiddenGroups.includes(id) ? "Show" : "Hide"}
                </ListItemText>
              </MenuItem>
            ) : null}
          </Menu>
        </Box>
        {hideUpload ? null : (
          <UploadButton currentBinId={binId} currentGroupId={id} />
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

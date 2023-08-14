import React, { FC, useState } from "react";
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  ThemeProvider,
} from "@mui/material";
import { theme } from "@zesty-io/material";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import { useLocalStorage } from "react-use";

import { RenameFolderDialog } from "./RenameFolderDialog";
import { NewFolderDialog } from "./NewFolderDialog";
import { DeleteFolderDialog } from "./DeleteFolderDialog";

export type Dialogs = "delete" | "rename" | "new" | null;
interface Props {
  anchorEl: Element | ((element: Element) => Element);
  onCloseMenu: () => void;
  title: string;
  binId: string;
  id?: string;
  groupId?: string;
}
export const FolderMenu: FC<Props> = ({
  anchorEl,
  onCloseMenu,
  id,
  groupId,
  title,
  binId,
}) => {
  const [openDialog, setOpenDialog] = useState<Dialogs>(null);
  const hiddenGroups =
    JSON.parse(localStorage.getItem("zesty:navMedia:hidden")) || [];
  const [_, setHiddenGroups] = useLocalStorage("zesty:navMedia:hidden", []);

  return (
    <ThemeProvider theme={theme}>
      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={onCloseMenu}>
        <MenuItem
          divider
          onClick={() => {
            onCloseMenu();
            setOpenDialog("new");
          }}
        >
          <ListItemIcon>
            <CreateNewFolderIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Add Sub Folder</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            onCloseMenu();
            setOpenDialog("rename");
          }}
        >
          <ListItemIcon>
            <DriveFileRenameOutlineIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Rename</ListItemText>
        </MenuItem>
        {!!groupId && (
          <MenuItem
            onClick={() => {
              onCloseMenu();
              setOpenDialog("delete");
            }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        )}
        {!!id && (
          <MenuItem
            onClick={() => {
              onCloseMenu();
              if (hiddenGroups?.includes(id)) {
                setHiddenGroups(
                  hiddenGroups?.filter((group: string) => group !== id)
                );
              } else {
                setHiddenGroups([...(hiddenGroups as string[]), id]);
              }
              // dispatches storage event for components to listen to
              window.dispatchEvent(new StorageEvent("storage"));
            }}
          >
            <ListItemIcon>
              {hiddenGroups?.includes(id) ? (
                <VisibilityIcon fontSize="small" />
              ) : (
                <VisibilityOffIcon fontSize="small" />
              )}
            </ListItemIcon>
            <ListItemText>
              {hiddenGroups?.includes(id) ? "Show" : "Hide"}
            </ListItemText>
          </MenuItem>
        )}
      </Menu>
      {openDialog === "rename" ? (
        <RenameFolderDialog
          open
          onClose={() => {
            setOpenDialog(null);
          }}
          id={id}
          name={title}
          groupId={groupId}
        />
      ) : null}
      {openDialog === "new" ? (
        <NewFolderDialog
          open
          onClose={() => {
            setOpenDialog(null);
          }}
          binId={binId}
          id={id}
        />
      ) : null}
      {openDialog === "delete" ? (
        <DeleteFolderDialog
          open
          onClose={() => {
            setOpenDialog(null);
          }}
          id={id}
          groupId={groupId}
        />
      ) : null}
    </ThemeProvider>
  );
};

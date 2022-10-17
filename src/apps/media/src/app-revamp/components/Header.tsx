import { MouseEvent, useState } from "react";
import {
  Box,
  Button,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  ListItemText,
  ListItemIcon,
  Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowDropDownRoundedIcon from "@mui/icons-material/ArrowDropDownRounded";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";
import { RenameFolderDialog } from "./RenameFolderDialog";
import { NewFolderDialog } from "./NewFolderDialog";
import { DeleteFolderDialog } from "./DeleteFolderDialog";
import { useLocalStorage } from "react-use";
import { UploadButton } from "./UploadButton";
import { useDispatch, useSelector } from "react-redux";
import {
  clearSelectedFiles,
  State,
} from "../../../../../shell/store/media-revamp";
import { File } from "../../../../../shell/services/types";

interface Props {
  title: string;
  id?: string;
  binId?: string;
  groupId?: string;
  hideUpload?: boolean;
  addImagesCallback?: (selectedFiles: File[]) => void;
}
type Dialogs = "delete" | "rename" | "new" | null;

export const Header = ({
  title,
  id,
  binId,
  groupId,
  hideUpload,
  addImagesCallback,
}: Props) => {
  const [openDialog, setOpenDialog] = useState<Dialogs>(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const selectedFiles = useSelector(
    (state: { mediaRevamp: State }) => state.mediaRevamp.selectedFiles
  );
  const limitSelected = useSelector(
    (state: { mediaRevamp: State }) => state.mediaRevamp.limitSelected
  );
  const dispatch = useDispatch();
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
        {selectedFiles.length > 0 ? (
          <>
            <Stack direction="row" spacing="2px" alignItems="center">
              <IconButton
                size="small"
                onClick={() => dispatch(clearSelectedFiles())}
                sx={{ height: "fit-content" }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
              <Typography variant="h4" fontWeight={600}>
                {selectedFiles.length}{" "}
                {limitSelected ? `/${limitSelected}` : null} Selected
              </Typography>
            </Stack>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                size="small"
                color="inherit"
                onClick={() => dispatch(clearSelectedFiles())}
                startIcon={<CloseIcon color="action" fontSize="small" />}
              >
                Deselect All
              </Button>
              <Button
                variant="contained"
                size="small"
                color="primary"
                onClick={() => addImagesCallback(selectedFiles)}
                startIcon={<CheckIcon fontSize="small" />}
              >
                Done
              </Button>
            </Stack>
          </>
        ) : (
          <>
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
                  <ArrowDropDownRoundedIcon fontSize="small" />
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
          </>
        )}
      </Box>
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
    </>
  );
};

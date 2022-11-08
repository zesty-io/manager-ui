import { MouseEvent, useEffect, useState } from "react";
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
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DriveFolderUploadRoundedIcon from "@mui/icons-material/DriveFolderUploadRounded";
import DeleteIcon from "@mui/icons-material/Delete";
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import CheckIcon from "@mui/icons-material/Check";
import CreateNewFolderRoundedIcon from "@mui/icons-material/CreateNewFolderRounded";
import { RenameFolderDialog } from "./RenameFolderDialog";
import { NewFolderDialog } from "./NewFolderDialog";
import { DeleteFolderDialog } from "./DeleteFolderDialog";
import { useLocalStorage } from "react-use";
import { UploadButton } from "./UploadButton";
import { useDispatch, useSelector } from "react-redux";
import { MoveFileDialog } from "./FileModal/MoveFileDialog";
import {
  clearSelectedFiles,
  selectFile,
  State,
} from "../../../../../shell/store/media-revamp";
import { useUpdateFileMutation } from "../../../../../shell/services/mediaManager";
import { File } from "../../../../../shell/services/types";
import { useHistory } from "react-router";

interface Props {
  title: string;
  id?: string;
  binId?: string;
  groupId?: string;
  files?: Array<File>;
  hideUpload?: boolean;
  hideFolderCreate?: boolean;
  addImagesCallback?: (selectedFiles: File[]) => void;
  showBackButton?: boolean;
}
type Dialogs = "delete" | "rename" | "new" | null;

export const Header = ({
  title,
  id,
  binId,
  files,
  groupId,
  hideUpload,
  hideFolderCreate,
  addImagesCallback,
  showBackButton,
}: Props) => {
  const [openDialog, setOpenDialog] = useState<Dialogs>(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const history = useHistory();
  const [showMoveFileDialog, setShowMoveFileDialog] = useState(false);
  const selectedFiles = useSelector(
    (state: { mediaRevamp: State }) => state.mediaRevamp.selectedFiles
  );
  const showHeaderActions = useSelector(
    (state: { mediaRevamp: State }) => state.mediaRevamp.showHeaderActions
  );
  const limitSelected = useSelector(
    (state: { mediaRevamp: State }) => state.mediaRevamp.limitSelected
  );
  const dispatch = useDispatch();
  const [hiddenGroups, setHiddenGroups] = useLocalStorage(
    "zesty:navMedia:hidden",
    []
  );
  const [
    updateFile,
    {
      reset: resetUpdate,
      isSuccess: isSuccessUpdate,
      isLoading: isLoadingUpdate,
    },
  ] = useUpdateFileMutation();

  const open = Boolean(anchorEl);
  const openMenu = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const closeMenu = () => {
    setAnchorEl(null);
  };

  const handleUpdateMutation = (newGroupId: string) => {
    Promise.all(
      selectedFiles?.map(async (file) => {
        await updateFile({
          id: file.id,
          previousGroupId: file.group_id,
          body: {
            group_id: newGroupId,
            title: file.title,
            filename: file.filename,
          },
        });
      })
    );
    dispatch(clearSelectedFiles());
  };

  const handleSelectAll = () => {
    // get the first 50 files
    let limitedFiles: Array<File> = [];
    files.map((file, i) => {
      if (i < 50) {
        limitedFiles.push(file);
      }
    });

    // exclude duplicate files and dispatch to selectFile
    const filteredFiles = limitedFiles.filter(
      (file) => !selectedFiles?.includes(file)
    );
    filteredFiles.map((file) => {
      dispatch(selectFile(file));
    });
  };

  return (
    <>
      {showMoveFileDialog && (
        <MoveFileDialog
          handleGroupChange={(newGroupId: string) =>
            handleUpdateMutation(newGroupId)
          }
          binId={binId}
          onClose={() => {
            setShowMoveFileDialog(false);
          }}
          fileCount={selectedFiles?.length}
        />
      )}

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
        {selectedFiles?.length > 0 ? (
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
                {selectedFiles?.length}{" "}
                {isSelectDialog && limitSelected ? `/${limitSelected}` : null}
                Selected
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
                variant="outlined"
                size="small"
                color="inherit"
                onClick={() => handleSelectAll()}
                disabled={
                  selectedFiles?.length == files?.length ||
                  selectedFiles?.length >= 50
                }
                startIcon={
                  <DoneAllRoundedIcon color="action" fontSize="small" />
                }
              >
                Select All
              </Button>
              {showHeaderActions && (
                <Button
                  variant="outlined"
                  size="small"
                  color="inherit"
                  onClick={() => setShowMoveFileDialog(true)}
                  startIcon={
                    <DriveFolderUploadRoundedIcon
                      color="action"
                      fontSize="small"
                    />
                  }
                >
                  Move
                </Button>
              )}
              {addImagesCallback && (
                <Button
                  variant="contained"
                  size="small"
                  color="primary"
                  onClick={() => addImagesCallback(selectedFiles)}
                  startIcon={<CheckIcon fontSize="small" />}
                >
                  Done
                </Button>
              )}
            </Stack>
          </>
        ) : (
          <>
            <Box sx={{ display: "flex", gap: "2px", alignItems: "center" }}>
              {showBackButton && (
                <IconButton
                  size="small"
                  sx={{ height: "fit-content" }}
                  onClick={() => {
                    if (history.length > 2) {
                      history.goBack();
                    } else {
                      history.push("/media");
                    }
                  }}
                >
                  <ArrowBackRoundedIcon fontSize="small" color="action" />
                </IconButton>
              )}
              <Typography variant="h4" fontWeight={600}>
                {title}
              </Typography>
              {id ? (
                <IconButton
                  size="small"
                  onClick={openMenu}
                  sx={{ height: "fit-content" }}
                  aria-label="Open folder menu"
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
                  <ListItemText>Add Sub Folder</ListItemText>
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
            <Box>
              {hideFolderCreate ? null : (
                <Button
                  sx={{ mr: 2 }}
                  variant="outlined"
                  color="inherit"
                  startIcon={<CreateNewFolderRoundedIcon color="action" />}
                  onClick={() => setOpenDialog("new")}
                >
                  Add Sub Folder
                </Button>
              )}
              {hideUpload ? null : (
                <UploadButton currentBinId={binId} currentGroupId={id} />
              )}
            </Box>
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

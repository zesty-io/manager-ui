import { MouseEvent, useEffect, useRef, useMemo, useState } from "react";
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
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
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
import { DeleteFileModal } from "./FileModal/DeleteFileModal";
import {
  clearSelectedFiles,
  selectFile,
  State,
} from "../../../../../shell/store/media-revamp";
import {
  useUpdateFilesMutation,
  useDeleteFilesMutation,
} from "../../../../../shell/services/mediaManager";
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
  const doneButtonRef = useRef<HTMLButtonElement>(null);
  const [openDialog, setOpenDialog] = useState<Dialogs>(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const history = useHistory();
  const now = useMemo(() => new Date(), []);
  const [deleteFiles, { isLoading: isLoadingDelete }] =
    useDeleteFilesMutation();
  const [showMoveFileDialog, setShowMoveFileDialog] = useState(false);
  const [showDeleteFileDialog, setShowDeleteFileDialog] = useState(false);
  const selectedFiles = useSelector(
    (state: { mediaRevamp: State }) => state.mediaRevamp.selectedFiles
  );
  const isSelectDialog = useSelector(
    (state: { mediaRevamp: State }) => state.mediaRevamp.isSelectDialog
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

  const [updateFiles, { isLoading: isUpdatingFiles }] =
    useUpdateFilesMutation();

  const open = Boolean(anchorEl);
  const openMenu = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const closeMenu = () => {
    setAnchorEl(null);
  };

  const handleUpdateMutation = (newGroupId: string) => {
    updateFiles(
      selectedFiles.map((file) => ({
        id: file.id,
        previousGroupId: file.group_id,
        body: {
          group_id: newGroupId,
          title: file.title,
          filename: file.filename,
        },
      }))
    ).then(() => {
      setShowMoveFileDialog(false);
      dispatch(clearSelectedFiles());
    });
  };

  const handleDeleteMutation = () => {
    deleteFiles(
      selectedFiles.map((file) => ({
        id: file.id,
        body: {
          group_id: file.group_id,
        },
      }))
    ).then(() => {
      setShowDeleteFileDialog(false);
      dispatch(clearSelectedFiles());
    });
  };

  const handleSelectAll = () => {
    // exclude duplicate files and dispatch to selectFile
    const filteredFiles = files.filter(
      (file) => !selectedFiles?.includes(file)
    );
    filteredFiles.forEach((file) => {
      dispatch(selectFile(file));
    });
  };

  const disableSelectAll = () => {
    if (
      selectedFiles?.length == files?.length ||
      selectedFiles?.length >= limitSelected
    ) {
      return true;
    } else {
      return false;
    }
  };

  // Focus done button after selecting files
  useEffect(() => {
    if (selectedFiles?.length > 0) {
      doneButtonRef.current?.focus();
    }
  }, [selectedFiles]);

  // Auto-select newly uploaded files when in content editor
  useEffect(() => {
    if (!addImagesCallback) return;
    const filesToSelect = files?.filter(
      (file) =>
        new Date(file.created_at) > now && !selectedFiles?.includes(file)
    );
    if (filesToSelect?.length) {
      filesToSelect.forEach((file) => {
        dispatch(selectFile(file));
      });
    }
  }, [files, addImagesCallback]);

  return (
    <>
      {/* Move File Dialog */}
      {showMoveFileDialog && (
        <MoveFileDialog
          handleGroupChange={(newGroupId: string) => {
            handleUpdateMutation(newGroupId);
          }}
          binId={binId}
          onClose={() => {
            if (!isUpdatingFiles) setShowMoveFileDialog(false);
          }}
          fileCount={selectedFiles?.length}
          showSpinner={isUpdatingFiles}
        />
      )}

      {/* Delete File Dialog */}
      {showDeleteFileDialog && (
        <DeleteFileModal
          onDeleteFile={handleDeleteMutation}
          fileCount={selectedFiles?.length}
          onClose={() => {
            if (!isLoadingDelete) setShowDeleteFileDialog(false);
          }}
          filename={selectedFiles?.length && selectedFiles[0].filename}
          isLoadingDelete={isLoadingDelete}
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
                {isSelectDialog && limitSelected
                  ? ` / ${limitSelected} `
                  : null}
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
                disabled={disableSelectAll()}
                startIcon={
                  <DoneAllRoundedIcon color="action" fontSize="small" />
                }
              >
                Select All
              </Button>
              {showHeaderActions && (
                <>
                  <Button
                    variant="outlined"
                    size="small"
                    color="inherit"
                    onClick={() => setShowDeleteFileDialog(true)}
                    startIcon={<DeleteIcon color="action" fontSize="small" />}
                  >
                    Delete
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => setShowMoveFileDialog(true)}
                    startIcon={
                      <DriveFolderUploadRoundedIcon fontSize="small" />
                    }
                  >
                    Move
                  </Button>
                </>
              )}
              {addImagesCallback && (
                <Button
                  variant="contained"
                  size="small"
                  color="primary"
                  onClick={() => addImagesCallback(selectedFiles)}
                  startIcon={<CheckIcon fontSize="small" />}
                  ref={doneButtonRef}
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
                  <MoreHorizRoundedIcon fontSize="small" />
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
                <UploadButton
                  caller="header"
                  currentBinId={binId}
                  currentGroupId={id}
                />
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

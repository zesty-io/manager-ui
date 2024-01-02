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
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import DriveFolderUploadRoundedIcon from "@mui/icons-material/DriveFolderUploadRounded";
import DeleteIcon from "@mui/icons-material/Delete";
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import CheckIcon from "@mui/icons-material/Check";
import CreateNewFolderRoundedIcon from "@mui/icons-material/CreateNewFolderRounded";
import { useHistory } from "react-router";
import { useLocalStorage } from "react-use";

import { RenameFolderDialog } from "./RenameFolderDialog";
import { NewFolderDialog } from "./NewFolderDialog";
import { DeleteFolderDialog } from "./DeleteFolderDialog";
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
import { MediaBreadcrumbs } from "./MediaBreadcrumbs";
import { FolderMenu } from "./FolderMenu";

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
  showBreadcrumbs?: boolean;
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
  showBreadcrumbs,
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
  const isReplace = useSelector(
    (state: { mediaRevamp: State }) => state.mediaRevamp.isReplace
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
          pt: 4,
          pb: 1.75,
          px: 4,
          borderStyle: "solid",
          borderWidth: "0px",
          borderBottomWidth: "2px",
          borderColor: "border",
          backgroundColor: "background.paper",
        }}
      >
        {selectedFiles?.length > 0 ? (
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack direction="row" spacing="2px" alignItems="center">
              {!isReplace && (
                <IconButton
                  size="small"
                  onClick={() => dispatch(clearSelectedFiles())}
                  sx={{ height: "fit-content" }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              )}
              <Typography variant="h3" fontWeight={700}>
                {!isReplace && selectedFiles?.length}{" "}
                {!isReplace && isSelectDialog && limitSelected
                  ? ` / ${limitSelected} `
                  : null}
                {isReplace && "Replacement File"} Selected
              </Typography>
            </Stack>
            <Box>
              {!isReplace && (
                <>
                  <Button
                    variant="outlined"
                    size="small"
                    color="inherit"
                    sx={{ mr: 1 }}
                    onClick={() => dispatch(clearSelectedFiles())}
                    startIcon={<CloseIcon color="action" fontSize="small" />}
                  >
                    Deselect All
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color="inherit"
                    sx={{ mr: 1 }}
                    onClick={() => handleSelectAll()}
                    disabled={disableSelectAll()}
                    startIcon={
                      <DoneAllRoundedIcon color="action" fontSize="small" />
                    }
                  >
                    Select All
                  </Button>
                </>
              )}
              {showHeaderActions && (
                <>
                  <Button
                    variant="outlined"
                    size="small"
                    color="inherit"
                    sx={{ mr: 1 }}
                    onClick={() => setShowDeleteFileDialog(true)}
                    startIcon={<DeleteIcon color="action" fontSize="small" />}
                  >
                    Delete
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{ mr: addImagesCallback ? 1 : 0 }}
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
                  startIcon={
                    isReplace ? (
                      <AutorenewRoundedIcon fontSize="small" />
                    ) : (
                      <CheckIcon fontSize="small" />
                    )
                  }
                  ref={doneButtonRef}
                >
                  {isReplace ? "Replace" : "Done"}
                </Button>
              )}
            </Box>
          </Stack>
        ) : isReplace ? (
          <Typography variant="h3" fontWeight={700}>
            Select Replacement File
          </Typography>
        ) : (
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack gap={0.25}>
              {showBreadcrumbs && id && <MediaBreadcrumbs id={id} />}
              <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
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
                <Typography
                  variant="h3"
                  fontWeight={700}
                  sx={{
                    display: "-webkit-box",
                    "-webkit-line-clamp": "2",
                    "-webkit-box-orient": "vertical",
                    wordBreak: "break-word",
                    wordWrap: "break-word",
                    hyphens: "auto",
                    overflow: "hidden",
                  }}
                >
                  {title}
                </Typography>
              </Box>
            </Stack>
            <Box flexShrink={0}>
              {id ? (
                <IconButton
                  size="small"
                  onClick={openMenu}
                  sx={{ height: "fit-content", mr: 1 }}
                  aria-label="Open folder menu"
                >
                  <MoreHorizRoundedIcon fontSize="small" />
                </IconButton>
              ) : null}
              <FolderMenu
                anchorEl={anchorEl}
                onCloseMenu={closeMenu}
                title={title}
                binId={binId}
                groupId={groupId}
                id={id}
              />
              {hideFolderCreate ? null : (
                <Button
                  sx={{ mr: 1 }}
                  variant="outlined"
                  color="inherit"
                  startIcon={<CreateNewFolderRoundedIcon color="action" />}
                  onClick={() => setOpenDialog("new")}
                  size="small"
                >
                  Add Sub Folder
                </Button>
              )}
              {hideUpload ? null : (
                <UploadButton currentBinId={binId} currentGroupId={id} />
              )}
            </Box>
          </Stack>
        )}
      </Box>
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
    </>
  );
};

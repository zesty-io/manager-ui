import { FC, useEffect, useState, useRef, useCallback } from "react";
import {
  Typography,
  Box,
  TextField,
  InputAdornment,
  Avatar,
  InputLabel,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Button,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import { useTheme } from "@mui/material/styles";
import { debounce } from "lodash";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ImageIcon from "@mui/icons-material/Image";
import { MD5 } from "../../../../../../utility/md5";
import {
  mediaManagerApi,
  useUpdateFileAltTextMutation,
  useUpdateFileMutation,
  useDeleteFileMutation,
} from "../../../../../../shell/services/mediaManager";
import { fileExtension } from "../../utils/fileUtils";
import { RenameFileModal } from "./RenameFileModal";
import moment from "moment";
import { fileTypeToColor } from "../../utils/fileUtils";

import DriveFileRenameOutlineRoundedIcon from "@mui/icons-material/DriveFileRenameOutlineRounded";
import WidgetsRoundedIcon from "@mui/icons-material/WidgetsRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import DriveFolderUploadRoundedIcon from "@mui/icons-material/DriveFolderUploadRounded";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import DeleteFileModal from "./DeleteFileModal";
import { MoveFileDialog } from "./MoveFileDialog";
interface Props {
  id?: string;
  src?: string;
  filename?: string;
  groupId?: string;
  binId?: string;
  title?: string;
  user?: {
    email?: string;
    role?: string;
  };
  createdAt?: Date;
  handleCloseModal: () => void;
  setShowEdit: (show: boolean) => void;
}

export const FileModalContent: FC<Props> = ({
  id,
  binId,
  src,
  filename,
  groupId,
  title,
  user,
  createdAt,
  handleCloseModal,
  setShowEdit,
}) => {
  const [newTitle, setNewTitle] = useState(title);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isCopiedZuid, setIsCopiedZuid] = useState<boolean>(false);
  const [newFilename, setNewFilename] = useState<string>(
    filename.substring(0, filename.lastIndexOf(".")) || filename
  );
  const [showRenameFileModal, setShowRenameFileModal] =
    useState<boolean>(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(null);
  const [showMoveFileDialog, setShowMoveFileDialog] = useState(false);
  const openSettings = Boolean(showSettingsDropdown);

  const [deleteFile] = useDeleteFileMutation();
  const [
    updateFile,
    {
      reset: resetUpdate,
      isSuccess: isSuccessUpdate,
      isLoading: isLoadingUpdate,
    },
  ] = useUpdateFileMutation();
  const [
    updateFileAltTextMutation,
    {
      reset: resetUpdateAltText,
      isSuccess: isSuccessUpdateAltText,
      isLoading: isLoadingUpdateAltText,
    },
  ] = useUpdateFileAltTextMutation();
  const [showDeleteFileModal, setShowDeleteFileModal] =
    useState<boolean>(false);

  /**
   * @description Set initial values for the fields
   */
  // useEffect(() => {
  //   if (newTitle.current) {
  //     newTitle.current.value = title;
  //   }
  //   // if (fileExtension(filename) !== "No Extension") {
  //   //   setFileType(fileExtension(filename));
  //   // }
  // }, [title, filename]);

  /**
   * @description Used for copying the alttext's value
   */
  const handleCopyClick = (data: string, isZuid = false) => {
    navigator?.clipboard
      ?.writeText(data)
      .then(() => {
        if (isZuid) {
          setIsCopiedZuid(true);
        } else {
          setIsCopied(true);
        }
        setTimeout(() => {
          if (isZuid) {
            setIsCopiedZuid(false);
          } else {
            setIsCopied(false);
          }
        }, 1500);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  /**
   * @description Used to call api everytime the filename and alttext is updated
   */
  const handleUpdateMutation = (
    renamedFilename?: string,
    isAltTextUpdate?: boolean,
    newGroupId = groupId
  ) => {
    // construct file type
    let constructedFileType = "";
    if (fileExtension(filename))
      constructedFileType = `.${fileExtension(filename)}`;

    if (isAltTextUpdate) {
      updateFileAltTextMutation({
        id,
        body: {
          group_id: newGroupId,
          title: newTitle,
          filename:
            `${renamedFilename}${constructedFileType}` ||
            `${newFilename}${constructedFileType}`,
        },
      });
    } else {
      updateFile({
        id,
        previousGroupId: groupId,
        body: {
          group_id: newGroupId,
          title: newTitle,
          filename:
            `${renamedFilename}${constructedFileType}` ||
            `${newFilename}${constructedFileType}`,
        },
      });
    }
  };

  const onDeleteFile = () => {
    deleteFile({
      id,
      body: {
        group_id: groupId,
      },
    });
    handleCloseModal();
    // history.replace(location.path);
  };

  return (
    <Box>
      {/* Delete File Modal */}
      {showDeleteFileModal && (
        <DeleteFileModal
          onDeleteFile={onDeleteFile}
          filename={filename}
          onClose={() => setShowDeleteFileModal(false)}
        />
      )}

      {/* Rename File Modal */}
      {showRenameFileModal && (
        <RenameFileModal
          handleUpdateMutation={handleUpdateMutation}
          onSetNewFilename={setNewFilename}
          onClose={() => setShowRenameFileModal(false)}
          newFilename={newFilename}
          isSuccessUpdate={isSuccessUpdate}
          isLoadingUpdate={isLoadingUpdate}
          resetUpdate={resetUpdate}
          extension={fileExtension(filename)}
        />
      )}

      {showMoveFileDialog && (
        <MoveFileDialog
          handleGroupChange={(newGroupId: string) =>
            handleUpdateMutation(filename, false, newGroupId)
          }
          binId={binId}
          onClose={() => {
            setShowMoveFileDialog(false);
            handleCloseModal();
          }}
        />
      )}

      {/* Content Header */}
      <Box
        sx={{
          p: 2,
          borderColor: "border",
          borderWidth: "0px",
          borderBottomWidth: "1px",
          borderStyle: "solid",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Tooltip title={newFilename} placement="bottom-start">
            <Box
              sx={{
                width: "300px",
              }}
            >
              <Typography variant="body1" noWrap>
                {newFilename}
              </Typography>
            </Box>
          </Tooltip>
          <Box sx={{ display: "flex", flexDirection: "row" }}>
            <IconButton
              size="small"
              onClick={() => setShowRenameFileModal(true)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              aria-label="Trash Button"
              onClick={() => setShowDeleteFileModal(true)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
            <IconButton
              onClick={(evt) => setShowSettingsDropdown(evt.currentTarget)}
              aria-controls={openSettings ? "settingsMenu" : undefined}
              aria-haspopup="true"
              aria-label="Open settings menu"
              aria-expanded={openSettings ? "true" : undefined}
              size="small"
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>

            {/* Settings Dropdown Menu */}
            <Menu
              id="settingsMenu"
              anchorEl={showSettingsDropdown}
              open={Boolean(showSettingsDropdown)}
              onClose={() => setShowSettingsDropdown(null)}
              PaperProps={{
                style: {
                  width: "240px",
                  marginLeft: "-50px",
                },
              }}
              anchorOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
            >
              <MenuItem
                onClick={() => {
                  setShowRenameFileModal(true);
                  setShowSettingsDropdown(null);
                }}
              >
                <ListItemIcon>
                  <DriveFileRenameOutlineRoundedIcon />
                </ListItemIcon>
                <ListItemText>Rename</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleCopyClick(id, true)}>
                <ListItemIcon>
                  {isCopied ? <CheckIcon /> : <WidgetsRoundedIcon />}
                </ListItemIcon>
                <ListItemText>Copy ZUID</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => setShowMoveFileDialog(true)}>
                <ListItemIcon>
                  <DriveFolderUploadRoundedIcon />
                </ListItemIcon>
                <ListItemText>Move to</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => setShowDeleteFileModal(true)}>
                <ListItemIcon>
                  <DeleteRoundedIcon />
                </ListItemIcon>
                <ListItemText>Delete</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Box>
        <Chip
          label={fileExtension(filename) || "No Extension"}
          sx={{
            mt: 1,
            textTransform: "uppercase",
            backgroundColor: `${fileTypeToColor(fileExtension(filename))}.100`,
            color: `${fileTypeToColor(fileExtension(filename))}.600`,
          }}
          size="small"
        />
      </Box>

      {/* Content Form */}
      <Box sx={{ px: 2 }}>
        <Box sx={{ mt: 2 }}>
          <InputLabel>Title</InputLabel>
          <InputLabel>Can be used for alt-text and captions</InputLabel>
          <TextField
            placeholder="Enter title"
            aria-label="Title TextField"
            value={newTitle}
            onChange={(event) => setNewTitle(event.target.value)}
            multiline
            rows={3}
            fullWidth
          />
          {newTitle !== title && (
            <Button
              disabled={isLoadingUpdateAltText}
              size="small"
              sx={{ mt: 1 }}
              variant="contained"
              aria-label="Save Title Button"
              onClick={() => handleUpdateMutation(newFilename, true)}
            >
              {isLoadingUpdateAltText ? (
                <CircularProgress size="24px" color="inherit" />
              ) : (
                "Save"
              )}
            </Button>
          )}
        </Box>
        <Box sx={{ mt: 3 }}>
          <InputLabel>File URL</InputLabel>
          <TextField
            fullWidth
            value={src}
            className="FileUrlField"
            InputProps={{
              readOnly: true,
              disableUnderline: true,
              endAdornment: (
                <InputAdornment position="end">
                  {isCopied ? (
                    <CheckIcon />
                  ) : (
                    <IconButton
                      onClick={() => handleCopyClick(src)}
                      className="CopyFileUrlBtn"
                    >
                      <ContentCopyIcon />
                    </IconButton>
                  )}
                </InputAdornment>
              ),
            }}
          />
        </Box>
        {["jpg", "jpeg", "png", "webp"].includes(fileExtension(filename)) && (
          <Button
            sx={{ mt: 1.5 }}
            onClick={() => setShowEdit(true)}
            startIcon={<EditIcon color="action" />}
            color="inherit"
            variant="contained"
          >
            Launch On the Fly Editor
          </Button>
        )}
        {/* {user?.email && (
          <Box sx={{ mt: 3 }}>
            <Typography color="text.secondary" variant="body3">
              UPLOADED BY
            </Typography>
            <Box sx={{ display: "flex", mt: 1 }}>
              <Avatar
                sx={{ bgcolor: "grey.300", width: 40, height: 40 }}
                alt={user?.email || ""}
                src={`https://www.gravatar.com/avatar/${MD5(
                  user?.email || ""
                )}.jpg?s=40`}
              ></Avatar>
              <Box sx={{ pl: 2 }}>
                <Typography>{user?.email}</Typography>
                <Typography sx={{ color: "text.secondary" }}>
                  {user?.role}
                </Typography>
              </Box>
            </Box>
          </Box>
        )} */}
        <Box sx={{ mt: 3 }}>
          <InputLabel>ZUID</InputLabel>
          <TextField
            fullWidth
            value={id}
            aria-label="Zuid TextField"
            InputProps={{
              readOnly: true,
              disableUnderline: true,
              endAdornment: (
                <InputAdornment position="end">
                  {isCopiedZuid ? (
                    <CheckIcon />
                  ) : (
                    <IconButton
                      onClick={() => handleCopyClick(id, true)}
                      className="CopyZuidBtn"
                    >
                      <ContentCopyIcon />
                    </IconButton>
                  )}
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <Box sx={{ mt: 3 }}>
          {/* @ts-expect-error body3 is not defined */}
          <Typography color="text.secondary" sx={{ mt: 1 }} variant="body3">
            UPLOADED ON
          </Typography>
          <Box sx={{ display: "flex", mt: 1 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CalendarTodayIcon sx={{ color: "#101828", opacity: "0.4" }} />
            </Box>
            <Box sx={{ pl: 3 }}>
              <Typography variant="body2">
                {moment(createdAt).format("LL")}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {moment(createdAt).calendar(null, {
                  lastDay: "[Yesterday] [at] h:mm A ",
                  sameDay: "[Today] [at] h:mm A ",
                  lastWeek: "dddd [at] h:mm A ",
                  sameElse: "dddd [at] h:mm A ",
                })}
                {new Date(createdAt)
                  .toLocaleDateString("en-US", {
                    day: "2-digit",
                    timeZoneName: "short",
                  })
                  .slice(4)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

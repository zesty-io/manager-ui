import { FC, useEffect, useState, useRef } from "react";
import {
  Typography,
  Box,
  TextField,
  InputAdornment,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
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
import { mediaManagerApi } from "../../../../../../shell/services/mediaManager";
import { fileExtension } from "../../utils/fileUtils";
import { RenameFileModal } from "./RenameFileModal";
import moment from "moment";

import { useLocation } from "react-router-dom";
import { useHistory, useRouteMatch } from "react-router-dom";

import DriveFileRenameOutlineRoundedIcon from "@mui/icons-material/DriveFileRenameOutlineRounded";
import WidgetsRoundedIcon from "@mui/icons-material/WidgetsRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import DriveFolderUploadRoundedIcon from "@mui/icons-material/DriveFolderUploadRounded";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import DeleteFileModal from "./DeleteFileModal";
interface Props {
  id?: string;
  src?: string;
  filename?: string;
  groupId?: string;
  title?: string;
  user?: {
    email?: string;
    role?: string;
  };
  createdAt?: Date;
  handleCloseModal: () => void;
}

export const FileModalContent: FC<Props> = ({
  id,
  src,
  filename,
  groupId,
  title,
  user,
  createdAt,
  handleCloseModal,
}) => {
  const theme = useTheme();
  const location = useRouteMatch();
  const history = useHistory();
  const newTitle = useRef<any>("");
  const [isFileUrlCopied, setIsFileUrlCopied] = useState<boolean>(false);
  const [newFilename, setNewFilename] = useState<string>(
    filename.substring(0, filename.lastIndexOf(".")) || filename
  );
  const [fileType, setFileType] = useState<string>(fileExtension(filename));
  const [showRenameFileModal, setShowRenameFileModal] =
    useState<boolean>(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(null);
  const openSettings = Boolean(showSettingsDropdown);

  const [deleteFile] = mediaManagerApi.useDeleteFileMutation();
  const [updateFile, { isLoading: updateFileIsLoading }] =
    mediaManagerApi.useUpdateFileMutation();
  const isLoading = updateFileIsLoading;
  const [showDeleteFileModal, setShowDeleteFileModal] =
    useState<boolean>(false);

  /**
   * @description Set initial values for the fields
   */
  useEffect(() => {
    if (newTitle.current) {
      newTitle.current.value = "setnewtitle";
    }
  }, [title, filename]);

  /**
   * @description Used for copying the alttext's value
   */
  const handleCopyClick = () => {
    navigator?.clipboard
      ?.writeText(src)
      .then(() => {
        setIsFileUrlCopied(true);
        setTimeout(() => {
          setIsFileUrlCopied(false);
        }, 1500);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  /**
   * @description Used to call api everytime the filename and alttext is updated
   */
  const handleUpdateMutation = (renamedFilename?: string) => {
    const debouncedTitle = debounce(async () => {
      updateFile({
        id,
        body: {
          group_id: groupId,
          title: newTitle.current.value,
          filename:
            `${renamedFilename}.${fileType}` || `${newFilename}.${fileType}`,
        },
      });
    }, 500);

    debouncedTitle();
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
          filename={newFilename}
          onClose={() => setShowDeleteFileModal(false)}
        />
      )}

      {/* Content */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          pb: 4,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ImageIcon />
          <Typography variant="body2" noWrap sx={{ width: "200px", ml: 0.5 }}>
            {newFilename}
          </Typography>
          {showRenameFileModal && (
            <RenameFileModal
              handleUpdateMutation={handleUpdateMutation}
              onSetNewFilename={setNewFilename}
              onClose={() => setShowRenameFileModal(null)}
              newFilename={newFilename}
            />
          )}
        </Box>
        <Box>
          <IconButton onClick={() => setShowDeleteFileModal(true)}>
            <DeleteIcon />
          </IconButton>
          <IconButton
            onClick={(evt) => setShowSettingsDropdown(evt.currentTarget)}
            aria-controls={openSettings ? "settingsMenu" : undefined}
            aria-haspopup="true"
            aria-expanded={openSettings ? "true" : undefined}
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            id="settingsMenu"
            anchorEl={showSettingsDropdown}
            open={Boolean(showSettingsDropdown)}
            onClose={() => setShowSettingsDropdown(null)}
            sx={{
              minWidth: "240px",
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
            <MenuItem>
              <ListItemIcon>
                <WidgetsRoundedIcon />
              </ListItemIcon>
              <ListItemText>Copy ZUID</ListItemText>
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

      <Box>
        <Typography>File URL</Typography>
        <TextField
          sx={{ mt: 0.5, width: "100%" }}
          value={src}
          InputProps={{
            readOnly: true,
            disableUnderline: true,
            endAdornment: (
              <InputAdornment position="end">
                {isFileUrlCopied ? (
                  <CheckIcon />
                ) : (
                  <IconButton onClick={() => handleCopyClick()}>
                    <ContentCopyIcon />
                  </IconButton>
                )}
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <Box sx={{ mt: 3 }}>
        <Typography>Alt Text</Typography>
        <TextField
          sx={{ mt: 0.5 }}
          aria-label="empty textarea"
          placeholder="Empty"
          inputRef={newTitle}
          onChange={() => handleUpdateMutation()}
          multiline
          rows={3}
          fullWidth
        />
      </Box>
      <Box sx={{ mt: 2 }}>
        <Typography color="text.secondary">UPLOADED BY</Typography>
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
            <Typography>{user?.role}</Typography>
          </Box>
        </Box>
      </Box>
      <Box sx={{ mt: 2 }}>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
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
            <CalendarTodayIcon />
          </Box>
          <Box sx={{ pl: 3 }}>
            <Typography>{moment(createdAt).format("LL")}</Typography>
            <Typography>
              {moment(createdAt).add(3, "days").calendar()}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

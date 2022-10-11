import { FC, useEffect, useState, useRef } from "react";
import {
  Typography,
  Box,
  TextField,
  InputAdornment,
  Avatar,
  TextareaAutosize,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import { Textarea } from "@zesty-io/core/Textarea";
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

import DriveFileRenameOutlineRoundedIcon from "@mui/icons-material/DriveFileRenameOutlineRounded";
import WidgetsRoundedIcon from "@mui/icons-material/WidgetsRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import DriveFolderUploadRoundedIcon from "@mui/icons-material/DriveFolderUploadRounded";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
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
  logs?: {
    dateUploaded?: string;
    timeUploaded?: string;
  };
}

export const FileModalContent: FC<Props> = ({
  id,
  src,
  filename,
  groupId,
  title,
  user,
  logs,
}) => {
  const theme = useTheme();
  const newTitle = useRef<any>("");
  const [isFileUrlCopied, setIsFileUrlCopied] = useState<boolean>(false);
  const [newFilename, setNewFilename] = useState<string>(filename);
  const [fileType, setFileType] = useState<string>(fileExtension(filename));
  const [showRenameFileModal, setShowRenameFileModal] =
    useState<boolean>(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(null);
  const openSettings = Boolean(showSettingsDropdown);

  const [updateFile, { isLoading: updateFileIsLoading }] =
    mediaManagerApi.useUpdateFileMutation();
  const isLoading = updateFileIsLoading;

  /**
   * @description Set initial values for the fields
   */
  useEffect(() => {
    newTitle.current.value = title;
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
        console.log(err);
      });
  };

  /**
   * @description Used to call api everytime the filename and alttext is updated
   * @note fileType will be appended on the filename payload
   */
  const handleUpdateMutation = () => {
    const debouncedTitle = debounce(async () => {
      updateFile({
        id,
        body: {
          group_id: groupId,
          title: newTitle.current.value,
          filename: newFilename,
        },
      });
    }, 500);

    debouncedTitle();
  };

  return (
    <Box>
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
          <Typography variant="body2" noWrap sx={{ width: "200px", mt: 0.3 }}>
            {newFilename}
          </Typography>
          {showRenameFileModal && (
            <RenameFileModal
              handleUpdateMutation={handleUpdateMutation}
              onSetNewFilename={setNewFilename}
              fileType={fileType}
              onClose={() => setShowRenameFileModal(null)}
              newFilename={newFilename}
            />
          )}
        </Box>
        <Box>
          <IconButton>
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
              width: "240px",
            }}
          >
            <MenuItem
              sx={{
                p: 1,
                display: "flex",
                alignItems: "center",
                alignSelf: "stretch",
              }}
              onClick={() => {
                setShowRenameFileModal(true);
                setShowSettingsDropdown(null);
              }}
            >
              <DriveFileRenameOutlineRoundedIcon sx={{ width: "36px" }} />
              Rename
            </MenuItem>
            <MenuItem
              sx={{
                p: 1,
                display: "flex",
                alignItems: "center",
                alignSelf: "stretch",
              }}
              onClick={() => setShowRenameFileModal(true)}
            >
              <WidgetsRoundedIcon sx={{ width: "36px" }} />
              Copy ZUID
            </MenuItem>
            <MenuItem
              sx={{
                p: 1,
                display: "flex",
                alignItems: "center",
                alignSelf: "stretch",
              }}
              onClick={() => setShowRenameFileModal(true)}
            >
              <ContentCopyRoundedIcon sx={{ width: "36px" }} />
              Duplicate
            </MenuItem>
            <MenuItem
              sx={{
                p: 1,
                display: "flex",
                alignItems: "center",
                alignSelf: "stretch",
              }}
              onClick={() => setShowRenameFileModal(true)}
            >
              <DriveFolderUploadRoundedIcon sx={{ width: "36px" }} />
              Move to
            </MenuItem>
            <MenuItem
              sx={{
                p: 1,
                display: "flex",
                alignItems: "center",
                alignSelf: "stretch",
              }}
              onClick={() => setShowRenameFileModal(true)}
            >
              <FolderRoundedIcon sx={{ width: "36px" }} />
              Show file location
            </MenuItem>
            <MenuItem
              sx={{
                p: 1,
                display: "flex",
                alignItems: "center",
                alignSelf: "stretch",
              }}
              onClick={() => setShowRenameFileModal(true)}
            >
              <DeleteRoundedIcon sx={{ width: "36px" }} />
              Delete
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      <Box>
        <Typography color="text.primary">File URL</Typography>
        <TextField
          sx={{ mt: 1, width: "100%" }}
          value={src}
          InputProps={{
            readOnly: true,
            disableUnderline: true,
            endAdornment: (
              <InputAdornment position="end">
                {isFileUrlCopied ? (
                  <CheckIcon />
                ) : (
                  <ContentCopyIcon
                    onClick={handleCopyClick}
                    sx={{ cursor: "pointer" }}
                  />
                )}
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <Box sx={{ mt: 3 }}>
        <Typography>Alt Text</Typography>
        <TextField
          aria-label="empty textarea"
          placeholder="Empty"
          ref={newTitle}
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
            <Typography>{logs?.dateUploaded}</Typography>
            <Typography>{logs?.timeUploaded}</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

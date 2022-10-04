import { FC, useState } from "react";
import {
  Typography,
  Box,
  TextField,
  InputAdornment,
  Avatar,
  TextareaAutosize,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import { Textarea } from "@zesty-io/core/Textarea";
import { useTheme } from "@mui/material/styles";
import { MD5 } from "../../../../../../utility/md5";

interface Props {
  id?: string;
  src?: string;
  filename?: string;
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
  title,
  user,
  logs,
}) => {
  const theme = useTheme();
  const [isFileUrlCopied, setIsFileUrlCopied] = useState(false);

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

  return (
    <Box>
      <Box>
        <Typography color="text.primary">File URL</Typography>
        <TextField
          sx={{ mt: 1, width: "100%" }}
          value={filename}
          variant="standard"
          InputProps={{
            readOnly: true,
            disableUnderline: true,
            style: {
              borderRadius: "8px",
              padding: "7px 12px",
              border: `1px solid ${theme.palette.grey[200]}`,
            },
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
        <Typography color="text.primary">Alt Text</Typography>
        <TextareaAutosize
          aria-label="empty textarea"
          placeholder="Empty"
          value={title}
          style={{
            width: "100%",
            height: 82,
            marginTop: "4px",
            padding: "7px 12px",
            boxSizing: "border-box",
            border: `1px solid ${theme.palette.grey[200]}`,
            borderRadius: "8px",
            outline: "none",
            fontSize: "14px",
          }}
        />
      </Box>
      <Box sx={{ mt: 2 }}>
        <Typography color="text.secondary">UPLOADED BY</Typography>
        <Box sx={{ display: "flex", mt: 1 }}>
          <Avatar
            sx={{ bgcolor: "grey.300", width: 40, height: 40 }}
            alt="Remy Sharp"
            src={`https://www.gravatar.com/avatar/${MD5(
              "testemail@gmail.com"
            )}.jpg?s=40`}
          ></Avatar>
          <Box sx={{ pl: 2 }}>
            <Typography variant="body1">Name</Typography>
            <Typography variant="body1">Role</Typography>
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

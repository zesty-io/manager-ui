import { useEffect } from "react";
import {
  CardMedia,
  Avatar,
  Checkbox,
  Grid,
  IconButton,
  Stack,
  Paper,
  Typography,
  Box,
  Slide,
  Zoom,
  Grow,
} from "@mui/material";
import TrapFocus from "@mui/material/Unstable_TrapFocus";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { MemoizedEditor } from "../../../../../apps/code-editor/src/app/components/Editor/components/MemoizedEditor";
import MonacoEditor from "react-monaco-editor/lib/editor";
type Props = {};

const JsonViewer = ({
  open,
  data,
  onClose,
}: {
  open: boolean;
  data: any;
  onClose: () => void;
}) => {
  useEffect(() => {
    console.debug("MOUNTED");

    return () => {
      console.debug("UNMOUNTED");
    };
  }, []);
  return (
    <TrapFocus open={open} disableAutoFocus disableEnforceFocus>
      <Slide direction="right" in={open} mountOnEnter unmountOnExit>
        <Paper
          elevation={0}
          variant="outlined"
          sx={{
            zIndex: 5,
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            borderRadius: "8px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="flex-start"
            alignItems="center"
            width="100%"
            height="84px"
            maxHeight="84px"
            borderBottom="1px solid"
            borderColor="border"
            px={2}
          >
            <IconButton sx={{ flexGrow: 0 }} onClick={onClose}>
              <ArrowBackRoundedIcon color="action" />
            </IconButton>
            <Typography variant="h4" fontWeight={700} sx={{ flexGrow: 1 }}>
              View JSON
            </Typography>
          </Box>
          <Box
            borderRadius={2}
            sx={{
              height: "calc(100% - 84px)",
              width: "100%",
              overflow: "auto",
              bgcolor: "grey.50",
              py: 2,
              px: 4,
              "& .react-monaco-editor-container": {
                borderRadius: "8px",
                overflow: "hidden",
                "& .monaco-editor, \
                & .monaco-editor-background,\
                & .monaco-editor .inputarea.ime-input,\
                & .overflow-guard .margin": {
                  backgroundColor: "grey.900",
                },
              },
            }}
          >
            <MonacoEditor
              language="json"
              theme="vs-dark"
              options={{
                readOnly: true,
                domReadOnly: true,
                fontSize: 14,
                lineNumbers: "off",
                scrollBeyondLastLine: false,
                selectOnLineNumbers: true,
                automaticLayout: true,
                wordWrap: "on",
                minimap: {
                  enabled: false,
                },
                padding: {
                  top: 20,
                  bottom: 20,
                },
              }}
              value={`{
  "video_id": "1631094",
  “title": "Chugging through Sri Lanka's tea plantations",
  "thumbnail_image": "https://lanka.com/images/ella.jpg",
  "video": "https://lanka.com/videos/ella.mov",
  "duration": "13:10",
}`}
            />
          </Box>
        </Paper>
      </Slide>
    </TrapFocus>
  );
};

export default JsonViewer;

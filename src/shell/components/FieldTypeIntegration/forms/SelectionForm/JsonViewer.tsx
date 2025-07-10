import { IconButton, Paper, Typography, Box, Slide } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import MonacoEditor from "react-monaco-editor/lib/editor";
import CloseIcon from "@mui/icons-material/Close";

const SLIDER_PROPS = {
  direction: "right",
  appear: true,
  mountOnEnter: true,
  unmountOnExit: true,
};

const JsonViewer = ({
  open,
  data,
  onClose,
  isSlider = false,
  showCloseButton = false,
}: {
  open?: boolean;
  data: any;
  onClose: () => void;
  isSlider?: boolean;
  showCloseButton?: boolean;
}) => {
  if (!!data?.["_itemId"]) {
    delete data["_itemId"];
  }

  return (
    <Box
      component={isSlider ? Slide : "div"}
      {...(isSlider
        ? { in: open, ...SLIDER_PROPS }
        : { width: "100%", height: "100%" })}
    >
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
          sx={{
            px: 4,
            pt: 4.5,
            pb: 2,
          }}
        >
          {!showCloseButton && (
            <IconButton
              sx={{ flexGrow: 0 }}
              onClick={onClose}
              data-cy="jsonCodeViewerArrowButton"
            >
              <ArrowBackRoundedIcon color="action" />
            </IconButton>
          )}
          <Typography variant="h4" fontWeight={700} sx={{ flexGrow: 1 }}>
            View JSON
          </Typography>
          {!!showCloseButton && (
            <IconButton
              data-cy="jsonCodeViewerCloseButton"
              onClick={onClose}
              sx={{ flexGrow: 0, position: "absolute", top: 16, right: 16 }}
            >
              <CloseIcon color="action" />
            </IconButton>
          )}
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

              "& .mtk4": {
                color: "#FEC84B",
              },
              "& .mtk5": {
                color: "#32D583",
                "&.detected-link": {
                  color: "#0BA5EC",
                },
              },
              "& .mtk6": {
                color: "#0BA5EC",
              },
            },
          }}
        >
          <MonacoEditor
            className="integrationJsonViewerEditor"
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
            value={!data ? "" : JSON.stringify(data, null, 2)}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default JsonViewer;

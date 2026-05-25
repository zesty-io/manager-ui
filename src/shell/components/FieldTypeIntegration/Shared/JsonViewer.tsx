import {
  IconButton,
  Typography,
  Box,
  Drawer,
  Dialog,
  DrawerProps,
  DialogProps,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import MonacoEditor from "react-monaco-editor/lib/editor";
import CloseIcon from "@mui/icons-material/Close";

const DRAWER_SLOT_PROPS: DrawerProps = {
  anchor: "left",
  hideBackdrop: true,
  slotProps: {
    root: {
      sx: {
        position: "absolute",
      },
    },
    paper: {
      sx: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
      },
    },
  },
};

const DIALOG_SLOT_PROPS: DialogProps = {
  open: true,
  fullWidth: true,
  maxWidth: "md",
  slotProps: {
    paper: {
      sx: {
        width: "100%",
        height: "calc(100vh - 40px)",
        maxHeight: "1240px",
      },
    },
  },
};

export const sanitizeJsonData = (data: any, stringify: boolean = false) => {
  try {
    let newData = data;

    if ("_itemId" in data) {
      const { _itemId, ...restData } = data;
      newData = restData;
    }
    return !stringify ? newData : JSON.stringify(newData, null, 2);
  } catch (error) {
    return `Script Error: ${error?.message}`;
  }
};

const JsonViewer = ({
  open,
  data,
  onClose,
  isSlider = false,
  showCloseButton = false,
  container,
}: {
  open?: boolean;
  data: any;
  onClose: () => void;
  isSlider?: boolean;
  showCloseButton?: boolean;
  container?: React.RefObject<HTMLElement>;
}) => {
  const sanitizedJson = sanitizeJsonData(data);

  const Component = isSlider ? Drawer : Dialog;
  const componentProps = isSlider
    ? {
        open,
        onClose,
        container: container?.current,
        ...DRAWER_SLOT_PROPS,
      }
    : {
        onClose,
        fullWidth: true,
        ...DIALOG_SLOT_PROPS,
        open,
      };

  return (
    <Component {...componentProps}>
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
          value={JSON.stringify(sanitizedJson, undefined, 2)}
        />
      </Box>
    </Component>
  );
};

export default JsonViewer;

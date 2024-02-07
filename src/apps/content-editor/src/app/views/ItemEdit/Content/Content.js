import { Editor } from "../../../components/Editor";
import { PreviewMode } from "../../../components/Editor/PreviewMode";
import {
  Box,
  Stack,
  IconButton,
  Tooltip,
  useMediaQuery,
  ThemeProvider,
} from "@mui/material";
import { theme } from "@zesty-io/material";
import { StartRounded, DesktopMacRounded } from "@mui/icons-material";
import { Actions } from "./Actions";
import { useLocalStorage } from "react-use";
import { useContext } from "react";
import { DuoModeContext } from "../../../../../../../shell/contexts/duoModeContext";
export default function Content(props) {
  const [showSidebar, setShowSidebar] = useLocalStorage(
    "zesty:content:sidebarOpen",
    false
  );

  const {
    value: showDuoMode,
    setValue: setShowDuoMode,
    isDisabled,
  } = useContext(DuoModeContext);

  const xLarge = useMediaQuery((theme) => theme.breakpoints.up("xl"));

  const isFocusMode = !showDuoMode && !showSidebar;

  return (
    <Box
      bgcolor="grey.50"
      height="100%"
      overflow="hidden"
      pt={2.5}
      pr={4}
      display="flex"
      justifyContent="space-between"
      sx={{
        "*": {
          scrollbarWidth: "none",
          "-ms-overflow-style": "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        },
      }}
    >
      <Box
        height="100%"
        sx={{
          display: "flex",
          flex: showDuoMode ? "unset" : 1,
          justifyContent:
            (!showDuoMode && !showSidebar) || xLarge ? "center" : "flex-start",
          overflowY: "scroll",
          maxWidth: showDuoMode ? 640 : "unset",
          width: showDuoMode ? "100%" : "unset",
        }}
        pr={3}
        pl={4}
      >
        <Box
          width={isFocusMode ? "60%" : "100%"}
          height="100%"
          minWidth={isFocusMode && 640}
          flex="0 1 auto"
        >
          <Box width="100%">
            <Editor
              // active={this.state.makeActive}
              // scrolled={() => this.setState({ makeActive: "" })}
              model={props.model}
              itemZUID={props.itemZUID}
              item={props.item}
              dispatch={props.dispatch}
              isDirty={props.item.dirty}
              onSave={props.onSave}
              modelZUID={props.modelZUID}
              saveClicked={props.saveClicked}
              fieldErrors={props.fieldErrors}
              onUpdateFieldErrors={props.onUpdateFieldErrors}
              hasErrors={props.hasErrors}
            />
          </Box>
        </Box>
      </Box>
      {!showDuoMode ? (
        <Box display="flex" gap={1}>
          <ThemeProvider theme={theme}>
            <Stack
              gap={1.5}
              sx={{
                ...(!showSidebar && {
                  position: "absolute",
                  right: "24px",
                }),
              }}
            >
              <Tooltip
                title={showSidebar ? "Close Info Bar" : "Open Info Bar"}
                placement="left"
              >
                <IconButton
                  size="small"
                  onClick={() => setShowSidebar(!showSidebar)}
                  data-cy="ContentSidebarToggle"
                >
                  <StartRounded
                    fontSize="small"
                    sx={{
                      transform: showSidebar
                        ? "rotate(0deg)"
                        : "rotate(180deg)",
                    }}
                  />
                </IconButton>
              </Tooltip>
              {!isDisabled && (
                <Tooltip title="Open DUO Mode" placement="left" dark>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setShowDuoMode(true);
                    }}
                  >
                    <DesktopMacRounded fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </ThemeProvider>
          {showSidebar && (
            <Box
              maxWidth={320}
              flex="0 1 auto"
              height="100%"
              pl={4}
              sx={{
                borderLeft: (theme) => `1px solid ${theme.palette.grey[200]}`,
                overflowY: "auto",
                boxSizing: "border-box",
              }}
              data-cy="ContentSidebar"
            >
              <Actions
                {...props}
                site={{}}
                set={{
                  type: props.model?.type,
                }}
              />
            </Box>
          )}
        </Box>
      ) : (
        <Box height="100%" flex="1 1 auto" minWidth={360}>
          <PreviewMode
            dirty={props.item.dirty}
            version={props.item.meta.version}
            onClose={() => setShowDuoMode(false)}
            onSave={() => props.onSave()}
            hasErrors={props.hasErrors}
          />
        </Box>
      )}
    </Box>
  );
}

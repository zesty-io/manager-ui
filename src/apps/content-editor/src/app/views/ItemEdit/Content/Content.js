import { Editor } from "../../../components/Editor";
import { PreviewMode } from "../../../components/Editor/PreviewMode";
import { Box, Stack, IconButton, Tooltip } from "@mui/material";
import { StartRounded, DesktopMacRounded } from "@mui/icons-material";
import { Actions } from "./Actions";
import { useLocalStorage } from "react-use";
export default function Content(props) {
  const [showSidebar, setShowSidebar] = useLocalStorage(
    "zesty:content:sidebarOpen",
    false
  );
  const [showDuoModeLS, setShowDuoModeLS] = useLocalStorage(
    "zesty:content:duoModeOpen",
    true
  );

  const showDuoMode = props?.model?.type === "dataset" ? false : showDuoModeLS;

  return (
    <Box
      bgcolor="grey.50"
      height="100%"
      overflow="hidden"
      px={4}
      pt={2.5}
      display="flex"
      gap={3}
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
            !showDuoMode && !showSidebar ? "center" : "flex-start",
          overflowY: "scroll",
          overscrollBehavior: "none",
        }}
      >
        <Box height="100%" maxWidth={640} flex="0 1 auto">
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
          />
        </Box>
      </Box>
      {!showDuoMode ? (
        <Box display="flex" gap={1}>
          <Stack gap={1.5}>
            <Tooltip
              title={showSidebar ? "Close Info Bar" : "Open Info Bar"}
              placement="left"
              dark
            >
              <IconButton
                size="small"
                onClick={() => setShowSidebar(!showSidebar)}
              >
                <StartRounded
                  fontSize="small"
                  sx={{
                    transform: showSidebar ? "rotate(0deg)" : "rotate(180deg)",
                  }}
                />
              </IconButton>
            </Tooltip>
            {props.model?.type !== "dataset" && (
              <Tooltip title="Open DUO Mode" placement="left" dark>
                <IconButton
                  size="small"
                  onClick={() => {
                    setShowDuoModeLS(true);
                  }}
                >
                  <DesktopMacRounded fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
          {showSidebar && (
            <Box
              maxWidth={320}
              flex="0 1 auto"
              height="100%"
              pl={4}
              sx={{
                borderLeft: (theme) => `1px solid ${theme.palette.grey[200]}`,
                overflowY: "auto",
              }}
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
        <Box height="100%" flex="1 1 auto">
          <PreviewMode
            dirty={props.item.dirty}
            version={props.item.meta.version}
            onClose={() => setShowDuoModeLS(false)}
            onSave={() => props.onSave()}
          />
        </Box>
      )}
    </Box>
  );
}

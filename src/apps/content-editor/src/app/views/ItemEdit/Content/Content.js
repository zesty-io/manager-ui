import { useSelector } from "react-redux";
import cx from "classnames";

import { useState } from "react";
import { Editor } from "../../../components/Editor";
import { Header2 } from "../components/ItemEditHeader";
import { ItemVersioning } from "../components/Header/ItemVersioning";
import { PreviewMode } from "../../../components/Editor/PreviewMode";
import { ActionsDrawer } from "./ActionsDrawer";

import styles from "./Content.less";
import { Box, Stack, IconButton } from "@mui/material";
import { StartRounded, DesktopMacRounded } from "@mui/icons-material";
import { Actions } from "./Actions";
import { useLocalStorage } from "react-use";
export default function Content(props) {
  // const ui = useSelector((state) => state.ui);
  const [showSidebar, setShowSidebar] = useLocalStorage(
    "zesty:content:sidebarOpen",
    false
  );
  const [showDuoModeLS, setShowDuoModeLS] = useLocalStorage(
    "zesty:content:duoModeOpen",
    false
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
          flex: showDuoMode ? 0 : 1,
          justifyContent:
            !showDuoMode && !showSidebar ? "center" : "flex-start",
        }}
      >
        <Box height="100%" width={showDuoMode ? 412 : 640}>
          <Editor
            // active={this.state.makeActive}
            // scrolled={() => this.setState({ makeActive: "" })}
            model={props.model}
            itemZUID={props.itemZUID}
            item={props.item}
            fields={props.fields}
            dispatch={props.dispatch}
            isDirty={props.item.dirty}
            onSave={props.onSave}
            modelZUID={props.modelZUID}
            missingRequiredFieldNames={props.missingRequiredFieldNames ?? []}
          />
        </Box>
      </Box>
      {!showDuoMode ? (
        <Box display="flex" gap={1}>
          <Stack gap={1.5}>
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
            {props.model?.type !== "dataset" && (
              <IconButton
                size="small"
                onClick={() => {
                  setShowDuoModeLS(true);
                }}
              >
                <DesktopMacRounded fontSize="small" />
              </IconButton>
            )}
          </Stack>
          {showSidebar && (
            <Box
              width={320}
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
        <Box height="100%" flex={1} minWidth={360}>
          <PreviewMode
            dirty={props.item.dirty}
            version={props.item.meta.version}
            onClose={() => setShowDuoModeLS(false)}
          />
        </Box>
      )}

      {/* {ui.duoMode && (
          <PreviewMode
            dirty={props.item.dirty}
            version={props.item.meta.version}
          />
        )} */}
    </Box>
  );
}

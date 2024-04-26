import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Box, TextField, Button, Stack } from "@mui/material";
import { Editor } from "@tinymce/tinymce-react";
import { theme } from "@zesty-io/material";
import sanitizeHtml from "sanitize-html";
import { useSelector } from "react-redux";

import { MentionList } from "./MentionList";
import tinymce from "tinymce";
import { countCharUsage, getCursorPosition } from "./utils";
import { AppState } from "../../../shell/store/types";

const PLACEHOLDER = '<p class="placeholder">Reply or add others with @</p>';

type InputFieldProps = {
  isFirstComment: boolean;
  onCancel: () => void;
};
export const InputField = ({ isFirstComment, onCancel }: InputFieldProps) => {
  const buttonsContainerRef = useRef<HTMLDivElement>();
  const inputRef = useRef<HTMLDivElement>();
  const mentionListRef = useRef(null);
  const [inputValue, setInputValue] = useState("");
  const [initialValue, setInitialValue] = useState(PLACEHOLDER);
  const [isEditorInitialized, setIsEditorInitialized] = useState(false);
  const [isEditorActive, setIsEditorActive] = useState(false);
  const [mentionListAnchorEl, setMentionListAnchorEl] = useState(null);
  const [isEnterPressed, setIsEnterPressed] = useState(true);
  const [userFilterKeyword, setUserFilterKeyword] = useState("");
  const platform = useSelector((state: AppState) => state.platform);

  return (
    <>
      <Box sx={{ my: 1.5 }}>
        <Box height={100} display={isEditorInitialized ? "none" : "block"} />
        <Box
          ref={inputRef}
          display={isEditorInitialized ? "block" : "none"}
          sx={{
            "& #commentInputField": {
              ...theme.typography.body2,
              my: 1.5,
              p: 1,
              minHeight: 40,
              borderRadius: 2,
              boxSizing: "border-box",
              border: (theme) => `1px solid ${theme.palette.border}`,

              "&:focus-visible": {
                outline: (theme) => `${theme.palette.primary.light} solid 1px`,
              },

              "& .placeholder": {
                color: "text.disabled",
              },
            },
          }}
        >
          <Editor
            id="commentInputField"
            initialValue={PLACEHOLDER}
            init={{
              inline: true,

              setup: (editor) => {
                editor.on("ResizeEditor", () => {
                  if (!editor.isNotDirty) {
                    buttonsContainerRef.current?.scrollIntoView();
                  }
                });
              },
            }}
            onClick={() => {
              // Removes the placeholder
              if (tinymce?.activeEditor.getContent() === PLACEHOLDER) {
                tinymce?.activeEditor.setContent("");
              }
              setIsEditorActive(true);
            }}
            onBlur={() => {
              // Re-adds the placeholder when user clicks out and there's no value
              if (!tinymce?.activeEditor.getContent()) {
                tinymce?.activeEditor.setContent(PLACEHOLDER);
              }
              setIsEditorActive(false);
            }}
            onInit={(evt, editor) => {
              setIsEditorInitialized(true);
            }}
            onEditorChange={(value, editor) => {
              setInputValue(value);
            }}
            onKeyDown={(evt, editor) => {
              // Checks if the mention list should be opened or not
              if (evt.key === "@") {
                setTimeout(() => {
                  setMentionListAnchorEl(inputRef.current);
                });
              }

              // Logs the entered values after the mention list was opened
              if (!!mentionListAnchorEl) {
                if (evt.key.length === 1) {
                  setUserFilterKeyword(userFilterKeyword + evt.key);
                } else if (evt.key === "Backspace") {
                  setUserFilterKeyword(
                    userFilterKeyword.slice(0, userFilterKeyword?.length - 1)
                  );
                }
              } else {
                setUserFilterKeyword("");
              }

              // Changes selected item from the mention list when open
              if (
                (evt.key === "ArrowDown" || evt.key === "ArrowUp") &&
                !!mentionListAnchorEl
              ) {
                evt.preventDefault();
                mentionListRef.current?.handleChangeSelectedUser(evt.key);
                return;
              }

              // Closes the mention list
              if (
                (evt.key === "ArrowLeft" ||
                  evt.key === "ArrowRight" ||
                  evt.key === " ") &&
                !!mentionListAnchorEl
              ) {
                setMentionListAnchorEl(null);
                return;
              }

              // Checks if the @ that opened the mention list was deleted
              if (
                (evt.key === "Backspace" || evt.key === "Delete") &&
                !!mentionListAnchorEl
              ) {
                const countBeforeDeletion = countCharUsage(
                  inputRef.current?.innerText,
                  "@"
                );

                setTimeout(() => {
                  const countAfterDeletion = countCharUsage(
                    inputRef.current?.innerText,
                    "@"
                  );

                  if (countAfterDeletion < countBeforeDeletion) {
                    setMentionListAnchorEl(null);
                  }
                });
                return;
              }

              // Selects the highlighted item when mention list is open
              if (evt.key === "Enter" && !!mentionListAnchorEl) {
                evt.preventDefault();
                const userEmail =
                  mentionListRef.current?.handleSelectUser()?.email;

                if (userEmail) {
                  editor.insertContent(
                    mentionListRef.current?.handleSelectUser()?.email
                  );
                  setMentionListAnchorEl(null);
                }
                return;
              }
            }}
          />
        </Box>
      </Box>
      {!!mentionListAnchorEl && (
        <MentionList
          ref={mentionListRef}
          anchorEl={mentionListAnchorEl}
          filterKeyword={userFilterKeyword}
        />
      )}
      <Stack
        ref={buttonsContainerRef}
        direction="row"
        gap={1}
        justifyContent="end"
      >
        <Button
          variant="outlined"
          color="inherit"
          size="small"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button variant="contained" color="primary" size="small">
          {isFirstComment ? "Comment" : "Reply"}
        </Button>
      </Stack>
    </>
  );
};

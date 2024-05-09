import { useEffect, useRef, useState, useContext } from "react";
import { Box, Typography, Button, Stack } from "@mui/material";
import { Editor } from "@tinymce/tinymce-react";
import { theme } from "@zesty-io/material";
import { LoadingButton } from "@mui/lab";
import { useParams } from "react-router";

import { MentionList } from "./MentionList";
import tinymce from "tinymce";
import { countCharUsage, getResourceTypeByZuid } from "./utils";
import { CommentContext } from "../../contexts/CommentProvider";
import {
  useCreateCommentMutation,
  useCreateReplyMutation,
  useUpdateCommentMutation,
  useUpdateReplyMutation,
} from "../../services/accounts";

const PLACEHOLDER = '<p class="placeholder">Reply or add others with @</p>';
const EMAIL_MENTION_REGEX =
  /(?<!\>)@[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}(?!\<span\>)/gm;

type InputFieldProps = {
  isFirstComment: boolean;
  onCancel: () => void;
  resourceZUID: string;
  parentCommentZUID: string;
  isEditMode?: boolean;
  editModeValue?: string;
};
export const InputField = ({
  isFirstComment,
  onCancel,
  resourceZUID,
  parentCommentZUID,
  isEditMode = false,
  editModeValue = "",
}: InputFieldProps) => {
  const [
    createComment,
    {
      isLoading: isCreatingComment,
      isError: isCommentCreationError,
      isSuccess: isCommentCreated,
    },
  ] = useCreateCommentMutation();
  const [
    createReply,
    {
      isLoading: isCreatingReply,
      isError: isReplyCreationError,
      isSuccess: isReplyCreated,
    },
  ] = useCreateReplyMutation();
  const [
    updateComment,
    {
      isLoading: isUpdatingComment,
      isError: isCommentUpdateError,
      isSuccess: isCommentUpdated,
    },
  ] = useUpdateCommentMutation();
  const [
    updateReply,
    {
      isLoading: isUpdatingReply,
      isError: isReplyUpdateError,
      isSuccess: isReplyUpdated,
    },
  ] = useUpdateReplyMutation();
  const { itemZUID } = useParams<{ itemZUID: string }>();
  const [comments, updateComments, commentZUIDtoEdit, setCommentZUIDtoEdit] =
    useContext(CommentContext);
  const buttonsContainerRef = useRef<HTMLDivElement>();
  const inputRef = useRef<HTMLDivElement>();
  const mentionListRef = useRef(null);
  const [inputValue, setInputValue] = useState("");
  const [initialValue, setInitialValue] = useState(PLACEHOLDER);
  const [mentionListAnchorEl, setMentionListAnchorEl] = useState(null);
  const [userFilterKeyword, setUserFilterKeyword] = useState("");

  const handleSubmit = () => {
    if (isFirstComment) {
      createComment({
        resourceType: getResourceTypeByZuid(resourceZUID),
        resourceZUID,
        content: inputValue,
        resourceParentZUID: itemZUID,
      });
    } else {
      createReply({
        content: inputValue,
        commentZUID: parentCommentZUID,
        resourceZUID,
      });
    }
  };

  const handleUpdate = () => {
    if (commentZUIDtoEdit.startsWith("24")) {
      updateComment({
        resourceZUID,
        commentZUID: commentZUIDtoEdit,
        content: inputValue,
      });
    } else {
      updateReply({
        commentZUID: commentZUIDtoEdit,
        parentCommentZUID,
        content: inputValue,
      });
    }
  };

  const getPrimaryButtonText = () => {
    if (isEditMode) {
      return "Save";
    }

    if (isFirstComment) {
      return "Comment";
    } else {
      return "Reply";
    }
  };

  useEffect(() => {
    if (comments[resourceZUID]) {
      setInitialValue(comments[resourceZUID]);
      setInputValue(comments[resourceZUID]);
    }
  }, []);

  useEffect(() => {
    // No need to save edit mode changes in draft
    if (inputValue && !isEditMode) {
      updateComments({
        [resourceZUID]: inputValue === PLACEHOLDER ? "" : inputValue,
      });
    }
  }, [inputValue, isEditMode]);

  useEffect(() => {
    if (isCommentCreated || isReplyCreated) {
      tinymce?.activeEditor.setContent(PLACEHOLDER);
      setInputValue("");
      updateComments({
        [resourceZUID]: "",
      });
    }
  }, [isCommentCreated, isReplyCreated]);

  useEffect(() => {
    if (isCommentUpdated || isReplyUpdated) {
      tinymce?.activeEditor.setContent(PLACEHOLDER);
      setInputValue("");
      setCommentZUIDtoEdit(null);
    }
  }, [isCommentUpdated, isReplyUpdated]);

  useEffect(() => {
    if (isEditMode) {
      setInitialValue(editModeValue);
      setInputValue(editModeValue);
    }
  }, [isEditMode, editModeValue]);

  const isLoading =
    isCreatingComment ||
    isCreatingReply ||
    isUpdatingComment ||
    isUpdatingReply;
  const hasError =
    isCommentCreationError ||
    isReplyCreationError ||
    isCommentUpdateError ||
    isReplyUpdateError;

  return (
    <>
      <Box sx={{ mt: 1.5 }}>
        <Box
          ref={inputRef}
          sx={{
            "& #commentInputField": {
              ...theme.typography.body2,
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

              "& .mentioned-user": {
                color: "primary.main",
              },

              "& .mce-offscreen-selection": {
                position: "absolute",
                // HACK: Makes sure that the offscreen selection is offscreen when user selects the mentioned user element
                left: "-9999999px",
              },
            },
          }}
        >
          <Editor
            id="commentInputField"
            initialValue={initialValue}
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
            }}
            onBlur={() => {
              // Re-adds the placeholder when user clicks out and there's no value
              if (!tinymce?.activeEditor.getContent()) {
                tinymce?.activeEditor.setContent(PLACEHOLDER);
              }
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
                  const selection = window.getSelection();
                  if (selection && selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    const startOffset = range.startOffset;
                    range.setStart(
                      range.startContainer,
                      startOffset - (userFilterKeyword?.length + 1)
                    );
                    range.setEnd(range.startContainer, startOffset);
                    selection.removeAllRanges();
                    selection.addRange(range);
                  }
                  editor.selection.setContent(
                    `<span class="mentioned-user" contenteditable="false">@${
                      mentionListRef.current?.handleSelectUser()?.email
                    }</span>`
                  );
                  editor.selection.setContent(" ");

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
      {hasError && (
        <Typography variant="body2" color="error.dark" mt={0.5}>
          Unable to add comment. Please check your internet connection and try
          again.
        </Typography>
      )}
      <Stack
        ref={buttonsContainerRef}
        direction="row"
        gap={1}
        justifyContent="end"
        mt={1.5}
      >
        <Button
          variant="outlined"
          color="inherit"
          size="small"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <LoadingButton
          data-cy="SubmitNewComment"
          variant="contained"
          color="primary"
          size="small"
          onClick={isEditMode ? handleUpdate : handleSubmit}
          disabled={!inputValue}
          loading={isLoading}
        >
          {getPrimaryButtonText()}
        </LoadingButton>
      </Stack>
    </>
  );
};

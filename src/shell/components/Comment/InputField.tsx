import { useEffect, useRef, useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { Box, Typography, Button, Stack } from "@mui/material";
import { Editor } from "@tinymce/tinymce-react";
import { theme } from "@zesty-io/material";
import { useParams } from "react-router";
import { useDebounce } from "react-use";

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

type InputFieldProps = {
  isFirstComment: boolean;
  onCancel: () => void;
  commentResourceZUID: string;
  parentCommentZUID: string;
  isEditMode?: boolean;
  editModeValue?: string;
  commentCount: number;
};
export const InputField = ({
  isFirstComment,
  onCancel,
  commentResourceZUID,
  parentCommentZUID,
  isEditMode = false,
  editModeValue = "",
  commentCount,
}: InputFieldProps) => {
  const { t } = useTranslation();
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
  const [initialValue, setInitialValue] = useState("");
  const [mentionListAnchorEl, setMentionListAnchorEl] = useState(null);
  const [userFilterKeyword, setUserFilterKeyword] = useState("");
  const [prevCommentCount, setPrevCommentCount] = useState(commentCount);

  const handleSubmit = () => {
    if (isFirstComment) {
      createComment({
        resourceZUID: itemZUID,
        content: inputValue,
        scopeTo: commentResourceZUID,
      });
    } else {
      createReply({
        content: inputValue,
        commentZUID: parentCommentZUID,
        resourceZUID: commentResourceZUID,
      });
    }
  };

  const handleUpdate = () => {
    if (commentZUIDtoEdit.startsWith("24")) {
      updateComment({
        resourceZUID: commentResourceZUID,
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
      return t("common.save");
    }

    if (isFirstComment) {
      return t("common.comment");
    } else {
      return t("common.reply");
    }
  };

  const insertUserMention = (email: string) => {
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

    tinymce.activeEditor.selection.setContent(
      `<span class="mentioned-user" contenteditable="false">@${email}</span>`
    );
    tinymce.activeEditor.selection.setContent(" ");

    setMentionListAnchorEl(null);
  };

  useEffect(() => {
    if (comments[commentResourceZUID]) {
      setInitialValue(comments[commentResourceZUID]);
      setInputValue(comments[commentResourceZUID]);
    }
  }, []);

  useDebounce(
    () => {
      // No need to save edit mode changes in draft
      if (inputValue && !isEditMode) {
        updateComments({
          [commentResourceZUID]: inputValue,
        });
      }
    },
    300,
    [inputValue, isEditMode]
  );

  useEffect(() => {
    if (
      (isCommentCreated || isReplyCreated) &&
      prevCommentCount !== commentCount
    ) {
      tinymce?.activeEditor.setContent("");
      setInputValue("");
      updateComments({
        [commentResourceZUID]: "",
      });
      setPrevCommentCount(commentCount);
    }
  }, [isCommentCreated, isReplyCreated, prevCommentCount, commentCount]);

  useEffect(() => {
    if (isCommentUpdated || isReplyUpdated) {
      tinymce?.activeEditor.setContent("");
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
  // Ensures that the buttons are only shown when there is text content in the input field without blocking the user from actually
  // pressing enter to start or end the comment with multiple line breaks if they wanted to
  const showButtons =
    !!inputValue &&
    !!tinymce.activeEditor.getContent({ format: "text" }).trim();

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
              cursor: "text",
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
            disabled={isLoading}
            init={{
              inline: true,
              auto_focus: true,
              placeholder: "Reply or add others with @",

              setup: (editor) => {
                editor.on("ResizeEditor", () => {
                  if (!editor.isNotDirty) {
                    buttonsContainerRef.current?.scrollIntoView();
                  }
                });
              },

              content_style: "ul, ol { margin-left: 16px }",
              skin_url: "/vendors/tinymce/skins/ui/Zesty",
            }}
            onEditorChange={(value, editor) => {
              setInputValue(value);
            }}
            onKeyDown={(evt, editor) => {
              // Checks if the mention list should be opened or not
              if (evt.key === "@") {
                setTimeout(() => {
                  setUserFilterKeyword("");
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
                  evt.key === "Escape") &&
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
                mentionListRef.current?.handleSelectUser();
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
          onUserSelected={insertUserMention}
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
        {showButtons && (
          <>
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              onClick={onCancel}
              disabled={isLoading}
            >
              {t("common.cancel")}
            </Button>
            <Button
              data-cy="SubmitNewComment"
              variant="contained"
              color="primary"
              size="small"
              onClick={isEditMode ? handleUpdate : handleSubmit}
              loading={isLoading}
            >
              {getPrimaryButtonText()}
            </Button>
          </>
        )}
      </Stack>
    </>
  );
};

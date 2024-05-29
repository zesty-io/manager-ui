import { useRef, useEffect, useState, useContext } from "react";
import {
  Stack,
  Typography,
  Avatar,
  IconButton,
  Box,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@mui/material";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import DriveFileRenameOutlineRoundedIcon from "@mui/icons-material/DriveFileRenameOutlineRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import moment from "moment";
import { useLocation } from "react-router";
import { useSelector } from "react-redux";

import { useUpdateCommentStatusMutation } from "../../services/accounts";
import { MD5 } from "../../../utility/md5";
import { useParams as useSearchParams } from "../../hooks/useParams";
import { InputField } from "./InputField";
import { CommentContext } from "../../contexts/CommentProvider";
import { AppState } from "../../store/types";
import { User } from "../../services/types";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import {
  useDeleteCommentMutation,
  useDeleteReplyMutation,
} from "../../services/accounts";

const URL_REGEX =
  /(?:http[s]?:\/\/.)?(?:www\.)?[-a-zA-Z0-9@%._\+~#=]{2,256}\.[a-z]{2,6}\b(?:[-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)/gm;

type CommentItemProps = {
  commentZUID: string;
  body: string;
  creator: {
    name: string;
    ZUID: string;
    email: string;
  };
  createdOn: string;
  parentCommentZUID: string;
  withResolveButton?: boolean;
  onParentCommentDeleted: () => void;
};
export const CommentItem = ({
  commentZUID,
  body,
  creator,
  createdOn,
  parentCommentZUID,
  withResolveButton,
  onParentCommentDeleted,
}: CommentItemProps) => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [_, __, commentZUIDtoEdit, setCommentZUIDtoEdit] =
    useContext(CommentContext);
  const [
    deleteComment,
    { isLoading: isDeletingComment, isSuccess: isCommentDeleted },
  ] = useDeleteCommentMutation();
  const [
    deleteReply,
    { isLoading: isDeletingReply, isSuccess: isReplyDeleted },
  ] = useDeleteReplyMutation();
  const [updateCommentStatus, { isLoading: isUpdatingCommentStatus }] =
    useUpdateCommentStatusMutation();
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement>();
  const [isCopied, setIsCopied] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const commentBodyRef = useRef<HTMLParagraphElement>();
  const loggedInUser: User = useSelector((state: AppState) => state.user);

  const commentResourceZUID = searchParams.get("commentResourceZuid");
  const isLoggedInUserCommentCreator = loggedInUser?.ZUID === creator?.ZUID;

  useEffect(() => {
    if (commentBodyRef.current) {
      const hyperlinkedContent = body?.replaceAll(URL_REGEX, (text) => {
        // Highlights @ mentions
        if (text.includes("@") && text.startsWith("@")) {
          return `<span style="color: #FF5D0A">${text}</span>`;
        }

        // Converts url strings to anchor tags
        if (!text.includes("@")) {
          const url =
            text.includes("http://") || text.includes("https://")
              ? text
              : `https://${text}`;

          return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #FF5D0A; text-decoration: none">${text}</a>`;
        }

        return text;
      });

      commentBodyRef.current.innerHTML = hyperlinkedContent;
    }
  }, [body, commentBodyRef]);

  useEffect(() => {
    if (isCommentDeleted || isReplyDeleted) {
      setIsDeleteModalOpen(false);

      if (commentZUID.startsWith("24")) {
        onParentCommentDeleted();
      }
    }
  }, [isCommentDeleted, isReplyDeleted]);

  const handleCopyClick = () => {
    const resourceZUID = searchParams.get("commentResourceZuid");

    navigator?.clipboard
      ?.writeText(
        `${window.location.origin}${location.pathname}?commentResourceZuid=${resourceZUID}&replyZUID=${commentZUID}`
      )
      .then(() => {
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 500);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const handleDeleteComment = () => {
    if (commentZUID.startsWith("24")) {
      deleteComment({
        resourceZUID: commentResourceZUID,
        commentZUID,
      });
    } else {
      deleteReply({
        resourceZUID: commentResourceZUID,
        commentZUID,
        parentCommentZUID,
      });
    }
  };

  const handleUpdateCommentStatus = () => {
    updateCommentStatus({
      resourceZUID: commentResourceZUID,
      commentZUID,
      parentCommentZUID,
      isResolved: true,
    });
  };

  if (commentZUIDtoEdit === commentZUID) {
    return (
      <InputField
        isEditMode
        editModeValue={body}
        isFirstComment={false}
        onCancel={() => setCommentZUIDtoEdit(null)}
        resourceZUID={commentResourceZUID}
        parentCommentZUID={parentCommentZUID}
      />
    );
  }

  return (
    <>
      <Box data-cy="CommentItem" id={commentZUID}>
        <Stack gap={1.5}>
          <Stack gap={1.5} direction="row">
            <Stack flex={1} direction="row" gap={1.5} alignItems="center">
              <Avatar
                sx={{ width: 32, height: 32 }}
                src={`https://www.gravatar.com/avatar/${MD5(
                  creator?.email || ""
                )}?s=32`}
              />
              <Stack>
                <Typography fontWeight={700} variant="body2">
                  {creator?.name}
                </Typography>
                <Typography
                  variant="body3"
                  fontWeight={600}
                  color="text.secondary"
                >
                  {moment(createdOn).fromNow()}
                </Typography>
              </Stack>
            </Stack>
            <Box>
              {withResolveButton && (
                <Tooltip
                  title="Mark as Resolved"
                  placement="top-start"
                  disableInteractive
                >
                  <IconButton
                    data-cy="ResolveCommentButton"
                    color="primary"
                    size="small"
                    onClick={handleUpdateCommentStatus}
                    disabled={isUpdatingCommentStatus}
                  >
                    <CheckRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip
                title="More Options"
                placement="top-start"
                disableInteractive
              >
                <IconButton
                  data-cy="CommentMenuButton"
                  size="small"
                  onClick={(evt) => setMenuAnchorEl(evt.currentTarget)}
                >
                  <MoreVertRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Stack>
          <Typography
            variant="body2"
            ref={commentBodyRef}
            sx={{ overflowWrap: "break-word" }}
          ></Typography>
        </Stack>
        {menuAnchorEl && (
          <Menu
            anchorEl={menuAnchorEl}
            open
            onClose={() => setMenuAnchorEl(null)}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            slotProps={{
              paper: {
                sx: {
                  width: 160,
                },
              },
            }}
          >
            {isLoggedInUserCommentCreator && (
              <MenuItem
                data-cy="EditCommentButton"
                onClick={() => {
                  setMenuAnchorEl(null);
                  setCommentZUIDtoEdit(commentZUID);
                }}
              >
                <ListItemIcon>
                  <DriveFileRenameOutlineRoundedIcon />
                </ListItemIcon>
                <ListItemText>Edit</ListItemText>
              </MenuItem>
            )}
            <MenuItem data-cy="CopyCommentLinkButton" onClick={handleCopyClick}>
              <ListItemIcon>
                {isCopied ? <CheckRoundedIcon /> : <LinkRoundedIcon />}
              </ListItemIcon>
              <ListItemText>Copy Link</ListItemText>
            </MenuItem>
            {isLoggedInUserCommentCreator && (
              <MenuItem
                data-cy="DeleteCommentButton"
                onClick={() => {
                  setMenuAnchorEl(null);
                  setIsDeleteModalOpen(true);
                }}
              >
                <ListItemIcon>
                  <DeleteRoundedIcon />
                </ListItemIcon>
                <ListItemText>Delete</ListItemText>
              </MenuItem>
            )}
          </Menu>
        )}
      </Box>
      {isDeleteModalOpen && (
        <ConfirmDeleteModal
          isDeletingComment={isDeletingComment || isDeletingReply}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirmDelete={handleDeleteComment}
        />
      )}
    </>
  );
};

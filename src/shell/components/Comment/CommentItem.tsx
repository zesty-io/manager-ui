import { useMemo, useRef, useEffect, useState, useContext } from "react";
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
} from "@mui/material";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import DriveFileRenameOutlineRoundedIcon from "@mui/icons-material/DriveFileRenameOutlineRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import moment from "moment";
import { useLocation } from "react-router";

import { useGetUsersQuery } from "../../services/accounts";
import { MD5 } from "../../../utility/md5";
import { useParams as useSearchParams } from "../../hooks/useParams";
import { InputField } from "./InputField";
import { CommentContext } from "../../contexts/CommentProvider";

const URL_REGEX =
  /(?:http[s]?:\/\/.)?(?:www\.)?[-a-zA-Z0-9@%._\+~#=]{2,256}\.[a-z]{2,6}\b(?:[-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)/gm;

type CommentItemProps = {
  id: string;
  body: string;
  creator: string;
  createdOn: string;
  commentZUID: string;
  withResolveButton?: boolean;
  onResolveComment: () => void;
};
export const CommentItem = ({
  id,
  body,
  creator,
  createdOn,
  commentZUID,
  withResolveButton,
  onResolveComment,
}: CommentItemProps) => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [_, __, commentZUIDtoEdit, setCommentZUIDtoEdit] =
    useContext(CommentContext);
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement>();
  const [isCopied, setIsCopied] = useState(false);
  const commentBodyRef = useRef<HTMLParagraphElement>();
  const { data: users } = useGetUsersQuery();

  const commentResourceZUID = searchParams.get("commentResourceZuid");

  const user = useMemo(
    () => users?.find((user) => user.ZUID === creator),
    [users]
  );

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

  const handleCopyClick = () => {
    const resourceZUID = searchParams.get("commentResourceZuid");

    navigator?.clipboard
      ?.writeText(
        `${window.location.origin}${location.pathname}?commentResourceZuid=${resourceZUID}&replyZUID=${id}`
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

  if (commentZUIDtoEdit === id) {
    return (
      <InputField
        isEditMode
        // editModeValue={body}
        editModeValue="<p>Hello guys!</p><div>Hey hey</div>"
        isFirstComment={false}
        onCancel={() => setCommentZUIDtoEdit(null)}
        resourceZUID={commentResourceZUID}
        commentZUID={commentZUID}
      />
    );
  }

  return (
    <Box id={id}>
      <Stack gap={1.5}>
        <Stack gap={1.5} direction="row">
          <Stack flex={1} direction="row" gap={1.5} alignItems="center">
            <Avatar
              sx={{ width: 32, height: 32 }}
              src={`https://www.gravatar.com/avatar/${MD5(
                user?.email || ""
              )}?s=32`}
            />
            <Stack>
              <Typography fontWeight={700} variant="body2">
                {`${user?.firstName} ${user?.lastName}`}
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
              <IconButton size="small" onClick={onResolveComment}>
                <CheckRoundedIcon fontSize="small" color="primary" />
              </IconButton>
            )}
            <IconButton
              size="small"
              onClick={(evt) => setMenuAnchorEl(evt.currentTarget)}
            >
              <MoreVertRoundedIcon fontSize="small" />
            </IconButton>
          </Box>
        </Stack>
        <Typography variant="body2" ref={commentBodyRef}></Typography>
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
          <MenuItem
            onClick={() => {
              setMenuAnchorEl(null);
              setCommentZUIDtoEdit(id);
            }}
          >
            <ListItemIcon>
              <DriveFileRenameOutlineRoundedIcon />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleCopyClick}>
            <ListItemIcon>
              {isCopied ? <CheckRoundedIcon /> : <LinkRoundedIcon />}
            </ListItemIcon>
            <ListItemText>Copy Link</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => console.log("Delete this comment")}>
            <ListItemIcon>
              <DeleteRoundedIcon />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </Menu>
      )}
    </Box>
  );
};

import { IconButton, Button, alpha } from "@mui/material";
import AddCommentRoundedIcon from "@mui/icons-material/AddCommentRounded";
import CommentRoundedIcon from "@mui/icons-material/CommentRounded";
import { useState } from "react";

import { CommentsList } from "./CommentsList";

// Mock data
export type CommentItemType = {
  creator: string;
  createdOn: number;
  body: string;
};
const comments: CommentItemType[] = [
  {
    creator: "Nar",
    createdOn: Date.now(),
    body: "Lorem ipsum sit dolor hello hello",
  },
  {
    creator: "Zosh",
    createdOn: Date.now(),
    body: "Yo yo yo",
  },
  {
    creator: "Andres",
    createdOn: Date.now(),
    body: "Hey guys! What's up",
  },
  {
    creator: "Nar",
    createdOn: Date.now(),
    body: "For all that is beautiful!",
  },
];

type CommentProps = {};
export const Comment = ({}: CommentProps) => {
  const [isUnresolved] = useState(false);
  const [_comments] = useState(comments);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>(null);

  return (
    <>
      {_comments.length ? (
        <Button
          size="xsmall"
          endIcon={<CommentRoundedIcon />}
          onClick={(evt) => setAnchorEl(evt.currentTarget)}
          sx={{
            backgroundColor: (theme) =>
              isUnresolved
                ? alpha(theme.palette.primary.main, 0.04)
                : "action.hover",
            minWidth: 0,
            fontWeight: 600,
            fontSize: 14,
            lineHeight: "14px",
            px: 0.5,
            py: 0.25,
            color: isUnresolved ? "primary.main" : "text.secondary",

            "&:hover": {
              backgroundColor: (theme) =>
                alpha(theme.palette.primary.main, 0.08),
              color: "primary.main",
            },

            "&:hover .MuiButton-endIcon .MuiSvgIcon-root": {
              fill: (theme) => theme.palette.primary.main,
            },

            "& .MuiButton-endIcon": {
              ml: 0.5,
              mr: 0,
            },

            "& .MuiButton-endIcon .MuiSvgIcon-root": {
              fontSize: 16,
              fill: (theme) =>
                isUnresolved
                  ? theme.palette.primary.main
                  : theme.palette.action.active,
            },
          }}
        >
          {comments.length}
        </Button>
      ) : (
        <IconButton
          size="xxsmall"
          sx={{
            "&:hover": {
              backgroundColor: (theme) =>
                alpha(theme.palette.primary.main, 0.08),
              color: "primary.main",
            },
          }}
        >
          <AddCommentRoundedIcon sx={{ fontSize: 16 }} />
        </IconButton>
      )}
      {anchorEl && (
        <CommentsList
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          comments={_comments}
          isUnresolved
        />
      )}
    </>
  );
};

import { IconButton, Button, alpha } from "@mui/material";
import AddCommentRoundedIcon from "@mui/icons-material/AddCommentRounded";
import CommentRoundedIcon from "@mui/icons-material/CommentRounded";
import { useState } from "react";
import { theme } from "@zesty-io/material";

// Mock data
const comments = [
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

  return (
    <>
      {_comments.length ? (
        <Button
          size="xsmall"
          endIcon={<CommentRoundedIcon />}
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
              fill: "primary.main",
            },

            "& .MuiButton-endIcon": {
              ml: 0.5,
              mr: 0,
            },

            "& .MuiButton-endIcon .MuiSvgIcon-root": {
              fontSize: 16,
              fill: isUnresolved ? "primary.main" : "action.active",
            },
          }}
        >
          {comments.length}
        </Button>
      ) : (
        <IconButton size="small">
          <AddCommentRoundedIcon />
        </IconButton>
      )}
    </>
  );
};

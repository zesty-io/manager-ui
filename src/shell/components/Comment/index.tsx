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
const dummyComments: CommentItemType[] = [
  {
    creator: "Nar",
    createdOn: Date.now() - 100000000,
    body: "Lorem ipsum sit dolor hello hello",
  },
  {
    creator: "Zosh",
    createdOn: Date.now() - 20000011,
    body: "Yo yo yo",
  },
  {
    creator: "Andres",
    createdOn: Date.now() - 3333333,
    body: "Hey guys! What's up",
  },
  {
    creator: "Nar",
    createdOn: Date.now() - 456900,
    body: "For all that is beautiful!",
  },
];

type CommentProps = {};
export const Comment = ({}: CommentProps) => {
  const [isResolved, setIsResolved] = useState(false);
  const [comments] = useState(dummyComments);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>(null);

  return (
    <>
      {comments.length ? (
        <Button
          size="xsmall"
          endIcon={<CommentRoundedIcon />}
          onClick={(evt) => setAnchorEl(evt.currentTarget)}
          sx={{
            backgroundColor: (theme) =>
              isResolved
                ? "action.hover"
                : alpha(theme.palette.primary.main, 0.04),
            minWidth: 0,
            fontWeight: 600,
            fontSize: 14,
            lineHeight: "14px",
            px: 0.5,
            py: 0.25,
            color: isResolved ? "text.secondary" : "primary.main",

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
                isResolved
                  ? theme.palette.action.active
                  : theme.palette.primary.main,
            },
          }}
        >
          {comments.length}
        </Button>
      ) : (
        <IconButton
          size="xxsmall"
          onClick={(evt) => setAnchorEl(evt.currentTarget)}
          sx={{
            backgroundColor: anchorEl
              ? (theme) => alpha(theme.palette.primary.main, 0.08)
              : "transparent",
            color: anchorEl ? "primary.main" : "action",
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
          comments={comments}
          isResolved={isResolved}
          onResolveComment={() => setIsResolved(true)}
        />
      )}
    </>
  );
};

import { IconButton, Button, alpha } from "@mui/material";
import AddCommentRoundedIcon from "@mui/icons-material/AddCommentRounded";
import CommentRoundedIcon from "@mui/icons-material/CommentRounded";
import { useState } from "react";

import { CommentsList } from "./CommentsList";

// Mock data
export type CommentItemType = {
  creator: string;
  createdOn: string;
  body: string;
};
const dummyComments: CommentItemType[] = [
  {
    creator: "5-84d1e6d4ae-s3m974",
    createdOn: "2024-01-13T22:59:17Z",
    body: "Lorem ipsum sit dolor hello hello. @stuart@zesty.io hello hello",
  },
  {
    creator: "5-a0a2aabff8-bw1dp1",
    createdOn: "2024-02-14T22:59:17Z",
    body: "Yo yo yo. Coming at you from youtube.com, answers.microsoft.com",
  },
  {
    creator: "5-84d1e6d4ae-s3m974",
    createdOn: "2024-02-14T23:59:17Z",
    body: "Hey guys! What's up. https://duckduckgo.com/?q=gravatar+query+params&t=brave&ia=web",
  },
  {
    creator: "5-57801f6-3cj46d",
    createdOn: "2024-03-24T10:59:17Z",
    body: "For all that is beautiful! andres.galindo@zesty.io",
  },
];

type CommentProps = {
  fieldZuid: string;
};
export const Comment = ({ fieldZuid }: CommentProps) => {
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
          fieldZuid={fieldZuid}
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

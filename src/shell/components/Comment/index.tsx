import { IconButton, Button, alpha } from "@mui/material";
import AddCommentRoundedIcon from "@mui/icons-material/AddCommentRounded";
import CommentRoundedIcon from "@mui/icons-material/CommentRounded";
import { useState, useRef, useEffect } from "react";

import { CommentsList } from "./CommentsList";
import { useParams as useSearchParams } from "../../hooks/useParams";

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
  resourceZUID: string;
};
export const Comment = ({ resourceZUID }: CommentProps) => {
  const buttonRef = useRef<HTMLButtonElement>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isResolved, setIsResolved] = useState(false);
  const [comments] = useState(dummyComments);
  const [isCommentListOpen, setIsCommentListOpen] = useState(false);
  const [isButtonAutoscroll, setIsButtonAutoscroll] = useState(true);

  const commentResourceZuid = searchParams.get("commentResourceZuid");

  useEffect(() => {
    setIsCommentListOpen(
      commentResourceZuid === resourceZUID && !!buttonRef.current
    );
  }, [buttonRef.current, commentResourceZuid]);

  useEffect(() => {
    // Autoscrolls to the button before opening the comment list popup
    // Only applicable when popup is opened via deeplink
    if (isCommentListOpen && isButtonAutoscroll) {
      buttonRef.current?.scrollIntoView();
    }
  }, [isCommentListOpen, isButtonAutoscroll]);

  return (
    <>
      {comments.length ? (
        <Button
          size="xsmall"
          endIcon={<CommentRoundedIcon />}
          onClick={() => {
            setIsButtonAutoscroll(false);
            setSearchParams(resourceZUID, "commentResourceZuid");
          }}
          ref={buttonRef}
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
          onClick={() => {
            setIsButtonAutoscroll(false);
            setSearchParams(resourceZUID, "commentResourceZuid");
          }}
          ref={buttonRef}
          sx={{
            backgroundColor: isCommentListOpen
              ? (theme) => alpha(theme.palette.primary.main, 0.08)
              : "transparent",
            color: isCommentListOpen ? "primary.main" : "action",
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
      {isCommentListOpen && (
        <CommentsList
          anchorEl={buttonRef.current}
          onClose={() => {
            setIsButtonAutoscroll(false);
            setSearchParams(null, "commentResourceZuid");
          }}
          comments={comments}
          isResolved={isResolved}
          onResolveComment={() => setIsResolved(true)}
        />
      )}
    </>
  );
};

import { IconButton, Button, alpha } from "@mui/material";
import AddCommentRoundedIcon from "@mui/icons-material/AddCommentRounded";
import CommentRoundedIcon from "@mui/icons-material/CommentRounded";
import { useState, useRef, useEffect } from "react";

import { CommentsList } from "./CommentsList";
import { useParams as useSearchParams } from "../../hooks/useParams";
import { useGetCommentByResourceQuery } from "../../services/accounts";

// Mock data
export type CommentItemType = {
  creator: string;
  createdOn: string;
  body: string;
};

type CommentProps = {
  resourceZUID: string;
};
export const Comment = ({ resourceZUID }: CommentProps) => {
  const { data: comment, isLoading: isCommentLoading } =
    useGetCommentByResourceQuery({ resourceZUID }, { skip: !resourceZUID });
  const buttonRef = useRef<HTMLButtonElement>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isResolved, setIsResolved] = useState(false);
  const [isCommentListOpen, setIsCommentListOpen] = useState(false);
  const [isButtonAutoscroll, setIsButtonAutoscroll] = useState(true);

  const commentResourceZuid = searchParams.get("commentResourceZuid");

  console.log("comment data for ", resourceZUID, comment);

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
      {comment ? (
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
          {/* NOTE: Adding 1 since we need to include the initial comment **/}
          {comment.replyCount + 1}
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
          commentZUID={comment?.ZUID}
          anchorEl={buttonRef.current}
          onClose={() => {
            setIsButtonAutoscroll(false);
            setSearchParams(null, "commentResourceZuid");
          }}
          isResolved={isResolved}
          onResolveComment={() => setIsResolved(true)}
        />
      )}
    </>
  );
};

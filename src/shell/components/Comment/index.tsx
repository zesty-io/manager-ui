import { IconButton, Button, alpha, Box } from "@mui/material";
import AddCommentRoundedIcon from "@mui/icons-material/AddCommentRounded";
import CommentRoundedIcon from "@mui/icons-material/CommentRounded";
import { useState, useRef, useEffect, useMemo } from "react";
import { useParams } from "react-router";

import { CommentsList } from "./CommentsList";
import { useParams as useSearchParams } from "../../hooks/useParams";
import { useGetCommentByResourceQuery } from "../../services/accounts";

type CommentProps = {
  resourceZUID: string;
};
export const Comment = ({ resourceZUID }: CommentProps) => {
  const { itemZUID } = useParams<{ itemZUID: string }>();
  const { data: comment, isLoading: isCommentLoading } =
    useGetCommentByResourceQuery({ resourceZUID }, { skip: !resourceZUID });
  const buttonContainerRef = useRef<HTMLDivElement>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isResolved, setIsResolved] = useState(false);
  const [isCommentListOpen, setIsCommentListOpen] = useState(false);
  const [isButtonAutoscroll, setIsButtonAutoscroll] = useState(true);

  const commentResourceZuid = searchParams.get("commentResourceZuid");

  const activeComment = useMemo(() => {
    return comment?.find((comment) => comment.resourceParentZUID === itemZUID);
  }, [comment, itemZUID]);

  useEffect(() => {
    setIsCommentListOpen(
      commentResourceZuid === resourceZUID && !!buttonContainerRef.current
    );
  }, [buttonContainerRef.current, commentResourceZuid]);

  useEffect(() => {
    // Autoscrolls to the button before opening the comment list popup
    // Only applicable when popup is opened via deeplink
    if (isCommentListOpen && isButtonAutoscroll) {
      buttonContainerRef.current?.scrollIntoView();
    }
  }, [isCommentListOpen, isButtonAutoscroll]);

  return (
    <>
      <Box ref={buttonContainerRef}>
        {activeComment ? (
          <Button
            size="xsmall"
            endIcon={<CommentRoundedIcon />}
            onClick={() => {
              setIsButtonAutoscroll(false);
              setSearchParams(resourceZUID, "commentResourceZuid");
            }}
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
            {activeComment.replyCount + 1}
          </Button>
        ) : (
          <IconButton
            size="xxsmall"
            onClick={() => {
              setIsButtonAutoscroll(false);
              setSearchParams(resourceZUID, "commentResourceZuid");
            }}
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
      </Box>
      {isCommentListOpen && (
        <CommentsList
          commentZUID={activeComment?.ZUID}
          anchorEl={buttonContainerRef.current}
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

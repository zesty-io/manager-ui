import { IconButton, Button, alpha, Box, Tooltip } from "@mui/material";
import AddCommentRoundedIcon from "@mui/icons-material/AddCommentRounded";
import CommentRoundedIcon from "@mui/icons-material/CommentRounded";
import { useState, useRef, useEffect, useMemo, useContext } from "react";
import { useParams } from "react-router";

import { CommentsList } from "./CommentsList";
import { useParams as useSearchParams } from "../../hooks/useParams";
import { useGetCommentByResourceQuery } from "../../services/accounts";
import { CommentContext } from "../../contexts/CommentProvider";

type CommentProps = {
  resourceZUID: string;
};
export const Comment = ({ resourceZUID }: CommentProps) => {
  const [_, __, ___, setCommentZUIDtoEdit] = useContext(CommentContext);
  const { itemZUID } = useParams<{ itemZUID: string }>();
  const { data: comment } = useGetCommentByResourceQuery(
    { resourceZUID },
    { skip: !resourceZUID }
  );
  const buttonContainerRef = useRef<HTMLDivElement>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isCommentListOpen, setIsCommentListOpen] = useState(false);
  const [isButtonAutoscroll, setIsButtonAutoscroll] = useState(true);

  const commentResourceZuid = searchParams.get("commentResourceZuid");

  const parentComment = useMemo(() => {
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
        {parentComment ? (
          <Tooltip
            title="View Open Comment"
            disableInteractive
            placement="top-start"
          >
            <Button
              data-cy="OpenCommentsButton"
              size="xsmall"
              endIcon={<CommentRoundedIcon />}
              onClick={() => {
                setIsButtonAutoscroll(false);
                setSearchParams(resourceZUID, "commentResourceZuid");
              }}
              sx={{
                backgroundColor: (theme) =>
                  parentComment.resolved
                    ? "action.hover"
                    : alpha(theme.palette.primary.main, 0.04),
                minWidth: 0,
                fontWeight: 600,
                fontSize: 14,
                lineHeight: "14px",
                px: 0.5,
                py: 0.25,
                color: parentComment.resolved
                  ? "text.secondary"
                  : "primary.main",

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
                    parentComment.resolved
                      ? theme.palette.action.active
                      : theme.palette.primary.main,
                },
              }}
            >
              {/* NOTE: Adding 1 since we need to include the initial comment **/}
              {parentComment.replyCount + 1}
            </Button>
          </Tooltip>
        ) : (
          <Tooltip
            title="Add New Comment"
            disableInteractive
            placement="top-start"
          >
            <IconButton
              data-cy="OpenCommentsButton"
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
          </Tooltip>
        )}
      </Box>
      {isCommentListOpen && (
        <CommentsList
          parentCommentZUID={parentComment?.ZUID}
          anchorEl={buttonContainerRef.current}
          onClose={() => {
            setIsButtonAutoscroll(false);
            setCommentZUIDtoEdit(null);
            setSearchParams(null, "commentResourceZuid");
            setSearchParams(null, "replyZUID");
          }}
          isResolved={parentComment?.resolved}
        />
      )}
    </>
  );
};

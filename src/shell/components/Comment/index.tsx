import { IconButton, Button, alpha, Box, Tooltip } from "@mui/material";
import AddCommentRoundedIcon from "@mui/icons-material/AddCommentRounded";
import CommentRoundedIcon from "@mui/icons-material/CommentRounded";
import { useState, useRef, useEffect, useMemo, useContext } from "react";
import { useParams, useHistory, useLocation } from "react-router";

import { CommentsList } from "./CommentsList";
import { useGetCommentByResourceQuery } from "../../services/accounts";
import { CommentContext } from "../../contexts/CommentProvider";

type PathParams = {
  modelZUID: string;
  itemZUID: string;
  resourceZUID: string;
};
type CommentProps = {
  resourceZUID: string;
};
export const Comment = ({ resourceZUID }: CommentProps) => {
  const history = useHistory();
  const location = useLocation();
  const [_, __, ___, setCommentZUIDtoEdit] = useContext(CommentContext);
  const { itemZUID, resourceZUID: activeResourceZUID } =
    useParams<PathParams>();
  const { data: comment, isLoading: isLoadingComment } =
    useGetCommentByResourceQuery(
      { itemZUID, resourceZUID },
      { skip: !resourceZUID }
    );
  const buttonContainerRef = useRef<HTMLDivElement>();
  const [isCommentListOpen, setIsCommentListOpen] = useState(false);
  const [isButtonAutoscroll, setIsButtonAutoscroll] = useState(true);

  const parentComment = useMemo(() => {
    return comment?.find((comment) => comment.resourceZUID === itemZUID);
  }, [comment, itemZUID]);

  useEffect(() => {
    if (!!resourceZUID) {
      setIsCommentListOpen(
        activeResourceZUID === resourceZUID && !!buttonContainerRef.current
      );
    }
  }, [buttonContainerRef.current, activeResourceZUID]);

  useEffect(() => {
    // Autoscrolls to the button before opening the comment list popup
    // Only applicable when popup is opened via deeplink
    if (isCommentListOpen && isButtonAutoscroll) {
      buttonContainerRef.current?.scrollIntoView();
    }
  }, [isCommentListOpen, isButtonAutoscroll]);

  const handleOpenCommentsList = () => {
    setIsButtonAutoscroll(false);
    history.replace(`${location.pathname}/comment/${resourceZUID}`);
  };

  if (!resourceZUID) {
    return <></>;
  }

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
              disabled={isLoadingComment}
              onClick={handleOpenCommentsList}
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
              disabled={isLoadingComment}
              onClick={handleOpenCommentsList}
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

            // Makes sure that we can properly pop back to the component where the comment was rendered
            const pathnameArr = location.pathname?.split("/");
            const commentIndex = pathnameArr.findIndex(
              (path) => path === "comment"
            );

            history.replace(pathnameArr?.slice(0, commentIndex)?.join("/"));
          }}
          isResolved={parentComment?.resolved}
        />
      )}
    </>
  );
};

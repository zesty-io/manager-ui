import {
  Divider,
  Paper,
  Popper,
  Backdrop,
  PopperPlacementType,
  Box,
  Stack,
  Skeleton,
} from "@mui/material";
import { theme } from "@zesty-io/material";
import { Fragment, useEffect, useRef, useState } from "react";

import { CommentItem } from "./CommentItem";
import { InputField } from "./InputField";
import { useParams as useSearchParams } from "../../hooks/useParams";
import { useGetCommentThreadQuery } from "../../services/accounts";

type CommentsListProps = {
  anchorEl: Element;
  onClose: () => void;
  isResolved: boolean;
  onResolveComment: () => void;
  commentZUID: string;
};
export const CommentsList = ({
  anchorEl,
  onClose,
  onResolveComment,
  isResolved,
  commentZUID,
}: CommentsListProps) => {
  const [searchParams] = useSearchParams();
  const [popperTopOffset, setPopperTopOffset] = useState(0);
  const [popperBottomOffset, setPopperBottomOffset] = useState(0);
  const [placement, setPlacement] =
    useState<PopperPlacementType>("bottom-start");
  const topOffsetRef = useRef<HTMLDivElement>();

  const commentResourceZUID = searchParams.get("commentResourceZuid");
  const highlightedReplyZUID = searchParams.get("replyZUID");

  const { data: commentThread, isLoading: isLoadingCommentThread } =
    useGetCommentThreadQuery({ commentZUID }, { skip: !commentZUID });

  useEffect(() => {
    if (
      window.innerHeight - anchorEl?.getBoundingClientRect().top >
      window.innerHeight * 0.3
    ) {
      setPlacement("bottom-start");
    } else {
      setPlacement("top-start");
    }

    setTimeout(() => {
      const { top, bottom } = topOffsetRef.current?.getBoundingClientRect();

      setPopperTopOffset(top);
      setPopperBottomOffset(bottom);
    });

    // HACK: Prevents UI flicker when popper renders and is temporarily out of bounds
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = null;
    };
  }, []);

  useEffect(() => {
    // Scrolls to a specific reply indicated in the search params
    if (!isLoadingCommentThread) {
      setTimeout(() => {
        const replyEl = document.getElementById(highlightedReplyZUID);
        if (replyEl) {
          replyEl.scrollIntoView();
        }
      });
    }
  }, [highlightedReplyZUID, isLoadingCommentThread]);

  const calculateMaxHeight = () => {
    if (placement === "bottom-start") {
      return window.innerHeight - popperTopOffset - 8;
    } else {
      return popperBottomOffset - 8;
    }
  };

  return (
    <Backdrop
      id="popperBg"
      open
      sx={{
        zIndex: theme.zIndex.modal,
        backgroundColor: "transparent",
      }}
      onClick={(evt) => {
        const element = evt.target as HTMLElement;

        if (element?.id === "popperBg") {
          onClose();
        }
      }}
    >
      <Popper
        open
        anchorEl={anchorEl}
        placement={placement}
        sx={{
          zIndex: theme.zIndex.modal,
        }}
        ref={topOffsetRef}
        popperOptions={{
          modifiers: [
            {
              name: "offset",
              options: {
                offset: [0, 4],
              },
            },
          ],
        }}
      >
        <Paper
          elevation={8}
          sx={{
            width: 360,
            p: 2,
            maxHeight: calculateMaxHeight(),
            overflow: "auto",
            boxSizing: "border-box",
          }}
        >
          {isLoadingCommentThread && <CommentItemLoading />}
          {commentThread?.map((comment, index) => (
            <Fragment key={comment.ZUID}>
              <CommentItem
                id={comment.ZUID}
                body={comment.content}
                createdOn={comment.createdAt}
                creator={comment.createdByUserZUID}
                withResolveButton={index === 0 && !isResolved}
                onResolveComment={onResolveComment}
              />
              {index + 1 < commentThread?.length && (
                <Divider sx={{ my: 1.5 }} />
              )}
            </Fragment>
          ))}
          <InputField
            isFirstComment={!commentThread?.length}
            onCancel={onClose}
            resourceZUID={commentResourceZUID}
            commentZUID={commentZUID}
          />
        </Paper>
      </Popper>
    </Backdrop>
  );
};

const CommentItemLoading = () => {
  return (
    <Stack gap={1.5}>
      <Stack direction="row" gap={1.5} alignItems="center">
        <Skeleton
          variant="circular"
          width={32}
          height={32}
          sx={{ flexShrink: 0 }}
        />
        <Stack height={38} width="100%" justifyContent="space-between">
          <Skeleton variant="rounded" height={14} />
          <Skeleton variant="rounded" height={12} />
        </Stack>
      </Stack>
      <Stack gap={0.5}>
        <Skeleton variant="rounded" height={14} />
        <Skeleton variant="rounded" height={14} />
      </Stack>
    </Stack>
  );
};

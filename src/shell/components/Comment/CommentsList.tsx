import {
  Divider,
  Paper,
  Popper,
  Backdrop,
  PopperPlacementType,
  Stack,
  Skeleton,
} from "@mui/material";
import { theme } from "@zesty-io/material";
import { Fragment, useContext, useEffect, useRef, useState } from "react";

import { CommentItem } from "./CommentItem";
import { InputField } from "./InputField";
import { useGetCommentThreadQuery } from "../../services/accounts";
import { CommentContext } from "../../contexts/CommentProvider";
import { useParams } from "react-router";

type PathParams = {
  modelZUID: string;
  itemZUID: string;
  resourceZUID: string;
  commentZUID: string;
};
type CommentsListProps = {
  anchorEl: Element;
  onClose: () => void;
  isResolved: boolean;
  parentCommentZUID: string;
};
export const CommentsList = ({
  anchorEl,
  onClose,
  isResolved,
  parentCommentZUID,
}: CommentsListProps) => {
  const { resourceZUID, commentZUID } = useParams<PathParams>();
  const [_, __, commentZUIDtoEdit] = useContext(CommentContext);
  const [popperTopOffset, setPopperTopOffset] = useState(0);
  const [popperBottomOffset, setPopperBottomOffset] = useState(0);
  const [placement, setPlacement] =
    useState<PopperPlacementType>("bottom-start");
  const topOffsetRef = useRef<HTMLDivElement>();

  const { data: commentThread, isLoading: isLoadingCommentThread } =
    useGetCommentThreadQuery(
      { commentZUID: parentCommentZUID },
      { skip: !parentCommentZUID }
    );

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
        const replyEl = document.getElementById(commentZUID);

        if (replyEl) {
          replyEl.scrollIntoView();
        }
      });
    }
  }, [commentZUID, isLoadingCommentThread]);

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
                commentZUID={comment.ZUID}
                body={comment.content}
                createdOn={comment.createdAt}
                creator={{
                  ZUID: comment.createdByUserZUID,
                  name: comment.createdByUserName,
                  email: comment.createdByUserEmail,
                }}
                withResolveButton={index === 0 && !isResolved}
                parentCommentZUID={parentCommentZUID}
                onParentCommentDeleted={onClose}
              />
              {index + 1 < commentThread?.length && (
                <Divider sx={{ my: 1.5 }} />
              )}
            </Fragment>
          ))}
          {!commentZUIDtoEdit && (
            <InputField
              isFirstComment={!commentThread?.length}
              onCancel={onClose}
              commentResourceZUID={resourceZUID}
              parentCommentZUID={parentCommentZUID}
            />
          )}
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

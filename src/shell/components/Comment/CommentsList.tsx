import { Popover, Divider } from "@mui/material";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";

import { CommentItem } from "./CommentItem";
import { CommentItemType } from "./index";
import { InputField } from "./InputField";

type CommentsListProps = {
  anchorEl: Element;
  onClose: () => void;
  comments: CommentItemType[];
  isResolved: boolean;
  onResolveComment: () => void;
};
export const CommentsList = ({
  anchorEl,
  onClose,
  comments,
  onResolveComment,
  isResolved,
}: CommentsListProps) => {
  const [popoverTopOffset, setPopoverTopOffset] = useState(0);

  const topOffsetRef = useCallback((node: HTMLDivElement) => {
    if (node) {
      // HACK: Needed so that we're getting the correct value after the popover has been drawn to the DOM
      setTimeout(() => {
        setPopoverTopOffset(node.offsetTop);
      }, 100);
    }
  }, []);

  return (
    <Popover
      open
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      slotProps={{
        paper: {
          elevation: 8,
          sx: {
            width: 360,
            p: 2,
            mt: 0.5,
            maxHeight: `calc(100% - ${popoverTopOffset}px - 48px)`,
          },
          ref: topOffsetRef,
        },
      }}
    >
      {comments?.map((comment, index) => (
        <Fragment key={index}>
          <CommentItem
            body={comment.body}
            createdOn={comment.createdOn}
            creator={comment.creator}
            withResolveButton={index === 0 && !isResolved}
            onResolveComment={onResolveComment}
          />
          {index + 1 < comments?.length && <Divider sx={{ my: 1.5 }} />}
        </Fragment>
      ))}
      <InputField isFirstComment={!comments?.length} />
    </Popover>
  );
};

import { Popover, Divider, Paper, Popper, Box, Backdrop } from "@mui/material";
import { theme } from "@zesty-io/material";
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
  const [popperTopOffset, setPopperTopOffset] = useState(0);
  const [popperBottomOffset, setPopperBottomOffset] = useState(0);
  const topOffsetRef = useRef<HTMLDivElement>();

  useEffect(() => {
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

  const calculateMaxHeight = () => {
    const isPopperInBottom =
      anchorEl.getBoundingClientRect().top < popperTopOffset;

    if (isPopperInBottom) {
      return window.innerHeight - popperTopOffset - 32 - 8;
    } else {
      return popperBottomOffset - 32 - 8;
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
        placement="bottom-start"
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
          <InputField isFirstComment={!comments?.length} onCancel={onClose} />
        </Paper>
      </Popper>
    </Backdrop>
  );
};

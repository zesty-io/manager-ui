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
  const [popoverTopOffset, setPopoverTopOffset] = useState(0);

  const topOffsetRef = useCallback((node: HTMLDivElement) => {
    if (node) {
      // HACK: Needed so that we're getting the correct value after the popover has been drawn to the DOM
      setTimeout(() => {
        setPopoverTopOffset(node.offsetTop);
      }, 100);
    }
  }, []);

  // NOTE: Try to get the offsetBottom and if it is small, change the origins to top??

  return (
    // <Popover
    //   open
    //   anchorEl={anchorEl}
    //   onClose={onClose}
    //   anchorOrigin={{
    //     vertical: "bottom",
    //     horizontal: "left",
    //   }}
    //   transformOrigin={{
    //     vertical: "top",
    //     horizontal: "left",
    //   }}
    //   slotProps={{
    //     paper: {
    //       elevation: 8,
    //       sx: {
    //         width: 360,
    //         p: 2,
    //         mt: 0.5,
    //         maxHeight: `calc(100% - ${popoverTopOffset}px - 48px)`,
    //       },
    //       ref: topOffsetRef,
    //     },
    //   }}
    // >
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
      >
        <Paper
          elevation={8}
          sx={{
            width: 360,
            p: 2,
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

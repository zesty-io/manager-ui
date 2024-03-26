import { Popover, Divider } from "@mui/material";

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
          },
        },
      }}
    >
      {comments?.map((comment, index) => (
        <>
          <CommentItem
            key={index}
            body={comment.body}
            createdOn={comment.createdOn}
            creator={comment.creator}
            withResolveButton={index === 0 && !isResolved}
            onResolveComment={onResolveComment}
          />
          {index + 1 < comments?.length && <Divider sx={{ my: 1.5 }} />}
        </>
      ))}
      <InputField isFirstComment={!comments?.length} />
    </Popover>
  );
};

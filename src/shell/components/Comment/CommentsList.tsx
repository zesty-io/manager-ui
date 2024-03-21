import { Popover } from "@mui/material";

type CommentsListProps = {
  anchorEl: Element;
  onClose: () => void;
};
export const CommentsList = ({ anchorEl, onClose }: CommentsListProps) => {
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
    >
      Hello comment section!
    </Popover>
  );
};

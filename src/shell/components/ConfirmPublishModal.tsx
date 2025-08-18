import { useRef } from "react";
import {
  Box,
  Button,
  ButtonBaseActions,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";

export type ConfirmPublishModal = {
  contentTitle: string;
  onCancel: () => void;
  onConfirm: () => void;
  contentVersion: number;
  altText?: string;
  isPublishing?: boolean;
  children?: JSX.Element;
  relatedItemsToPublishCount?: number;
};
export const ConfirmPublishModal = ({
  contentTitle,
  onCancel,
  onConfirm,
  contentVersion,
  altText,
  isPublishing,
  children,
  relatedItemsToPublishCount,
}: ConfirmPublishModal) => {
  const actionRef = useRef<ButtonBaseActions | null>(null);
  const onEntered = () => actionRef?.current?.focusVisible();
  return (
    <Dialog
      open
      data-cy="ConfirmPublishModal"
      PaperProps={{ sx: { width: 480 } }}
      TransitionProps={{ onEntered }}
    >
      <DialogTitle component="div" sx={{ pb: 1 }}>
        <Stack
          height={40}
          width={40}
          bgcolor="green.100"
          borderRadius="50%"
          justifyContent="center"
          alignItems="center"
          marginBottom={1.5}
        >
          <CloudUploadRoundedIcon color="success" />
        </Stack>
        <Box>
          Publish {altText || "Content Item"}:
          <Typography fontWeight={400} variant="h5" display="inline">
            {" "}
            {contentTitle}?
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          This will immediately make v{contentVersion} of the{" "}
          {altText ? altText?.toLowerCase() : "item"} available on all of your
          platforms. You can always unpublish this item later if needed.
        </Typography>
        {children}
      </DialogContent>
      <DialogActions>
        <Button
          data-cy="CancelPublishButton"
          variant="text"
          color="inherit"
          onClick={onCancel}
          disabled={isPublishing}
        >
          Cancel
        </Button>
        <Button
          loading={isPublishing}
          action={(actions) => (actionRef.current = actions)}
          variant="contained"
          color="success"
          sx={{ color: "common.white" }}
          onClick={onConfirm}
          data-cy="ConfirmPublishButton"
        >
          Publish {altText || !!relatedItemsToPublishCount ? "Items " : "Item "}
          {!!relatedItemsToPublishCount &&
            `(${relatedItemsToPublishCount + 1})`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stack,
  ButtonBaseActions,
  List,
} from "@mui/material";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import { useRef } from "react";
import { ContentItem } from "../../../../../../shell/services/types";
import { DialogContentItem } from "./DialogContentItem";

type ConfirmPublishesModalProps = {
  items: ContentItem[];
  onConfirm: (items: ContentItem[]) => void;
  onCancel: () => void;
};
export const ConfirmPublishesModal = ({
  items,
  onConfirm,
  onCancel,
}: ConfirmPublishesModalProps) => {
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
        <Box>Publish {items.length} Items:</Box>
        <Typography variant="body2" color="text.secondary" mt={1}>
          This will make the the following 2 content items immediately available
          on all of your platforms. You can always unpublish this item later if
          needed.
        </Typography>
      </DialogTitle>
      <DialogContent>
        <List disablePadding>
          {items.map((item, index) => (
            <DialogContentItem key={index} item={item} />
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button variant="text" color="inherit" onClick={() => onCancel()}>
          Cancel
        </Button>
        <Button
          action={(actions) => (actionRef.current = actions)}
          variant="contained"
          color="success"
          sx={{ color: "common.white" }}
          onClick={() => {
            onConfirm(items);
          }}
          data-cy="ConfirmPublishButton"
        >
          Publish Items ({items.length})
        </Button>
      </DialogActions>
    </Dialog>
  );
};

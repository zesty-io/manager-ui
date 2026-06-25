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
import { DeleteRounded } from "@mui/icons-material";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { ContentItem } from "../../../../../../shell/services/types";
import { DialogContentItem } from "./DialogContentItem";

type ConfirmDeletesModalProps = {
  items: ContentItem[];
  onConfirm: (items: ContentItem[]) => void;
  onCancel: () => void;
};
export const ConfirmDeletesDialog = ({
  items,
  onConfirm,
  onCancel,
}: ConfirmDeletesModalProps) => {
  const { t } = useTranslation();
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
          bgcolor="red.100"
          borderRadius="50%"
          justifyContent="center"
          alignItems="center"
          marginBottom={1.5}
        >
          <DeleteRounded color="error" />
        </Stack>
        <Box>
          {t("content.itemListDeleteTitle", { count: items.length })}
          {":"}
        </Box>
        <Typography variant="body2" color="text.secondary" mt={1}>
          {t("content.itemListDeleteDescription", { count: items.length })}
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
          {t("common.cancel")}
        </Button>
        <Button
          data-cy="ConfirmMultiPageTableDelete"
          action={(actions) => (actionRef.current = actions)}
          variant="contained"
          color="error"
          onClick={() => {
            onConfirm(items);
          }}
        >
          {t("content.itemListDeleteButton", { count: items.length })}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

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
} from "@mui/material";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { ContentItem } from "../../../../../../shell/services/types";
import { DialogContentItem } from "./DialogContentItem";

type ConfirmPublishesModalProps = {
  items: ContentItem[];
  onConfirm: (items: ContentItem[]) => void;
  onCancel: () => void;
  loading: boolean;
};
export const ConfirmPublishesModal = ({
  items,
  onConfirm,
  onCancel,
  loading,
}: ConfirmPublishesModalProps) => {
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
      <DialogTitle component="div" sx={{ pb: 2.5 }}>
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
          {t("content.itemListPublishTitle", { count: items.length })}
          {":"}
        </Box>
        <Typography variant="body2" color="text.secondary" mt={1}>
          {t("content.itemListPublishDescription", { count: items.length })}
        </Typography>
      </DialogTitle>
      <DialogContent>
        {items.map((item, index) => (
          <DialogContentItem key={index} item={item} />
        ))}
      </DialogContent>
      <DialogActions>
        <Button variant="text" color="inherit" onClick={() => onCancel()}>
          {t("common.cancel")}
        </Button>
        <Button
          loading={loading}
          action={(actions) => (actionRef.current = actions)}
          variant="contained"
          color="success"
          sx={{ color: "common.white" }}
          onClick={() => {
            onConfirm(items);
          }}
          data-cy="ConfirmPublishButton"
        >
          {t("content.itemListPublishButton", { count: items.length })}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

import { memo, useState, useEffect } from "react";
import { Prompt } from "react-router-dom";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  Box,
  Typography,
} from "@mui/material";
import { WarningAmberRounded } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import type { NavModalScope } from "utility/history";

type PendingEditsModalProps = {
  show: boolean;
  loading?: boolean;
  onSave: (scope: NavModalScope) => Promise<void>;
  onDiscard: (scope: NavModalScope) => Promise<void>;
};

export default memo(function PendingEditsModal(props: PendingEditsModalProps) {
  const { t } = useTranslation();
  // FIXME: non memoized onSave & onDiscard props are causing rerenders

  const [loading, setLoading] = useState(props.loading || false);
  const [open, setOpen] = useState(false);
  const [answer, setAnswer] = useState(() => () => {});
  // Stored with `answer`, so a prompt that replaces this one resets it.
  const [scope, setScope] = useState<NavModalScope>({});

  // Expose globals so external components can invoke
  // NOTE: Should this be a portal?
  useEffect(() => {
    window.openContentNavigationModal = (callback, nextScope = {}) => {
      setOpen(true);
      setAnswer(() => callback);
      setScope(nextScope);
    };

    return () => {
      window.openContentNavigationModal = null;
    };
  }, []);

  const handler = (action: string) => {
    switch (action) {
      case "save":
        setLoading(true);
        props
          .onSave(scope)
          .then((i) => {
            // @ts-ignore
            answer(true);
          })
          .catch((err) => {
            console.error(err);
            // @ts-ignore
            answer(false);
          })
          .finally(() => {
            setLoading(false);
            setOpen(false);
          });
        break;
      case "delete":
        setLoading(true);
        props.onDiscard(scope).then(() => {
          setLoading(false);
          setOpen(false);
          // @ts-ignore
          answer(true);
        });
        break;
      case "cancel":
        setOpen(false);
        // @ts-ignore
        answer(false);
      default:
        break;
    }
  };

  return (
    <>
      <Prompt when={Boolean(props.show)} message={"content_confirm"} />

      <Dialog
        data-cy="PendingEditsModal"
        open={open}
        fullWidth
        maxWidth="sm"
        onClose={() => handler("cancel")}
      >
        <DialogTitle>
          <Box
            sx={{
              backgroundColor: "warning.light",
              borderRadius: "100%",
              width: "40px",
              height: "40px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mb: 1.5,
            }}
          >
            <WarningAmberRounded color="warning" />
          </Box>
          {t("common.unsavedChanges")}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {t("content.itemEditUnsavedChangesDescription")}
          </Typography>
        </DialogTitle>
        <DialogActions
          sx={{
            justifyContent: "space-between",
          }}
        >
          <Button
            data-cy="PendingEditsModalCancel"
            color="inherit"
            onClick={() => handler("cancel")}
          >
            {t("content.itemEditContinueEditing")}
          </Button>
          <Box display="flex" gap={1}>
            <Button
              data-cy="PendingEditsModalDiscard"
              color="primary"
              loading={loading}
              onClick={() => handler("delete")}
            >
              {t("content.itemEditDontSave")}
            </Button>
            <Button
              data-cy="PendingEditsModalSave"
              variant="contained"
              color="primary"
              loading={loading}
              onClick={() => handler("save")}
            >
              {t("common.save")}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
});

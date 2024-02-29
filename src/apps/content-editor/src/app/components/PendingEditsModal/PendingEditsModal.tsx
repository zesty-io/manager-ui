import { memo, useState, useEffect } from "react";
import { Prompt } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  Box,
  Typography,
} from "@mui/material";
import { WarningAmberRounded } from "@mui/icons-material";
import { theme } from "@zesty-io/material";
import { LoadingButton } from "@mui/lab";

type PendingEditsModalProps = {
  show: boolean;
  loading?: boolean;
  onSave: () => Promise<void>;
  onDiscard: () => Promise<void>;
};

export default memo(function PendingEditsModal(props: PendingEditsModalProps) {
  // FIXME: non memoized onSave & onDiscard props are causing rerenders

  const [loading, setLoading] = useState(props.loading || false);
  const [open, setOpen] = useState(false);
  const [answer, setAnswer] = useState(() => () => {});

  // Expose globals so external components can invoke
  // NOTE: Should this be a portal?
  useEffect(() => {
    window.openContentNavigationModal = (callback) => {
      setOpen(true);
      setAnswer(() => callback);
    };

    return () => {
      window.openContentNavigationModal = null;
    };
  }, []);

  const handler = (action: string) => {
    switch (action) {
      case "save":
        setLoading(true);
        props.onSave().then(() => {
          setLoading(false);
          setOpen(false);
          // @ts-ignore
          answer(true);
        });
        break;
      case "delete":
        setLoading(true);
        props.onDiscard().then(() => {
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
      <ThemeProvider theme={theme}>
        <Dialog
          open={open}
          fullWidth
          maxWidth={"xs"}
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
            Unsaved Changes
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              You have unsaved changes that will be lost if you leave this page.
            </Typography>
          </DialogTitle>
          <DialogActions
            sx={{
              justifyContent: "space-between",
            }}
          >
            <Button color="inherit" onClick={() => handler("cancel")}>
              Continue Editing
            </Button>
            <Box display="flex" gap={1}>
              <LoadingButton
                color="primary"
                loading={loading}
                onClick={() => handler("delete")}
              >
                Don't Save
              </LoadingButton>
              <LoadingButton
                variant="contained"
                color="primary"
                loading={loading}
                onClick={() => handler("save")}
              >
                Save
              </LoadingButton>
            </Box>
          </DialogActions>
        </Dialog>
      </ThemeProvider>
    </>
  );
});

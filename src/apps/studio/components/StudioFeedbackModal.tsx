import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import { useSendEmailMutation } from "shell/services/cloudFunctions";
import { useSelector } from "react-redux";
import { AppState } from "shell/store/types";

// `value` is typed as required `string` on every caller's prop, but several
// callers pass Redux fields (e.g. `instance?.name`) that are `any` at the
// state layer and genuinely `undefined` until their slice finishes loading —
// coalesce defensively rather than trust the prop type.
const escapeHtml = (value: string): string =>
  (value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

type StudioFeedbackModalProps = {
  open: boolean;
  onClose: () => void;
  email: string;
  instanceName: string;
  instanceZUID: string;
  activePage: string;
  mode: "content" | "layout";
};

export const StudioFeedbackModal = ({
  open,
  onClose,
  email,
  instanceName,
  instanceZUID,
  activePage,
  mode,
}: StudioFeedbackModalProps) => {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const user = useSelector((state: AppState) => state.user);
  const [sendEmail, { isLoading: isSubmitting }] = useSendEmailMutation();

  const handleClose = () => {
    if (isSubmitting) return;
    setMessage("");
    setError("");
    onClose();
  };

  const handleSubmit = () => {
    if (!message.trim() || isSubmitting) return;

    setError("");

    const feedbackName = [user?.firstName, user?.lastName]
      .filter(Boolean)
      .join(" ");
    const feedbackSubject = `Studio feedback from ${feedbackName || email}`;

    const feedbackBody = [
      `<b>User:</b> ${escapeHtml(email)}`,
      `<b>Instance:</b> ${escapeHtml(instanceZUID)} (${escapeHtml(
        instanceName
      )})`,
      `<b>Page:</b> ${escapeHtml(activePage)}`,
      `<b>Mode:</b> ${escapeHtml(mode)}`,
      `<b>Message:</b><br>${escapeHtml(message).replace(/\n/g, "<br>")}`,
    ].join("<br>");

    sendEmail({
      to: CONFIG.SLACK_FEEDBACK_EMAIL,
      subject: feedbackSubject,
      body: feedbackBody,
      template: "raw",
    })
      .unwrap()
      .then(() => {
        setMessage("");
        onClose();
      })
      .catch(() => {
        setError("Couldn't send feedback. Try again.");
      });
  };

  return (
    <Dialog
      data-cy="StudioFeedbackModal"
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>
        <Box sx={{ fontWeight: 700 }}>Share Feedback</Box>
        <Typography sx={{ mt: 0.5 }} variant="body2" color="text.secondary">
          Please tell us about your experience so we can improve.
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography variant="subtitle2" color="text.primary" fontWeight={600}>
          How was your experience with studio-mode
        </Typography>
        <TextField
          data-cy="StudioFeedbackMessageInput"
          fullWidth
          multiline
          minRows={4}
          placeholder="Please provide detailed feedback about your experience"
          value={message}
          onChange={(evt) => setMessage(evt.target.value)}
          disabled={isSubmitting}
          sx={{ mt: 1 }}
        />
        {error ? (
          <Typography
            data-cy="StudioFeedbackErrorMessage"
            variant="caption"
            color="error"
            sx={{ mt: 1, display: "block" }}
          >
            {error}
          </Typography>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button
          data-cy="StudioFeedbackCancelButton"
          color="inherit"
          onClick={handleClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          data-cy="StudioFeedbackSubmitButton"
          variant="contained"
          onClick={handleSubmit}
          disabled={!message.trim() || isSubmitting}
          loading={isSubmitting}
        >
          Share Feedback
        </Button>
      </DialogActions>
    </Dialog>
  );
};

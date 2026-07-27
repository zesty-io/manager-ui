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

type StudioFeedbackModalProps = {
  open: boolean;
  onClose: () => void;
  email: string;
  instanceZUID: string;
  pageModelZUID: string;
  pageItemZUID: string;
  interactionMode: "content" | "layout";
};

export const StudioFeedbackModal = ({
  open,
  onClose,
  email,
  instanceZUID,
  pageModelZUID,
  pageItemZUID,
  interactionMode,
}: StudioFeedbackModalProps) => {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
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

    const body = `
<blockquote style="border-left: 3px solid #444;padding: 0 12px;">${message}</blockquote>

<p>Context:</p>
<ul>
<li>Email: ${email}</li>
<li>Instance ZUID: ${instanceZUID}</li>
<li>Page Model ZUID: ${pageModelZUID}</li>
<li>Page Item ZUID: ${pageItemZUID}</li>
<li>Interaction Mode: ${interactionMode}</li>
</ul>
      `;

    sendEmail({
      to: CONFIG.SLACK_FEEDBACK_EMAIL,
      subject: `Studio Feedback from ${email}`,
      body,
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
        <Typography variant="caption" color="text.secondary" component="div">
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
